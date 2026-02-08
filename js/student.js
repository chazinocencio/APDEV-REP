const studentprofile = document.getElementById('studentprofile')
const studentreserve = document.getElementById('studentreserve')
const logout = document.getElementById('logout')

studentprofile.addEventListener('click', function(){

        window.location.href = "../studentprofile.html"
})

studentreserve.addEventListener('click', function(){
        window.location.href = "../studentreserve.html"
})

logout.addEventListener('click', function(){
        window.location.href = "../index.html"
})