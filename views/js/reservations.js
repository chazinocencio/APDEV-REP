const technicianprofile = document.getElementById('back')
const edit = document.getElementById("edit")
const editcancel = document.getElementById("editcancel")
const editsave = document.getElementById("save")
const editrev = document.getElementById("editrev")

technicianprofile.addEventListener('click', function(){
    window.location.href = "../technician.html";
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

document.getElementById('headerlogo').addEventListener('click', () => {
        window.location.href = "student.html";
    });