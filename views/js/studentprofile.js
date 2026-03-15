document.addEventListener("DOMContentLoaded", async function(){
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
		window.location.href = "../index.html"
        return;
    }

    const response = await fetch(`api/common_routes/view_profile/${user.username}`);
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

    studentprofile.addEventListener('click', function(){
    window.location.href = "../student.html";
    }) 

    cancelpass.addEventListener('click', function(){
    editpass.classList.add('hidden');
    }) 

    savepass.addEventListener('click', function(){
    editpass.classList.add('hidden');
    }) 

    canceldeact.addEventListener('click', function(){
    deact.classList.add('hidden');
    }) 

    confirmdeact.addEventListener('click', function(){
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
            const response = await fetch(`api/common_routes/view_profile/${editUsername.value}`);
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

            localStorage.setItem("user", JSON.stringify(user));

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
    