document.addEventListener("DOMContentLoaded", async function(){
    const response = await fetch ('/api/auth/checkAuth', {
        credentials: 'include'
    });
    const data = await response.json();

    if(data.success){
        const user = data.user
        if (user.role === 'student'){
            window.location.href = 'student.html'
        } else {
            window.location.href = 'technician.html'
        }
    } else {
        console.log(data.message);
    }
});