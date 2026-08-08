document.getElementById('togglePassword').addEventListener('click', () => {
  const passwordInput = document.getElementById('password');
  const toggle = document.getElementById('togglePassword');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggle.textContent = 'Hide';
  } else {
    passwordInput.type = 'password';
    toggle.textContent = 'Show';
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.textContent = '';

  const result = await loginUser({ email, password });

  if (result.token) {
    saveSession(result.token, result.user);

    if (result.user.role === 'admin') window.location.href = 'admin-dashboard.html';
    else if (result.user.role === 'facility_manager') window.location.href = 'manager-dashboard.html';
    else window.location.href = 'user-dashboard.html';
  } else {
    errorMsg.textContent = result.message || 'Login failed.';
  }
});