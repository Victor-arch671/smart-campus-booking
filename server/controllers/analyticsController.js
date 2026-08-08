const Booking = require('../models/Booking');
const Facility = require('../models/Facility');

// helper: get facility IDs this manager owns (admins see everything — returns null)
async function getManagedFacilityIds(user) {
  if (user.role === 'admin') return null;
  const facilities = await Facility.find({ managerId: user.id }).select('_id');
  return facilities.map(f => f._id);
}

// GET analytics overview: most/least booked, peak periods, daily occupancy
exports.getOverview = async (req, res) => {
  try {
    const managedIds = await getManagedFacilityIds(req.user);
    const baseFilter = { status: 'approved' };
    if (managedIds) baseFilter.facilityId = { $in: managedIds };

    // Most / least booked facilities
    const byFacility = await Booking.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$facilityId', totalBookings: { $sum: 1 } } },
      { $sort: { totalBookings: -1 } }
    ]);
    const populatedByFacility = await Facility.populate(byFacility, { path: '_id', select: 'name type' });

    const mostBooked = populatedByFacility[0] || null;
    const leastBooked = populatedByFacility[populatedByFacility.length - 1] || null;

    // Peak booking periods — group by the hour portion of startTime (e.g. "14:00" -> "14")
    const peakPeriods = await Booking.aggregate([
      { $match: baseFilter },
      { $project: { hour: { $substrCP: ['$startTime', 0, 2] } } },
      { $group: { _id: '$hour', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Daily occupancy — bookings per calendar date
    const dailyOccupancy = await Booking.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$bookingDate', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      mostBookedFacility: mostBooked,
      leastUtilizedFacility: leastBooked,
      peakBookingHours: peakPeriods,
      dailyOccupancy
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating analytics overview.' });
  }
};

// PREDICT busy vs low-utilization periods, based on historical day-of-week patterns
exports.predictUtilization = async (req, res) => {
  try {
    const managedIds = await getManagedFacilityIds(req.user);
    const filter = { status: 'approved' };
    if (managedIds) filter.facilityId = { $in: managedIds };

    // Average bookings per day-of-week (1 = Sunday ... 7 = Saturday, MongoDB convention)
    const byWeekday = await Booking.aggregate([
      { $match: filter },
      { $project: { dayOfWeek: { $dayOfWeek: '$bookingDate' } } },
      { $group: { _id: '$dayOfWeek', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    if (byWeekday.length === 0) {
      return res.status(200).json({ message: 'Not enough booking history yet to generate a prediction.', prediction: [] });
    }

    const dayNames = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const average = byWeekday.reduce((sum, d) => sum + d.count, 0) / byWeekday.length;

    const prediction = byWeekday.map(d => ({
      day: dayNames[d._id],
      historicalBookings: d.count,
      forecast: d.count > average ? 'busy' : 'low-utilization'
    }));

    res.status(200).json({ averageBookingsPerActiveDay: average, prediction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating prediction.' });
  }
};