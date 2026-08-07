const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;