const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// REGISTER — now also collects and hashes a security question/answer
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, securityQuestion, securityAnswer } = req.body;

    if (!name || !email || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ message: 'Name, email, password, security question, and answer are all required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Normalize the answer (lowercase, trimmed) before hashing so "Blue" and "blue " both match later
    const normalizedAnswer = securityAnswer.trim().toLowerCase();
    const securityAnswerHash = await bcrypt.hash(normalizedAnswer, 10);

    const newUser = new User({
      name,
      email,
      passwordHash,
      role: role || 'user',
      department,
      securityQuestion,
      securityAnswerHash
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// GET SECURITY QUESTION — step 1 of password reset: looks up the question for a given email
// without revealing whether the answer is right or wrong yet
exports.getSecurityQuestion = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });
    if (!user) {
      // Deliberately vague message — doesn't confirm/deny whether this email is registered
      return res.status(404).json({ message: 'No account found with that email.' });
    }

    res.status(200).json({ securityQuestion: user.securityQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching security question.' });
  }
};

// RESET PASSWORD — step 2: verifies the security answer, then sets a new password
exports.resetPassword = async (req, res) => {
  try {
    const { email, securityAnswer, newPassword } = req.body;

    if (!email || !securityAnswer || !newPassword) {
      return res.status(400).json({ message: 'Email, security answer, and new password are all required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email.' });
    }

    const normalizedAnswer = securityAnswer.trim().toLowerCase();
    const isAnswerCorrect = await bcrypt.compare(normalizedAnswer, user.securityAnswerHash);

    if (!isAnswerCorrect) {
      return res.status(401).json({ message: 'Security answer is incorrect.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error resetting password.' });
  }
};