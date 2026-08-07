const express = require('express');
const router = express.Router();
const { createMaintenance, getMaintenanceForFacility, deleteMaintenance } = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('admin'), createMaintenance);
router.get('/facility/:facilityId', protect, getMaintenanceForFacility);
router.delete('/:id', protect, authorize('admin'), deleteMaintenance);

module.exports = router;