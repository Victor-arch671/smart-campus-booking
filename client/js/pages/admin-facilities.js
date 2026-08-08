// Only admins can manage facilities
requireRole(['admin']);

document.getElementById('logoutBtn').addEventListener('click', logout);

const tableBody = document.getElementById('facilitiesTableBody');
const formMsg = document.getElementById('formMsg');

// Loads all facilities and renders them into the table
async function loadFacilities() {
  const facilities = await fetchFacilities();
  tableBody.innerHTML = '';

  facilities.forEach(f => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${f.name}</td>
      <td>${f.type}</td>
      <td>${f.capacity}</td>
      <td>${f.location || '-'}</td>
      <td>${f.hasProjector ? 'Yes' : 'No'}</td>
      <td>${f.hasAC ? 'Yes' : 'No'}</td>
      <td>
        <select data-id="${f._id}" class="statusSelect">
          <option value="available" ${f.status === 'available' ? 'selected' : ''}>Available</option>
          <option value="under_maintenance" ${f.status === 'under_maintenance' ? 'selected' : ''}>Under Maintenance</option>
          <option value="inactive" ${f.status === 'inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </td>
      <td>
        <button class="saveStatusBtn" data-id="${f._id}">Save</button>
        <button class="deleteBtn" data-id="${f._id}">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Wire up each "Save" button to update that facility's status
  document.querySelectorAll('.saveStatusBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const select = document.querySelector(`.statusSelect[data-id="${id}"]`);
      await updateFacility(id, { status: select.value });
      formMsg.textContent = 'Facility status updated.';
      loadFacilities(); // refresh the table to reflect the change
    });
  });

  // Wire up each "Delete" button
  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this facility?')) {
        await deleteFacility(id);
        loadFacilities(); // refresh the table after deletion
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
    document.getElementById('facilityForm').reset();
    loadFacilities(); // refresh the table with the new facility included
  } else {
    formMsg.textContent = result.message || 'Failed to add facility.';
  }
});

// Load the facilities table as soon as the page opens
loadFacilities();