document.addEventListener('DOMContentLoaded', function() {
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
        const startTime = (hourStart.value + ':' + minuteStart.value);
        const endTime = (hourEnd.value + ':' + minuteEnd.value);

        const startDateTime = new Date(`${dateInput.value}T${startTime}`);
        const endDateTime = new Date(`${dateInput.value}T${endTime}`);

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
                startTime: `${dateInput.value}T${startTime}:00`,
                endTime: `${dateInput.value}T${endTime}:00`
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

        availableSeats.forEach(seat => {
            const seatNo = seat.seatID.split('-')[1];

            results.innerHTML += `
                <div class="results">
                    <div class="resultdeets">
                        <p>${seat.roomID}</p>
                        <p>${seatNo}</p>
                    </div>
                        <div class="butt" id="reserve">
                            <h3>Reserve</h3>
                        </div>
                </div>
            `;
        });
    });

    studentprofile.addEventListener('click', function(){
        window.location.href = "../student.html";
    })
});
