const technicianprofile = document.getElementById('technicianprofile')
const technicianreserve = document.getElementById('technicianreserve')
const logout = document.getElementById('logout')
const searchprof = document.getElementById('searchstudent')
const searchtime = document.getElementById('searchroom')
const searchrev = document.getElementById('searchrev')

const search = document.getElementById('studentsearch')

searchprof.addEventListener('click', function(){
        window.location.href = "../techniciansearchprof.html"
})

searchtime.addEventListener('click', function(){
        window.location.href = "../techniciansearchroom.html"
})

searchrev.addEventListener('click', function(){
        window.location.href = "../techniciansearchrev.html"
})

technicianprofile.addEventListener('click', function(){
        window.location.href = "technicianprofile.html"
})

technicianreserve.addEventListener('click', function(){
        window.location.href = "technicianreserve.html"
})

logout.addEventListener('click', function(){
        window.location.href = "../index.html"
})

search.addEventListener('click', function(e){
        var searchmenu = document.getElementById('searchmenu')
;

        if(searchmenu.classList.contains("hidden")){
                searchmenu.classList.remove("hidden");
        }
        else{
               searchmenu.classList.add("hidden");  
        }
               
        
})