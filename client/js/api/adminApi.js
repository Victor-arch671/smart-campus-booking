// Base URL for all admin-only backend routes
const ADMIN_API_BASE = 'http://localhost:5000/api/admin';

// Fetches the full list of registered users (admin only)
async function fetchUsers() {
  const res = await fetch(`${ADMIN_API_BASE}/users`, {
    headers: { 'Authorization': `Bearer ${getToken()}` } // token proves this request is coming from a logged-in admin
  });
  return res.json();
}

// Updates a single user's role (e.g. promote a user to facility_manager or admin)
async function updateUserRole(userId, role) {
  const res = await fetch(`${ADMIN_API_BASE}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ role })
  });
  return res.json();
}

// Deletes a user account entirely (admin only)
async function deleteUserAccount(userId) {
  const res = await fetch(`${ADMIN_API_BASE}/users/${userId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}