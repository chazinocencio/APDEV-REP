// Sample reservation data with data attributes
let reservations = [];

// Generate seat lists (1..24) for each room
const allSeats = Array.from({ length: 24 }, (_, i) => String(i + 1));
const seatsByRoom = {
    'G301': allSeats,
    'G302': allSeats,
    'G303': allSeats,
    'G304': allSeats,
    'G305': allSeats,
    'G306': allSeats
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
    const resID = filterResID.value.toUpperCase();
    const room = filterRoom.value.toUpperCase();
    const seat = filterSeat.value.toUpperCase();
    const date = formatDateForComparison(filterDate.value);
    const timeSlot = filterTime.value;
    
    let visibleCount = 0;

    reservations.forEach((reservation, index) => {
        let matches = true;
        const displayIndex = index + 1; // Display index is 1-based
        console.log(date, reservation.date)
        // Apply AND logic - all filters must match
        // if (resID && !displayIndex.toString().includes(resID)) {
        //     matches = false;
        // }
        if (resID && !reservation.reservationID.includes(resID)) {
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
            <p>${reservation.reservationID}</p>
            <p>${reservation.room.toUpperCase()}</p>
            <p>${reservation.seat.toUpperCase()}</p>
            <p>${reservation.dateRequested}</p>
            <p>${reservation.timeRequested}</p>
            <p>${reservation.date}</p>
            <p>${reservation.startTime}</p>
            <p>${reservation.endTime}</p>
        </div>
        <div class="butts">
            <div class="butt edit-button" data-id="${reservation.reservationId}">
                <h3>Edit</h3>
            </div>
            <div class="canbutt cancel-button" data-id="${reservation.reservationId}" data-seat="${reservation.rawSeatID}" data-start="${reservation.rawStart}" data-end="${reservation.rawEnd}">
                <h3>Cancel</h3>
            </div>
        </div>
    `;
    
    return resultDiv;
}

// disable cancel buttons until 10 minutes after reservation start
function updateCancelButtonState(btn, startISO){
    if (!btn || !startISO) return;
    const start = new Date(startISO);
    const enableAt = new Date(start.getTime() + 10 * 60 * 1000);
    const now = new Date();

    function enable(){
        btn.classList.remove('cancel-disabled');
        btn.removeAttribute('aria-disabled');
        btn.title = '';
    }

    if (now >= enableAt){
        enable();
        return;
    }

    btn.classList.add('cancel-disabled');
    btn.setAttribute('aria-disabled','true');
    btn.title = 'Cancel disabled until ' + enableAt.toLocaleString();

    const ms = enableAt.getTime() - now.getTime();
    setTimeout(() => { try { enable(); } catch (e) {} }, ms + 50);
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
        const cb = resultElement.querySelector('.cancel-button');
        if (cb && reservation.type === 'Student') updateCancelButtonState(cb, reservation.rawStart);
    });
});

// Initial load - populate results on page load
window.addEventListener('load', function(){
    fetchReservations();
});

// Fetch reservations from API
async function fetchReservations() {
    try {
        const response = await fetch('/api/technician/all_reservations', {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (Array.isArray(data)) {
            // keep only student reservations (filter out blocks made by technicians)
            const studentReservations = data;

            reservations = studentReservations.map(res => {
                // Parse seatID to extract room and seat (format: "G301-1" or similar)
                const parts = res.seatID.split('-');
                const room = (parts[0] || '').toUpperCase();
                const seat = (parts[1] || '').toUpperCase();

                const dateReq = new Date(res.dateRequested)

                // formatted date & time requested
                const dateRequested = dateReq.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                })
                const timeRequested = dateReq.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                })
                
                // Format dates and times
                const startDate = new Date(res.startTime);
                const endDate = new Date(res.endTime);
                
                const dateStr = startDate.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                });
                
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
                    reservationID: res.reservationID,
                    reservationId: res._id || 'N/A',
                    type: res.reservationType,
                    room: room,
                    seat: seat,
                    dateRequested: dateRequested,
                    timeRequested: timeRequested,
                    date: dateStr,
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                    rawSeatID: res.seatID,
                    rawStart: res.startTime,
                    rawEnd: res.endTime,
                    _id: res._id
                };
            }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort oldest to newest
            
            // Populate results
            resultsContainer.innerHTML = '';
            noResultsMessage.classList.add('hidden');
            
            reservations.forEach((reservation, index) => {
                const resultElement = createResultElement(reservation, index + 1);
                resultsContainer.appendChild(resultElement);
                const cb = resultElement.querySelector('.cancel-button');
                if (cb && reservation.type === 'Student') updateCancelButtonState(cb, reservation.rawStart);
            });
        }
    } catch (error) {
        console.error('Error fetching reservations:', error);
        noResultsMessage.textContent = 'Error loading reservations. Please try again later.';
        noResultsMessage.classList.remove('hidden');
    }
}

// Delegate click handlers for Edit and Cancel buttons
resultsContainer.addEventListener('click', function (e) {
    const editBtn = e.target.closest('.edit-button');
    const cancelBtn = e.target.closest('.cancel-button');

    if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        const res = reservations.find(r => r.reservationId === id || r._id === id);
        if (!res) return alert('Reservation not found');
        openEditModal(res);
    }

    if (cancelBtn) {
        if (cancelBtn.getAttribute('aria-disabled') === 'true'){
            alert('Cancel is not available yet for this reservation.');
            return;
        }
        const id = cancelBtn.getAttribute('data-id');
        const seat = cancelBtn.getAttribute('data-seat');
        const start = cancelBtn.getAttribute('data-start');
        const end = cancelBtn.getAttribute('data-end');

        if (!confirm('Are you sure you want to cancel this reservation?')) return;

        // perform delete
        (async () => {
            try {
                const delResp = await fetch(`/api/technician/delete_reservation/${encodeURIComponent(seat)}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ startTime: start, endTime: end })
                });

                if (delResp.ok) {
                    alert('Reservation cancelled');
                    fetchReservations();
                } else {
                    const err = await delResp.json().catch(() => ({}));
                    alert('Error: ' + (err.message || 'Failed to cancel reservation'));
                }
            } catch (err) {
                console.error('Error cancelling reservation:', err);
                alert('Failed to cancel reservation');
            }
        })();
    }
});

