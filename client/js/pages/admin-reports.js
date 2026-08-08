// Only admins can view system reports
requireRole(['admin']);

document.getElementById('logoutBtn').addEventListener('click', logout);

// Loads the system report and renders all three sections: totals, status breakdown, top facilities
async function loadReport() {
  const report = await fetchSystemReport();

  if (!report.totalFacilities && report.totalFacilities !== 0) {
    document.getElementById('totalsGrid').textContent = report.message || 'Failed to load report.';
    return;
  }

  // ---- Totals summary cards ----
  const totalsGrid = document.getElementById('totalsGrid');
  totalsGrid.innerHTML = `
    <div class="report-card">
      <span class="report-card-label">Total Facilities</span>
      <span class="report-card-value">${report.totalFacilities}</span>
    </div>
    <div class="report-card">
      <span class="report-card-label">Total Users</span>
      <span class="report-card-value">${report.totalUsers}</span>
    </div>
    <div class="report-card">
      <span class="report-card-label">Total Bookings</span>
      <span class="report-card-value">${report.totalBookings}</span>
    </div>
  `;

  // ---- Bookings by status table ----
  const statusBody = document.getElementById('statusTableBody');
  statusBody.innerHTML = '';
  report.bookingsByStatus.forEach(s => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td data-label="Status" style="text-transform: capitalize;">${s._id}</td>
      <td data-label="Count" class="data">${s.count}</td>
    `;
    statusBody.appendChild(row);
  });

  // ---- Top facilities table ----
  const topBody = document.getElementById('topFacilitiesTableBody');
  topBody.innerHTML = '';
  report.topFacilities.forEach(f => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td data-label="Facility">${f._id?.name || 'Unknown'}</td>
      <td data-label="Type">${f._id?.type || '-'}</td>
      <td data-label="Total Bookings" class="data">${f.totalBookings}</td>
    `;
    topBody.appendChild(row);
  });

  // ---- Timestamp ----
  document.getElementById('generatedAt').textContent =
    `Report generated: ${new Date(report.generatedAt).toLocaleString()}`;
}

// Load the report as soon as the page opens
loadReport();