const User = require('../models/User');
const bcrypt = require('bcrypt');

// GET all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash -securityAnswerHash');
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
};

// CREATE a user directly (admin only) — bypasses self-registration
exports.createUser = async (req, res) => {
  try {
    console.log('RECEIVED BODY:', req.body); // TEMPORARY — remove after debugging

    const { name, email, password, role, department, securityQuestion, securityAnswer } = req.body;

    if (!name || !email || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ message: 'Name, email, password, security question, and answer are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const securityAnswerHash = await bcrypt.hash(securityAnswer.trim().toLowerCase(), 10);

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

    const userToReturn = newUser.toObject();
    delete userToReturn.passwordHash;
    delete userToReturn.securityAnswerHash;

    res.status(201).json(userToReturn);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating user.' });
  }
};

// UPDATE a user's role or details
exports.updateUser = async (req, res) => {
  try {
    const { name, role, department } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (role) updates.role = role;
    if (department) updates.department = department;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash -securityAnswerHash');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating user.' });
  }
};

// ADMIN-INITIATED PASSWORD RESET
exports.adminResetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'A new password of at least 6 characters is required.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: `Password reset for ${user.name}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error resetting password.' });
  }
};

// DELETE a user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ message: 'User deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting user.' });
  }
};