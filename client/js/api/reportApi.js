// Base URL for reporting backend routes
const REPORT_API_BASE = 'http://localhost:5000/api/reports';

// Fetches the system-wide report: totals, booking status breakdown, top facilities
async function fetchSystemReport() {
  const res = await fetch(`${REPORT_API_BASE}/system`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}