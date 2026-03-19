const studentprofile = document.getElementById('back')
const g301 = document.getElementById('G301')
const g302 = document.getElementById('G302')
const g303 = document.getElementById('G303')
const g304 = document.getElementById('G304')
const g305 = document.getElementById('G305')
const g306 = document.getElementById('G306')
const reservations = document.getElementById('reservations')

document.addEventListener("DOMContentLoaded", async function() {

    const token = localStorage.getItem("token");

    const response = await fetch('/api/student/all_reservations', {
        headers: { "Authorization": `Bearer ${token}` }
    });
    const allReservations = await response.json();

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const roomCounts = {
        "g301": 0,
        "g302": 0,
        "g303": 0,
        "g304": 0,
        "g305": 0,
        "g306": 0
    };

    allReservations.forEach(reservation => {
        const reservationDate = new Date(reservation.startTime).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });


        if (reservationDate !== today) return;

    
        const room = reservation.seatID.split('-')[0].toLowerCase();
        if (roomCounts[room] !== undefined) {
            roomCounts[room]++;
        }
    });

    var percentage = (roomCounts["g301"] / 432) * 100;
    percentage = Math.round(percentage);
    
    document.getElementById("G301").innerHTML = `
                    <div class="roomheader">
                        <img src="assets/images/roompic.png" alt="Room Thumbnail">
                        <div class="roomlabel">
                            <h3>Room G301</h3>
                        </div>
                    </div>
                    <div class="vacancyinfo">
                        <span>Vacancy:</span>
                        <span>`+percentage+`%</span>
                    </div>
                    <div class="progressbar">
                        <div class="progressfill" style="width: `+percentage+`%;"></div>
                    </div>`

    studentprofile.addEventListener('click', function(){
        window.location.href = "../student.html";
    })

    reservations.addEventListener('click', async function(){
        window.location.href = "../myreservations.html";
    })

    g301.addEventListener('click', function(){
        window.location.href = "./student_room.html?room=G301";
    })

    if (g302) g302.addEventListener('click', function(){
        window.location.href = "./student_room.html?room=G302";
    })

    if (g303) g303.addEventListener('click', function(){
        window.location.href = "./student_room.html?room=G303";
    })

    if (g304) g304.addEventListener('click', function(){
        window.location.href = "./student_room.html?room=G304";
    })

    if (g305) g305.addEventListener('click', function(){
        window.location.href = "./student_room.html?room=G305";
    })

    if (g306) g306.addEventListener('click', function(){
        window.location.href = "./student_room.html?room=G306";
    })

})
