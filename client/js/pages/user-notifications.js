// Only logged-in users can view their own notifications
requireAuth();
document.getElementById('logoutBtn').addEventListener('click', logout);

const listContainer = document.getElementById('notificationsList');

// Maps each notification type to a friendlier, readable label
const typeLabels = {
  reminder: 'Reminder',
  pending_approval: 'Pending Approval',
  booking_confirmed: 'Booking Confirmed',
  booking_rejected: 'Booking Rejected',
  booking_cancelled: 'Booking Cancelled'
};

// Loads and displays the logged-in user's notifications as a list of cards
async function loadNotificationsList() {
  const notifications = await fetchMyNotifications();
  listContainer.innerHTML = '';

  if (!Array.isArray(notifications) || notifications.length === 0) {
    listContainer.innerHTML = '<p>You have no notifications yet.</p>';
    return;
  }

  notifications.forEach(n => {
    const card = document.createElement('div');
    card.className = `notification-card ${n.isRead ? 'read' : 'unread'}`;

    card.innerHTML = `
      <div class="notification-header">
        <span class="badge badge-neutral">${typeLabels[n.type] || n.type}</span>
        <span class="notification-time data">${new Date(n.createdAt).toLocaleString()}</span>
      </div>
      <p>${n.message}</p>
      ${!n.isRead ? `<button class="markReadBtn" data-id="${n._id}">Mark as Read</button>` : ''}
    `;
    listContainer.appendChild(card);
  });

  // Wire up "Mark as Read" buttons
  document.querySelectorAll('.markReadBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await markNotificationRead(btn.getAttribute('data-id'));
      loadNotificationsList(); // refresh so the card updates to its "read" style
    });
  });
}

// Load notifications as soon as the page opens
loadNotificationsList();