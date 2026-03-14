document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.querySelector(".logcard");

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        var username = document.getElementById('username');
        var password = document.getElementById('password');
        var errormess = document.getElementById('errormess');

        var all_fields = true;
        username.style.borderColor = "var(--midgrey-green)";
        password.style.borderColor = "var(--midgrey-green)";
        if (username.value == ""){
            all_fields = false;
            username.style.borderColor = "red";
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
                const response = await fetch("http://localhost:5000/api/auth/student/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: username.value,
                        password: password.value
                    })
                });

                const data = await response.json();
                if (data.success) {
                    // store token for authenticated requests
                    localStorage.setItem("token", data.token);
                    // optional: store user info
                    localStorage.setItem("user", JSON.stringify(data.user));
                    // redirect to student dashboard
                    window.location.href = "student.html";

                } else {
                    errormess.style.opacity = 1;
                    errormess.innerHTML = "Invalid username or password.";
                }

            } catch (error) {
                console.error(error);
                errormess.style.opacity = 1;
                errormess.innerHTML = "Unable to connect to server.";
            }
        }
    })
})