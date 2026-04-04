const studentprofile = document.getElementById('back')
const g301 = document.getElementById('G301')
const g302 = document.getElementById('G302')
const g303 = document.getElementById('G303')
const g304 = document.getElementById('G304')
const g305 = document.getElementById('G305')
const g306 = document.getElementById('G306')
const reservations = document.getElementById('reservations')

document.addEventListener("DOMContentLoaded", async function() {
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

    document.getElementById('headerlogo').addEventListener('click', () => {
        window.location.href = "technician.html";
    });

    const response = await fetch('/api/student/all_reservations', {
        credentials: 'include'
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

    function countSlots(startTime, endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMinutes = (end - start) / (1000 * 60); 
        return Math.round(diffMinutes / 30);
    }

    allReservations.forEach(reservation => {
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));

        // only consider next 14 days
        const next14Days = new Date(todayStart);
        next14Days.setDate(next14Days.getDate() + 14);

        const reservationStart = new Date(reservation.startTime);

        if (reservationStart < todayStart || reservationStart >= next14Days) return;
    
        const room = reservation.seatID.split('-')[0].toLowerCase();
        if (roomCounts[room] !== undefined) {
            const slots = countSlots(reservation.startTime, reservation.endTime);
            roomCounts[room] += slots;
        }
    });


    for (var i = 1; i < 7; i++){
    
        var percentage = (roomCounts["g30"+ i] / (432*14)) * 100;
        percentage = Math.round(percentage);
        
        document.getElementById("G30" + i).innerHTML = `
                    <div class="roomheader">
                        <img src="assets/images/roompic.png" alt="Room Thumbnail">
                        <div class="roomlabel">
                            <h3>Room G30`+ i + `</h3>
                        </div>
                    </div>
                    <div class="vacancyinfo">
                        <span>Slots filled (next 14 days):</span>
                        <span>`+percentage+`%</span>
                    </div>
                    <div class="progressbar">
                        <div class="progressfill" id="progbarG30${i}" style="width: `+percentage+`%;"></div>
                    </div>`

        const progBar = document.getElementById("progbarG30" + i);
        if (progBar){
            progBar.style.backgroundColor = "var(--ls-green)";
            if(percentage >= 33 && percentage < 67){
                progBar.style.backgroundColor = "var(--ls-gold)";
            } else if(percentage >= 67) {
                progBar.style.backgroundColor = "var(--ls-red)";
            }
        }
    }

    studentprofile.addEventListener('click', function(){
        window.location.href = "../technician.html";
    })

    reservations.addEventListener('click', function(){
        window.location.href = "../techniciansearchrev.html";
    })

    g301.addEventListener('click', function(){
        window.location.href = "./technician_rooms.html?room=G301";
    })

    if (g302) g302.addEventListener('click', function(){
        window.location.href = "./technician_rooms.html?room=G302";
    })

    if (g303) g303.addEventListener('click', function(){
        window.location.href = "./technician_rooms.html?room=G303";
    })

    if (g304) g304.addEventListener('click', function(){
        window.location.href = "./technician_rooms.html?room=G304";
    })

    if (g305) g305.addEventListener('click', function(){
        window.location.href = "./technician_rooms.html?room=G305";
    })

    if (g306) g306.addEventListener('click', function(){
        window.location.href = "./technician_rooms.html?room=G306";
    })
})
