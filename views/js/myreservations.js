const studentprofile = document.getElementById('back')
const editcancel = document.getElementById("editcancel")
const editsave = document.getElementById("save")
const editrev = document.getElementById("editrev")

function populateDropdowns() {
    // Room dropdown G301 - G306
    const roomSelect = document.getElementById("room");
    roomSelect.innerHTML = '<option value="">Select Room</option>';
    for (let i = 301; i <= 306; i++) {
        const option = document.createElement("option");
        option.value = `G${i}`;
        option.textContent = `G${i}`;
        roomSelect.appendChild(option);
    }

    // Seat dropdown 1 - 24
    const seatSelect = document.getElementById("seat");
    seatSelect.innerHTML = '<option value="">Select Seat</option>';
    for (let i = 1; i <= 24; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        seatSelect.appendChild(option);
    }

    // Date dropdown - next 30 days
    const dateSelect = document.getElementById("date");
    dateSelect.innerHTML = '<option value="">Select Date</option>';
    const today = new Date();
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        const formatted = weekdays[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
        const option = document.createElement("option");
        option.value = formatted;
        option.textContent = formatted;
        dateSelect.appendChild(option);
    }

    // Time dropdowns - 30 min intervals 8AM to 5PM
    const times = [];
    for (let hour = 8; hour <= 16; hour++) {
        ["00", "30"].forEach(min => {
            if (hour === 16 && min === "30") return; // stop at 5:00 PM
            const period = hour < 12 ? "AM" : "PM";
            const displayHour = hour > 12 ? hour - 12 : hour;
            times.push(`${displayHour}:${min} ${period}`);
        });
    }
    times.push("5:00 PM"); // add final end time

    const timestart = document.getElementById("timestart");
    const timeend = document.getElementById("timeend");
    timestart.innerHTML = '<option value="">Select Start Time</option>';
    timeend.innerHTML = '<option value="">Select End Time</option>';

    times.forEach(time => {
        const opt1 = document.createElement("option");
        opt1.value = time;
        opt1.textContent = time;
        timestart.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = time;
        opt2.textContent = time;
        timeend.appendChild(opt2);
    });
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


    const dataResponse = await fetch(`/api/student/specific_reservation/${studentProfile.idNumber}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await dataResponse.json();

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
    
    data.forEach(async (reservation, index) => {

        const seatResponse = await fetch(`/api/student/search_seat/${reservation.seatID}`, {
            headers: { "Authorization": `Bearer ${token}` }
        }); 
        const seatData = await seatResponse.json();
        const div = document.createElement("div");

        div.classList.add("results");
        div.innerHTML = `
            <div class="resultdeets">
                <p>${index + 1}</p>
                <p>${seatData.roomID}</p>
                <p>${reservation.seatID}</p>
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

        populateDropdowns();


        });

        div.querySelector('.canbutt').addEventListener('click', async function() {

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

            const result = await deleteResponse.json();

            if (deleteResponse.ok) {
                console.log("Cancelled", result);
                div.remove();

                
            } else {
                console.warn("Cancel failed:", result);
            }

        } catch (error) {
            console.error("Cancel error:", error);
        }


            });
     
    });

    studentprofile.addEventListener('click', function(){
        window.location.href = "../student.html";
    })

    editsave.addEventListener('click', async function(){
        
        const room = document.getElementById("room").value;
        const seat = document.getElementById("seat").value;
        const date = document.getElementById("date").value;
        const startTime = document.getElementById("timestart").value;
        const endTime = document.getElementById("timeend").value;

        const errormess = document.querySelector(".errormess");

        if (!room || room === "Select Room" ||
            !seat || seat === "Select Seat" ||
            !date || date === "Select Date" ||
            !startTime || startTime === "Select Start Time" ||
            !endTime || endTime === "Select End Time") {
            
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
        const difference = endMinutes - startMinutes;

        if (difference !== 30) {
            errormess.textContent = "Invalid, time slot must be exactly 30 minutes apart.";
            errormess.classList.remove("hidden");
            return;
        }

        if (endMinutes <= startMinutes) {
            errormess.textContent = "Invalid, end time must be after start time.";
            errormess.classList.remove("hidden");
            return;
        }

        errormess.classList.add("hidden");

        const startFullDate = date + " " + startTime;
        const endFullDate = date + " " + endTime;

        editedReservation = [];

        const getResponse = await fetch(`/api/student/reservations/key/${seat}?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
                    {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                    });

                    const data = getResponse.json()
            
                editedReservation.push({
                        room: room,
                        idNumber: user.idNumber,
                        seatID: seat,
                        startTime: date + " " + startTime,
                        endTime: date + " " + endTime,
                        date: date,
                        isAnonymous: data.isAnonymous,
                        description: "reserved"
                        
                    });

                        if (!getResponse.ok) {
                            //no reservation
                            const deleteResponse = await fetch(`/api/student/delete_reservation/${seat}`, {
                            method: "DELETE",
                            headers: { 
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}` 
                            },
                            body: JSON.stringify({
                                startTime: startTime,
                                endTime: endTime
                            })
                        });
                        const postResponse = await fetch("/api/student/create_reservation/" + studentProfile.username, {
                        method: "POST",
                        headers: { "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`},
                        
                        body: JSON.stringify(editedReservation)
                        
                    });
                        }else{
                            //there is reservation
                            errormess.textContent = "Invalid, there is already a reservation for this slot.";
                            errormess.classList.remove("hidden"); 
                            return;

                        }

            



        errormess.classList.add("hidden");


        //editrev.classList.add('hidden');


        
    })

    editcancel.addEventListener('click', function(){
        editrev.classList.add('hidden');
    })

});

