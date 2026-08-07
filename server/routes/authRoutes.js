const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

module.exports = router;

const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, (req, res) => {
  res.status(200).json({ message: 'You are authenticated.', user: req.user });
});

router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.status(200).json({ message: 'Welcome, admin.' });
});