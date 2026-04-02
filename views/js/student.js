document.addEventListener("DOMContentLoaded", async function(){
	let user = null;

	const res = await fetch('api/auth/me', {
		credentials: 'include'
	})

	if(res.ok){
		const data = await res.json();
		user = data.user
		if (!user) {
			window.location.href = "student_login.html";
			return;
		}
	} else {
		window.location.href = "student_login.html";
		return;
	}

	const response = await fetch(`api/student/view_profile/${user.username}`);
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

	logout.addEventListener('click', async function(){
		const response = await fetch('/api/auth/logout', {
			method: 'POST',
			credentials: 'include'
		})
		const data = await response.json();

		if(data.success)
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