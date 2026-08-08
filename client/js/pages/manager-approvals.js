// Only facility managers (or admins previewing) can view this page
requireRole(['facility_manager', 'admin']);
document.getElementById('logoutBtn').addEventListener('click', logout);

const tableBody = document.getElementById('bookingsTableBody');
const statusMsg = document.getElementById('statusMsg');

// Loads pending bookings — the backend already scopes this to only facilities this manager owns
async function loadPendingApprovals() {
  const bookings = await fetchPendingBookingsAsManager();
  tableBody.innerHTML = '';

  if (!Array.isArray(bookings) || bookings.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7">No pending bookings for your facilities right now.</td></tr>';
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

  // Wire up "Approve" — shows a green success message
  document.querySelectorAll('.approveBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const facility = btn.getAttribute('data-facility');
      const result = await updateBookingStatusAsManager(btn.getAttribute('data-id'), 'approved');

      if (result.booking) {
        statusMsg.textContent = `Booking for ${facility} approved successfully.`;
        statusMsg.className = 'success';
      } else {
        statusMsg.textContent = result.message || 'Failed to approve booking.';
        statusMsg.className = 'error';
      }
      loadPendingApprovals();
    });
  });

  // Wire up "Reject" — always shows red, matching the admin page's convention
  document.querySelectorAll('.rejectBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const facility = btn.getAttribute('data-facility');
      const result = await updateBookingStatusAsManager(btn.getAttribute('data-id'), 'rejected');

      statusMsg.textContent = result.booking
        ? `Booking for ${facility} rejected.`
        : (result.message || 'Failed to reject booking.');
      statusMsg.className = 'error';
      loadPendingApprovals();
    });
  });
}

loadPendingApprovals();