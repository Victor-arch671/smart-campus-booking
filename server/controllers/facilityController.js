const Facility = require('../models/Facility');

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