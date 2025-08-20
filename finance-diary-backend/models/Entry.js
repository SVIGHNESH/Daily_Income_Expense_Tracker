const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true, default: Date.now },
  description: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true }, // Positive for income, negative for expense
  type: { type: String, enum: ['income', 'expense'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Entry', entrySchema);