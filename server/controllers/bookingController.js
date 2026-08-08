const Booking = require('../models/Booking');
const Facility = require('../models/Facility');
const MaintenanceSchedule = require('../models/MaintenanceSchedule');
const RiskAlert = require('../models/RiskAlert');
const User = require('../models/User');
const { notify } = require('../services/notificationEngine');

// helper: get facility IDs this manager owns (admins see everything — returns null)
async function getManagedFacilityIds(user) {
  if (user.role === 'admin') return null;
  const facilities = await Facility.find({ managerId: user.id }).select('_id');
  return facilities.map(f => f._id);
}

// CREATE booking — with conflict detection + risk detection + notify the relevant manager
exports.createBooking = async (req, res) => {
  try {
    const { facilityId, bookingDate, startTime, endTime, expectedAttendance, purpose, urgency, peopleAffected } = req.body;

    const facility = await Facility.findById(facilityId);
    if (!facility) return res.status(404).json({ message: 'Facility not found.' });
    if (facility.status !== 'available') {
      return res.status(400).json({ message: 'This facility is not currently available for booking.' });
    }
    if (expectedAttendance > facility.capacity) {
      return res.status(400).json({ message: `Facility capacity (${facility.capacity}) is below expected attendance.` });
    }

    // Conflict check 1: overlapping bookings
    const conflict = await Booking.findOne({
      facilityId,
      bookingDate,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflict) {
      const alternative = await Facility.findOne({
        _id: { $ne: facilityId },
        status: 'available',
        capacity: { $gte: expectedAttendance }
      });

      return res.status(409).json({
        message: 'This facility is already booked for the requested time.',
        suggestedAlternative: alternative || null
      });
    }

    // Conflict check 2: maintenance windows
    const maintenanceConflict = await MaintenanceSchedule.findOne({
      facilityId,
      startDateTime: { $lt: new Date(`${bookingDate}T${endTime}`) },
      endDateTime: { $gt: new Date(`${bookingDate}T${startTime}`) }
    });

    if (maintenanceConflict) {
      return res.status(409).json({
        message: 'This facility is under scheduled maintenance during the requested time.',
        reason: maintenanceConflict.reason
      });
    }

    const waitingTime = 0;
    const priorityScore = (urgency || 1) * (waitingTime + 1) * (peopleAffected || 1);

    const booking = new Booking({
      userId: req.user.id,
      facilityId,
      bookingDate,
      startTime,
      endTime,
      expectedAttendance,
      purpose,
      urgency,
      peopleAffected,
      waitingTime,
      priorityScore
    });

    await booking.save();

    // Risk Detection: flag if this user made 3+ booking attempts for the same facility/date within the last hour
    const recentAttempts = await Booking.countDocuments({
      userId: req.user.id,
      facilityId,
      bookingDate,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });

    if (recentAttempts >= 3) {
      await RiskAlert.create({
        type: 'multiple_booking_attempts',
        relatedUserId: req.user.id,
        relatedBookingId: booking._id,
        description: `User made ${recentAttempts} booking attempts for the same facility/date within an hour.`
      });
    }

    // Notification Engine: notify the facility's manager (if assigned) that a booking is pending their approval
    if (facility.managerId) {
      await notify(
        facility.managerId,
        'pending_approval',
        `A new booking for ${facility.name} on ${bookingDate} is awaiting your approval.`,
        booking._id
      );
    }

    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating booking.' });
  }
};

// GET my bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate('facilityId', 'name type location');
    res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching bookings.' });
  }
};

// CANCEL booking (owner only) — notify the manager it's been cancelled
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('facilityId');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only cancel your own bookings.' });
    }
    booking.status = 'cancelled';
    await booking.save();

    if (booking.facilityId?.managerId) {
      await notify(
        booking.facilityId.managerId,
        'booking_cancelled',
        `A booking for ${booking.facilityId.name} on ${booking.bookingDate.toISOString().split('T')[0]} was cancelled by the requester.`,
        booking._id
      );
    }

    res.status(200).json({ message: 'Booking cancelled.', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error cancelling booking.' });
  }
};

// GET pending bookings — scoped to the manager's own facilities (admins see all)
exports.getPendingBookings = async (req, res) => {
  try {
    const managedIds = await getManagedFacilityIds(req.user);
    const filter = { status: 'pending' };
    if (managedIds) filter.facilityId = { $in: managedIds };

    const bookings = await Booking.find(filter)
      .populate('facilityId', 'name type location')
      .populate('userId', 'name email')
      .sort({ priorityScore: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching pending bookings.' });
  }
};

// APPROVE / REJECT booking — only if the manager owns that facility — notify the requester
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected.' });
    }

    const booking = await Booking.findById(req.params.id).populate('facilityId');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    if (req.user.role === 'facility_manager' &&
        booking.facilityId.managerId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only manage bookings for facilities you are assigned to.' });
    }

    booking.status = status;
    booking.approvedBy = req.user.id;
    booking.approvalTimestamp = new Date();
    await booking.save();

    const notifType = status === 'approved' ? 'booking_confirmed' : 'booking_rejected';
    const notifMessage = status === 'approved'
      ? `Your booking for ${booking.facilityId.name} on ${booking.bookingDate.toISOString().split('T')[0]} has been approved.`
      : `Your booking for ${booking.facilityId.name} on ${booking.bookingDate.toISOString().split('T')[0]} was rejected.`;

    await notify(booking.userId, notifType, notifMessage, booking._id);

    res.status(200).json({ message: `Booking ${status}.`, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating booking status.' });
  }
};

// VIEW CALENDAR — bookings for a specific facility
exports.getFacilityCalendar = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const facility = await Facility.findById(facilityId);
    if (!facility) return res.status(404).json({ message: 'Facility not found.' });

    if (req.user.role === 'facility_manager' && facility.managerId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only view the calendar for facilities you manage.' });
    }

    const bookings = await Booking.find({
      facilityId,
      status: { $in: ['pending', 'approved'] }
    }).select('bookingDate startTime endTime status purpose').sort({ bookingDate: 1 });

    res.status(200).json({ facility: facility.name, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching calendar.' });
  }
};

// MONITOR UTILIZATION — booking counts per managed facility
exports.getUtilization = async (req, res) => {
  try {
    const managedIds = await getManagedFacilityIds(req.user);
    const filter = { status: 'approved' };
    if (managedIds) filter.facilityId = { $in: managedIds };

    const results = await Booking.aggregate([
      { $match: filter },
      { $group: { _id: '$facilityId', totalBookings: { $sum: 1 } } },
      { $sort: { totalBookings: -1 } }
    ]);

    const populated = await Facility.populate(results, { path: '_id', select: 'name type capacity' });
    res.status(200).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching utilization.' });
  }
};