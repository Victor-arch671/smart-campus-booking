const Facility = require('../models/Facility');
const Booking = require('../models/Booking');
const MaintenanceSchedule = require('../models/MaintenanceSchedule');

// GET all facilities (with optional filters)
exports.getFacilities = async (req, res) => {
  try {
    const { minCapacity, hasProjector, hasAC, type } = req.query;
    const filter = {};

    if (minCapacity) filter.capacity = { $gte: Number(minCapacity) };
    if (hasProjector) filter.hasProjector = hasProjector === 'true';
    if (hasAC) filter.hasAC = hasAC === 'true';
    if (type) filter.type = type;

    const facilities = await Facility.find(filter);
    res.status(200).json(facilities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching facilities.' });
  }
};

// GET single facility
exports.getFacilityById = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found.' });
    res.status(200).json(facility);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching facility.' });
  }
};

// CREATE facility (Admin only)
exports.createFacility = async (req, res) => {
  try {
    const facility = new Facility(req.body);
    await facility.save();
    res.status(201).json(facility);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating facility.' });
  }
};

// UPDATE facility (Admin only)
exports.updateFacility = async (req, res) => {
  try {
    const facility = await Facility.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!facility) return res.status(404).json({ message: 'Facility not found.' });
    res.status(200).json(facility);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating facility.' });
  }
};

// DELETE facility (Admin only)
exports.deleteFacility = async (req, res) => {
  try {
    const facility = await Facility.findByIdAndDelete(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found.' });
    res.status(200).json({ message: 'Facility deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting facility.' });
  }
};

// SMART RECOMMENDATION — matches the brief's example exactly:
// attendance, projector, AC, time in -> best matching, currently free facility out
exports.recommendFacility = async (req, res) => {
  try {
    const { expectedAttendance, hasProjector, hasAC, bookingDate, startTime, endTime } = req.query;

    if (!expectedAttendance || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({ message: 'expectedAttendance, bookingDate, startTime, and endTime are required.' });
    }

    const attendance = Number(expectedAttendance);

    // Step 1: filter by hard requirements
    const filter = {
      status: 'available',
      capacity: { $gte: attendance }
    };
    if (hasProjector === 'true') filter.hasProjector = true;
    if (hasAC === 'true') filter.hasAC = true;

    const candidates = await Facility.find(filter);

    if (candidates.length === 0) {
      return res.status(404).json({ message: 'No facility matches the required capacity/equipment.' });
    }

    const candidateIds = candidates.map(f => f._id);

    // Step 2: ONE query for all conflicting bookings across every candidate
    const conflictingBookings = await Booking.find({
      facilityId: { $in: candidateIds },
      bookingDate,
      status: { $in: ['pending', 'approved'] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    }).select('facilityId');

    // Step 3: ONE query for all conflicting maintenance windows across every candidate
    const conflictingMaintenance = await MaintenanceSchedule.find({
      facilityId: { $in: candidateIds },
      startDateTime: { $lt: new Date(`${bookingDate}T${endTime}`) },
      endDateTime: { $gt: new Date(`${bookingDate}T${startTime}`) }
    }).select('facilityId');

    // Build a quick lookup set of facility IDs that are blocked
    const blockedIds = new Set([
      ...conflictingBookings.map(b => b.facilityId.toString()),
      ...conflictingMaintenance.map(m => m.facilityId.toString())
    ]);

    // Step 4: filter candidates in memory — no more per-candidate DB calls
    const available = candidates.filter(f => !blockedIds.has(f._id.toString()));

    if (available.length === 0) {
      return res.status(404).json({ message: 'No facility matching your requirements is free at that time.' });
    }

    // Step 5: rank by best fit — smallest capacity that still satisfies attendance
    available.sort((a, b) => a.capacity - b.capacity);
    const best = available[0];

    const reasons = ['Available at the requested time', `Capacity ${best.capacity}`];
    if (best.hasProjector) reasons.push('Has projector');
    if (best.hasAC) reasons.push('Air conditioned');

    res.status(200).json({
      recommended: best,
      reasons,
      otherOptions: available.slice(1, 4)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating recommendation.' });
  }
};