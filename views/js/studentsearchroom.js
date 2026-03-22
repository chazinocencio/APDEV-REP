function formatDate(date){
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
}

function loadDates(){
    var currentDate = new Date();
    const dateInput = document.querySelector('#dateinput select');
    dateInput.innerHTML = `
        <option value="">Select</option>
        <option value="${currentDate.toLocaleDateString('en-CA')}">
            ${formatDate(currentDate)}
        </option>
    `
    
    for(let i = 1; i < 7; i++){
        let newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() + i)
        dateInput.innerHTML += `
            <option value="${newDate.toLocaleDateString('en-CA')}">
                ${formatDate(newDate)}
            </option>
        `
    }
    
}

document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!user || !token) {
        window.location.href = "../index.html"
        return;
    }

    loadDates();
    const dateInput = document.getElementById('date');
    const timeStart = document.getElementById('timestart');
    const timeEnd = document.getElementById('timeend');
    const errorMess = document.getElementById('errormess');
    const search = document.getElementById('searchbutt');
    const results = document.getElementById('card');
    const studentprofile = document.getElementById('back');

    errormess.style.display = 'none';

    search.addEventListener('click', async function() {
        
        if (dateInput.value === "" || timeStart.value === "" || timeEnd.value === "") {
            errorMess.style.display = 'block';
            errorMess.textContent = 'Please enter all fields.';
            errorMess.style.color = 'red';  
            return;
        }

        const startTime = `${dateInput.value}T${timeStart.value}:00`;
        const endTime = `${dateInput.value}T${timeEnd.value}:00`;

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
                    const res = await fetch(`/api/student/view_profile/${user.username}`)
                    const requester = await res.json()

                    if(!requester.canReserve){
                        alert("Your account has been blocked from making reservations. Contact support for assistance.");
                        return;
                    } 
                    
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
