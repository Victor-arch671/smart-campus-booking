// Base URL for all admin-only backend routes
const ADMIN_API_BASE = 'http://localhost:5000/api/admin';

// Fetches the full list of registered users (admin only)
async function fetchUsers() {
  const res = await fetch(`${ADMIN_API_BASE}/users`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

// Fetches only users with the facility_manager role, for facility-assignment dropdowns
async function fetchManagers() {
  const allUsers = await fetchUsers();
  if (!Array.isArray(allUsers)) return [];
  return allUsers.filter(u => u.role === 'facility_manager');
}

// Creates a new user directly (admin only) — no self-registration needed
async function createUser(data) {
  const res = await fetch(`${ADMIN_API_BASE}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Updates a user's role
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

// Updates a user's display name (e.g. to rename a test account to something clearer)
async function updateUserName(userId, name) {
  const res = await fetch(`${ADMIN_API_BASE}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ name })
  });
  return res.json();
}

// Admin sets a brand new password for a user — does not reveal or need the old one
async function adminResetPassword(userId, newPassword) {
  const res = await fetch(`${ADMIN_API_BASE}/users/${userId}/reset-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ newPassword })
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