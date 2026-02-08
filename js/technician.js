const technicianprofile = document.getElementById('technicianprofile')
const logout = document.getElementById('logout')
const searchprof = document.getElementById('searchstudent')

const search = document.getElementById('studentsearch')

searchprof.addEventListener('click', function(){
        window.location.href = "../techniciansearchprof.html"
})

technicianprofile.addEventListener('click', function(){
        window.location.href = "technicianprofile.html"
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