document.addEventListener("DOMContentLoaded", async function(){
    let user = null;

	const res = await fetch('api/auth/me', {
		credentials: 'include'
	})

	if(res.ok){
		const data = await res.json();
		user = data.user
		if (!user) {
			window.location.href = "student_login.html";
			return;
		}
	} else {
		window.location.href = "student_login.html";
		return;
	}

    const response = await fetch(`api/student/view_profile/${user.username}`);
    const data = await response.json();
    const studentProfile = data;

    const fullName = `${studentProfile.lastName}, ${studentProfile.firstName} ${studentProfile.middleName ? studentProfile.middleName[0] + '.' : ''}`;

    document.querySelector('#profileusername').innerHTML = `@${studentProfile.username}`
    document.querySelector('#header-fullname').innerHTML = fullName;
    document.querySelector('#prof-id').innerHTML = studentProfile.idNumber;
    document.querySelector('#college').innerHTML = studentProfile.college;
    document.querySelector('#prof-program').innerHTML = studentProfile.degreeProgram;
    document.querySelector('#bio').innerHTML = studentProfile.bio;
	document.querySelector('#profile-picture').src = studentProfile.profilePicture;
    document.querySelector('#editbio').value = studentProfile.bio;
    document.querySelector('#editusername').value = studentProfile.username;

    const studentprofile = document.getElementById('back')
    const edit = document.getElementById('edit')
    const save = document.getElementById('save')
    const cancel = document.getElementById('cancel')
    const usernameError = document.getElementById('username-error');
    const editUsername = document.getElementById('editusername');
    const editBio = document.getElementById('editbio');
    const profilepic = document.getElementById('profile-picture')
    const pictureedit = document.getElementById('pictureedit')
    const card = document.getElementById('card')
    const editinfo = document.getElementById('info')

    const editphotocard = document.getElementById('editphotocard')
    const photosave = document.getElementById('photosave')
    const photocancel = document.getElementById('photocancel')
    const dragdrop = document.getElementById("dragdrop");
    const input = document.getElementById("photoInput");
    const previewImg = document.querySelector(".instructions img");
    let selectedFile = null;
    
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

    function hasStrongPassword(value) {
        if (!value) return false;
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongPasswordRegex.test(value);
    }

    async function oldPasswordValid(value) {
        const response = await fetch(`api/student/check_password/${user.idNumber}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password: value })
        });
        const data = await response.json();
        return data.success;
    }

    studentprofile.addEventListener('click', function(){
    window.location.href = "../student.html";
    }) 

    cancelpass.addEventListener('click', function(){
        oldPass.value = '';
        newPass.value = '';
        confirmPass.value = '';
        editpass.classList.add('hidden');
    }) 

    savepass.addEventListener('click', async function(){
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
            const response = await fetch(`api/student/change_password/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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

    canceldeact.addEventListener('click', function(){
        deactPass.value = '';
        deact.classList.add('hidden');
        deactErrorMess.classList.add('hidden');
    }) 

    confirmdeact.addEventListener('click', async function(){
        deactErrorMess.classList.add('hidden');
        if(deactPass.value === ''){
            deactErrorMess.classList.remove('hidden');
            deactErrorMess.innerHTML = "Please enter your password.";
            return;
        } else {
            const response = await fetch(`api/student/deactivate/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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

    changepass.addEventListener('click', function(){
        editpass.classList.remove('hidden');
    })

    deactbutt.addEventListener('click', function(){
        deact.classList.remove('hidden');
    })
    edit.addEventListener('click', () => { 
        profilepic.style.filter = "brightness(0.75)";
        edit.classList.add('hidden');
        card.classList.add('hidden');
        changepass.classList.add('hidden');
        deactbutt.classList.add('hidden');
        editinfo.classList.remove('hidden');
        pictureedit.classList.remove('hidden');
        save.classList.remove('hidden');
        cancel.classList.remove('hidden');
    });

    save.addEventListener('click', async function(){
        if(editUsername.value !== ''){
            const response = await fetch(`api/student/view_profile/${editUsername.value}`);
            const data = await response.json();

            if(data){
                if(data.username !== studentProfile.username){
                    usernameError.classList.remove('hidden');
                    usernameError.innerHTML = "<h3>This username is already taken.</h3>";
                    return;
                }
            }

            const formData = new FormData();
            formData.append('username', editUsername.value);
            formData.append('bio', editBio.value);

            if(selectedFile){
                formData.append('profilePicture', selectedFile);
            }

            const response2 = await fetch(`api/student/edit_profile/${user.idNumber}`, {
                method: 'PUT',
                body: formData
            });
            
            if (!response2.ok) {
                const text = await response2.text();
                console.error("Server error:", text);
                return;
            }
            const updatedUser = await response2.json();
            user.username = updatedUser.data.username;
            user.bio = updatedUser.data.bio;
            user.profilePicture = updatedUser.data.profilePicture;

            //localStorage.setItem("user", JSON.stringify(user));

            location.reload();
        } else {
            usernameError.classList.remove('hidden');
            usernameError.innerHTML = "<h3>Username cannot be empty.</h3>";
        }
    })

    cancel.addEventListener('click', event =>{ 
        location.reload();
    })

    pictureedit.addEventListener('click', event =>{
        editphotocard.classList.remove('hidden');
    })

    photosave.addEventListener('click', event =>{
        editphotocard.classList.add('hidden');
        if(selectedFile){
            profilepic.src = previewImg.src;
            previewImg.src = "assets/images/photoeditsym.png";
            previewImg.style.height = "auto";
            previewImg.style.width = "70px";
        }
    })

    photocancel.addEventListener('click', event =>{
        editphotocard.classList.add('hidden');
        previewImg.src = "assets/images/photoeditsym.png";
        previewImg.style.height = "auto";
        previewImg.style.width = "70px";
        selectedFile = null;
    })

    // click to browse
    dragdrop.addEventListener("click", () => {
        input.click();
    });

    // file selected
    input.addEventListener("change", (e) => {
        selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const reader = new FileReader();

        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewImg.style.height = "150px";
            previewImg.style.width = "auto";
        };

        reader.readAsDataURL(selectedFile);
    });

    // drag events
    dragdrop.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    dragdrop.addEventListener("drop", (e) => {
        e.preventDefault();
        selectedFile = e.dataTransfer.files[0];

        if (!selectedFile) return;

        const reader = new FileReader();

        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewImg.style.height = "150px";
            previewImg.style.width = "auto";
        };

        reader.readAsDataURL(selectedFile);
    });
}) 
    