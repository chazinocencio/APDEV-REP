document.addEventListener("DOMContentLoaded", async function(){
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

    const response = await fetch(`api/technician/view_profile/${user.username}`, {
        credentials: 'include'
    });
    const technicianProfile = await response.json();

    const profilePicEl = document.getElementById('profilepic');
    const profileUsername = document.getElementById('profileusername');
    const profileFullName = document.getElementById('profilefullname');
    const profIdEl = document.getElementById('prof-id');
    const campusEl = document.getElementById('campus');
    const progEl = document.getElementById('prof-program');
    const bioEl = document.getElementById('bio') || document.querySelector('.rightdetails .box h3') || document.querySelector('.rightdetails .box');

    // populate
    if (technicianProfile.profilePicture) profilePicEl.src = technicianProfile.profilePicture;
    profileUsername.innerText = technicianProfile.username ? `@${technicianProfile.username}` : technicianProfile.email;
    profileFullName.innerText = `${technicianProfile.lastName}, ${technicianProfile.firstName} ${technicianProfile.middleName ? technicianProfile.middleName[0] + '.' : ''}`;
    if (profIdEl) profIdEl.innerText = technicianProfile.employeeID || '';
    if (campusEl) campusEl.innerText = technicianProfile.department || '';
    if (progEl) progEl.innerText = technicianProfile.role || '';
    if (bioEl) bioEl.innerText = technicianProfile.bio || '';

    const technicianprofile = document.getElementById('back')
    const edit = document.getElementById('edit')
    const save = document.getElementById('save')
    const cancel = document.getElementById('cancel')
    const pictureedit = document.getElementById('pictureedit')
    const card = document.getElementById('card')
    const editinfo = document.getElementById('info')
    const editphotocard = document.getElementById('editphotocard')
    const photosave = document.getElementById('photosave')
    const photocancel = document.getElementById('photocancel')
    const changepass = document.getElementById("changepass")
    const deactbutt = document.getElementById("deactbutt")
    const editpass = document.getElementById("editpass")
    const savepass = document.getElementById("savepass")
    const cancelpass = document.getElementById("cancelpass")
    const deact = document.getElementById("deact")
    const confirmdeact = document.getElementById("confirmdeact")
    const canceldeact = document.getElementById("canceldeact")

    const oldPass = document.getElementById("oldpass");
    const newPass = document.getElementById("newpass");
    const confirmPass = document.getElementById("conpass");
    const errorMess = document.getElementById("errormess");
    const oldPassError = document.getElementById("oldpasserror");

    const deactPass = document.getElementById("deactpass");
    const deactErrorMess = document.getElementById("deac-error-mess");

    const editUsername = document.getElementById('editusername');
    const editBio = document.getElementById('editbio');

    // fill edit fields
    if (editUsername) editUsername.value = technicianProfile.username || '';
    if (editBio) editBio.value = technicianProfile.bio || '';

    function hasStrongPassword(value) {
        if (!value) return false;
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongPasswordRegex.test(value);
    }

    async function oldPasswordValid(value) {
        const response = await fetch(`api/technician/check_password/${user.employeeID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ password: value })
        });
        const data = await response.json();
        return data.success;
    }

    technicianprofile.addEventListener('click', function(){
        window.location.href = "technician.html";
    }) 

    cancelpass && cancelpass.addEventListener('click', function(){
        oldPass.value = '';
        newPass.value = '';
        confirmPass.value = '';
        editpass.classList.add('hidden');
    }) 

    savepass && savepass.addEventListener('click', async function(){
        var valid = true;

        if(oldPass.value === '' || newPass.value === '' || confirmPass.value === ''){   
            errorMess.classList.remove('hidden');
            errorMess.innerHTML = "Please fill out all fields.";
            valid = false;
            return;
        } else {
            errorMess.classList.add('hidden');
            oldPassError.classList.add('hidden');
            if(!(await oldPasswordValid(oldPass.value))){
                valid = false;
                oldPassError.classList.remove('hidden');
                oldPassError.innerHTML = "Old password is incorrect.";
                return;
            }
            if(!hasStrongPassword(newPass.value)){
                valid = false;
                errorMess.classList.remove('hidden');
                errorMess.innerHTML = "Password must be at least 8 characters long, include uppercase letters, lowercase letters, numbers, and special characters.";
                return;
            }
            if(newPass.value === oldPass.value){
                valid = false;
                errorMess.classList.remove('hidden');
                errorMess.innerHTML = "New password cannot be the same as the old password.";
                return;
            }
            if(newPass.value !== confirmPass.value){
                valid = false;
                errorMess.classList.remove('hidden');
                errorMess.innerHTML = "Password does not match.";
                return;
            }
        }

        if(valid){
            const response = await fetch(`api/technician/change_password/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    user: user,
                    oldPassword: oldPass.value,
                    newPassword: newPass.value
                })
            });
            
            oldPass.value = '';
            newPass.value = '';
            confirmPass.value = '';
            editpass.classList.add('hidden');
        }
    }) 

    canceldeact && canceldeact.addEventListener('click', function(){
        deactPass.value = '';
        deact.classList.add('hidden');
        deactErrorMess.classList.add('hidden');
    }) 

    confirmdeact && confirmdeact.addEventListener('click', async function(){
        deactErrorMess.classList.add('hidden');
        if(deactPass.value === ''){
            deactErrorMess.classList.remove('hidden');
            deactErrorMess.innerHTML = "Please enter your password.";
            return;
        } else {
            const response = await fetch(`api/technician/deactivate/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    user: user,
                    password: deactPass.value
                })
            });

            const data = await response.json();
            if(data.success){
                const logoutrResponse = await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                })
                const logoutData = await logoutrResponse.json();

                if(logoutData.success)
                    window.location.href = "../index.html"
            } else {
                deactErrorMess.classList.remove('hidden');
                deactErrorMess.innerHTML = data.message || "An error occurred. Please try again.";
                return;
            }
        }
        deact.classList.add('hidden');
    }) 

    changepass && changepass.addEventListener('click', function(){
        editpass.classList.remove('hidden');
    })

    deactbutt && deactbutt.addEventListener('click', function(){
        deact.classList.remove('hidden');
    })

    edit && edit.addEventListener('click', () => { 
        profilePicEl.style.filter = "brightness(0.75)";
        edit.classList.add('hidden');
        card.classList.add('hidden');
        changepass && changepass.classList.add('hidden');
        deactbutt && deactbutt.classList.add('hidden');
        editinfo.classList.remove('hidden');
        pictureedit.classList.remove('hidden');
        save.classList.remove('hidden');
        cancel.classList.remove('hidden');
    });

    save && save.addEventListener('click', async function(){
        // check username uniqueness if changed
        if(editUsername && editUsername.value !== ''){
            const respCheck = await fetch(`api/technician/view_profile/${editUsername.value}`, {
                credentials: 'include'
            });
            const dataCheck = await respCheck.json();
            if(dataCheck && dataCheck.username !== technicianProfile.username){
                const err = document.querySelector('.errormess');
                err && err.classList.remove('hidden');
                return;
            }

            const formData = new FormData();
            formData.append('username', editUsername.value);
            formData.append('bio', editBio ? editBio.value : '');

            const input = document.getElementById('photoInput');
            if (input && input.files && input.files[0]) {
                formData.append('profilePicture', input.files[0]);
            }

            const response2 = await fetch(`api/technician/edit_profile/${technicianProfile.employeeID}`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            });

            if (!response2.ok) {
                const text = await response2.text();
                console.error("Server error:", text);
                return;
            }
            const updatedUser = await response2.json();
            console.log(updatedUser);

            location.reload();
        } else {
            const err = document.querySelector('.errormess');
            err && err.classList.remove('hidden');
            err && (err.innerHTML = '<h3>Username cannot be empty.</h3>');
        }
    })

    cancel && cancel.addEventListener('click', event =>{ 
        location.reload();
    })

    pictureedit && pictureedit.addEventListener('click', event =>{
        editphotocard.classList.remove('hidden');
    })

    photosave && photosave.addEventListener('click', event =>{
        editphotocard.classList.add('hidden');
        const input = document.getElementById('photoInput');
        const previewImg = document.querySelector('.instructions img');
        const profilepic = document.getElementById('profilepic');
        if(input && input.files && input.files[0]){
            // show preview immediately
            const reader = new FileReader();
            reader.onload = function(e){
                profilepic.src = e.target.result;
            }
            reader.readAsDataURL(input.files[0]);
            previewImg.src = "assets/images/photoeditsym.png";
        }
    })

    photocancel && photocancel.addEventListener('click', event =>{
        editphotocard.classList.add('hidden');
        const previewImg = document.querySelector('.instructions img');
        previewImg.src = "assets/images/photoeditsym.png";
        if(document.getElementById('photoInput')) document.getElementById('photoInput').value = null;
    })

    // drag/drop and file input handling
    const dragdrop = document.getElementById('dragdrop');
    const input = document.getElementById('photoInput');
    const previewImg = document.querySelector('.instructions img');

    if (dragdrop) {
        dragdrop.addEventListener('click', () => input && input.click());

        dragdrop.addEventListener('dragover', (e) => { e.preventDefault(); });
        dragdrop.addEventListener('drop', (e) => {
            e.preventDefault();
            if (!e.dataTransfer.files[0]) return;
            const file = e.dataTransfer.files[0];
            if (!file.type.startsWith('image/')) return;
            if (input) input.files = e.dataTransfer.files;
            const reader = new FileReader();
            reader.onload = function(ev){ previewImg.src = ev.target.result; previewImg.style.height = '150px'; previewImg.style.width = 'auto'; }
            reader.readAsDataURL(file);
        });
    }

    if (input) {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev){ previewImg.src = ev.target.result; previewImg.style.height = '150px'; previewImg.style.width = 'auto'; }
            reader.readAsDataURL(file);
        });
    }
});
