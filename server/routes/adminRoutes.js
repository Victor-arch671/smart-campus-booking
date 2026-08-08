const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, adminResetPassword } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/users', protect, authorize('admin'), getUsers);
router.post('/users', protect, authorize('admin'), createUser);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.put('/users/:id/reset-password', protect, authorize('admin'), adminResetPassword);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;