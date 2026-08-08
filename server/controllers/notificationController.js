const Notification = require('../models/Notification');

// GET my notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('bookingId', 'bookingDate startTime endTime status');
    res.status(200).json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching notifications.' });
  }
};

// MARK as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found.' });
    res.status(200).json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating notification.' });
  }
};