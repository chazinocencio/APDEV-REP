document.addEventListener("DOMContentLoaded", function () {
    var infoForm = document.getElementById("student-info-form");
    var accountForm = document.getElementById("account-form");

    if (infoForm) {
        var firstName = document.getElementById("first-name");
        var lastName = document.getElementById("last-name");
        var middleName = document.getElementById("middle-name");
        var college = document.getElementById("college");
        var degreeProgram = document.getElementById("degree-program");
        var email = document.getElementById("dlsu-email");
        var idNumber = document.getElementById("id-number");

        var emailError = document.getElementById("email-error");
        var idError = document.getElementById("id-error");
        var formError = document.getElementById("form-error");

        var continueBtn = document.getElementById("info-continue");
        var backBtn = document.getElementById("info-back");

        const studentData = JSON.parse(localStorage.getItem("registerData"));
        if (studentData) {
            firstName.value = studentData.firstName || "";
            lastName.value = studentData.lastName || "";
            middleName.value = studentData.middleName || "";
            college.value = studentData.college || "";
            degreeProgram.value = studentData.degreeProgram || "";
            email.value = studentData.email || "";
            idNumber.value = studentData.idNumber || "";
        }
        
        function trimValue(input) {
            return input ? input.value.trim() : "";
        }

        function isValidEmail(value) {
            if (!value) return false;
            if (!value.endsWith("@dlsu.edu.ph")) return false;
            if (value.includes(" ")) return false;
            return true;
        }
        function isValidId(value) {
            if (!value) return false;
            if (isNaN(value)) return false;
            value = Number(value);
            if (!Number.isInteger(value)) return false;
            if (value < 10000000 || value > 99999999) return false;
            return true;
        }
        async function emailExists(value) {
            const response = await fetch(`api/student/search_email/${value}`);
            const data = await response.json();
            return !!data; // Return true if student exists, false otherwise
        }
        async function idNumberExists(value) {
            const response = await fetch(`api/student/search_idNumber/${value}`);
            const data = await response.json();
            return !!data; // Return true if student exists, false otherwise
        }

        function capitalizeFirstChar(str) {
            return str.replace(/(^|\s)\S/g, function(match) {
                return match.toUpperCase();
            });
        }

        if (continueBtn) {
            continueBtn.addEventListener("click", async function () {
                var valid = true;

                if (trimValue(firstName) === ""){
                    valid = false;
                    firstName.style.borderColor = "red";
                    formError.style.display = "block";
                }
                if (trimValue(lastName) === ""){
                    valid = false;
                    lastName.style.borderColor = "red";
                    formError.style.display = "block";
                }
                if (trimValue(middleName) === ""){
                    valid = false;
                    middleName.style.borderColor = "red";
                    formError.style.display = "block";
                }
                if (trimValue(college) === ""){
                    valid = false;
                    college.style.borderColor = "red";
                    formError.style.display = "block";
                }
                if (trimValue(degreeProgram) === ""){
                    valid = false;
                    degreeProgram.style.borderColor = "red";
                    formError.style.display = "block";
                }
                if (trimValue(email) === ""){
                    valid = false;
                    email.style.borderColor = "red";
                    formError.style.display = "block";
                }
                if (idNumber.value === ""){
                    valid = false;
                    idNumber.style.borderColor = "red";
                    formError.style.display = "block";
                }
                if (email.value !== "" && !isValidEmail(email.value.toLowerCase())) {
                    valid = false;
                    email.style.borderColor = "red";
                    emailError.style.display = "block";
                    emailError.textContent = "Not a valid DLSU Email.";
                } else if (email.value !== "" && isValidEmail(email.value.toLowerCase()) && await emailExists(email.value)) {
                    valid = false;
                    email.style.borderColor = "red";
                    emailError.textContent = "This email is already registered.";
                    emailError.style.display = "block";
                }

                if (idNumber.value !== "" && !isValidId(idNumber.value)) {
                    console.log("Invalid ID Number: " + idNumber.value);
                    valid = false;
                    idNumber.style.borderColor = "red";
                    idError.style.display = "block";
                    idError.textContent = "Not a valid DLSU ID Number.";
                } else if (idNumber.value !== "" && isValidId(idNumber.value) && await idNumberExists(idNumber.value)) {
                    valid = false;
                    idNumber.style.borderColor = "red";
                    idError.textContent = "This ID Number is already registered.";
                    idError.style.display = "block";
                }

                if (valid) {
                    const studentData = {
                        firstName: capitalizeFirstChar(trimValue(firstName)),
                        lastName: capitalizeFirstChar(trimValue(lastName)),
                        middleName: capitalizeFirstChar(trimValue(middleName)),
                        college: trimValue(college),
                        degreeProgram: trimValue(degreeProgram),
                        email: trimValue(email).toLowerCase(),
                        idNumber: trimValue(idNumber)
                    };
                    localStorage.setItem("registerData", JSON.stringify(studentData));
                    window.location.href = "student_register_account.html";
                }
            });
        }

        firstName.addEventListener("click", function () {
            firstName.style.borderColor = "var(--ls-green)";
            formError.style.display = "none";
        });

        lastName.addEventListener("click", function () {
            lastName.style.borderColor = "var(--ls-green)";
            formError.style.display = "none";
        });

        middleName.addEventListener("click", function () {
            middleName.style.borderColor = "var(--ls-green)";
            formError.style.display = "none";
        });

        college.addEventListener("click", function () {
            college.style.borderColor = "var(--ls-green)";
            formError.style.display = "none";
        });

        degreeProgram.addEventListener("click", function () {
            degreeProgram.style.borderColor = "var(--ls-green)";
            formError.style.display = "none";
        });

        email.addEventListener("click", function () {
            email.style.borderColor = "var(--ls-green)";
            formError.style.display = "none";
            emailError.style.display = "none";
        });

        idNumber.addEventListener("click", function () {
            idNumber.style.borderColor = "var(--ls-green)";
            formError.style.display = "none";
            idError.style.display = "none";
        });

        if (backBtn) {
            backBtn.addEventListener("click", function () {
                localStorage.removeItem("registerData");
                window.location.href = "student_login.html";
            });
        }
    }

    if (accountForm) {
        const studentData = JSON.parse(localStorage.getItem("registerData"));
        if (!studentData) {
            window.location.href = "student_register.html";
            return;
        }

        var username = document.getElementById("reg-username");
        var password = document.getElementById("reg-password");
        var passwordConfirm = document.getElementById("reg-password-confirm");
        var formError = document.getElementById("form-error");

        var usernameError = document.getElementById("username-error");
        var passwordError = document.getElementById("password-error");

        var registerBtn = document.getElementById("account-register");
        var backAccountBtn = document.getElementById("account-back");

        function trimValue(input) {
            return input ? input.value.trim() : "";
        }
        
        async function usernameExists(value) {
            const response = await fetch(`api/student/view_profile/${value}`);
            const data = await response.json();
            return !!data; // Return true if student exists, false otherwise
        }
        function hasStrongPassword(value) {
            if (!value) return false;
            const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            return strongPasswordRegex.test(value);
        }
        function isValidUsername(value) {
            if (!value) return false;
            const usernameRegex = /^[a-zA-Z0-9_.]+$/;
            return usernameRegex.test(value);
        }

        if (registerBtn) {
            registerBtn.addEventListener("click", async function () {
                valid = true;

                if (trimValue(username) === ""){
                    valid = false;
                    username.style.borderColor = "red";
                    formError.style.display = "block";
                }
                if (trimValue(password) === ""){
                    valid = false;
                    password.style.borderColor = "red";
                    formError.style.display = "block";
                }
                if (trimValue(passwordConfirm) === ""){
                    valid = false;
                    passwordConfirm.style.borderColor = "red";
                    formError.style.display = "block";
                }

                if (trimValue(username) !== "" && !isValidUsername(username.value.trim())){
                    valid = false;
                    username.style.borderColor = "red";
                    usernameError.style.display = "block";
                    usernameError.textContent = "Username can only contain letters, numbers, underscores, and periods.";
                } else if (trimValue(username) !== "" && isValidUsername(username.value.trim()) && await usernameExists(username.value.trim())) {
                    valid = false;
                    username.style.borderColor = "red";
                    usernameError.textContent = "This username is already taken.";
                    usernameError.style.display = "block";
                }

                if (trimValue(password) !== "" && !hasStrongPassword(password.value)) {
                    valid = false;
                    password.style.borderColor = "red";
                    passwordError.style.display = "block";
                    passwordError.textContent = "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.";
                } else if (trimValue(password) !== trimValue(passwordConfirm)) {
                    valid = false;
                    password.style.borderColor = "red";
                    passwordConfirm.style.borderColor = "red";
                    passwordError.textContent = "Passwords do not match.";
                    passwordError.style.display = "block";
                }

                if (valid) {
                    const response = await fetch("api/auth/student/register", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            username: trimValue(username),
                            password: trimValue(password),
                            ...studentData
                        })
                    });
                    localStorage.removeItem("registerData");
                    const data = await response.json();
                    window.location.href = "student_login.html";
                }
            });
        }

        username.addEventListener("click", function () {
            username.style.borderColor = "var(--ls-green)";
            formError.style.display = "none";
            usernameError.style.display = "none";
        });

        password.addEventListener("click", function () {
            password.style.borderColor = "var(--ls-green)";
            passwordConfirm.style.borderColor = "var(--ls-green)";
            formError.style.display = "none";
            passwordError.style.display = "none";
        }); 

        passwordConfirm.addEventListener("click", function () {
            password.style.borderColor = "var(--ls-green)";
            passwordConfirm.style.borderColor = "var(--ls-green)";
            formError.style.display = "none";
            passwordError.style.display = "none";
        });

        if (backAccountBtn) {
            backAccountBtn.addEventListener("click", function () {
                window.location.href = "student_register.html";
            });
        }
    }
});
