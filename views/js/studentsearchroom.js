document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!user || !token) {
        window.location.href = "../index.html"
        return;
    }


    const dateInput = document.getElementById('date');
    const hourStart = document.getElementById('hourstart');
    const minuteStart = document.getElementById('minutestart');
    const hourEnd = document.getElementById('hourend');
    const minuteEnd = document.getElementById('minuteend');
    const errorMess = document.getElementById('errormess');
    const search = document.getElementById('searchbutt');
    const results = document.getElementById('card');
    const studentprofile = document.getElementById('back');

    errormess.style.display = 'none';

    search.addEventListener('click', async function() {
        
        if (dateInput.value === "" || hourStart.value === "" || minuteStart.value === "" || hourEnd.value === "" || minuteEnd.value === "") {
            errorMess.style.display = 'block';
            errorMess.textContent = 'Please enter all fields.';
            errorMess.style.color = 'red';  
            return;
        }

        const startTime = `${dateInput.value}T${hourStart.value}:${minuteStart.value}:00`;
        const endTime = `${dateInput.value}T${hourEnd.value}:${minuteEnd.value}:00`;

        const startDateTime = new Date(startTime);
        const endDateTime = new Date(endTime);

        if (startDateTime >= endDateTime) {
            errorMess.style.display = 'block';
            errorMess.textContent = 'End time must be after start time.';
            errorMess.style.color = 'red';
            return;
        }
        errormess.style.display = 'none';

        const response = await fetch('api/common_routes/search_timeslot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startTime: startTime,
                endTime: endTime
            })
        });
        const data = await response.json();
        const availableSeats = data.availableSeats;

        results.innerHTML = `
            <div class="label">
                <div class="resultdeets">
                        <h3>Room #</h3>
                        <h3>Seat #</h3>
                </div>
            </div>
        `;

        if (availableSeats.length > 0) {
            availableSeats.forEach(seat => {
                const seatNo = seat.seatID.split('-')[1];

                results.innerHTML += `
                    <div class="results">
                        <div class="resultdeets">
                            <p>${seat.roomID}</p>
                            <p>${seatNo}</p>
                        </div>
                            <div class="butt" id="reserve" data-seatid="${seat.seatID}">
                                <h3>Reserve</h3>
                            </div>
                    </div>
                `;
            });
            document.querySelectorAll('.results .butt').forEach(reserveButton => {
                reserveButton.addEventListener('click', async function() {
                    const selectedSeatId = this.getAttribute('data-seatid');
                    
                    const response = await fetch(`/api/student/create_reservation/${user.username}`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                        },
                        
                        body: JSON.stringify({
                            seatID: selectedSeatId,
                            startTime: startTime,
                            endTime: endTime,
                            isAnonymous: false,
                        })
                    });

                    const reservationResult = await response.json();
                    console.log(reservationResult);

                    this.closest('.results').remove();
                });
            });
        }
    });

    studentprofile.addEventListener('click', function(){
        window.location.href = "../student.html";
    })
});
