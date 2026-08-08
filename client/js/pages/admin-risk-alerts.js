// Only admins can view risk alerts
requireRole(['admin']);

document.getElementById('logoutBtn').addEventListener('click', logout);

const tableBody = document.getElementById('riskTableBody');
const statusFilter = document.getElementById('statusFilter');

// Maps each alert type to a friendlier, readable label
const typeLabels = {
  duplicate_attendance: 'Duplicate Attendance',
  excessive_complaints: 'Excessive Complaints',
  multiple_booking_attempts: 'Multiple Booking Attempts',
  suspicious_login: 'Suspicious Login'
};

// Maps each status to a badge style, matching the design system's badge classes
const statusBadge = {
  open: 'badge-alert',
  reviewed: 'badge-confirmed',
  dismissed: 'badge-neutral'
};

// Loads risk alerts based on the currently selected filter
async function loadRiskAlerts() {
  const alerts = await fetchRiskAlerts(statusFilter.value);
  tableBody.innerHTML = '';

  if (!Array.isArray(alerts) || alerts.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">No risk alerts match this filter.</td></tr>';
    return;
  }

  alerts.forEach(a => {
    const row = document.createElement('tr');
    const flaggedAt = new Date(a.flaggedAt).toLocaleString();
    const userLabel = a.relatedUserId ? `${a.relatedUserId.name} (${a.relatedUserId.email})` : '-';

    row.innerHTML = `
      <td data-label="Type">${typeLabels[a.type] || a.type}</td>
      <td data-label="User">${userLabel}</td>
      <td data-label="Description">${a.description || '-'}</td>
      <td data-label="Flagged At" class="data">${flaggedAt}</td>
      <td data-label="Status"><span class="badge ${statusBadge[a.status]}">${a.status}</span></td>
      <td data-label="Action">
        ${a.status === 'open' ? `
          <button class="reviewBtn" data-id="${a._id}">Mark Reviewed</button>
          <button class="deleteBtn dismissBtn" data-id="${a._id}">Dismiss</button>
        ` : '-'}
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Wire up "Mark Reviewed" buttons
  document.querySelectorAll('.reviewBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await updateRiskAlertStatus(btn.getAttribute('data-id'), 'reviewed');
      loadRiskAlerts(); // refresh to reflect the new status
    });
  });

  // Wire up "Dismiss" buttons
  document.querySelectorAll('.dismissBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await updateRiskAlertStatus(btn.getAttribute('data-id'), 'dismissed');
      loadRiskAlerts();
    });
  });
}

// Reload the table whenever the filter dropdown changes
statusFilter.addEventListener('change', loadRiskAlerts);

// Load alerts (defaults to "open" since that's the most actionable view) as soon as the page opens
loadRiskAlerts();