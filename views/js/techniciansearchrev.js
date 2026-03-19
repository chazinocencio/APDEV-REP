// Sample reservation data with data attributes
let reservations = [];

const seatsByRoom = {
    'G301': ['1', '2', '3', '4', '5'],
    'G302': ['1', '2', '3', '4', '5'],
    'G303': ['1', '2', '3', '4', '5'],
    'G304': ['1', '2', '3', '4', '5'],
    'G305': ['1', '2', '3', '4', '5'],
    'G306': ['1', '2', '3', '4', '5']
};

const timeSlots = [
    '8:00 AM - 9:00 AM',
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM'
];

// DOM Elements
const technicianBack = document.getElementById('back');
const filterResID = document.getElementById('filterResID');
const filterRoom = document.getElementById('filterRoom');
const filterSeat = document.getElementById('filterSeat');
const filterDate = document.getElementById('filterDate');
const filterTime = document.getElementById('filterTime');
const searchBtn = document.getElementById('searchbutt');
const clearBtn = document.getElementById('clearbutt');
const resultsContainer = document.getElementById('resultsContainer');
const noResultsMessage = document.getElementById('noResultsMessage');

// Back button functionality
technicianBack.addEventListener('click', function(){
    window.location.href = "technician.html";
});

// Update Seat dropdown when Room is selected
filterRoom.addEventListener('change', function(){
    const selectedRoom = this.value;
    filterSeat.innerHTML = '<option value="">Select Seat</option>';
    filterSeat.disabled = !selectedRoom;
    
    if (selectedRoom && seatsByRoom[selectedRoom]) {
        seatsByRoom[selectedRoom].forEach(seat => {
            const option = document.createElement('option');
            option.value = seat;
            option.textContent = seat;
            filterSeat.appendChild(option);
        });
    }
});

// Update Time Slot dropdown when Date is selected
filterDate.addEventListener('change', function(){
    filterTime.innerHTML = '<option value="">Select Time</option>';
    filterTime.disabled = !this.value;
    
    if (this.value) {
        timeSlots.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot;
            option.textContent = slot;
            filterTime.appendChild(option);
        });
    }
});

// Format date for comparison (DD/MM/YYYY to comparison format)
function formatDateForComparison(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return (date.getMonth() + 1).toString().padStart(2, '0') + '/' + 
           date.getDate().toString().padStart(2, '0') + '/' + 
           date.getFullYear();
}

// Apply filters function
function applyFilters() {
    const resID = filterResID.value.toLowerCase();
    const room = filterRoom.value.toUpperCase();
    const seat = filterSeat.value.toUpperCase();
    const date = formatDateForComparison(filterDate.value);
    const timeSlot = filterTime.value;

    let visibleCount = 0;

    reservations.forEach((reservation, index) => {
        let matches = true;
        const displayIndex = index + 1; // Display index is 1-based

        // Apply AND logic - all filters must match
        if (resID && !displayIndex.toString().includes(resID)) {
            matches = false;
        }
        if (room && reservation.room.toUpperCase() !== room) {
            matches = false;
        }
        if (seat && reservation.seat.toUpperCase() !== seat) {
            matches = false;
        }
        if (date && reservation.date !== date) {
            matches = false;
        }
        if (timeSlot && !isTimeInSlot(reservation.startTime, reservation.endTime, timeSlot)) {
            matches = false;
        }

        // Find or create result element
        let resultElement = document.querySelector(`[data-res-id="${reservation.reservationId}"]`);
        
        if (!resultElement) {
            resultElement = createResultElement(reservation, displayIndex);
            resultsContainer.appendChild(resultElement);
        }

        if (matches) {
            resultElement.classList.remove('hidden');
            visibleCount++;
        } else {
            resultElement.classList.add('hidden');
        }
    });

    // Show/hide no results message
    if (visibleCount === 0) {
        noResultsMessage.classList.remove('hidden');
    } else {
        noResultsMessage.classList.add('hidden');
    }
}

