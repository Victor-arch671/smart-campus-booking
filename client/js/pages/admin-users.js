requireRole(['admin']);
document.getElementById('logoutBtn').addEventListener('click', logout);

const tableBody = document.getElementById('usersTableBody');
const statusMsg = document.getElementById('statusMsg');

async function loadUsers() {
  const users = await fetchUsers();

  if (!Array.isArray(users)) {
    statusMsg.textContent = users.message || 'Failed to load users.';
    statusMsg.className = 'error';
    return;
  }

  tableBody.innerHTML = '';

  users.forEach(u => {
    const row = document.createElement('tr');
    // securityQuestion is safe to display — it's not secret, only the ANSWER is hashed and hidden
    row.innerHTML = `
      <td data-label="Name">${u.name}</td>
      <td data-label="Email">${u.email}</td>
      <td data-label="Role">
        <select data-id="${u._id}" class="roleSelect">
          <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
          <option value="facility_manager" ${u.role === 'facility_manager' ? 'selected' : ''}>Facility Manager</option>
          <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
      </td>
      <td data-label="Department">${u.department || '-'}</td>
      <td data-label="Security Question">${u.securityQuestion || '-'}</td>
      <td data-label="Action">
        <button class="saveRoleBtn" data-id="${u._id}">Save Role</button>
        <button class="saveStatusBtn resetPwBtn" data-id="${u._id}" data-name="${u.name}">Reset Password</button>
        <button class="deleteBtn deleteUserBtn" data-id="${u._id}" data-name="${u.name}">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  document.querySelectorAll('.saveRoleBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const select = document.querySelector(`.roleSelect[data-id="${id}"]`);
      const result = await updateUserRole(id, select.value);

      if (result._id) {
        statusMsg.textContent = `${result.name}'s role updated to ${result.role}.`;
        statusMsg.className = 'success';
      } else {
        statusMsg.textContent = result.message || 'Failed to update role.';
        statusMsg.className = 'error';
      }
    });
  });

  // Admin sets a NEW password for the user — never shows or needs the old one
  document.querySelectorAll('.resetPwBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const newPassword = prompt(`Enter a new password for ${name} (min 6 characters):`);

      if (!newPassword) return; // user cancelled the prompt

      const result = await adminResetPassword(id, newPassword);

      if (result.message && result.message.includes('Password reset')) {
        statusMsg.textContent = result.message;
        statusMsg.className = 'success';
      } else {
        statusMsg.textContent = result.message || 'Failed to reset password.';
        statusMsg.className = 'error';
      }
    });
  });

  document.querySelectorAll('.deleteUserBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');

      if (!confirm(`Delete ${name}'s account? This cannot be undone.`)) return;

      const result = await deleteUserAccount(id);

      statusMsg.textContent = result.message || `${name} deleted.`;
      statusMsg.className = result.message === 'User deleted.' ? 'success' : 'error';
      loadUsers();
    });
  });
}

document.getElementById('addUserForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById('newName').value,
    email: document.getElementById('newEmail').value,
    password: document.getElementById('newPassword').value,
    role: document.getElementById('newRole').value,
    department: document.getElementById('newDepartment').value,
    securityQuestion: document.getElementById('newSecurityQuestion').value,
    securityAnswer: document.getElementById('newSecurityAnswer').value
  };

  const result = await createUser(data);
  const addUserMsg = document.getElementById('addUserMsg');

  if (result._id) {
    addUserMsg.textContent = `User "${result.name}" created successfully as ${result.role}.`;
    addUserMsg.className = 'success';
    document.getElementById('addUserForm').reset();
    loadUsers();
  } else {
    addUserMsg.textContent = result.message || 'Failed to create user.';
    addUserMsg.className = 'error';
  }
});

loadUsers();