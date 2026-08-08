// Base URL for maintenance-related backend routes
const MAINTENANCE_API_BASE = 'http://localhost:5000/api/maintenance';

// Creates a new maintenance window for a facility (admin only)
async function createMaintenanceWindow(data) {
  const res = await fetch(MAINTENANCE_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Fetches all maintenance windows for a specific facility
async function fetchMaintenanceForFacility(facilityId) {
  const res = await fetch(`${MAINTENANCE_API_BASE}/facility/${facilityId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

// Deletes a maintenance window (admin only)
async function deleteMaintenanceWindow(id) {
  const res = await fetch(`${MAINTENANCE_API_BASE}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}