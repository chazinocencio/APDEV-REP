document.addEventListener('DOMContentLoaded', async function(){
    const back = document.getElementById('back');
    const reservationsList = document.getElementById('reservations-list');
    const editrev = document.getElementById('editrev');
    const saveBtn = document.getElementById('save');
    const editCancelBtn = document.getElementById('editcancel');

    if (back) back.addEventListener('click', () => window.location.href = "../technician.html");

    function formatDate(ts){
        const d = new Date(ts);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const month = months[d.getMonth()];
        const day = d.getDate();
        const year = d.getFullYear();
        return `${month} ${day},${year}`;
    }
    function formatTime(ts){
        const d = new Date(ts);
        let hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2,'0');
        const ampm = hours >= 12 ? 'Pm' : 'Am';
        hours = hours % 12;
        if (hours === 0) hours = 12;
        return `${hours}:${minutes} ${ampm}`;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id'); 

    if (!id) {
        reservationsList.innerHTML = '<h3>No student selected.</h3>';
        return;
    }

    try{
        const res = await fetch(`api/student/reservations/${id}`);
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

            const resNumber = idx + 1;

            el.innerHTML = `
                <div class="resultdeets">
                    <p>${resNumber}</p>
                    <p>${room}</p>
                    <p>${seat}</p>
                    <p>${formatDate(r.startTime)}</p>
                    <p>${formatTime(r.startTime)}</p>
                    <p>${formatTime(r.endTime)}</p>
                </div>
                <div class="butts">
                    <div class="butt edit-button" id="edit" data-id="${r._id}">
                        <h3>Edit</h3>
                    </div>
                    <div class="canbutt cancel-button" id="cancel" data-id="${r._id}">
                        <h3>Cancel</h3>
                    </div>
                </div>
            `;
            reservationsList.appendChild(el);
        })

    } catch (err){
        console.error(err);
        reservationsList.innerHTML = '<h3>Error loading reservations.</h3>';
    }

    reservationsList.addEventListener('click', function(e){
        const editBtn = e.target.closest('.edit-button');
        const cancelBtn = e.target.closest('.cancel-button');

        if (editBtn){
            const parent = editBtn.closest('.results');
            const pEls = parent.querySelector('.resultdeets').querySelectorAll('p');
            const room = pEls[1]?.textContent || '';
            const seat = pEls[2]?.textContent || '';
            const date = pEls[3]?.textContent || '';
            const start = pEls[4]?.textContent || '';
            const end = pEls[5]?.textContent || '';

            document.getElementById('room').value = room;
            document.getElementById('seat').value = seat;
            document.getElementById('date').value = date;
            document.getElementById('timestart').value = start;
            document.getElementById('timeend').value = end;

            editrev.classList.remove('hidden');
        }

        if (cancelBtn){
            const confirmed = confirm('Are you sure you want to cancel this reservation?');
            if (confirmed){
                alert('Cancellation requires authentication; perform delete via server API with credentials.');
            }
        }
    })

    if (saveBtn) saveBtn.addEventListener('click', function(){
        editrev.classList.add('hidden');
    })

    if (editCancelBtn) editCancelBtn.addEventListener('click', function(){
        editrev.classList.add('hidden');
    })

});
