document.addEventListener("DOMContentLoaded", function(){
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "student_login.html";
        return;
    }

    const fullName = `${user.lastName}, ${user.firstName} ${user.middleName ? user.middleName[0] + '.' : ''}`;

    document.querySelector('#profileusername').innerHTML = `@${user.username}`
    document.querySelector('#header-fullname').innerHTML = fullName;
    document.querySelector('#prof-id').innerHTML = user.idNumber;
    document.querySelector('#college').innerHTML = user.college;
    document.querySelector('#prof-program').innerHTML = user.degreeProgram;
    document.querySelector('#bio').innerHTML = user.bio;
    document.querySelector('#editbio').value = user.bio;

    const studentprofile = document.getElementById('back')
    const edit = document.getElementById('edit')
    const save = document.getElementById('save')
    const cancel = document.getElementById('cancel')
    const profilepic = document.getElementById('profilepic')
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

    console.log({edit, profilepic, pictureedit, card, editinfo});

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

    save.addEventListener('click', event =>{ 
        profilepic.style.filter = "brightness(1)";
        edit.classList.remove('hidden');
        card.classList.remove('hidden');
        editinfo.classList.add('hidden');
        pictureedit.classList.add('hidden');
        save.classList.add('hidden');
        cancel.classList.add('hidden');
        changepass.classList.remove('hidden');
        deactbutt.classList.remove('hidden');

    })

    cancel.addEventListener('click', event =>{ 
        profilepic.style.filter = "brightness(1)";
        edit.classList.remove('hidden');
        card.classList.remove('hidden');
        editinfo.classList.add('hidden');
        pictureedit.classList.add('hidden');
        save.classList.add('hidden');
        cancel.classList.add('hidden');
        changepass.classList.remove('hidden');
        deactbutt.classList.remove('hidden');
    })

    pictureedit.addEventListener('click', event =>{
        editphotocard.classList.remove('hidden');
    })

    photosave.addEventListener('click', event =>{
        editphotocard.classList.add('hidden');
    })

    photocancel.addEventListener('click', event =>{
        editphotocard.classList.add('hidden');
    })
}) 
    