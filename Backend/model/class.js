const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['free', 'paid'], required: true },
  price: { type: Number, default: 0 },
  duration: Number, // in minutes
  maxParticipants: Number,
  scheduledDate: Date,
  videoUrl: String,
  meetingLink: String,
  category: { type: String, enum: ['yoga', 'zumba', 'pranayam', 'meditation', 'fitness', 'pilates', 'aerobics'], default: 'yoga' },
  isActive: { type: Boolean, default: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  enrolledAt: { type: Date, default: Date.now },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'completed' }
});

const classMessageSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'link', 'announcement'], default: 'text' }
}, { timestamps: true });

const Class = mongoose.model('Class', classSchema);
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
const ClassMessage = mongoose.model('ClassMessage', classMessageSchema);

module.exports = { Class, Enrollment, ClassMessage };