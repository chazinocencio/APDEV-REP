document.addEventListener('DOMContentLoaded', async function(){
	let user = null;

	const res = await fetch('api/auth/me', {
		credentials: 'include'
	})

	if(res.ok){
		const data = await res.json();
		user = data.user
		if (!user) {
			window.location.href = "technician_login.html";
			return;
		}
	} else {
		window.location.href = "technician_login.html";
		return;
	}
	
	const technicianprofile = document.getElementById('technicianprofile')
	const technicianreserve = document.getElementById('technicianreserve')
	const logout = document.getElementById('logout')
	const searchprof = document.getElementById('searchstudent')
	const searchtime = document.getElementById('searchroom')
	const searchrev = document.getElementById('searchrev')
	const search = document.getElementById('studentsearch')

	const headUsername = document.getElementById('headusername');
	const usernameFull = document.getElementById('username-fullname');
	const userImg = document.querySelector('.user img');

	const fullName = `${user.lastName || ''}, ${user.firstName || ''}${user.middleName ? ' ' + (user.middleName[0] + '.') : ''}`;
	const displayName = user.username ? `@${user.username}` : fullName;

	if (headUsername) headUsername.innerHTML = fullName;
	if (usernameFull) usernameFull.innerHTML = displayName;
	if (userImg && user.profilePicture) userImg.src = user.profilePicture;

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
});