const RiskAlert = require('../models/RiskAlert');

// GET all risk alerts (Admin only)
exports.getRiskAlerts = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const alerts = await RiskAlert.find(filter)
      .populate('relatedUserId', 'name email')
      .populate('relatedBookingId')
      .sort({ flaggedAt: -1 });
    res.status(200).json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching risk alerts.' });
  }
};

// UPDATE alert status (Admin reviews/dismisses)
exports.updateRiskAlertStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['reviewed', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Status must be reviewed or dismissed.' });
    }
    const alert = await RiskAlert.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!alert) return res.status(404).json({ message: 'Risk alert not found.' });
    res.status(200).json(alert);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating risk alert.' });
  }
};