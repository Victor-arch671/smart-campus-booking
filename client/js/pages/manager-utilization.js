// Only facility managers (or admins previewing) can view this page
requireRole(['facility_manager', 'admin']);
document.getElementById('logoutBtn').addEventListener('click', logout);

const tableBody = document.getElementById('utilizationTableBody');

// Loads utilization stats — the backend already scopes this to only facilities this manager owns
async function loadUtilization() {
  const results = await fetchUtilizationAsManager();
  tableBody.innerHTML = '';

  if (!Array.isArray(results) || results.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="3">No approved bookings yet for your facilities.</td></tr>';
    return;
  }

  results.forEach(r => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td data-label="Facility">${r._id?.name || 'Unknown'}</td>
      <td data-label="Type">${r._id?.type || '-'}</td>
      <td data-label="Total Approved Bookings" class="data">${r.totalBookings}</td>
    `;
    tableBody.appendChild(row);
  });
}

// Load utilization data as soon as the page opens
loadUtilization();