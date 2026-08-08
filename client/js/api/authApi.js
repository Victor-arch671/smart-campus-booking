const API_BASE = 'http://localhost:5000/api';

async function registerUser(data) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function loginUser(data) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Fetches the security question for a given email — step 1 of password reset
async function getSecurityQuestion(email) {
  const res = await fetch(`${API_BASE}/auth/security-question/${encodeURIComponent(email)}`);
  return res.json();
}

// Submits the security answer and new password — step 2 of password reset
async function resetPassword(data) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}