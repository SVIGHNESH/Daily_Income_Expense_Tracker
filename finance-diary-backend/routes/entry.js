const express = require('express');
const Entry = require('../models/Entry');
const auth = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Create entry
router.post('/', async (req, res) => {
  try {
    const { description, category, amount, type, date } = req.body;
    
    // Validation
    if (!description || !category || !amount || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const entry = new Entry({
      userId: req.user.id,
      description,
      category,
      amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      type,
      date: date || new Date()
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all entries
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, category, type } = req.query;
    let filter = { userId: req.user.id };
    
    // Date filtering
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Category filtering
    if (category) filter.category = category;
    
    // Type filtering
    if (type) filter.type = type;
    
    const entries = await Entry.find(filter).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single entry
router.get('/:id', async (req, res) => {
  try {
    const entry = await Entry.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.json(entry);
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update entry
router.put('/:id', async (req, res) => {
  try {
    const { description, category, amount, type, date } = req.body;
    
    const updateData = {};
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (type) updateData.type = type;
    if (date) updateData.date = new Date(date);
    
    // Handle amount based on type
    if (amount !== undefined && type) {
      updateData.amount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    }

    const entry = await Entry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.json(entry);
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete entry
router.delete('/:id', async (req, res) => {
  try {
    const entry = await Entry.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get financial summary
router.get('/summary/stats', async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user.id });
    
    const totalIncome = entries
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + Math.abs(e.amount), 0);
      
    const totalExpenses = entries
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + Math.abs(e.amount), 0);
      
    const balance = totalIncome - totalExpenses;
    
    // Category breakdown
    const categoryBreakdown = {};
    entries.forEach(entry => {
      if (!categoryBreakdown[entry.category]) {
        categoryBreakdown[entry.category] = {
          income: 0,
          expense: 0,
          total: 0
        };
      }
      
      const amount = Math.abs(entry.amount);
      if (entry.type === 'income') {
        categoryBreakdown[entry.category].income += amount;
      } else {
        categoryBreakdown[entry.category].expense += amount;
      }
      
      categoryBreakdown[entry.category].total = 
        categoryBreakdown[entry.category].income - 
        categoryBreakdown[entry.category].expense;
    });
    
    res.json({
      totalIncome,
      totalExpenses,
      balance,
      entriesCount: entries.length,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;