// Only admins can manage facilities
requireRole(['admin']);

document.getElementById('logoutBtn').addEventListener('click', logout);

const tableBody = document.getElementById('facilitiesTableBody');
const formMsg = document.getElementById('formMsg');
let managers = []; // cached list of facility_manager users, refreshed each load

// Loads all facilities and renders them into the table, including a manager-assignment dropdown
async function loadFacilities() {
  const facilities = await fetchFacilities();
  managers = await fetchManagers(); // pulls only users with role facility_manager

  tableBody.innerHTML = '';

  facilities.forEach(f => {
    const row = document.createElement('tr');

    // Show name AND email in each option, so two managers are never confused with each other
    const managerOptions = managers.map(m =>
      `<option value="${m._id}" ${f.managerId === m._id ? 'selected' : ''}>${m.name} — ${m.email}</option>`
    ).join('');

    row.innerHTML = `
      <td data-label="Name">${f.name}</td>
      <td data-label="Type">${f.type}</td>
      <td data-label="Capacity" class="data">${f.capacity}</td>
      <td data-label="Location">${f.location || '-'}</td>
      <td data-label="Projector">${f.hasProjector ? 'Yes' : 'No'}</td>
      <td data-label="AC">${f.hasAC ? 'Yes' : 'No'}</td>
      <td data-label="Status">
        <select data-id="${f._id}" class="statusSelect">
          <option value="available" ${f.status === 'available' ? 'selected' : ''}>Available</option>
          <option value="under_maintenance" ${f.status === 'under_maintenance' ? 'selected' : ''}>Under Maintenance</option>
          <option value="inactive" ${f.status === 'inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </td>
      <td data-label="Manager">
        <select data-id="${f._id}" class="managerSelect">
          <option value="">-- Unassigned --</option>
          ${managerOptions}
        </select>
      </td>
      <td data-label="Action">
        <button class="saveStatusBtn" data-id="${f._id}">Save</button>
        <button class="deleteBtn" data-id="${f._id}">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // "Save" updates status AND manager assignment together, with a message specific to what changed
  document.querySelectorAll('.saveStatusBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const statusSelect = document.querySelector(`.statusSelect[data-id="${id}"]`);
      const managerSelect = document.querySelector(`.managerSelect[data-id="${id}"]`);
      const selectedManagerId = managerSelect.value;

      await updateFacility(id, {
        status: statusSelect.value,
        managerId: selectedManagerId || null
      });

      // Give a message specific to whether a manager was assigned or removed
      if (selectedManagerId) {
        const chosenManager = managers.find(m => m._id === selectedManagerId);
        formMsg.textContent = `Manager assigned successfully: ${chosenManager.name}.`;
      } else {
        formMsg.textContent = 'Manager unassigned. Facility status updated.';
      }
      formMsg.className = 'success'; // uses the green success styling from your design system

      loadFacilities(); // refresh to reflect the saved changes
    });
  });

  // Wire up each "Delete" button
  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this facility?')) {
        await deleteFacility(id);
        loadFacilities();
      }
    });
  });
}

// Handles the "Add New Facility" form submission
document.getElementById('facilityForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById('name').value,
    type: document.getElementById('type').value,
    capacity: Number(document.getElementById('capacity').value),
    location: document.getElementById('location').value,
    hasProjector: document.getElementById('hasProjector').checked,
    hasAC: document.getElementById('hasAC').checked
  };

  const result = await createFacility(data);

  if (result._id) {
    formMsg.textContent = `Facility "${result.name}" added successfully.`;
    formMsg.className = 'success';
    document.getElementById('facilityForm').reset();
    loadFacilities();
  } else {
    formMsg.textContent = result.message || 'Failed to add facility.';
    formMsg.className = 'error';
  }
});

// Load the facilities table as soon as the page opens
loadFacilities();