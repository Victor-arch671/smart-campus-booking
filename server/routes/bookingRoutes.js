const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getPendingBookings,
  updateBookingStatus,
  getFacilityCalendar,
  getUtilization
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// User routes
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.put('/:id/cancel', protect, cancelBooking);

// Facility Manager routes (Admin can also access all of these)
router.get('/pending', protect, authorize('facility_manager', 'admin'), getPendingBookings);
router.put('/:id/status', protect, authorize('facility_manager', 'admin'), updateBookingStatus);
router.get('/calendar/:facilityId', protect, authorize('facility_manager', 'admin'), getFacilityCalendar);
router.get('/utilization', protect, authorize('facility_manager', 'admin'), getUtilization);

module.exports = router;