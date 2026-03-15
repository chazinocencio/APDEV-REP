document.addEventListener('DOMContentLoaded', async function() {
    const params = new URLSearchParams(window.location.search);
    const studentUsername = params.get("id");

    if(!studentUsername){
        window.location.href = "studentsearchprof.html";
        return;
    }

    const response = await fetch(`api/common_routes/view_profile/${studentUsername}`);
    const data = await response.json();
    const studentProfile = data;

    const fullName = `${studentProfile.lastName}, ${studentProfile.firstName} ${studentProfile.middleName ? studentProfile.middleName[0] + '.' : ''}`;

    document.querySelector('#profileusername').innerHTML = `@${studentProfile.username}`
    document.querySelector('#header-fullname').innerHTML = fullName;
    document.querySelector('#prof-id').innerHTML = studentProfile.idNumber;
    document.querySelector('#college').innerHTML = studentProfile.college;
    document.querySelector('#prof-program').innerHTML = studentProfile.degreeProgram;
    document.querySelector('#bio').innerHTML = studentProfile.bio;

    const studentprofile = document.getElementById('back')

    studentprofile.addEventListener('click', function(){
        window.location.href = "../studentreserve.html";
    })
});
    