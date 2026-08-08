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

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const department = document.getElementById('department').value;
  const errorMsg = document.getElementById('errorMsg');
  const successMsg = document.getElementById('successMsg');

  errorMsg.textContent = '';
  successMsg.textContent = '';

  const result = await registerUser({ name, email, password, department });

  if (result.message === 'User registered successfully.') {
    successMsg.textContent = 'Registration successful! Redirecting to login...';
    setTimeout(() => window.location.href = 'login.html', 1500);
  } else {
    errorMsg.textContent = result.message || 'Registration failed.';
  }
});