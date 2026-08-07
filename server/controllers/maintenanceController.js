const MaintenanceSchedule = require('../models/MaintenanceSchedule');
const Facility = require('../models/Facility');

// CREATE a maintenance window (Admin only)
exports.createMaintenance = async (req, res) => {
  try {
    const { facilityId, startDateTime, endDateTime, reason } = req.body;

    const facility = await Facility.findById(facilityId);
    if (!facility) return res.status(404).json({ message: 'Facility not found.' });

    const maintenance = new MaintenanceSchedule({
      facilityId,
      startDateTime,
      endDateTime,
      reason,
      createdBy: req.user.id
    });

    await maintenance.save();
    res.status(201).json(maintenance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating maintenance schedule.' });
  }
};

// GET all maintenance windows for a facility
exports.getMaintenanceForFacility = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const windows = await MaintenanceSchedule.find({ facilityId }).sort({ startDateTime: 1 });
    res.status(200).json(windows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching maintenance schedules.' });
  }
};

// DELETE a maintenance window
exports.deleteMaintenance = async (req, res) => {
  try {
    const window = await MaintenanceSchedule.findByIdAndDelete(req.params.id);
    if (!window) return res.status(404).json({ message: 'Maintenance schedule not found.' });
    res.status(200).json({ message: 'Maintenance schedule removed.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting maintenance schedule.' });
  }
};