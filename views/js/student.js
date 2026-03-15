document.addEventListener("DOMContentLoaded", function(){
	const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "student_login.html";
        return;
    }

    const fullName = `${user.lastName}, ${user.firstName} ${user.middleName ? user.middleName[0] + '.' : ''}`;
	var username;
	if (user.username){
		username = `@${user.username}`
	} else {
		username = fullName
	}

	document.querySelector('#headusername').innerHTML = fullName;
	document.querySelector('#student-username').innerHTML = username;
	
	const studentprofile = document.getElementById('studentprofile')
	const studentreserve = document.getElementById('studentreserve')
	const logout = document.getElementById('logout')
	const search = document.getElementById('studentsearch')
	const searchprof = document.getElementById('searchstudent')
	const searchroom = document.getElementById('searchroom')

	studentprofile.addEventListener('click', function(){
		window.location.href = "../studentprofile.html"
	})

	studentreserve.addEventListener('click', function(){
		window.location.href = "../studentreserve.html"
	})

	searchprof.addEventListener('click', function(){
		window.location.href = "../studentsearchprof.html"
	})

	searchroom.addEventListener('click', function(){
		window.location.href = "../studentsearchroom.html"
	})

	logout.addEventListener('click', function(){
		window.location.href = "../index.html"
	})

	search.addEventListener('click', function(e){
		var searchmenu = document.getElementById('searchmenu');

		if(searchmenu.classList.contains("hidden")){
			searchmenu.classList.remove("hidden");
		}
		else{
			searchmenu.classList.add("hidden");  
		}     
	})
})