const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  bookingDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  expectedAttendance: { type: Number, required: true },
  purpose: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'], default: 'pending' },
  priorityScore: { type: Number, default: 0 },
  urgency: { type: Number, default: 1 },
  waitingTime: { type: Number, default: 0 },
  peopleAffected: { type: Number, default: 1 },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalTimestamp: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);