const express = require('express');
const router = express.Router();
const { getOverview, predictUtilization } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/overview', protect, authorize('facility_manager', 'admin'), getOverview);
router.get('/predict', protect, authorize('admin'), predictUtilization);

module.exports = router;