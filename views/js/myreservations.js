const studentprofile = document.getElementById('back')
const editcancel = document.getElementById("editcancel")
const editsave = document.getElementById("save")
const editrev = document.getElementById("editrev")

function populateDropdowns() {
    const roomSelect = document.getElementById("room");
    roomSelect.innerHTML = '<option value="">Select Room</option>';
    for (let i = 301; i <= 306; i++) {
        const option = document.createElement("option");
        option.value = `G${i}`;
        option.textContent = `G${i}`;
        roomSelect.appendChild(option);
    }

    const seatSelect = document.getElementById("seat");
    seatSelect.innerHTML = '<option value="">Select Seat</option>';
    for (let i = 1; i <= 24; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        seatSelect.appendChild(option);
    }

    const dateSelect = document.getElementById("date");
    dateSelect.innerHTML = '<option value="">Select Date</option>';
    const today = new Date();
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    for (let i = 0; i < 8; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        
        // skip sunday
        if(d.getDay() === 0){ 
            continue;
        }
        
        const formatted = weekdays[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
        const option = document.createElement("option");
        
        option.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        option.textContent = formatted;
        dateSelect.appendChild(option);
    }
}


let currentReservation = null;

async function repaintDisplay(reservations, token, card) {

    card.querySelectorAll(".results").forEach(el => el.remove());

    for (const [index, reservation] of reservations.entries()) {
        const seatResponse = await fetch(`/api/student/search_seat/${reservation.seatID}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const seatData = await seatResponse.json();
        const div = document.createElement("div");

        const seat = reservation.seatID;
        const extractSeat = seat.split('-');
        const getSeat = extractSeat.pop();

        div.classList.add("results");
        div.innerHTML = `
            <div class="resultdeets">
                <p>${index + 1}</p>
                <p>${seatData.roomID}</p>
                <p>${getSeat}</p>
                <p>${new Date(reservation.startTime).toLocaleDateString()}</p>
                <p>${new Date(reservation.startTime).toLocaleTimeString()}</p>
                <p>${new Date(reservation.endTime).toLocaleTimeString()}</p>
            </div>
            <div class="butts"> 
                <div class="butt" data-id="${reservation._id}">
                    <h3>Edit</h3>
                </div>
                <div class="canbutt" data-id="${reservation._id}">
                    <h3>Cancel</h3>
                </div>
            </div>
        `;
        card.appendChild(div);

        div.querySelector('.butt').addEventListener('click', function() {
            editrev.classList.remove('hidden');
            document.getElementById("number_reservation").innerHTML = "Reservation #" + (index + 1);
            currentReservation = reservation; 
            populateDropdowns();

            document.getElementById("room").value = seatData.roomID || "";
            const seatNumber = reservation.seatID.split('-').pop();
            document.getElementById("seat").value = seatNumber || "";
            const resDate = new Date(reservation.startTime).toLocaleDateString('en-CA');
            document.getElementById("date").value = resDate;
            
            let tempTime = new Date(reservation.startTime);
            let tempHours = String(tempTime.getHours()).padStart(2, '0')
            let tempMinutes = String(tempTime.getMinutes()).padStart(2, '0');

            const resStartTime = `${tempHours}:${tempMinutes}`;

            tempTime = new Date(reservation.endTime);
            tempHours = String(tempTime.getHours()).padStart(2, '0')
            tempMinutes = String(tempTime.getMinutes()).padStart(2, '0');

            const resEndTime = `${tempHours}:${tempMinutes}`
            document.getElementById("timestart").value = resStartTime;
            document.getElementById("timeend").value = resEndTime;
        });

        div.querySelector('.canbutt').addEventListener('click', async function() {
            if(!confirm('Are you sure you want to cancel this reservation?')) return;
            
            try {
                const deleteResponse = await fetch(`/api/student/delete_reservation/${reservation.seatID}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        startTime: reservation.startTime,
                        endTime: reservation.endTime
                    })
                });

                const text = await deleteResponse.text();
                const result = text ? JSON.parse(text) : {};

                if (deleteResponse.ok) {
                    console.log("Cancelled:", result);
                    div.remove();
                } else {
                    console.warn("Cancel failed:", result);
                }

            } catch (error) {
                console.error("Cancel error:", error);
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user) {
        window.location.href = "../index.html";
        return;
    }

    const profileResponse = await fetch(`/api/student/view_profile/${user.username}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    const studentProfile = await profileResponse.json();

    const dataResponse = await fetch(`/api/student/reservations/${studentProfile.idNumber}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    let reservations = await dataResponse.json();

    const card = document.getElementById("card");

    card.innerHTML = `
        <div class="label">
            <div class="leb">
                <div class="lab">
                    <h3>Reservation #</h3>
                    <h3>Room #</h3>
                    <h3>Seat #</h3>
                </div>
                <h3>Date</h3>
                <h3>Start Time</h3>
                <h3>End Time</h3>
            </div>
        </div>
    `;

    await repaintDisplay(reservations, token, card);

    studentprofile.addEventListener('click', function() {
        window.location.href = "../student.html";
    });

    editsave.addEventListener('click', async function() {
        var room = document.getElementById("room").value;
        room = room.toLowerCase();
        var seat = document.getElementById("seat").value;
        const seatID = room + "-" + seat;
        const date = document.getElementById("date").value;
        const startTime = document.getElementById("timestart").value;
        const endTime = document.getElementById("timeend").value;
        const errormess = document.querySelector(".errormess");

    
        if (!room || !seat || !date || !startTime || !endTime) {
            errormess.textContent = "Invalid, please fill all forms.";
            errormess.classList.remove("hidden");
            return;
        }

        function timeToMinutes(timeStr) {
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
        }

        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);

        if (endMinutes <= startMinutes) {
            errormess.textContent = "Invalid, end time must be after start time.";
            errormess.classList.remove("hidden");
            return;
        }   

        errormess.classList.add("hidden");

        const startFullDate = date + "T" + startTime;
        const endFullDate = date + "T" + endTime;

        console.log(startFullDate, endFullDate)

        const conflictResponse = await fetch(`/api/student/reservations/conflict/${seatID}?startTime=${encodeURIComponent(startFullDate)}&endTime=${encodeURIComponent(endFullDate)}&idNumber=${encodeURIComponent(studentProfile.idNumber)}`);
        const conflictData = await conflictResponse.json();

        if (conflictData.hasConflict) {
            console.log("Conflict found:", conflictData.reservation);
            errormess.textContent = "Invalid, this time slot conflicts with an existing reservation.";
            errormess.classList.remove("hidden");
            return;
        }
       
            const deleteResponse = await fetch(`/api/student/delete_reservation/${currentReservation.seatID}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    startTime: currentReservation.startTime,
                    endTime: currentReservation.endTime
                })
            });

        const newReservation = {
            idNumber: studentProfile.idNumber,
            seatID: seatID,
            startTime: startFullDate,
            endTime: endFullDate,
            date: date,
            isAnonymous: currentReservation ? currentReservation.isAnonymous : false,
            description: "reserved"
        };

        const postResponse = await fetch("/api/student/create_reservation/" + studentProfile.username, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newReservation)
        });

        const postResult = await postResponse.json();

        if (postResponse.ok) {
            errormess.classList.add("hidden");
            editrev.classList.add('hidden');

            const refreshResponse = await fetch(`/api/student/specific_reservation/${studentProfile.idNumber}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            reservations = await refreshResponse.json();
            await repaintDisplay(reservations, token, card);

        } else {
            console.warn("Post failed:", postResult);
            errormess.textContent = "Failed to update reservation.";
            errormess.classList.remove("hidden");
        }
    });

    editcancel.addEventListener('click', function() {
        editrev.classList.add('hidden');
    });
});