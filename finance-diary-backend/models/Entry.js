const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    enum: {
      values: ['food', 'transport', 'entertainment', 'utilities', 'salary', 'healthcare', 'shopping', 'education', 'other'],
      message: 'Invalid category'
    }
  },
  amount: { 
    type: Number, 
    required: [true, 'Amount is required'],
    validate: {
      validator: function(value) {
        return value !== 0;
      },
      message: 'Amount cannot be zero'
    }
  },
  type: { 
    type: String, 
    enum: {
      values: ['income', 'expense'],
      message: 'Type must be either income or expense'
    },
    required: [true, 'Type is required']
  }
}, { 
  timestamps: true 
});

// Index for better query performance
entrySchema.index({ userId: 1, date: -1 });
entrySchema.index({ userId: 1, type: 1 });
entrySchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Entry', entrySchema);