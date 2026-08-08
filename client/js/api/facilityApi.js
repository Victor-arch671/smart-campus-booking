// Base URL for facility-related backend routes
const FACILITY_API_BASE = 'http://localhost:5000/api/facilities';

// Fetches all facilities (public route, no auth needed, but we send the token anyway for consistency)
async function fetchFacilities() {
  const res = await fetch(FACILITY_API_BASE);
  return res.json();
}

// Creates a new facility (admin only)
async function createFacility(data) {
  const res = await fetch(FACILITY_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Updates an existing facility (admin only) — used for editing details or assigning a manager
async function updateFacility(id, data) {
  const res = await fetch(`${FACILITY_API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Deletes a facility (admin only)
async function deleteFacility(id) {
  const res = await fetch(`${FACILITY_API_BASE}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}