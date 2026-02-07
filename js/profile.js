const studentprofile = document.getElementById('back')
const edit = document.getElementById('edit')
const save = document.getElementById('save')
const cancel = document.getElementById('cancel')
const profilepic = document.getElementById('profilepic')
const pictureedit = document.getElementById('pictureedit')
const card = document.getElementById('card')
const editinfo = document.getElementById('info')

console.log({edit, profilepic, pictureedit, card, editinfo});

studentprofile.addEventListener('click', function(){
    window.location.href = "../student.html";
})

edit.addEventListener('click', () => { 
    profilepic.style.filter = "brightness(0.75)";
    edit.classList.add('hidden');
    card.classList.add('hidden');
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
    
})

cancel.addEventListener('click', event =>{ 
    profilepic.style.filter = "brightness(1)";
    edit.classList.remove('hidden');
    card.classList.remove('hidden');
    editinfo.classList.add('hidden');
    pictureedit.classList.add('hidden');
    save.classList.add('hidden');
    cancel.classList.add('hidden');
})