var currentDate = new Date();
let room = null;
const sundayIndex = 0;

let activeRow = null;
let dayCounter = 0;

var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


function formatDate(d) {
    return weekdays[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

function updateDateDisplay() {
    var el = document.getElementById("dayanddate");
    if (el) el.textContent = formatDate(currentDate);
    document.getElementById('rev').classList.add("hidden");
    activeRow = null;
    document.querySelectorAll(".date-grid-row").forEach(r => {
        r.classList.remove("disabled");
    });
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

function validateSelectedCells(selectedCells, row){
    const cellsInRow = row.querySelectorAll('.date-grid-cell');
    const startCellIndex = Array.from(cellsInRow).indexOf(selectedCells[0]);
    const endCellIndex = Array.from(cellsInRow).indexOf(selectedCells[selectedCells.length-1]);
    
    return (endCellIndex - startCellIndex + 1) === selectedCells.length;
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
			window.location.href = "student_login.html";
			return;
		}
	} else {
		window.location.href = "student_login.html";
		return;
	}

    const params = new URLSearchParams(window.location.search);
    room = params.get("room");

    document.querySelector('#room-label').innerHTML = 'ROOM ' + room;

    // check Sunday
    if(currentDate.getDay() === sundayIndex) {
        currentDate.setDate(currentDate.getDate() + 1);
    }

    updateDateDisplay();

    var dateback = document.getElementById("dateback");
    if (dateback) {
        dateback.classList.add("disabled");
        dateback.addEventListener("click", function () {
            // can view next days
            if (dayCounter === 6) {
                datego.classList.remove("disabled");
            }
            // go to previous day
            if (dayCounter > 0) {
                currentDate.setDate(currentDate.getDate() - 1);
                // check if sunday
                if(currentDate.getDay() === sundayIndex) {
                    currentDate.setDate(currentDate.getDate() - 1);
                }
                updateDateDisplay();
                dayCounter--;
                // cannot view past days
                if (dayCounter === 0) {
                    dateback.classList.add("disabled");
                }
            } 
        });
    }

    var datego = document.getElementById("datego");
    if (datego) {
        datego.addEventListener("click", function () {
            // can view previous days
            if (dayCounter === 0) {
                dateback.classList.remove("disabled");
            }
            // go to next day
            if (dayCounter < 6) {
                currentDate.setDate(currentDate.getDate() + 1);
                // check if sunday
                if(currentDate.getDay() === sundayIndex) {
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                updateDateDisplay();
                dayCounter++;
                // cannot view more than 7 days
                if (dayCounter === 6) {
                    datego.classList.add("disabled");
                }
            } 
        });
    }

    
    var reserveButton = document.getElementById("rev");

    if(reserveButton){
        reserveButton.addEventListener("click", async function () {
            const res = await fetch(`/api/student/view_profile/${user.username}`, {
                credentials: 'include'
            })
            const requester = await res.json()

            if(!requester.canReserve){
                alert("Your account has been blocked from making reservations. Contact support for assistance.");
                updateDateDisplay()
                reserveButton.classList.add("hidden");
                return;
            } 

            const selectedCells = document.querySelectorAll(".date-grid-cell.chosen");
            const row = selectedCells[0].closest(".date-grid-row");
            const cellsInRow = row.querySelectorAll('.date-grid-cell');
            const startCellIndex = Array.from(cellsInRow).indexOf(selectedCells[0]);
            const endCellIndex = Array.from(cellsInRow).indexOf(selectedCells[selectedCells.length-1]);
            const seatNumber = row.querySelector('.date-grid-seat').textContent.replace('Seat ', '');
           
            if((endCellIndex - startCellIndex + 1) !== selectedCells.length){
                alert("Invalid Selection");
                return;
            }

            var anonCheckbox = document.getElementById('anonymous-toggle');
            var isAnonymous = anonCheckbox ? anonCheckbox.checked : false;

            const reserveDate = currentDate.toLocaleDateString('en-CA');
            const startTime = reserveDate + "T" + getTimeRangeStringFromIndex(startCellIndex).start;
            const endTime = reserveDate + "T" + getTimeRangeStringFromIndex(endCellIndex).end;

            // check if reservation was made at least 30 mins before start time
            const currentTimeTemp = new Date()
            const startTimeTemp = new Date(startTime)
            const minuteDiff = (startTimeTemp.getTime() - currentTimeTemp.getTime()) / 60000

            if(minuteDiff < 30) {
                alert('Reservation must be made at least 30 minutes before intended start time.');
                return;
            }

            const reservation = {
                seatID: room + '-' + seatNumber,
                startTime: startTime,
                endTime: endTime,
                isAnonymous: isAnonymous
            }

            try {
                const response = await fetch(`/api/student/create_reservation/${user.username}`,{
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                    },
                    credentials: 'include',
                    body: JSON.stringify(reservation)
                });

                const result = await response.json();

                if(result.success){
                    alert("Reserved");
                    updateDateDisplay();
                    activeRow = null;
                    document.querySelectorAll(".date-grid-row").forEach(r => {
                        r.classList.remove("disabled");
                    });
                    selectedCells.forEach(c => {
                        c.classList.remove("chosen")
                    })
                    reserveButton.classList.add("hidden");
                } else {
                    console.warn("Server returned an error:", result);
                }
            } catch (error) {
                console.error("POST failed:", error);
            }
        });
    }

    var gridWrap = document.querySelector(".date-grid-wrap");
    if (gridWrap) {
        gridWrap.addEventListener("click", function (e) {
            var cell = e.target.closest(".date-grid-cell");

            if(!cell) return;

            var row = cell.closest(".date-grid-row");

            if(!cell.classList.contains("unavailable") && !cell.classList.contains("selected")){
                if(!activeRow){
                    activeRow = row;

                    document.querySelectorAll(".date-grid-row").forEach(r => {
                        if(r !== activeRow){
                            r.classList.add("disabled");
                        }
                    });           
                }

                if (row !== activeRow) {
                    activeRow = row;
                }

                if (!cell.classList.contains("unavailable") && !cell.classList.contains("selected")) {
                    cell.classList.toggle("chosen");

                    if (reserveButton) {
                        var anyChosen = document.querySelector(".date-grid-cell.chosen");
                        if (anyChosen) {
                            reserveButton.classList.remove("hidden");
                        } else {
                            reserveButton.classList.add("hidden");
                            activeRow = null;
                            document.querySelectorAll(".date-grid-row").forEach(r => {
                                r.classList.remove("disabled");
                            });
                        }
                    }
                }
            }
        });

        var seatInfoCard = document.getElementById("seat-info-card");
        if (seatInfoCard) {
            var pinnedCell = null;

            function isInfoCell(cell) {
                return cell && cell.classList.contains("selected");
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

                const getResponse = await fetch(`/api/student/reservations/key/${roomSeat}?start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}`, {
                    method: "GET",
                    credentials: 'include'
                });
                const reservation = await getResponse.json();

                const getStudent = await fetch(`/api/student/get_profile/${reservation.idNumber}`, {
                    method: "GET",
                    credentials: 'include'
                });

                const studentProfile = await getStudent.json();
                const picture = studentProfile.profilePicture;
                const username = studentProfile.username;

                if(!reservation.isAnonymous){
                    const card = document.getElementById("seat-info-card");
                    card.querySelector(".seat-info-avatar").src = picture
                    card.querySelector(".seat-info-username").textContent = "@" + username;
                    seatInfoCard.classList.remove('disabled');
                    seatInfoCard.addEventListener('click', function(){
                        window.location.href = `./studentprof.html?id=${username}`;
                    }); 
                }   
                else{
                    const card = document.getElementById("seat-info-card");
                    card.innerHTML = `
                        <img src="./assets/images/diffusersym.png" alt="User avatar" class="seat-info-avatar">
                        <h2 class="seat-info-username">@anonymous</h2>
                    `;
                    seatInfoCard.classList.add('disabled');
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

    var studentprofile = document.getElementById("back");
    if (studentprofile) {
        studentprofile.addEventListener("click", function () {
            window.location.href = "./studentreserve.html";
        });
    }

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
});