const mongoose = require('mongoose');

const riskAlertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['duplicate_attendance', 'excessive_complaints', 'multiple_booking_attempts', 'suspicious_login'],
    required: true
  },
  relatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  relatedBookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  description: { type: String },
  status: { type: String, enum: ['open', 'reviewed', 'dismissed'], default: 'open' },
  flaggedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RiskAlert', riskAlertSchema);