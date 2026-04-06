const technicianBack = document.getElementById('back')

function formatDate(date){
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
}

function loadDates(){
    var currentDate = new Date();
    const dateInput = document.querySelector('#date');
    dateInput.innerHTML = `
        <option value="">Select</option>
        <option value="${currentDate.toLocaleDateString('en-CA')}">${formatDate(currentDate)}</option>
    `
    
    for(let i = 1; i < 14; i++){
        let newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() + i)
        dateInput.innerHTML += `
            <option value="${newDate.toLocaleDateString('en-CA')}">${formatDate(newDate)}</option>
        `
    }
}

technicianBack.addEventListener('click', function(){
    window.location.href = "technician.html";
})

document.addEventListener('DOMContentLoaded', async function() {
    let user = null;

    const res = await fetch('api/auth/me', { credentials: 'include' })

    if(res.ok){
        const data = await res.json();
        user = data.user
        if (!user || user.role !== 'technician') {
            window.location.href = "technician_login.html";
            return;
        }
    } else {
        window.location.href = "technician_login.html";
        return;
    }

    document.getElementById('headerlogo').addEventListener('click', () => {
        window.location.href = "technician.html";
    });

    loadDates();
    const dateInput = document.getElementById('date');
    const timeStart = document.getElementById('timestart');
    const timeEnd = document.getElementById('timeend');
    const errorMess = document.getElementById('errormess');
    const search = document.getElementById('searchbutt');
    const results = document.getElementById('card');

    errorMess.style.display = 'none';

    let selectedAction = null; // holds { type, seatID, startTime, endTime, room, seatNo }

    search.addEventListener('click', async function() {
        if (dateInput.value === "" || timeStart.value === "" || timeEnd.value === "") {
            errorMess.style.display = 'block';
            errorMess.textContent = 'Please enter all fields.';
            errorMess.style.color = 'red';  
            return;
        }

        const startTimeISO = `${dateInput.value}T${timeStart.value}:00+08:00`;
        const endTimeISO = `${dateInput.value}T${timeEnd.value}:00+08:00`;

        const startDateTime = new Date(startTimeISO);
        const endDateTime = new Date(endTimeISO);

        if (startDateTime >= endDateTime) {
            errorMess.style.display = 'block';
            errorMess.textContent = 'End time must be after start time.';
            errorMess.style.color = 'red';
            return;
        }
        errorMess.style.display = 'none';

        const response = await fetch('api/common_routes/search_timeslot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ startTime: startTimeISO, endTime: endTimeISO })
        });

        const data = await response.json();
        const availableSeats = data.availableSeats || [];

        results.innerHTML = `
            <div class="label">
                <div class="resultdeets">
                        <h3>Room</h3>
                        <h3>Seat</h3>
                </div>
            </div>
        `;

        if (availableSeats.length > 0) {
            availableSeats.forEach(seat => {
                const seatNo = seat.seatID.split('-')[1];

                const el = document.createElement('div');
                el.className = 'results';
                el.innerHTML = `
                    <div class="resultdeets">
                        <p>${seat.roomID}</p>
                        <p>${seatNo}</p>
                    </div>
                    <div class="butt reserve-btn" data-seatid="${seat.seatID}" data-room="${seat.roomID}" data-seatno="${seatNo}">
                        <h3>Reserve for student</h3>
                    </div>
                    <div class="butt block-btn" data-seatid="${seat.seatID}" data-room="${seat.roomID}" data-seatno="${seatNo}">
                        <h3>Block</h3>
                    </div>
                `;

                results.appendChild(el);
            });

            // attach listeners
            document.querySelectorAll('.reserve-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const seatID = this.getAttribute('data-seatid');
                    const room = this.getAttribute('data-room');
                    const seatNo = this.getAttribute('data-seatno');

                    selectedAction = {
                        type: 'reserve_student',
                        seatID: seatID,
                        startTime: startTimeISO,
                        endTime: endTimeISO,
                        room: room,
                        seatNo: seatNo
                    };

                    // populate modal
                    const rr = document.getElementById('reserve-room');
                    const rs = document.getElementById('reserve-seat');
                    const rd = document.getElementById('reserve-date');
                    const rstart = document.getElementById('reserve-start');
                    const rend = document.getElementById('reserve-end');
                    const rinput = document.getElementById('reserve-student-id');
                    const ranon = document.getElementById('reserve-anon');

                    if (rr) rr.textContent = selectedAction.room;
                    if (rs) rs.textContent = 'Seat ' + selectedAction.seatNo;
                    if (rd) rd.textContent = formatDate(new Date(dateInput.value));
                    if (rstart) rstart.textContent = timeStart.value;
                    if (rend) rend.textContent = timeEnd.value;
                    if (rinput) rinput.value = '';
                    if (ranon) ranon.checked = false;

                    const reserveModal = document.getElementById('reserve-modal');
                    if (reserveModal) reserveModal.classList.remove('hidden');
                });
            });

            document.querySelectorAll('.block-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const seatID = this.getAttribute('data-seatid');
                    const room = this.getAttribute('data-room');
                    const seatNo = this.getAttribute('data-seatno');

                    selectedAction = {
                        type: 'block_time',
                        seatID: seatID,
                        startTime: startTimeISO,
                        endTime: endTimeISO,
                        room: room,
                        seatNo: seatNo
                    };

                    // populate block modal
                    const brRoom = document.getElementById('block-room');
                    const brDate = document.getElementById('block-date');
                    const brStartTime = document.getElementById('block-start-time');
                    const brEndTime = document.getElementById('block-end-time');
                    const brSeat = document.getElementById('block-seat');
                    const brReason = document.getElementById('block-reason');

                    if (brRoom) brRoom.textContent = selectedAction.room;
                    if (brSeat) brSeat.textContent = 'Seat ' + selectedAction.seatNo;
                    if (brDate) brDate.textContent = dateInput.value;
                    if (brStartTime) brStartTime.textContent = timeStart.value;
                    if (brEndTime) brEndTime.textContent = timeEnd.value;
                    if (brReason) brReason.value = '';

                    const blockModal = document.getElementById('block-modal');
                    if (blockModal) blockModal.classList.remove('hidden');
                });
            });
        }
    });

    // Reserve modal handlers
    const reserveModalEl = document.getElementById('reserve-modal');
    if (reserveModalEl) {
        document.getElementById('reserve-confirm').addEventListener('click', async function () {
            const idInput = document.getElementById('reserve-student-id');
            const anonInput = document.getElementById('reserve-anon');
            const idNumber = idInput && idInput.value ? parseInt(idInput.value) : null;
            const isAnon = anonInput && anonInput.checked;

            if (!idNumber || isNaN(idNumber)) {
                alert('Please enter a valid student ID number');
                return;
            }

            const reservation = {
                seatID: selectedAction.seatID,
                startTime: selectedAction.startTime,
                endTime: selectedAction.endTime,
                idNumber: idNumber,
                isAnonymous: isAnon,
                description: ''
            };

            try {
                const response = await fetch(`/api/technician/reserve_for_student`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(reservation)
                });

                if (response.ok) {
                    alert('Reservation created for student');
                    // remove the matching result element
                    document.querySelectorAll(`[data-seatid="${selectedAction.seatID}"]`).forEach(el => {
                        const parent = el.closest('.results');
                        if (parent) parent.remove();
                    });
                    reserveModalEl.classList.add('hidden');
                } else {
                    const err = await response.json().catch(() => ({}));
                    alert('Error: ' + (err.message || 'Failed to create reservation'));
                }
            } catch (err) {
                console.error('Error creating reservation:', err);
                alert('Failed to create reservation');
            }
        });

        document.getElementById('reserve-cancel').addEventListener('click', function () {
            reserveModalEl.classList.add('hidden');
            selectedAction = null;
        });
    }

    // Block modal handlers
    const blockModalEl = document.getElementById('block-modal');
    if (blockModalEl) {
        document.getElementById('block-confirm').addEventListener('click', async function () {
            const reason = document.getElementById('block-reason') ? document.getElementById('block-reason').value.trim() : '';
            if (!reason) {
                alert('Please enter a reason for blocking');
                return;
            }

            const payload = {
                seatID: selectedAction.seatID,
                startTime: selectedAction.startTime,
                endTime: selectedAction.endTime,
                description: reason
            };

            try {
                const response = await fetch(`/api/technician/block_seat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert('Time slot blocked successfully');
                    document.querySelectorAll(`[data-seatid="${selectedAction.seatID}"]`).forEach(el => {
                        const parent = el.closest('.results');
                        if (parent) parent.remove();
                    });
                    blockModalEl.classList.add('hidden');
                } else {
                    const err = await response.json().catch(() => ({}));
                    alert('Error: ' + (err.message || 'Failed to block time slot'));
                }
            } catch (error) {
                console.error('Error blocking time:', error);
                alert('Failed to block time slot');
            }
        });

        document.getElementById('block-cancel').addEventListener('click', function () {
            blockModalEl.classList.add('hidden');
            selectedAction = null;
        });
    }

});

