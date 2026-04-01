document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.querySelector(".logcard");

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        var email = document.getElementById('email');
        var password = document.getElementById('password');
        var rememberMe = document.getElementById('rememberme')
        var errormess = document.getElementById('errormess');

        var all_fields = true;
        email.style.borderColor = "var(--midgrey-green)";
        password.style.borderColor = "var(--midgrey-green)";
        if (email.value == ""){
            all_fields = false;
            email.style.borderColor = "red";
        }
        if (password.value  == ""){
            all_fields = false;
            password.style.borderColor = "red";
        }

        if (all_fields == false){
            errormess.style.opacity = 100;
            errormess.innerHTML = "Please fill out all fields."
            return;
        } else {
            try {
                // determine which endpoint and redirect to use based on the form action
                const formAction = loginForm.getAttribute('action') || '';
                const isTechnician = formAction.toLowerCase().includes('technician');
                const endpoint = isTechnician ? "/api/auth/technician/login" : "/api/auth/student/login";

                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.value,
                        password: password.value,
                        rememberMe: rememberMe.checked
                    })
                });

                const data = await response.json();
                if (data.success) {
                    if(data.user.isActive === false){
                        errormess.style.opacity = 1;
                        errormess.innerHTML = "This account has been deactivated. Contact support for assistance.";
                    }
                    else {
                        // store token for authenticated requests
                        localStorage.setItem("token", data.token);
                        // optional: store user info
                        localStorage.setItem("user", JSON.stringify(data.user));
                        // redirect to appropriate dashboard (use the form action path)
                        // ensure we don't accidentally redirect to an external URL
                        const redirectPath = formAction || (isTechnician ? "technician.html" : "student.html");
                        window.location.href = redirectPath;
                    }

                } else {
                    errormess.style.opacity = 1;
                    errormess.innerHTML = "Invalid email or password.";
                }

            } catch (error) {
                errormess.style.opacity = 1;
                errormess.innerHTML = "Unable to connect to server.";
            }
        }
    })
})