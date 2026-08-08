// Only admins can manage maintenance schedules
requireRole(['admin']);

document.getElementById('logoutBtn').addEventListener('click', logout);

const facilitySelect = document.getElementById('facilitySelect');
const tableBody = document.getElementById('maintenanceTableBody');
const formMsg = document.getElementById('formMsg');

let selectedFacilityId = null; // tracks which facility is currently active in the picker

// Loads all facilities into the dropdown picker
async function loadFacilitiesIntoPicker() {
  const facilities = await fetchFacilities();
  facilities.forEach(f => {
    const option = document.createElement('option');
    option.value = f._id;
    option.textContent = `${f.name} (${f.type})`;
    facilitySelect.appendChild(option);
  });
}

// When the admin picks a facility, load its maintenance windows
facilitySelect.addEventListener('change', () => {
  selectedFacilityId = facilitySelect.value;
  if (selectedFacilityId) {
    loadMaintenanceWindows();
  } else {
    tableBody.innerHTML = '';
  }
});

// Loads and displays maintenance windows for the currently selected facility
async function loadMaintenanceWindows() {
  const windows = await fetchMaintenanceForFacility(selectedFacilityId);
  tableBody.innerHTML = '';

  if (!Array.isArray(windows) || windows.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4">No maintenance windows scheduled for this facility yet.</td></tr>';
    return;
  }

  windows.forEach(w => {
    const row = document.createElement('tr');
    // Format dates for readability instead of showing raw ISO strings
    const start = new Date(w.startDateTime).toLocaleString();
    const end = new Date(w.endDateTime).toLocaleString();

    row.innerHTML = `
      <td data-label="Start" class="data">${start}</td>
      <td data-label="End" class="data">${end}</td>
      <td data-label="Reason">${w.reason || '-'}</td>
      <td data-label="Action"><button class="deleteBtn" data-id="${w._id}">Remove</button></td>
    `;
    tableBody.appendChild(row);
  });

  // Wire up delete buttons for each maintenance window
  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Remove this maintenance window?')) {
        await deleteMaintenanceWindow(id);
        loadMaintenanceWindows(); // refresh after deletion
      }
    });
  });
}

// Handles scheduling a new maintenance window
document.getElementById('maintenanceForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!selectedFacilityId) {
    formMsg.textContent = 'Please select a facility first.';
    return;
  }

  const data = {
    facilityId: selectedFacilityId,
    startDateTime: document.getElementById('startDateTime').value,
    endDateTime: document.getElementById('endDateTime').value,
    reason: document.getElementById('reason').value
  };

  const result = await createMaintenanceWindow(data);

  if (result._id) {
    formMsg.textContent = 'Maintenance window scheduled successfully.';
    document.getElementById('maintenanceForm').reset();
    loadMaintenanceWindows(); // refresh the table with the new window included
  } else {
    formMsg.textContent = result.message || 'Failed to schedule maintenance.';
  }
});

// Populate the facility dropdown as soon as the page loads
loadFacilitiesIntoPicker();