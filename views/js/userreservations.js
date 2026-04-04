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
}

let currentReservation = null;

document.addEventListener('DOMContentLoaded', async function(){
    const back = document.getElementById('back');
    const reservationsList = document.getElementById('reservations-list');
    const editrev = document.getElementById('editrev');
    const saveBtn = document.getElementById('save');
    const editCancelBtn = document.getElementById('editcancel');
    
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

    if (back) back.addEventListener('click', () => window.location.href = "../technician.html");

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id'); 

    if (!id) {
        reservationsList.innerHTML = '<h3>No student selected.</h3>';
        return;
    }

    try{
        const res = await fetch(`api/student/reservations/${id}`, {
            credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch reservations');
        const reservations = await res.json();

        if (!reservations || reservations.length === 0){
            reservationsList.innerHTML = '<h3>No reservations found for this student.</h3>';
            return;
        }

        reservations.sort((a,b) => new Date(b.startTime) - new Date(a.startTime));

        reservationsList.innerHTML = '';
        reservations.forEach((r, idx) => {
            const el = document.createElement('div');
            el.className = 'results';
            el.dataset.resid = r._id;

            let room = '';
            let seat = '';
            if (r.seatID){
                if (r.seatID.includes('-')){
                    const parts = r.seatID.split('-');
                    room = parts[0].toUpperCase();
                    seat = parts.slice(1).join('-').toUpperCase();
                } else if (r.seatID.length > 4){
                    room = r.seatID.slice(0,4).toUpperCase();
                    seat = r.seatID.slice(4).toUpperCase();
                } else {
                    seat = r.seatID.toUpperCase();
                }
            }

            const dateReq = new Date(r.dateRequested).toLocaleDateString();
            const timeReq = new Date(r.dateRequested).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })

            const dateReserve = new Date(r.startTime).toLocaleDateString();
            const startTime = new Date(r.startTime).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
            const endTime = new Date(r.endTime).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })

            el.innerHTML = `
                <div class="resultdeets">
                    <p>${r.reservationID}</p>
                    <p>${room}</p>
                    <p>${seat}</p>
                    <p>${dateReq}</p>
                    <p>${timeReq}</p>
                    <p>${dateReserve}</p>
                    <p>${startTime}</p>
                    <p>${endTime}</p>
                </div>
                <div class="butts">
                    <div class="butt edit-button" id="edit" data-id="${r._id}">
                        <h3>Edit</h3>
                    </div>
                    <div class="canbutt cancel-button" id="cancel" data-id="${r._id}" data-seat="${r.seatID}" data-start="${new Date(r.startTime).toISOString()}" data-end="${new Date(r.endTime).toISOString()}">
                        <h3>Cancel</h3>
                    </div>
                </div>
            `;
            reservationsList.appendChild(el);

            el.querySelector('.edit-button').addEventListener('click', function(){
                editrev.classList.remove('hidden');
                document.getElementById("number_reservation").innerHTML = r.reservationID;
                document.querySelector('.errormess').classList.add('hidden');
                currentReservation = r; 
                populateDropdowns();

                document.getElementById("room").value = room;
                document.getElementById("seat").value = seat;
                const resDate = new Date(r.startTime).toLocaleDateString('en-CA');
                document.getElementById("date").value = resDate;
                
                let tempTime = new Date(r.startTime);
                let tempHours = String(tempTime.getHours()).padStart(2, '0')
                let tempMinutes = String(tempTime.getMinutes()).padStart(2, '0');

                const resStartTime = `${tempHours}:${tempMinutes}`;

                tempTime = new Date(r.endTime);
                tempHours = String(tempTime.getHours()).padStart(2, '0')
                tempMinutes = String(tempTime.getMinutes()).padStart(2, '0');

                const resEndTime = `${tempHours}:${tempMinutes}`
                document.getElementById("timestart").value = resStartTime;
                document.getElementById("timeend").value = resEndTime;
            })
            // ensure cancel button respects 10-minute rule
            const cbtn = el.querySelector('.cancel-button');
            if (cbtn) updateCancelButtonState(cbtn, new Date(r.startTime).toISOString());
            if (cbtn) cbtn.addEventListener('click', async function () {
                if (cbtn.getAttribute('aria-disabled') === 'true'){
                    alert('Cancel is not available yet for this reservation.');
                    return;
                }
                const seatID = cbtn.getAttribute('data-seat');
                const startTime = cbtn.getAttribute('data-start');
                const endTime = cbtn.getAttribute('data-end');
                const confirmed = confirm('Are you sure you want to cancel this reservation?');

                if (!confirmed) return;

                try {
                    const delResp = await fetch(`/api/technician/delete_reservation/${encodeURIComponent(seatID)}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({ 
                            startTime: r.startTime, 
                            endTime: r.endTime
                        })
                    });

                    if (!delResp.ok) {
                        const err = await delResp.json().catch(() => ({}));
                        throw new Error(err.message || 'Failed to cancel reservation');
                    }

                    const reservationCard = cbtn.closest('.results');
                    if (reservationCard) reservationCard.remove();

                    if (!reservationsList.querySelector('.results')) {
                        reservationsList.innerHTML = '<h3>No reservations found for this student.</h3>';
                    }

                    alert('Reservation cancelled successfully.');
                } catch (error) {
                    console.error('Error cancelling reservation:', error);
                    alert(error.message || 'Failed to cancel reservation');
                }
            })
        })

    } catch (err){
        console.error(err);
        reservationsList.innerHTML = '<h3>Error loading reservations.</h3>';
    }

    // disable cancel buttons until 10 minutes after reservation start
    function updateCancelButtonState(btn, startISO){
        if (!btn || !startISO) return;
        const start = new Date(startISO);
        const enableAt = new Date(start.getTime() + 10 * 60 * 1000);
        const now = new Date();

        function enable(){
            btn.classList.remove('cancel-disabled');
            btn.removeAttribute('aria-disabled');
            btn.title = '';
        }

        if (now >= enableAt){
            enable();
            return;
        }

        // disable until enableAt
        btn.classList.add('cancel-disabled');
        btn.setAttribute('aria-disabled','true');
        btn.title = 'Cancel disabled until ' + enableAt.toLocaleString();

        // schedule enabling
        const ms = enableAt.getTime() - now.getTime();
        setTimeout(() => {
            try { enable(); } catch (e) { /* ignore */ }
        }, ms + 50);
    }

    if (saveBtn) saveBtn.addEventListener('click', async function(){
        var room = document.getElementById("room").value;
        room = room.toLowerCase();
        var seat = document.getElementById("seat").value;
        const seatID = room + "-" + seat;
        const reservationID = document.getElementById('number_reservation').innerHTML;
        const date = document.getElementById("date").value;
        const startTime = document.getElementById("timestart").value;
        const endTime = document.getElementById("timeend").value;
        const errormess = document.querySelector(".errormess");

        if (!room || !seat || !date || !startTime || !endTime) {
            errormess.textContent = "Invalid, please fill all values.";
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

        const conflictResponse = await fetch(`/api/student/reservations/conflict/${seatID}?reservationID=${encodeURIComponent(reservationID)}&startTime=${encodeURIComponent(startFullDate)}&endTime=${encodeURIComponent(endFullDate)}`, {
            credentials: 'include'
        });
        const conflictData = await conflictResponse.json();

        if (conflictData.hasConflict) {
            console.log("Conflict found:", conflictData.reservation);
            errormess.textContent = "Invalid, this time slot conflicts with an existing reservation.";
            errormess.classList.remove("hidden");
            return;
        }

        const updateResp = await fetch(`/api/technician/update_reservation/${currentReservation._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 
                seatID: seatID, 
                startTime: startFullDate, 
                endTime: endFullDate, 
            })
        });
        const updateData = await updateResp.json();


        if(updateResp.ok){
            errormess.classList.add('hidden');
            editrev.classList.add('hidden');
            window.location.reload();
        } else {
            errormess.textContent = "Failed to update reservation.";
            errormess.classList.remove("hidden");
            console.error('Update Failed:', updateData ? updateData : '');
        }

    })

    if (editCancelBtn) editCancelBtn.addEventListener('click', function(){
        editrev.classList.add('hidden');
    })

});
