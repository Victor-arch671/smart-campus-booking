const express = require('express');
const router = express.Router();
const { getSystemReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/system', protect, authorize('admin'), getSystemReport);

module.exports = router;