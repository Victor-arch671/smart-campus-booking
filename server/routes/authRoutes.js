const express = require('express');
const router = express.Router();
const { register, login, getSecurityQuestion, resetPassword } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);

// Forgot password flow — both public, no token required (the user isn't logged in yet)
router.get('/security-question/:email', getSecurityQuestion);
router.post('/reset-password', resetPassword);

router.get('/me', protect, (req, res) => {
  res.status(200).json({ message: 'You are authenticated.', user: req.user });
});

router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.status(200).json({ message: 'Welcome, admin.' });
});

module.exports = router;