// Only logged-in users can search and book
requireAuth();
document.getElementById('logoutBtn').addEventListener('click', logout);

let currentSearchParams = null; // remembers the last search so we can reuse its details when booking
let recommendedFacilityId = null; // the facility the recommendation engine picked

// Handles the search form — calls the Smart Recommendation endpoint on the backend
document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const searchMsg = document.getElementById('searchMsg');
  const resultSection = document.getElementById('resultSection');
  searchMsg.textContent = '';
  resultSection.style.display = 'none';

  currentSearchParams = {
    expectedAttendance: document.getElementById('expectedAttendance').value,
    bookingDate: document.getElementById('bookingDate').value,
    startTime: document.getElementById('startTime').value,
    endTime: document.getElementById('endTime').value,
    hasProjector: document.getElementById('hasProjector').checked,
    hasAC: document.getElementById('hasAC').checked
  };

  const result = await getRecommendation(currentSearchParams);

  if (result.recommended) {
    recommendedFacilityId = result.recommended._id;

    document.getElementById('recommendedName').textContent =
      `${result.recommended.name} (${result.recommended.type})`;

    // Show the reasons the engine picked this facility — matches the project brief's example output
    const reasonsList = document.getElementById('recommendedReasons');
    reasonsList.innerHTML = '';
    result.reasons.forEach(reason => {
      const li = document.createElement('li');
      li.textContent = reason;
      reasonsList.appendChild(li);
    });

    resultSection.style.display = 'block';
    searchMsg.textContent = '';
  } else {
    searchMsg.textContent = result.message || 'No facility found matching your requirements.';
    searchMsg.className = 'error';
    resultSection.style.display = 'none';
  }
});

// Handles the booking form — books the recommended facility using the same search details
document.getElementById('bookForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const bookMsg = document.getElementById('bookMsg');
  bookMsg.textContent = '';

  const data = {
    facilityId: recommendedFacilityId,
    bookingDate: currentSearchParams.bookingDate,
    startTime: currentSearchParams.startTime,
    endTime: currentSearchParams.endTime,
    expectedAttendance: Number(currentSearchParams.expectedAttendance),
    purpose: document.getElementById('purpose').value,
    urgency: Number(document.getElementById('urgency').value),
    peopleAffected: Number(document.getElementById('peopleAffected').value)
  };

  const result = await createBooking(data);

  if (result._id) {
    bookMsg.textContent = 'Booking submitted! It is now pending approval.';
    bookMsg.className = 'success';
    document.getElementById('bookForm').reset();
  } else {
    // Handles conflict (409) responses too, including the suggested alternative if one exists
    let message = result.message || 'Booking failed.';
    if (result.suggestedAlternative) {
      message += ` Try: ${result.suggestedAlternative.name}.`;
    }
    bookMsg.textContent = message;
    bookMsg.className = 'error';
  }
});