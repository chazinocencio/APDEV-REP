var currentDate = new Date();
let room = null;

var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const SEATS_PER_ROOM = 24;

function formatDate(d) {
    return weekdays[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

function updateDateDisplay() {
    var el = document.getElementById("dayanddate");
    if (el) el.textContent = formatDate(currentDate);
    fetchReservations(room);
}

function getTimeIndex(timeString) {
    const date = new Date(timeString);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const startHour = 8; // grid starts at 8:00 AM

    return ((hours - startHour) * 60 + minutes) / 30;
}

function getTimeRangeStringFromIndex(index) {
    const startHour = 8;

    const startMinutesTotal = index * 30;
    const endMinutesTotal = (index + 1) * 30;

    function format(totalMinutes) {
        const hours = startHour + Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    return {
        start: format(startMinutesTotal),
        end: format(endMinutesTotal)
    };
}

async function fetchReservations(room) {
    var dateGrid = document.querySelector(".date-grid");
    if (!dateGrid) return;

    const response = await fetch(`/api/common_routes/reservations_per_day/${room}/${currentDate.toLocaleDateString('en-CA')}`, {
        credentials: 'include'
    });
    const data = await response.json();
    const reservations = data.reservations;

    dateGrid.querySelectorAll(".date-grid-cell").forEach(cell => {
        cell.className = "date-grid-cell"; // reset classes
    });

    reservations.forEach(reservation => {
        const { seatID, startTime, endTime, reservationType } = reservation;
        const seatNumber = parseInt(seatID.split("-")[1]);

        if (!seatNumber) return;

        const rowIndex = seatNumber - 1;
        const row = document.querySelectorAll(".date-grid-row")[rowIndex];

        if (!row) return;

        const cells = row.querySelectorAll(".date-grid-cell");
        const startIndex = getTimeIndex(startTime);
        const endIndex = getTimeIndex(endTime);

        for (let i = startIndex; i < endIndex; i++) {
            if (!cells[i]) continue;
            
            if (reservationType === "Student") {
                cells[i].classList.add("selected");
            } else if (reservationType === "Blocked") {
                cells[i].classList.add("unavailable");
            }
        }
    });
}



document.addEventListener("DOMContentLoaded", async function () {
    let user = null;

	const res = await fetch('api/auth/me', {
		credentials: 'include'
	})

	if(res.ok){
		const data = await res.json();
		user = data.user
		if (!user) {
			window.location.href = "technician_login.html";
			return;
		}
	} else {
		window.location.href = "technician_login.html";
		return;
	}

    const params = new URLSearchParams(window.location.search);
    room = params.get("room") || "G301";

    document.querySelector('#room-label').innerHTML = 'ROOM ' + room;
    
    updateDateDisplay();

    let activeRow = null;
    let dayCounter = 0;
    let selectedAction = null; // Track which action is in progress
    let currentReservation = null; // holds reservation being viewed/edited

    // ========== DATE NAVIGATION ==========
    var dateback = document.getElementById("dateback");
    if (dateback) {
        dateback.classList.add("disabled");
        dateback.addEventListener("click", function () {
            if (dayCounter === 6) {
                document.getElementById("datego").classList.remove("disabled");
            }
            if (dayCounter > 0) {
                currentDate.setDate(currentDate.getDate() - 1);
                updateDateDisplay();
                dayCounter--;
                if (dayCounter === 0) {
                    dateback.classList.add("disabled");
                }
            } 
        });
    }

    var datego = document.getElementById("datego");
    if (datego) {
        datego.addEventListener("click", function () {
            if (dayCounter === 0) {
                dateback.classList.remove("disabled");
            }
            if (dayCounter < 6) {
                currentDate.setDate(currentDate.getDate() + 1);
                updateDateDisplay();
                dayCounter++;
                if (dayCounter === 6) {
                    datego.classList.add("disabled");
                }
            } 
        });
    }

    // ========== RESERVE FOR STUDENT ==========
    var revButton = document.getElementById("rev");
    var reserveModal = document.getElementById("reserve-modal");
    
    if (revButton) {
        revButton.addEventListener("click", async function () {
            const selectedCells = document.querySelectorAll(".date-grid-cell.chosen");
            if (selectedCells.length === 0) {
                alert("Please select time slots");
                return;
            }

            const row = selectedCells[0].closest(".date-grid-row");
            const cellsInRow = row.querySelectorAll('.date-grid-cell');
            const startCellIndex = Array.from(cellsInRow).indexOf(selectedCells[0]);
            const endCellIndex = Array.from(cellsInRow).indexOf(selectedCells[selectedCells.length-1]);
            
            // Validate contiguous selection
            if ((endCellIndex - startCellIndex + 1) !== selectedCells.length) {
                alert("Invalid Selection - must be contiguous time slots");
                return;
            }

            const seatNumber = row.querySelector('.date-grid-seat').textContent.replace('Seat ', '');
            const reserveDateDisplay = formatDate(currentDate);
            const reserveDateISO = currentDate.toLocaleDateString('en-CA');
            const startTime = getTimeRangeStringFromIndex(startCellIndex).start;
            const endTime = getTimeRangeStringFromIndex(endCellIndex).end;

            // Show modal (use IDs present in G302 markup)
            selectedAction = {
                type: 'reserve_student',
                seatID: room + '-' + seatNumber,
                startTime: reserveDateISO + "T" + startTime,
                endTime: reserveDateISO + "T" + endTime
            };

            // populate modal fields
            const rr = document.getElementById('reserve-room');
            const rs = document.getElementById('reserve-seat');
            const rd = document.getElementById('reserve-date');
            const rstart = document.getElementById('reserve-start');
            const rend = document.getElementById('reserve-end');
            const rinput = document.getElementById('reserve-student-id');
            const ranon = document.getElementById('reserve-anon');

            if (rr) rr.textContent = room;
            if (rs) rs.textContent = 'Seat ' + seatNumber;
            if (rd) rd.textContent = reserveDateDisplay;
            if (rstart) rstart.textContent = formatTimeForDisplay(startTime);
            if (rend) rend.textContent = formatTimeForDisplay(endTime);
            if (rinput) rinput.value = '';
            if (ranon) ranon.checked = false;

            if (reserveModal) reserveModal.classList.remove('hidden');
        });
    }

    if (reserveModal) {
        document.getElementById('reserve-confirm').addEventListener('click', async function () {
            const idInput = document.getElementById('reserve-student-id');
            const anonInput = document.getElementById('reserve-anon');
            const idNumber = idInput && idInput.value ? parseInt(idInput.value) : null;
            const isAnon = anonInput && anonInput.checked;

            // Technicians must always provide a student ID when reserving for a student.
            if (!idNumber || isNaN(idNumber)) {
                alert('Please enter a valid student ID number');
                return;
            }

            const reservation = {
                seatID: selectedAction.seatID,
                startTime: convertDisplayDateToISO(selectedAction.startTime),
                endTime: convertDisplayDateToISO(selectedAction.endTime),
                idNumber: idNumber,
                reservationType: 'Student',
                isAnonymous: isAnon
            };

            try {
                // Use technician API to create reservation for student
                const response = await fetch(`/api/technician/reserve_for_student`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(reservation)
                });

                if (response.ok) {
                    alert('Reservation created for student');
                    updateDateDisplay();
                    clearSelection();
                    reserveModal.classList.add('hidden');
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
            reserveModal.classList.add('hidden');
            selectedAction = null;
        });
    }

    // ========== BLOCK TIME (PARTIAL) ==========
    var blockTimeButton = document.getElementById("blocktime");
    var blockTimeModal = document.getElementById("block-modal");
    
    if (blockTimeButton) {
        blockTimeButton.addEventListener("click", async function () {
            const selectedCells = document.querySelectorAll(".date-grid-cell.chosen");
            if (selectedCells.length === 0) {
                alert("Please select time slots to block");
                return;
            }

            const row = selectedCells[0].closest(".date-grid-row");
            const cellsInRow = row.querySelectorAll('.date-grid-cell');
            const startCellIndex = Array.from(cellsInRow).indexOf(selectedCells[0]);
            const endCellIndex = Array.from(cellsInRow).indexOf(selectedCells[selectedCells.length-1]);
            
            // Validate contiguous selection
            if ((endCellIndex - startCellIndex + 1) !== selectedCells.length) {
                alert("Invalid Selection - must be contiguous time slots");
                return;
            }

            const seatNumber = row.querySelector('.date-grid-seat').textContent.replace('Seat ', '');
            const reserveDate = currentDate.toLocaleDateString('en-CA');
            const startTime = getTimeRangeStringFromIndex(startCellIndex).start;
            const endTime = getTimeRangeStringFromIndex(endCellIndex).end;

            // Show modal
            selectedAction = {
                type: 'block_time',
                seatID: room + '-' + seatNumber,
                startTime: reserveDate + "T" + startTime,
                endTime: reserveDate + "T" + endTime
            };

              // populate block modal fields (match IDs in HTML)
              const brRoom = document.getElementById('block-room');
              const brStartDate = document.getElementById('block-start-date');
              const brEndDate = document.getElementById('block-end-date');
              const brStartTime = document.getElementById('block-start-time');
              const brEndTime = document.getElementById('block-end-time');
              const brReason = document.getElementById('block-reason');

              if (brRoom) brRoom.textContent = room;
              if (brStartDate) brStartDate.value = reserveDate;
              if (brEndDate) brEndDate.value = reserveDate;
              if (brStartTime) brStartTime.value = startTime;
              if (brEndTime) brEndTime.value = endTime;
              if (brReason) brReason.value = "";
            blockTimeModal.classList.remove("hidden");
        });
    }

    if (blockTimeModal) {
        const blockConfirmBtn = document.getElementById("block-confirm");
        const blockCancelBtn = document.getElementById("block-cancel");
        if (blockConfirmBtn) {
            blockConfirmBtn.addEventListener("click", async function () {
                const reason = document.getElementById("block-reason") ? document.getElementById("block-reason").value.trim() : document.getElementById("block-reason-input") && document.getElementById("block-reason-input").value.trim();
            
            if (!reason) {
                alert("Please enter a reason for blocking");
                return;
            }

            const reservation = {
                seatID: selectedAction.seatID,
                startTime: selectedAction.startTime,
                endTime: selectedAction.endTime,
                reservationType: 'Blocked',
                description: reason
            };

            try {
                // Use technician API to block a single seat/time range
                const response = await fetch(`/api/technician/block_seat`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: 'include',
                    body: JSON.stringify(reservation)
                });

                if (response.ok) {
                    alert("Time slot blocked successfully");
                    updateDateDisplay();
                    clearSelection();
                    blockTimeModal.classList.add("hidden");
                } else {
                    const err = await response.json().catch(() => ({}));
                    alert("Error: " + (err.message || "Failed to block time slot"));
                }
            } catch (error) {
                console.error("Error blocking time:", error);
                alert("Failed to block time slot");
            }
        });

        if (blockCancelBtn) {
            blockCancelBtn.addEventListener("click", function () {
                blockTimeModal.classList.add("hidden");
                selectedAction = null;
            });
        }
    }

    // ========== BLOCK ENTIRE ROOM ==========
    var blockRoomButton = document.getElementById("block");
    var blockRoomModal = document.getElementById("block-room-modal");
    
    if (blockRoomButton) {
        blockRoomButton.addEventListener("click", function () {
            // Set default times
            const reserveDate = currentDate.toLocaleDateString('en-CA');
            document.getElementById("block-room-start").value = "08:00";
            document.getElementById("block-room-end").value = "17:00";
            document.getElementById("block-room-reason").value = "";
            blockRoomModal.classList.remove("hidden");
        });
    }

    if (blockRoomModal) {
        document.getElementById("confirm-block-room").addEventListener("click", async function () {
            const startTime = document.getElementById("block-room-start").value;
            const endTime = document.getElementById("block-room-end").value;
            const reason = document.getElementById("block-room-reason").value.trim();

            if (!startTime || !endTime) {
                alert("Please select start and end times");
                return;
            }

            if (!reason) {
                alert("Please enter a reason for blocking");
                return;
            }

            // Validate time range
            if (startTime >= endTime) {
                alert("End time must be after start time");
                return;
            }

            const reserveDate = currentDate.toLocaleDateString('en-CA');
            const fullStartTime = reserveDate + "T" + startTime;
            const fullEndTime = reserveDate + "T" + endTime;

            // Check for conflicts with existing reservations
            try {
                const response = await fetch(`/api/common_routes/reservations_per_day/${room}/${reserveDate}`, {
                    credentials: 'include'
                });
                const data = await response.json();
                const reservations = data.reservations;

                const hasConflict = reservations.some(res => {
                    const resStart = new Date(res.startTime);
                    const resEnd = new Date(res.endTime);
                    const blockStart = new Date(fullStartTime);
                    const blockEnd = new Date(fullEndTime);

                    // Check for time overlap
                    return (blockStart < resEnd && blockEnd > resStart);
                });

                if (hasConflict) {
                    alert("Invalid selection of block time - conflicts with existing reservations");
                    return;
                }

                // Create blocks for all seats
                const blockPromises = [];
                for (let seatNum = 1; seatNum <= SEATS_PER_ROOM; seatNum++) {
                    const reservation = {
                        seatID: room + '-' + seatNum,
                        startTime: fullStartTime,
                        endTime: fullEndTime,
                        reservationType: 'Blocked',
                        description: reason
                    };

                    blockPromises.push(
                        fetch(`/api/technician/block_seat`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            credentials: 'include',
                            body: JSON.stringify(reservation)
                        })
                    );
                }

                const results = await Promise.all(blockPromises);
                let allSuccess = true;

                for (const result of results) {
                    const data = await result.json();
                    if (!data.success) {
                        allSuccess = false;
                        break;
                    }
                }

                if (allSuccess) {
                    alert("Room blocked successfully");
                    updateDateDisplay();
                    blockRoomModal.classList.add("hidden");
                } else {
                    alert("Error: Failed to block some or all seats");
                }
            } catch (error) {
                console.error("Error blocking room:", error);
                alert("Failed to block room");
            }
        });

        document.getElementById("cancel-block-room").addEventListener("click", function () {
            blockRoomModal.classList.add("hidden");
        });
    }

    // ========== GRID CELL SELECTION ==========
    var gridWrap = document.querySelector(".date-grid-wrap");
    if (gridWrap) {
        gridWrap.addEventListener("click", function (e) {
            var cell = e.target.closest(".date-grid-cell");

            if (!cell) return;

            var row = cell.closest(".date-grid-row");

            if (!cell.classList.contains("unavailable") && !cell.classList.contains("selected")) {
                if (!activeRow) {
                    activeRow = row;

                    document.querySelectorAll(".date-grid-row").forEach(r => {
                        if (r !== activeRow) {
                            r.classList.add("disabled");
                        }
                    });           
                }

                if (row !== activeRow) {
                    activeRow = row;
                }

                if (!cell.classList.contains("unavailable") && !cell.classList.contains("selected")) {
                    cell.classList.toggle("chosen");

                    var anyChosen = document.querySelector(".date-grid-cell.chosen");
                    if (!anyChosen) {
                        activeRow = null;
                        document.querySelectorAll(".date-grid-row").forEach(r => {
                            r.classList.remove("disabled");
                        });
                    }
                }
            }
        });

        var seatInfoCard = document.getElementById("seat-info-card");
        if (seatInfoCard) {
            var pinnedCell = null;

            function isInfoCell(cell) {
                // show info for student reservations (selected) and blocked slots (unavailable)
                return cell && (cell.classList.contains("selected") || cell.classList.contains("unavailable"));
            }

            async function showSeatInfo(cell) {
                seatInfoCard.classList.remove("hidden");
                var reservationDate = currentDate.toLocaleDateString('en-CA');

                var row = cell.closest('.date-grid-row');
                var seatText = row.querySelector('.date-grid-seat').textContent;
                var seatNumber = seatText.replace('Seat ', '');
                var roomSeat = room + "-" + seatNumber;

                var cellsInRow = row.querySelectorAll('.date-grid-cell');
                var cellIndex = Array.from(cellsInRow).indexOf(cell);

                const startTime = reservationDate + "T" + getTimeRangeStringFromIndex(cellIndex).start;
                const endTime = reservationDate + "T" + getTimeRangeStringFromIndex(cellIndex).end;

                try {
                    const getResponse = await fetch(`/api/student/reservations/key/${roomSeat}?start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}`, {
                        method: "GET",
                        credentials: 'include'
                    });
                    const reservation = await getResponse.json();

                    if (!reservation || !reservation.idNumber) {
                        hideSeatInfo();
                        return;
                    }

                    const getStudent = await fetch(`/api/student/get_profile/${reservation.idNumber}`, {
                        method: "GET",
                        credentials: 'include'
                    });

                    const studentProfile = await getStudent.json();
                    const picture = studentProfile.profilePicture;
                    const username = studentProfile.username;

                    // For technicians we always show the actual student who made the reservation
                    // (anonymity applies only between students). Use student profile data
                    // even if reservation.isAnonymous is true.
                    const card = document.getElementById("seat-info-card");
                    card.querySelector(".seat-info-avatar").src = picture || './assets/images/student.png';
                    card.querySelector(".seat-info-username").textContent = "@" + (username || 'unknown');
                    seatInfoCard.classList.remove('disabled');
                    // save the reservation for edit operations
                    currentReservation = reservation;
                    // update cancel button state immediately when reservation changes
                    try { updateCancelRevOpenState(); } catch (e) { /* ignore */ }
                } catch (error) {
                    console.error("Error fetching seat info:", error);
                    hideSeatInfo();
                }
            }

            function hideSeatInfo() {
                seatInfoCard.classList.add("hidden");
                // reservation may be cleared when hiding info; refresh cancel state
                try { updateCancelRevOpenState(); } catch (e) { /* ignore */ }
            }

            gridWrap.addEventListener("mouseover", function (e) {
                var cell = e.target.closest(".date-grid-cell");
                if (!isInfoCell(cell)) return;
                if (!pinnedCell) {
                    showSeatInfo(cell);
                }
            });

            gridWrap.addEventListener("mouseout", function (e) {
                var cell = e.target.closest(".date-grid-cell");
                if (!isInfoCell(cell)) return;
                if (!pinnedCell) {
                    hideSeatInfo();
                }
            });

            gridWrap.addEventListener("click", function (e) {
                e.stopPropagation();
                
                var cell = e.target.closest(".date-grid-cell");

                if (pinnedCell !== null) {
                    pinnedCell = null;
                    hideSeatInfo();
                } else if (isInfoCell(cell)) {
                    pinnedCell = cell;
                    showSeatInfo(cell);
                }
            });

            document.addEventListener("click", function () {
                pinnedCell = null;
                hideSeatInfo();
            });
        }
    }

    // ========== BACK BUTTON ==========
    var backButton = document.getElementById("back");
    if (backButton) {
        backButton.addEventListener("click", function () {
            window.location.href = "./technicianreserve.html";
        });
    }

    // ========== SEAT MAP ==========
    var map = document.getElementById('map');
    var seatmap = document.getElementById('seatmap');
    if (seatmap) {
        seatmap.addEventListener("click", function () {
            map.classList.remove('hidden');
        });
    }

    var crossback = document.getElementById('crossback');
    if (crossback) {
        crossback.addEventListener("click", function () {
            map.classList.add('hidden');
        });
    }

    // ========== ADDITIONAL MODAL HANDLERS (ported from G302) ==========
    // Edit reservation open - populate edit modal with current reservation
    var editReserveOpen = document.getElementById('editrevfs');
    var editBlockModal = document.getElementById('edit-block-modal');
    if (editReserveOpen && editBlockModal) {
        editReserveOpen.addEventListener('click', async function () {
            if (!currentReservation || !currentReservation._id) {
                alert('No reservation selected to edit');
                return;
            }

            // populate room (static)
            const editRoomEl = document.getElementById('edit-block-room');
            if (editRoomEl) editRoomEl.textContent = room;

            // populate seat select
            const seatSelect = document.getElementById('edit-block-seat');
            if (seatSelect) {
                seatSelect.innerHTML = '';
                for (let i = 1; i <= SEATS_PER_ROOM; i++) {
                    const opt = document.createElement('option');
                    opt.value = i;
                    opt.textContent = i;
                    seatSelect.appendChild(opt);
                }
                // select current seat
                const parts = currentReservation.seatID ? currentReservation.seatID.split('-') : [];
                const currentSeat = parts[1] || '';
                if (currentSeat) seatSelect.value = currentSeat;
            }

            // date inputs
            const startDateEl = document.getElementById('edit-block-start-date');
            const endDateEl = document.getElementById('edit-block-end-date');
            const resStart = new Date(currentReservation.startTime);
            const resEnd = new Date(currentReservation.endTime);
            const isoDate = (d) => d.toISOString().slice(0,10);
            if (startDateEl) startDateEl.value = isoDate(resStart);
            if (endDateEl) endDateEl.value = isoDate(resEnd);

            // time selects: populate half-hour slots from 08:00 to 17:00
            function makeTimeOptions(selectEl) {
                selectEl.innerHTML = '';
                const startHour = 8;
                const endHour = 17; // last slot start 16:30 -> end 17:00
                for (let h = startHour; h <= endHour; h++) {
                    for (let m = 0; m < 60; m += 30) {
                        const hh = String(h).padStart(2,'0');
                        const mm = String(m).padStart(2,'0');
                        const val = `${hh}:${mm}`;
                        const opt = document.createElement('option');
                        opt.value = val;
                        opt.textContent = val;
                        selectEl.appendChild(opt);
                        // stop at endHour:00
                        if (h === endHour && m > 0) break;
                    }
                }
            }

            const startTimeSelect = document.getElementById('edit-block-start-time');
            const endTimeSelect = document.getElementById('edit-block-end-time');
            if (startTimeSelect && endTimeSelect) {
                makeTimeOptions(startTimeSelect);
                makeTimeOptions(endTimeSelect);
                const fmt = (d) => String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
                startTimeSelect.value = fmt(resStart);
                endTimeSelect.value = fmt(resEnd);
            }

            // reason
            const reasonEl = document.getElementById('edit-block-reason');
            if (reasonEl) reasonEl.value = currentReservation.description || '';

            editBlockModal.classList.remove('hidden');
        });
    }

    // edit confirm / cancel simply hide modal (full edit logic not implemented yet)
    var editConfirm = document.getElementById('edit-confirm');
    var editCancel = document.getElementById('edit-cancel');
    if (editConfirm && editBlockModal) {
        editConfirm.addEventListener('click', async function () {
            if (!currentReservation || !currentReservation._id) {
                alert('No reservation selected');
                return;
            }

            const seatSelect = document.getElementById('edit-block-seat');
            const startDateEl = document.getElementById('edit-block-start-date');
            const endDateEl = document.getElementById('edit-block-end-date');
            const startTimeSelect = document.getElementById('edit-block-start-time');
            const endTimeSelect = document.getElementById('edit-block-end-time');
            const reasonEl = document.getElementById('edit-block-reason');

            const seat = seatSelect ? seatSelect.value : null;
            const startDate = startDateEl ? startDateEl.value : null;
            const endDate = endDateEl ? endDateEl.value : null;
            const startTime = startTimeSelect ? startTimeSelect.value : null;
            const endTime = endTimeSelect ? endTimeSelect.value : null;
            const description = reasonEl ? reasonEl.value.trim() : '';

            if (!seat || !startDate || !endDate || !startTime || !endTime) {
                alert('Please fill all fields');
                return;
            }

            // build ISO strings
            const fullStart = `${startDate}T${startTime}`;
            const fullEnd = `${endDate}T${endTime}`;

            if (new Date(fullStart) >= new Date(fullEnd)) {
                alert('End time must be after start time');
                return;
            }

            // check conflicts for the room/date
            try {
                const roomDate = startDate; // YYYY-MM-DD
                const resp = await fetch(`/api/common_routes/reservations_per_day/${room}/${roomDate}`, {
                    credentials: 'include'
                });
                const data = await resp.json();
                const reservations = data.reservations || [];

                const newSeatID = `${room}-${seat}`;
                const newStart = new Date(fullStart);
                const newEnd = new Date(fullEnd);

                const conflict = reservations.some(r => {
                    // ignore the reservation being edited
                    if (r._id === currentReservation._id) return false;
                    // only consider same seat (or blocked entries on same seat)
                    if (r.seatID !== newSeatID) return false;
                    const rStart = new Date(r.startTime);
                    const rEnd = new Date(r.endTime);
                    return (newStart < rEnd && newEnd > rStart);
                });

                if (conflict) {
                    alert('Selected time/seat conflicts with an existing reservation or block');
                    return;
                }

                // send update to server
                const updateResp = await fetch(`/api/technician/update_reservation/${currentReservation._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ seatID: newSeatID, startTime: fullStart, endTime: fullEnd, description })
                });

                if (updateResp.ok) {
                    alert('Reservation updated');
                    editBlockModal.classList.add('hidden');
                    updateDateDisplay();
                    currentReservation = null;
                } else {
                    const err = await updateResp.json().catch(() => ({}));
                    alert('Error: ' + (err.message || 'Failed to update reservation'));
                }
            } catch (error) {
                console.error('Error updating reservation:', error);
                alert('Failed to update reservation');
            }
        });
    }
    if (editCancel && editBlockModal) {
        editCancel.addEventListener('click', function () {
            editBlockModal.classList.add('hidden');
        });
    }

    // blockroom1 (password modal) confirm/cancel
    var blockroom1 = document.getElementById('blockroom1');
    var confirmBlockroomBtn = document.getElementById('confirmblock');
    var cancelBlockroomBtn = document.getElementById('cancelblock');
    if (confirmBlockroomBtn && blockroom1) {
        confirmBlockroomBtn.addEventListener('click', function () {
            blockroom1.classList.add('hidden');
        });
    }
    if (cancelBlockroomBtn && blockroom1) {
        cancelBlockroomBtn.addEventListener('click', function () {
            blockroom1.classList.add('hidden');
        });
    }

    // revcancel modal: open from cancel button and perform deletion on confirm
    var cancelRevOpen = document.getElementById('cancelrev');
    var revcancel = document.getElementById('revcancel');
    var confirmCancelBtn = document.getElementById('confirmcancel');
    var cancelCancelBtn = document.getElementById('cancelcancel');
    var cancelRevTimer = null;

    if (cancelRevOpen && revcancel) {
        cancelRevOpen.addEventListener('click', function () {
            if (!currentReservation || !currentReservation._id) {
                alert('No reservation selected to cancel');
                return;
            }
            if (cancelRevOpen.getAttribute('aria-disabled') === 'true'){
                alert('Cancel is not available yet for this reservation.');
                return;
            }
            revcancel.classList.remove('hidden');
        });
    }

    if (confirmCancelBtn && revcancel) {
        confirmCancelBtn.addEventListener('click', async function () {
            if (!currentReservation || !currentReservation.seatID) {
                alert('No reservation selected');
                revcancel.classList.add('hidden');
                return;
            }

            const seatID = currentReservation.seatID;
            const startTime = currentReservation.startTime;
            const endTime = currentReservation.endTime;

            try {
                const delResp = await fetch(`/api/technician/delete_reservation/${encodeURIComponent(seatID)}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ startTime, endTime })
                });

                if (delResp.ok) {
                    alert('Reservation cancelled');
                    revcancel.classList.add('hidden');
                    currentReservation = null;
                    try { updateCancelRevOpenState(); } catch (e) { /* ignore */ }
                    updateDateDisplay();
                    hideSeatInfo();
                } else {
                    const err = await delResp.json().catch(() => ({}));
                    alert('Error: ' + (err.message || 'Failed to cancel reservation'));
                }
            } catch (error) {
                console.error('Error cancelling reservation:', error);
                alert('Failed to cancel reservation');
            }
        });
    }

    if (cancelCancelBtn && revcancel) {
        cancelCancelBtn.addEventListener('click', function () {
            revcancel.classList.add('hidden');
        });
    }

    // update visual state of the cancel button (disable until 10 minutes after start)
    function updateCancelRevOpenState(){
        if (!cancelRevOpen) return;
            if (!currentReservation || !currentReservation.startTime){
                cancelRevOpen.classList.remove('cancel-disabled');
                cancelRevOpen.removeAttribute('aria-disabled');
                cancelRevOpen.title = '';
                return;
            }

        const start = new Date(currentReservation.startTime);
        const enableAt = new Date(start.getTime() + 10 * 60 * 1000); //adds 10 minutes to the start time to determine when cancel should be enabled
        const now = new Date();


        function enable(){
            cancelRevOpen.classList.remove('cancel-disabled');
            cancelRevOpen.removeAttribute('aria-disabled');
            cancelRevOpen.title = '';
        }

        if (now >= enableAt){
            enable();
            return;
        }

        // disable until enableAt
        cancelRevOpen.classList.add('cancel-disabled');
        cancelRevOpen.setAttribute('aria-disabled','true');
        cancelRevOpen.title = 'Cancel disabled until ' + enableAt.toLocaleString();

        if (cancelRevTimer) clearTimeout(cancelRevTimer);
        const ms = enableAt.getTime() - now.getTime();
        cancelRevTimer = setTimeout(() => { try { enable(); } catch (e){} }, ms + 50);
    }

    // keep the cancel button state updated (in case currentReservation changes)
    setInterval(updateCancelRevOpenState, 0);
    updateCancelRevOpenState();

    // Clicking the seat info card goes to the technician student profile page
    // keep clicks on the seat info card local (do not navigate away)
    var seatInfoCardNav = document.getElementById('seat-info-card');
    if (seatInfoCardNav) {
        seatInfoCardNav.addEventListener('click', function (e) {
            // prevent bubbling navigation; do nothing so edit button opens the in-page modal
            e.stopPropagation();
        });
    }

    // ========== HELPER FUNCTION ==========
    function formatTimeForDisplay(t) {
        // t expected like 'HH:MM' — return as-is or convert if needed
        if (!t) return '';
        return t;
    }

    function convertDisplayDateToISO(s) {
        // expects strings like 'YYYY-MM-DDTHH:MM' -> convert to include seconds
        if (!s) return s;
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return s + ':00';
        return s;
    }
    function clearSelection() {
        document.querySelectorAll(".date-grid-cell.chosen").forEach(c => {
            c.classList.remove("chosen");
        });
        activeRow = null;
        document.querySelectorAll(".date-grid-row").forEach(r => {
            r.classList.remove("disabled");
        });
        // Buttons remain visible; user will be prompted if no selection
    }
}});
