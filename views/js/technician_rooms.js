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

    const response = await fetch(`/api/common_routes/reservations_per_day/${room}/${currentDate.toLocaleDateString('en-CA')}`);
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



document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
        window.location.href = "./index.html"
        return;
    }

    const params = new URLSearchParams(window.location.search);
    room = params.get("room") || "G301";

    document.querySelector('#room-label').innerHTML = 'ROOM ' + room;
    
    updateDateDisplay();

    let activeRow = null;
    let dayCounter = 0;
    let selectedAction = null; // Track which action is in progress

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

            if (!isAnon && (!idNumber || isNaN(idNumber))) {
                alert('Please enter a valid student ID number or check Anonymous');
                return;
            }

            const reservation = {
                seatID: selectedAction.seatID,
                startTime: convertDisplayDateToISO(selectedAction.startTime),
                endTime: convertDisplayDateToISO(selectedAction.endTime),
                idNumber: isAnon ? null : idNumber,
                reservationType: 'Student',
                isAnonymous: isAnon
            };

            try {
                // Use technician API to create reservation for student
                const response = await fetch(`/api/technician/reserve_for_student`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
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
                        "Authorization": `Bearer ${token}`
                    },
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
                const response = await fetch(`/api/common_routes/reservations_per_day/${room}/${reserveDate}`);
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
                                "Authorization": `Bearer ${token}`
                            },
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
                    });
                    const reservation = await getResponse.json();

                    if (!reservation || !reservation.idNumber) {
                        hideSeatInfo();
                        return;
                    }

                    const getStudent = await fetch(`/api/student/get_profile/${reservation.idNumber}`, {
                        method: "GET",
                    });

                    const studentProfile = await getStudent.json();
                    const picture = studentProfile.profilePicture;
                    const username = studentProfile.username;

                    if (!reservation.isAnonymous) {
                        const card = document.getElementById("seat-info-card");
                        card.querySelector(".seat-info-avatar").src = picture
                        card.querySelector(".seat-info-username").textContent = "@" + username;
                        seatInfoCard.classList.remove('disabled');
                    } else {
                        const card = document.getElementById("seat-info-card");
                        card.innerHTML = `
                            <img src="./assets/images/diffusersym.png" alt="User avatar" class="seat-info-avatar">
                            <h2 class="seat-info-username">@anonymous</h2>
                        `;
                        seatInfoCard.classList.add('disabled');
                    }
                } catch (error) {
                    console.error("Error fetching seat info:", error);
                    hideSeatInfo();
                }
            }

            function hideSeatInfo() {
                seatInfoCard.classList.add("hidden");
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
    // Edit reservation open
    var editReserveOpen = document.getElementById('editrevfs');
    var editBlockModal = document.getElementById('edit-block-modal');
    if (editReserveOpen && editBlockModal) {
        editReserveOpen.addEventListener('click', function () {
            editBlockModal.classList.remove('hidden');
        });
    }

    // edit confirm / cancel simply hide modal (full edit logic not implemented yet)
    var editConfirm = document.getElementById('edit-confirm');
    var editCancel = document.getElementById('edit-cancel');
    if (editConfirm && editBlockModal) {
        editConfirm.addEventListener('click', function () {
            editBlockModal.classList.add('hidden');
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

    // revcancel modal confirm/cancel
    var revcancel = document.getElementById('revcancel');
    var confirmCancelBtn = document.getElementById('confirmcancel');
    var cancelCancelBtn = document.getElementById('cancelcancel');
    if (confirmCancelBtn && revcancel) {
        confirmCancelBtn.addEventListener('click', function () {
            revcancel.classList.add('hidden');
        });
    }
    if (cancelCancelBtn && revcancel) {
        cancelCancelBtn.addEventListener('click', function () {
            revcancel.classList.add('hidden');
        });
    }

    // Clicking the seat info card goes to the technician student profile page
    var seatInfoCardNav = document.getElementById('seat-info-card');
    if (seatInfoCardNav) {
        seatInfoCardNav.addEventListener('click', function () {
            window.location.href = "./techstudentprof.html";
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
