// Base URL for risk alert backend routes
const RISK_API_BASE = 'http://localhost:5000/api/risk-alerts';

// Fetches risk alerts — optionally filtered by status (open / reviewed / dismissed)
async function fetchRiskAlerts(status = '') {
  const url = status ? `${RISK_API_BASE}?status=${status}` : RISK_API_BASE;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

// Updates a risk alert's status (admin marks it reviewed or dismissed)
async function updateRiskAlertStatus(id, status) {
  const res = await fetch(`${RISK_API_BASE}/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ status })
  });
  return res.json();
}