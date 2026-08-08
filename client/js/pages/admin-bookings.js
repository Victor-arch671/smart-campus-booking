// Only admins can view this system-wide booking queue
requireRole(['admin']);

document.getElementById('logoutBtn').addEventListener('click', logout);

const tableBody = document.getElementById('bookingsTableBody');
const statusMsg = document.getElementById('statusMsg');

// Loads and displays every pending booking system-wide, sorted by priority score
async function loadPendingBookings() {
  const bookings = await fetchPendingBookingsAsAdmin();
  tableBody.innerHTML = '';

  if (!Array.isArray(bookings) || bookings.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7">No pending bookings right now.</td></tr>';
    return;
  }

  bookings.forEach(b => {
    const row = document.createElement('tr');
    const facilityLabel = b.facilityId ? `${b.facilityId.name} (${b.facilityId.location || 'no location'})` : 'Unknown facility';
    const userLabel = b.userId ? `${b.userId.name} (${b.userId.email})` : 'Unknown user';

    row.innerHTML = `
      <td data-label="Facility">${facilityLabel}</td>
      <td data-label="Requested By">${userLabel}</td>
      <td data-label="Date" class="data">${new Date(b.bookingDate).toLocaleDateString()}</td>
      <td data-label="Time" class="data">${b.startTime} - ${b.endTime}</td>
      <td data-label="Attendance" class="data">${b.expectedAttendance}</td>
      <td data-label="Priority Score" class="data">${b.priorityScore}</td>
      <td data-label="Action">
        <button class="saveStatusBtn approveBtn" data-id="${b._id}" data-facility="${facilityLabel}">Approve</button>
        <button class="deleteBtn rejectBtn" data-id="${b._id}" data-facility="${facilityLabel}">Reject</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Wire up "Approve" buttons — always shows the GREEN success message on success
  document.querySelectorAll('.approveBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const facility = btn.getAttribute('data-facility');
      const result = await updateBookingStatusAsAdmin(btn.getAttribute('data-id'), 'approved');

      if (result.booking) {
        statusMsg.textContent = `Booking for ${facility} approved successfully.`;
        statusMsg.className = 'success'; // green
      } else {
        statusMsg.textContent = result.message || 'Failed to approve booking.';
        statusMsg.className = 'error'; // red — this is an actual failure, so red is correct here too
      }

      loadPendingBookings();
    });
  });

  // Wire up "Reject" buttons — always shows the RED error/alert style, even on success,
  // since rejecting a booking is a negative outcome for the requester and should read that way
  document.querySelectorAll('.rejectBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const facility = btn.getAttribute('data-facility');
      const result = await updateBookingStatusAsAdmin(btn.getAttribute('data-id'), 'rejected');

      if (result.booking) {
        statusMsg.textContent = `Booking for ${facility} rejected.`;
        statusMsg.className = 'error'; // red, even though the API call itself succeeded
      } else {
        statusMsg.textContent = result.message || 'Failed to reject booking.';
        statusMsg.className = 'error';
      }

      loadPendingBookings();
    });
  });
}

loadPendingBookings();