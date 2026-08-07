const User = require('../models/User');

// GET all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching users.' });
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

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating user.' });
  }
};

// DELETE / deactivate a user
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