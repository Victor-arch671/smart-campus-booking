// Base URL for booking backend routes, reused here for admin-level oversight
const ADMIN_BOOKING_API_BASE = 'http://localhost:5000/api/bookings';

// Fetches the pending booking queue — for an admin, this returns EVERY pending
// booking system-wide, not just ones tied to facilities they manage
async function fetchPendingBookingsAsAdmin() {
  const res = await fetch(`${ADMIN_BOOKING_API_BASE}/pending`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

// Approves or rejects a booking (admin can act on ANY booking, including unassigned facilities)
async function updateBookingStatusAsAdmin(bookingId, status) {
  const res = await fetch(`${ADMIN_BOOKING_API_BASE}/${bookingId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ status })
  });
  return res.json();
}