// Check if time falls within a time slot
function isTimeInSlot(startTime, endTime, timeSlot) {
    // Simple check - matches if the start time matches the slot start
    const slotStart = timeSlot.split(' - ')[0];
    return startTime === slotStart;
}

// Create result element with proper alignment matching userreservations
function createResultElement(reservation, index) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'results';
    resultDiv.setAttribute('data-res-id', reservation.reservationId);
    resultDiv.setAttribute('data-room', reservation.room.toUpperCase());
    resultDiv.setAttribute('data-seat', reservation.seat.toUpperCase());
    resultDiv.setAttribute('data-date', reservation.date);
    resultDiv.setAttribute('data-time', reservation.startTime);
    resultDiv.setAttribute('data-index', index);
    
    resultDiv.innerHTML = `
        <div class="resultdeets">
            <p>${index}</p>
            <p>${reservation.room.toUpperCase()}</p>
            <p>${reservation.seat.toUpperCase()}</p>
            <p>${reservation.date}</p>
            <p>${reservation.startTime}</p>
            <p>${reservation.endTime}</p>
        </div>
        <div class="butts">
            <div class="butt reserve-button" data-id="${reservation.reservationId}">
                <h3>Reserve</h3>
            </div>
            <div class="canbutt block-button" data-id="${reservation.reservationId}">
                <h3>Block</h3>
            </div>
        </div>
    `;
    
    return resultDiv;
}

// Search button functionality
searchBtn.addEventListener('click', function(){
    applyFilters();
});

// Clear filters button functionality
clearBtn.addEventListener('click', function(){
    filterResID.value = '';
    filterRoom.value = '';
    filterSeat.value = '';
    filterSeat.disabled = true;
    filterDate.value = '';
    filterTime.value = '';
    filterTime.disabled = true;
    
    // Re-render all results
    resultsContainer.innerHTML = '';
    noResultsMessage.classList.add('hidden');
    
    reservations.forEach((reservation, index) => {
        const resultElement = createResultElement(reservation, index + 1);
        resultsContainer.appendChild(resultElement);
    });
});

// Initial load - populate results on page load
window.addEventListener('load', function(){
    fetchReservations();
});

// Fetch reservations from API
async function fetchReservations() {
    try {
        const response = await fetch('/api/technician/all_reservations');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (Array.isArray(data)) {
            reservations = data.map(res => {
                // Parse seatID to extract room and seat (format: "G301-1" or similar)
                const parts = res.seatID.split('-');
                const room = (parts[0] || '').toUpperCase();
                const seat = (parts[1] || '').toUpperCase();
                
                // Format dates and times
                const startDate = new Date(res.startTime);
                const endDate = new Date(res.endTime);
                
                const dateStr = (startDate.getMonth() + 1).toString().padStart(2, '0') + '/' + 
                                startDate.getDate().toString().padStart(2, '0') + '/' + 
                                startDate.getFullYear();
                
                const startTimeStr = startDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
                
                const endTimeStr = endDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
                
                return {
                    id: res.idNumber || 'N/A',
                    username: res.username || 'Anonymous',
                    reservationId: res._id || 'N/A',
                    room: room,
                    seat: seat,
                    date: dateStr,
                    startTime: startTimeStr,
                    endTime: endTimeStr
                };
            }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort oldest to newest
            
            // Populate results
            resultsContainer.innerHTML = '';
            noResultsMessage.classList.add('hidden');
            
            reservations.forEach((reservation, index) => {
                const resultElement = createResultElement(reservation, index + 1);
                resultsContainer.appendChild(resultElement);
            });
        }
    } catch (error) {
        console.error('Error fetching reservations:', error);
        noResultsMessage.textContent = 'Error loading reservations. Please try again later.';
        noResultsMessage.classList.remove('hidden');
    }
}


