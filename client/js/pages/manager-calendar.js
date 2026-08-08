// Only facility managers (or admins previewing) can view this page
requireRole(['facility_manager', 'admin']);
document.getElementById('logoutBtn').addEventListener('click', logout);

const facilitySelect = document.getElementById('facilitySelect');
const tableBody = document.getElementById('calendarTableBody');
const pageMsg = document.getElementById('pageMsg');

// Maps each booking status to a badge style, matching the design system
const statusBadge = {
  pending: 'badge-pending',
  approved: 'badge-confirmed',
  rejected: 'badge-alert',
  cancelled: 'badge-neutral',
  completed: 'badge-neutral'
};

// Loads all facilities into the dropdown — the backend's calendar endpoint itself
// will reject the request if this manager doesn't actually own the selected facility
async function loadFacilitiesIntoPicker() {
  const facilities = await fetchFacilities();
  facilities.forEach(f => {
    const option = document.createElement('option');
    option.value = f._id;
    option.textContent = `${f.name} (${f.type})`;
    facilitySelect.appendChild(option);
  });
}

// When a facility is picked, load its calendar
facilitySelect.addEventListener('change', async () => {
  const facilityId = facilitySelect.value;
  tableBody.innerHTML = '';
  pageMsg.textContent = '';

  if (!facilityId) return;

  const result = await fetchFacilityCalendar(facilityId);

  if (!result.bookings) {
    // Backend returns a 403 here if this manager doesn't own the facility — surfaced clearly
    pageMsg.textContent = result.message || 'Failed to load calendar.';
    pageMsg.className = 'error';
    return;
  }

  if (result.bookings.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4">No upcoming bookings for this facility.</td></tr>';
    return;
  }

  result.bookings.forEach(b => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td data-label="Date" class="data">${new Date(b.bookingDate).toLocaleDateString()}</td>
      <td data-label="Time" class="data">${b.startTime} - ${b.endTime}</td>
      <td data-label="Status"><span class="badge ${statusBadge[b.status]}">${b.status}</span></td>
      <td data-label="Purpose">${b.purpose || '-'}</td>
    `;
    tableBody.appendChild(row);
  });
});

// Populate the facility dropdown as soon as the page loads
loadFacilitiesIntoPicker();