var currentDate = new Date();

var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDate(d) {
    return weekdays[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

function updateDateDisplay() {
    var el = document.getElementById("dayanddate");
    if (el) el.textContent = formatDate(currentDate);
}

document.addEventListener("DOMContentLoaded", function () {
    updateDateDisplay();

    var dateback = document.getElementById("dateback");
    if (dateback) {
        dateback.addEventListener("click", function () {
            currentDate.setDate(currentDate.getDate() - 1);
            updateDateDisplay();
        });
    }

    var datego = document.getElementById("datego");
    if (datego) {
        datego.addEventListener("click", function () {
            currentDate.setDate(currentDate.getDate() + 1);
            updateDateDisplay();
        });
    }
    
    var reserveButton = document.getElementById("rev");
    if (reserveButton){
        reserveButton.addEventListener("click", async function(e) {
            const user = JSON.parse(localStorage.getItem("user"));
            const token = localStorage.getItem("token");

            if (!user) {
            window.location.href = "../index.html"
            return;
            }
            
            try {
            const response = await fetch(`/api/student/view_profile/${user.username}`, 
                {headers: { "Authorization": `Bearer ${token}` }});

            const studentProfile = await response.json();

           var anonCheckbox = document.getElementById('anonymous-toggle');
           var isAnonymous = anonCheckbox ? anonCheckbox.checked : false;

            var room = "G301";
            var reservationDate = document.getElementById("dayanddate").innerHTML;

            var selectedCells = document.querySelectorAll('.date-grid-cell.chosen');
            var reservations = [];


                selectedCells.forEach(function(cell) {
                    var row = cell.closest('.date-grid-row');
                    var seatText = row.querySelector('.date-grid-seat').textContent;
                    var seatNumber = seatText.replace('Seat ', '');

                    var cellsInRow = row.querySelectorAll('.date-grid-cell');
                    var cellIndex = Array.from(cellsInRow).indexOf(cell);
                    var timeHeaders = document.querySelectorAll('.date-grid-time');
                    var timeHeader = timeHeaders[cellIndex];

                    if (timeHeader) {
                        var spans = timeHeader.querySelectorAll('span');
                        var startTime = spans[0].textContent;
                        var endTime = spans[1].textContent;

                        reservations.push({
                        room: room,
                        idNumber: studentProfile.idNumber,
                        seatID: seatNumber,
                        startTime: reservationDate + " " + startTime,
                        endTime: reservationDate + " " + endTime,
                        date: reservationDate,
                        isAnonymous: isAnonymous,
                        description: "reserved"
                        
                    });
                    

                    }
                })

            for (const reservation of reservations) {
                 
                try {
                    const postResponse = await fetch("/api/student/create_reservation/" + studentProfile.username, {
                        method: "POST",
                        headers: { "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`},
                        
                        body: JSON.stringify(reservation)
                        
                    });
                     
                    const result = await postResponse.json();
                   
                      if (postResponse.ok) {
                        console.log("✅ Success:", result);
                    } else {
                    console.warn("⚠️ Server returned an error:", result);
                    }
            
                } catch (error) {
                    console.error("POST failed:", error);
                }
            }
            
             } catch (error) {
            console.error("Error:", error);
            }
        });
    }

    var gridWrap = document.querySelector(".date-grid-wrap");
    if (gridWrap) {
        gridWrap.addEventListener("click", function (e) {
            var cell = e.target.closest(".date-grid-cell");
            if (cell && !cell.classList.contains("unavailable") && !cell.classList.contains("selected")) {
                cell.classList.toggle("chosen");
                if (reserveButton) {
                    var anyChosen = gridWrap.querySelector(".date-grid-cell.chosen");
                    if (anyChosen) {
                        reserveButton.classList.remove("hidden");
                    } else {
                        reserveButton.classList.add("hidden");
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

            function showSeatInfo(cell) {
                seatInfoCard.classList.remove("hidden");
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
                var cell = e.target.closest(".date-grid-cell");
                if (!isInfoCell(cell)) return;

                if (pinnedCell === cell) {
                    pinnedCell = null;
                    hideSeatInfo();
                } else {
                    pinnedCell = cell;
                    showSeatInfo(cell);
                }
            });
        }
    }

    seatInfoCard.addEventListener('click', function(){
    window.location.href = "../studentprof.html";}) 

});

var studentprofile = document.getElementById("back");
if (studentprofile) {
    studentprofile.addEventListener("click", function () {
        window.location.href = "../studentreserve.html";
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

