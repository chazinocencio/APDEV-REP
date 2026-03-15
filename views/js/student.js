document.addEventListener("DOMContentLoaded", async function(){
	const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "student_login.html";
        return;
    }

	const response = await fetch(`api/common_routes/view_profile/${user.username}`);
    const data = await response.json();
    const studentProfile = data;

    const fullName = `${studentProfile.lastName}, ${studentProfile.firstName} ${studentProfile.middleName ? studentProfile.middleName[0] + '.' : ''}`;
	var username;
	if (studentProfile.username){
		username = `@${studentProfile.username}`
	} else {
		username = fullName
	}

	document.querySelector('#headusername').innerHTML = fullName;
	document.querySelector('#student-username').innerHTML = username;
	document.querySelector('#profile-picture').src = studentProfile.profilePicture;
	
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
  		localStorage.removeItem("token");
		localStorage.removeItem("user");
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