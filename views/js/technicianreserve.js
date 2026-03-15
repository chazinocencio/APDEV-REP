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
    window.location.href = "../views/technicianrooms/G301.html";
})

if (g302) g302.addEventListener('click', function(){
    window.location.href = "../technicianrooms/G302.html";
})

if (g303) g303.addEventListener('click', function(){
    window.location.href = "../technicianrooms/G303.html";
})

if (g304) g304.addEventListener('click', function(){
    window.location.href = "../technicianrooms/G304.html";
})

if (g305) g305.addEventListener('click', function(){
    window.location.href = "../technicianrooms/G305.html";
})

if (g306) g306.addEventListener('click', function(){
    window.location.href = "../technicianrooms/G306.html";
})
