document.addEventListener('DOMContentLoaded', async function() {
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

    document.getElementById('headerlogo').addEventListener('click', () => {
        window.location.href = "student.html";
    });

    const params = new URLSearchParams(window.location.search);
    const studentUsername = params.get("id");
    document.title = `@${studentUsername}`;

    if(!studentUsername){
        window.location.href = "studentsearchprof.html";
        return;
    }

    const response = await fetch(`api/student/view_profile/${studentUsername}`, {
        credentials: 'include'
    });
    const data = await response.json();
    const studentProfile = data;

    const fullName = `${studentProfile.lastName}, ${studentProfile.firstName} ${studentProfile.middleName ? studentProfile.middleName[0] + '.' : ''}`;

    document.querySelector('#profileusername').innerHTML = `@${studentProfile.username}`
    document.querySelector('#header-fullname').innerHTML = fullName;
    document.querySelector('#prof-id').innerHTML = studentProfile.idNumber.toString().slice(0,3);
    document.querySelector('#college').innerHTML = studentProfile.college;
    document.querySelector('#prof-program').innerHTML = studentProfile.degreeProgram;
    document.querySelector('#bio').innerHTML = studentProfile.bio;
	document.querySelector('#profile-picture').src = studentProfile.profilePicture;

    const studentprofile = document.getElementById('back')

    studentprofile.addEventListener('click', function(){
        window.location.href = "../student.html";
    })
});
    