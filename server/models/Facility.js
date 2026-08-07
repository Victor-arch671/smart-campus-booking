const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['hall', 'lab', 'room', 'equipment'], required: true },
  capacity: { type: Number, required: true },
  location: { type: String },
  hasProjector: { type: Boolean, default: false },
  hasAC: { type: Boolean, default: false },
  equipmentList: { type: [String], default: [] },
  status: { type: String, enum: ['available', 'under_maintenance', 'inactive'], default: 'available' },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Facility', facilitySchema);