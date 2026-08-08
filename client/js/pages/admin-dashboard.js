// Only allow admins to view this page — redirects anyone else back to login
requireRole(['admin']);

// Display the logged-in admin's name in the header
const user = getUser();
document.getElementById('adminName').textContent = `${user.name} (Admin)`;
document.getElementById('logoutBtn').addEventListener('click', logout);

const tableBody = document.getElementById('usersTableBody');
const statusMsg = document.getElementById('statusMsg');

// Fetches all users from the backend and builds the table rows
async function loadUsers() {
  const users = await fetchUsers();

  // If the API returned an error object instead of an array, show the error and stop
  if (!Array.isArray(users)) {
    statusMsg.textContent = users.message || 'Failed to load users.';
    return;
  }

  tableBody.innerHTML = ''; // clear any existing rows before re-rendering

  // Build one table row per user, with a role dropdown and a Save button
  users.forEach(u => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>
        <select data-id="${u._id}" class="roleSelect">
          <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
          <option value="facility_manager" ${u.role === 'facility_manager' ? 'selected' : ''}>Facility Manager</option>
          <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
      </td>
      <td>${u.department || '-'}</td>
      <td><button class="saveRoleBtn" data-id="${u._id}">Save</button></td>
    `;
    tableBody.appendChild(row);
  });

  // Wire up every Save button after the rows exist in the DOM
  document.querySelectorAll('.saveRoleBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const select = document.querySelector(`.roleSelect[data-id="${id}"]`);
      const newRole = select.value;

      // Send the role change to the backend
      const result = await updateUserRole(id, newRole);

      if (result._id) {
        statusMsg.textContent = `${result.name}'s role updated to ${result.role}.`;
      } else {
        statusMsg.textContent = result.message || 'Failed to update role.';
      }
    });
  });
}

// Load the user list as soon as the page opens
loadUsers();