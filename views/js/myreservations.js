const studentprofile = document.getElementById('back')
const edit = document.getElementById("edit")
const editcancel = document.getElementById("editcancel")
const editsave = document.getElementById("save")
const editrev = document.getElementById("editrev")

document.addEventListener("DOMContentLoaded", async function() {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user) {
        window.location.href = "../index.html";
        return;
    }

    const profileResponse = await fetch(`/api/common_routes/view_profile/${user.username}`, {
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
});

    studentprofile.addEventListener('click', function(){
        window.location.href = "../student.html";
    })

    edit.addEventListener('click', function(){
        editrev.classList.remove('hidden');
    })

    editsave.addEventListener('click', function(){
        editrev.classList.add('hidden');
    })

    editcancel.addEventListener('click', function(){
        editrev.classList.add('hidden');
    })

});