// Edit modal creation and handling
let searchEditModal = null;
let editingReservation = null;
function openEditModal(reservation) {
    // use existing modal element inserted into the page
    searchEditModal = document.getElementById('edit-block-modal');
    if (!searchEditModal) {
        alert('Edit modal not found on this page');
        return;
    }

    editingReservation = reservation;

    // populate fields (IDs match technician_rooms.html)
    const roomEl = document.getElementById('edit-block-room');
    const seatSelect = document.getElementById('edit-block-seat');
    const startDateEl = document.getElementById('edit-block-start-date');
    const startTimeSelect = document.getElementById('edit-block-start-time');
    const endTimeSelect = document.getElementById('edit-block-end-time');
    const reasonEl = document.getElementById('edit-block-reason');

    if (roomEl) roomEl.textContent = reservation.room;

    // populate seat options
    const seatsList = seatsByRoom[reservation.room] || Array.from({length:30},(_,i)=>String(i+1));
    seatSelect.innerHTML = '';
    seatsList.forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = s; seatSelect.appendChild(o); });
    const parts = (reservation.rawSeatID || '').split('-');
    const currentSeat = parts[1] || reservation.seat;
    if (currentSeat) seatSelect.value = currentSeat;

    // set dates and times
    const sDate = new Date(reservation.rawStart);
    if (startDateEl) startDateEl.value = sDate.toISOString().slice(0,10);

    function makeTimeOptions(selectEl) {
        selectEl.innerHTML = '';
        const startHour = 8; const endHour = 17;
        for (let h = startHour; h <= endHour; h++) {
            for (let m = 0; m < 60; m += 30) {
                const hh = String(h).padStart(2,'0'); const mm = String(m).padStart(2,'0');
                const val = `${hh}:${mm}`;
                const opt = document.createElement('option'); opt.value = val; opt.textContent = val; selectEl.appendChild(opt);
                if (h === endHour && m > 0) break;
            }
        }
    }

    makeTimeOptions(startTimeSelect);
    makeTimeOptions(endTimeSelect);
    const fmt = d => String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    if (startTimeSelect) startTimeSelect.value = fmt(sDate);
    // set end time from original reservation end
    const origEnd = new Date(reservation.rawEnd);
    if (endTimeSelect) endTimeSelect.value = fmt(origEnd);

    if (reasonEl) reasonEl.value = reservation.description || '';

    searchEditModal.classList.remove('hidden');

    // attach handlers to existing confirm/cancel buttons
    const confirmBtn = document.getElementById('edit-confirm');
    const cancelBtn = document.getElementById('edit-cancel');

    if (cancelBtn) cancelBtn.onclick = () => { searchEditModal.classList.add('hidden'); editingReservation = null; };

    if (confirmBtn) {
        confirmBtn.onclick = async function () {
            if (!editingReservation) { alert('No reservation selected'); return; }

            const seat = seatSelect ? seatSelect.value : null;
            const startDate = startDateEl ? startDateEl.value : null;
            const startTime = startTimeSelect ? startTimeSelect.value : null;
            const endTime = endTimeSelect ? endTimeSelect.value : null;
            const description = reasonEl ? reasonEl.value.trim() : '';

            if (!seat || !startDate || !startTime || !endTime) { alert('Please fill all fields'); return; }
            // single-day reservations: use startDate for both start and end day
            const fullStart = `${startDate}T${startTime}+08:00`;
            const fullEnd = `${startDate}T${endTime}+08:00`;
            if (new Date(fullStart) >= new Date(fullEnd)) { alert('End time must be after start time'); return; }

            try {
                const roomDate = startDate; // YYYY-MM-DD
                const resp = await fetch(`/api/common_routes/reservations_per_day/${editingReservation.room}/${roomDate}`, {
                    credentials: 'include'
                });
                const data = await resp.json();
                const existing = data.reservations || [];

                const newSeatID = `${editingReservation.room}-${seat}`;
                const newStart = new Date(fullStart);
                const newEnd = new Date(fullEnd);

                const conflict = existing.some(r => {
                    if (r._id === editingReservation._id) return false;
                    if (r.seatID !== newSeatID) return false;
                    const rStart = new Date(r.startTime); const rEnd = new Date(r.endTime);
                    return (newStart < rEnd && newEnd > rStart);
                });

                if (conflict) { alert('Selected time/seat conflicts with an existing reservation or block'); return; }

                const updateResp = await fetch(`/api/technician/update_reservation/${editingReservation._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ seatID: newSeatID, startTime: fullStart, endTime: fullEnd, description })
                });

                if (updateResp.ok) {
                    alert('Reservation updated');
                    searchEditModal.classList.add('hidden');
                    editingReservation = null;
                    fetchReservations();
                } else {
                    const err = await updateResp.json().catch(() => ({}));
                    alert('Error: ' + (err.message || 'Failed to update reservation'));
                }
            } catch (err) {
                console.error('Error updating reservation:', err);
                alert('Failed to update reservation');
            }
        };
    }
}

document.getElementById('headerlogo').addEventListener('click', () => {
    window.location.href = "technician.html";
});