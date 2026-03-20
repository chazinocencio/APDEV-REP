const studentprofile = document.getElementById('back')
const g301 = document.getElementById('G301')
const g302 = document.getElementById('G302')
const g303 = document.getElementById('G303')
const g304 = document.getElementById('G304')
const g305 = document.getElementById('G305')
const g306 = document.getElementById('G306')
const reservations = document.getElementById('reservations')

studentprofile.addEventListener('click', function(){
    window.location.href = "../technician.html";
})

reservations.addEventListener('click', function(){
    window.location.href = "../reservations.html";
})

g301.addEventListener('click', function(){
    window.location.href = "./technician_rooms.html?room=G301";
})

if (g302) g302.addEventListener('click', function(){
    window.location.href = "./technician_rooms.html?room=G302";
})

if (g303) g303.addEventListener('click', function(){
    window.location.href = "./technician_rooms.html?room=G303";
})

if (g304) g304.addEventListener('click', function(){
    window.location.href = "./technician_rooms.html?room=G304";
})

if (g305) g305.addEventListener('click', function(){
    window.location.href = "./technician_rooms.html?room=G305";
})

if (g306) g306.addEventListener('click', function(){
    window.location.href = "./technician_rooms.html?room=G306";
})
