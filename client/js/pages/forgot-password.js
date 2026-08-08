let verifiedEmail = null; // stores the email once its security question is successfully found

// Step 1: look up the security question for the entered email
document.getElementById('emailForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const emailMsg = document.getElementById('emailMsg');
  emailMsg.textContent = '';

  const result = await getSecurityQuestion(email);

  if (result.securityQuestion) {
    verifiedEmail = email;
    document.getElementById('questionText').textContent = result.securityQuestion;
    document.getElementById('resetForm').style.display = 'block';
    document.getElementById('emailForm').style.display = 'none'; // hide step 1 once step 2 is shown
  } else {
    emailMsg.textContent = result.message || 'Could not find an account with that email.';
  }
});

// Password show/hide toggle for the new password field
document.getElementById('togglePassword').addEventListener('click', () => {
  const passwordInput = document.getElementById('newPassword');
  const toggle = document.getElementById('togglePassword');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggle.textContent = 'Hide';
  } else {
    passwordInput.type = 'password';
    toggle.textContent = 'Show';
  }
});

// Step 2: submit the security answer + new password
document.getElementById('resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const securityAnswer = document.getElementById('securityAnswer').value;
  const newPassword = document.getElementById('newPassword').value;
  const resetMsg = document.getElementById('resetMsg');
  const resetSuccessMsg = document.getElementById('resetSuccessMsg');

  resetMsg.textContent = '';
  resetSuccessMsg.textContent = '';

  const result = await resetPassword({ email: verifiedEmail, securityAnswer, newPassword });

  if (result.message === 'Password reset successfully. You can now log in with your new password.') {
    resetSuccessMsg.textContent = result.message;
    setTimeout(() => window.location.href = 'login.html', 2000);
  } else {
    resetMsg.textContent = result.message || 'Password reset failed.';
  }
});