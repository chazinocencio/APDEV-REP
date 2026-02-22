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

    var gridWrap = document.querySelector(".date-grid-wrap");
    var reserveButton = document.getElementById("rev");
    if (gridWrap) {
        gridWrap.addEventListener("click", function (e) {
            var cell = e.target.closest(".date-grid-cell");
            if (cell && !cell.classList.contains("unavailable") && !cell.classList.contains("selected")) {
                cell.classList.toggle("chosen");
            }
        });

        var seatInfoCard = document.getElementById("seat-info-card");
        if (seatInfoCard) {
            var pinnedCell = null;

            function isInfoCell(cell) {
                return cell && cell.classList.contains("selected");
            }

            function showSeatInfo(cell) {
                seatInfoCard.classList.remove("hidden");
            }

            function hideSeatInfo() {
                seatInfoCard.classList.add("hidden");
            }

            gridWrap.addEventListener("mouseover", function (e) {
                var cell = e.target.closest(".date-grid-cell");
                if (!isInfoCell(cell)) return;
                if (!pinnedCell) {
                    showSeatInfo(cell);
                }
            });

            gridWrap.addEventListener("mouseout", function (e) {
                var cell = e.target.closest(".date-grid-cell");
                if (!isInfoCell(cell)) return;
                if (!pinnedCell) {
                    hideSeatInfo();
                }
            });

            gridWrap.addEventListener("click", function (e) {
                var cell = e.target.closest(".date-grid-cell");
                if (!isInfoCell(cell)) return;

                if (pinnedCell === cell) {
                    pinnedCell = null;
                    hideSeatInfo();
                } else {
                    pinnedCell = cell;
                    showSeatInfo(cell);
                }
            });
        }
    }

    var reserveModal = document.getElementById("reserve-modal");
    var editBlockModal = document.getElementById("edit-block-modal");
    var reserveOpen = document.getElementById("revfs");
    var editreserveOpen = document.getElementById("editrevfs");
    var reserveCancel = document.getElementById("reserve-cancel");
    var reserveConfirm = document.getElementById("reserve-confirm");

    var editCancel = document.getElementById("edit-cancel");
    var editConfirm = document.getElementById("edit-confirm");

    if (reserveOpen && reserveModal) {
        reserveOpen.addEventListener("click", function () {
            reserveModal.classList.remove("hidden");
        });
    }

      if (reserveOpen && reserveModal) {
        reserveOpen.addEventListener("click", function () {
            reserveModal.classList.remove("hidden");
        });
    }
    
      if (editreserveOpen && editBlockModal) {
        editreserveOpen.addEventListener("click", function () {
            editBlockModal.classList.remove("hidden");
        });
    }

    if (reserveCancel && reserveModal) {
        reserveCancel.addEventListener("click", function () {
            reserveModal.classList.add("hidden");
        });
    }

    if (reserveConfirm && reserveModal) {
        reserveConfirm.addEventListener("click", function () {
            reserveModal.classList.add("hidden");
        });
    }

    if (editCancel && editBlockModal) {
        editCancel.addEventListener("click", function () {
            editBlockModal.classList.add("hidden");
        });
    }

    if (editConfirm && editBlockModal) {
        editConfirm.addEventListener("click", function () {
            editBlockModal.classList.add("hidden");
        });
    }


    var blockModal = document.getElementById("block-modal");
    var blockOpen = document.getElementById("blocktime");
    var blockCancel = document.getElementById("block-cancel");
    var blockConfirm = document.getElementById("block-confirm");

    if (blockOpen && blockModal) {
        blockOpen.addEventListener("click", function () {
            blockModal.classList.remove("hidden");
        });
    }

    if (blockCancel && blockModal) {
        blockCancel.addEventListener("click", function () {
            blockModal.classList.add("hidden");
        });
    }

    if (blockConfirm && blockModal) {
        blockConfirm.addEventListener("click", function () {
            blockModal.classList.add("hidden");
        });
    }

    var block = document.getElementById("block");
    var blockroom1 = document.getElementById("blockroom1");
    var conbutt = document.getElementById("confirmblock");
    var canbutt = document.getElementById("cancelblock");
    var cancelrev = document.getElementById("cancelrev");

    var revcancel = document.getElementById("revcancel");
    var confirmcancel = document.getElementById("confirmcancel");
    var cancelcancel = document.getElementById("cancelcancel");

 if (block && blockroom1) {
        block.addEventListener("click", function () {
            blockroom1.classList.remove("hidden");
        });
    }

    if (cancelrev && blockroom1) {
        cancelrev.addEventListener("click", function () {
            revcancel.classList.remove("hidden");
        });
    }

    if (conbutt && blockroom1) {
        conbutt.addEventListener("click", function () {
            blockroom1.classList.add("hidden");
        });
    }

    if (canbutt && blockroom1) {
        canbutt.addEventListener("click", function () {
            blockroom1.classList.add("hidden");
        });
    }

     if (confirmcancel && revcancel) {
        confirmcancel.addEventListener("click", function () {
            revcancel.classList.add("hidden");
        });
    }

    if (cancelcancel && revcancel) {
        cancelcancel.addEventListener("click", function () {
            revcancel.classList.add("hidden");
        });
    }
    seatInfoCard.addEventListener('click', function(){
    window.location.href = "../techstudentprof.html";}) 
    
});

var technicianprofile = document.getElementById("back");
if (technicianprofile) {
    technicianprofile.addEventListener("click", function () {
        window.location.href = "../technicianreserve.html";
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