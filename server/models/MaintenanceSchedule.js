const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  reason: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('MaintenanceSchedule', maintenanceSchema);