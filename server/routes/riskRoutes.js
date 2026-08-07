const express = require('express');
const router = express.Router();
const { getRiskAlerts, updateRiskAlertStatus } = require('../controllers/riskController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getRiskAlerts);
router.put('/:id/status', protect, authorize('admin'), updateRiskAlertStatus);

module.exports = router;