// Base URL reused from bookings — Facility Manager uses the same endpoints as Admin,
// but the backend automatically scopes results to only facilities this manager owns
const MANAGER_BOOKING_API_BASE = 'http://localhost:5000/api/bookings';

// Fetches pending bookings — scoped to this manager's own facilities by the backend
async function fetchPendingBookingsAsManager() {
  const res = await fetch(`${MANAGER_BOOKING_API_BASE}/pending`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

// Approves or rejects a booking — backend rejects this if the manager doesn't own the facility
async function updateBookingStatusAsManager(bookingId, status) {
  const res = await fetch(`${MANAGER_BOOKING_API_BASE}/${bookingId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ status })
  });
  return res.json();
}

// Fetches the booking calendar for a specific facility (must be one this manager owns)
async function fetchFacilityCalendar(facilityId) {
  const res = await fetch(`${MANAGER_BOOKING_API_BASE}/calendar/${facilityId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

// Fetches utilization stats — scoped to this manager's own facilities
async function fetchUtilizationAsManager() {
  const res = await fetch(`${MANAGER_BOOKING_API_BASE}/utilization`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}