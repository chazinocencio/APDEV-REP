const studentprofile = document.getElementById('back')
const edit = document.getElementById("edit")
const editcancel = document.getElementById("editcancel")
const editsave = document.getElementById("save")
const editrev = document.getElementById("editrev")

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
