const express = require('express');
const router = express.Router();
const {
  getFacilities, getFacilityById, createFacility, updateFacility, deleteFacility, recommendFacility
} = require('../controllers/facilityController');
const { protect, authorize } = require('../middleware/auth');

router.get('/recommend', protect, recommendFacility);   // put this BEFORE /:id so "recommend" isn't treated as an ID
router.get('/', getFacilities);
router.get('/:id', getFacilityById);
router.post('/', protect, authorize('admin'), createFacility);
router.put('/:id', protect, authorize('admin'), updateFacility);
router.delete('/:id', protect, authorize('admin'), deleteFacility);

module.exports = router;