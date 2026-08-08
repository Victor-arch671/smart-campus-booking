// Only logged-in users can view their own bookings
requireAuth();
document.getElementById('logoutBtn').addEventListener('click', logout);

const tableBody = document.getElementById('bookingsTableBody');
const statusMsg = document.getElementById('statusMsg');

// Maps each booking status to a badge style, matching the design system
const statusBadge = {
  pending: 'badge-pending',
  approved: 'badge-confirmed',
  rejected: 'badge-alert',
  cancelled: 'badge-neutral',
  completed: 'badge-neutral'
};

// Loads and displays the logged-in user's own bookings
async function loadMyBookingsList() {
  const bookings = await fetchMyBookings();
  tableBody.innerHTML = '';

  if (!Array.isArray(bookings) || bookings.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">You have no bookings yet. Try Search &amp; Book.</td></tr>';
    return;
  }

  bookings.forEach(b => {
    const row = document.createElement('tr');
    const facilityLabel = b.facilityId ? `${b.facilityId.name} (${b.facilityId.location || 'no location'})` : 'Unknown facility';

    // Only pending or approved bookings can still be cancelled — no point cancelling something already done
    const canCancel = ['pending', 'approved'].includes(b.status);

    row.innerHTML = `
      <td data-label="Facility">${facilityLabel}</td>
      <td data-label="Date" class="data">${new Date(b.bookingDate).toLocaleDateString()}</td>
      <td data-label="Time" class="data">${b.startTime} - ${b.endTime}</td>
      <td data-label="Purpose">${b.purpose || '-'}</td>
      <td data-label="Status"><span class="badge ${statusBadge[b.status]}">${b.status}</span></td>
      <td data-label="Action">
        ${canCancel ? `<button class="deleteBtn cancelBtn" data-id="${b._id}">Cancel</button>` : '-'}
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Wire up "Cancel" buttons
  document.querySelectorAll('.cancelBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Cancel this booking?')) return;

      const result = await cancelBooking(btn.getAttribute('data-id'));

      if (result.booking) {
        statusMsg.textContent = 'Booking cancelled successfully.';
        statusMsg.className = 'success';
      } else {
        statusMsg.textContent = result.message || 'Failed to cancel booking.';
        statusMsg.className = 'error';
      }

      loadMyBookingsList(); // refresh to reflect the cancellation
    });
  });
}

// Load the booking list as soon as the page opens
loadMyBookingsList();