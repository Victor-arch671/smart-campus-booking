// Base URLs for booking, facility recommendation, and notification routes
const BOOKING_API_BASE = 'http://localhost:5000/api/bookings';
const RECOMMEND_API_BASE = 'http://localhost:5000/api/facilities/recommend';
const NOTIFICATION_API_BASE = 'http://localhost:5000/api/notifications';

// Gets a smart facility recommendation based on the user's requirements
async function getRecommendation(params) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${RECOMMEND_API_BASE}?${query}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

// Creates a new booking
async function createBooking(data) {
  const res = await fetch(BOOKING_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Fetches the logged-in user's own booking history
async function fetchMyBookings() {
  const res = await fetch(`${BOOKING_API_BASE}/my-bookings`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

// Cancels a booking the user owns
async function cancelBooking(id) {
  const res = await fetch(`${BOOKING_API_BASE}/${id}/cancel`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

// Fetches the logged-in user's notifications
async function fetchMyNotifications() {
  const res = await fetch(NOTIFICATION_API_BASE, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

// Marks a single notification as read
async function markNotificationRead(id) {
  const res = await fetch(`${NOTIFICATION_API_BASE}/${id}/read`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}