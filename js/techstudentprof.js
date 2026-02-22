const techprofile = document.getElementById('back')
const viewrev = document.getElementById('viewrev')
const blockbutt = document.getElementById('blockbutt')
const confirmblock = document.getElementById('confirmblock')
const cancelblock = document.getElementById('cancelblock')

techprofile.addEventListener('click', function(){
   window.location.href = "../technician.html";
}) 

viewrev.addEventListener('click', function(){
   window.location.href = "../userreservations.html";
}) 

blockbutt.addEventListener('click', function(){
   document.getElementById('blockroom1').classList.remove('hidden');
}) 

confirmblock.addEventListener('click', function(){
   document.getElementById('blockroom1').classList.add('hidden');
}) 
cancelblock.addEventListener('click', function(){
   document.getElementById('blockroom1').classList.add('hidden');
})
