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

    // Step 2: remove any candidate that's actually booked or under maintenance at that time
    const available = [];
    for (const facility of candidates) {
      const bookingConflict = await Booking.findOne({
        facilityId: facility._id,
        bookingDate,
        status: { $in: ['pending', 'approved'] },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      });

      const maintenanceConflict = await MaintenanceSchedule.findOne({
        facilityId: facility._id,
        startDateTime: { $lt: new Date(`${bookingDate}T${endTime}`) },
        endDateTime: { $gt: new Date(`${bookingDate}T${startTime}`) }
      });

      if (!bookingConflict && !maintenanceConflict) {
        available.push(facility);
      }
    }

    if (available.length === 0) {
      return res.status(404).json({ message: 'No facility matching your requirements is free at that time.' });
    }

    // Step 3: rank by best fit — smallest capacity that still satisfies attendance (avoids wasting a huge hall on a small group)
    available.sort((a, b) => a.capacity - b.capacity);
    const best = available[0];

    const reasons = ['Available at the requested time', `Capacity ${best.capacity}`];
    if (best.hasProjector) reasons.push('Has projector');
    if (best.hasAC) reasons.push('Air conditioned');

    res.status(200).json({
      recommended: best,
      reasons,
      otherOptions: available.slice(1, 4) // up to 3 runner-ups
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating recommendation.' });
  }
};