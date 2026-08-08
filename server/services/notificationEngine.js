const Notification = require('../models/Notification');

// Creates a notification for a single user
exports.notify = async (userId, type, message, bookingId = null) => {
  try {
    await Notification.create({ userId, type, message, bookingId });
  } catch (err) {
    console.error('Notification creation failed:', err);
    // deliberately not thrown — a failed notification shouldn't break the main action
  }
};