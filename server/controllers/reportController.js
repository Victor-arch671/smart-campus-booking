const Booking = require('../models/Booking');
const Facility = require('../models/Facility');
const User = require('../models/User');

// System-wide report — admin only, no facility-manager scoping (admins see everything)
exports.getSystemReport = async (req, res) => {
  try {
    const totalFacilities = await Facility.countDocuments();
    const totalUsers = await User.countDocuments();

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const totalBookings = await Booking.countDocuments();

    const topFacilities = await Booking.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$facilityId', totalBookings: { $sum: 1 } } },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 }
    ]);
    const populatedTopFacilities = await Facility.populate(topFacilities, { path: '_id', select: 'name type' });

    res.status(200).json({
      generatedAt: new Date(),
      totalFacilities,
      totalUsers,
      totalBookings,
      bookingsByStatus,
      topFacilities: populatedTopFacilities
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating report.' });
  }
};