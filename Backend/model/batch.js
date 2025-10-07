const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  instructor: String,
  startDate: Date,
  endDate: Date,
  price: Number,
  category: { type: String, enum: ['yoga', 'zumba', 'meditation'], default: 'yoga' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  progress: { type: Number, default: 0 },
  purchaseDate: { type: Date, default: Date.now }
});

const Batch = mongoose.model('Batch', batchSchema);
const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = { Batch, Purchase };