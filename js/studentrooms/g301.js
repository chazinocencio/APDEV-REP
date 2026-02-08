var currentDate = new Date();

var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDate(d) {
    return weekdays[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

function updateDateDisplay() {
    var el = document.getElementById("dayanddate");
    if (el) el.textContent = formatDate(currentDate);
}

document.addEventListener("DOMContentLoaded", function () {
    updateDateDisplay();

    var dateback = document.getElementById("dateback");
    if (dateback) {
        dateback.addEventListener("click", function () {
            currentDate.setDate(currentDate.getDate() - 1);
            updateDateDisplay();
        });
    }

    var datego = document.getElementById("datego");
    if (datego) {
        datego.addEventListener("click", function () {
            currentDate.setDate(currentDate.getDate() + 1);
            updateDateDisplay();
        });
    }

    document.querySelector(".date-grid-wrap").addEventListener("click", function (e) {
        var cell = e.target.closest(".date-grid-cell");
        if (cell && !cell.classList.contains("unavailable")) {
            cell.classList.toggle("chosen");
        }
    });
});

var studentprofile = document.getElementById("back");
if (studentprofile) {
    studentprofile.addEventListener("click", function () {
        window.location.href = "../studentreserve.html";
    });
}

var map = document.getElementById('map');

var seatmap = document.getElementById('seatmap');
if (seatmap) {
    seatmap.addEventListener("click", function () {
        map.classList.remove('hidden');
    });
}

var crossback = document.getElementById('crossback');
if (crossback) {
    crossback.addEventListener("click", function () {
        map.classList.add('hidden');
    });
}