// Saves the JWT token and user info after a successful login
function saveSession(token, user) {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(user));
}

// Retrieves the saved JWT token, used in Authorization headers for protected API calls
function getToken() {
  return sessionStorage.getItem('token');
}

// Retrieves the saved user object (name, email, role, etc.)
function getUser() {
  const user = sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Clears the session and sends the user back to the login page
function logout() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

// Blocks access to a page if there's no logged-in user
function requireAuth() {
  if (!getToken()) window.location.href = 'login.html';
}

// Blocks access to a page unless the logged-in user's role is in the allowed list
// e.g. requireRole(['admin']) only lets admins view that page
function requireRole(allowedRoles) {
  requireAuth();
  const user = getUser();
  if (!allowedRoles.includes(user.role)) {
    alert('You do not have permission to view this page.');
    window.location.href = 'login.html';
  }
}