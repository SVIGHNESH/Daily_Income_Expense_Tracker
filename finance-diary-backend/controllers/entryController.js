const Entry = require('../models/Entry');

exports.createEntry = async (req, res) => {
  try {
    const { description, category, amount, type, date } = req.body;
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
    res.status(400).json({ error: error.message });
  }
};

exports.getEntries = async (req, res) => {
  try {
    const { startDate, endDate, category, type } = req.query;
    let filter = { userId: req.user.id };
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    if (category) filter.category = category;
    if (type) filter.type = type;
    
    const entries = await Entry.find(filter).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const entry = await Entry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user.id });
    const totalIncome = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = Math.abs(entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0));
    const balance = totalIncome - totalExpenses;
    
    res.json({
      totalIncome,
      totalExpenses,
      balance,
      entriesCount: entries.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};