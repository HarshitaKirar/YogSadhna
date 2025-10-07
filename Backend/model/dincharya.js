const mongoose = require('mongoose');

const dincharyaMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: String,
  messageType: { type: String, enum: ['text', 'image', 'video', 'link', 'meeting'], default: 'text' },
  mediaUrl: String,
  isAdminMessage: { type: Boolean, default: false }
}, { timestamps: true });

const DincharyaMessage = mongoose.model('DincharyaMessage', dincharyaMessageSchema);

module.exports = { DincharyaMessage };