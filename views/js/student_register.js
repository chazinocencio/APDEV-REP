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

        function trimValue(input) {
            return input ? input.value.trim() : "";
        }

        function validateEmail(value) {
            if (!value) return false;
            if (value.indexOf("@") === -1) return false;
            return true;
        }


        if (continueBtn) {
            continueBtn.addEventListener("click", function () {
                var valid = true;

                var firstOk = trimValue(firstName) !== "";
                var lastOk = trimValue(lastName) !== "";
                var middleOk = trimValue(middleName) !== "";
                var collegeOk = trimValue(college) !== "";
                var degreeOk = trimValue(degreeProgram) !== "";

                var emailVal = trimValue(email);
                var idVal = trimValue(idNumber);

                var emailOk = validateEmail(emailVal);
                var idOk = validateId(idVal);

                if (!firstOk || !lastOk || !middleOk || !collegeOk || !degreeOk || !emailOk || !idOk) {
                    valid = false;
                }

                if (emailError) {
                    emailError.style.display = emailOk ? "none" : "block";
                }

                if (idError) {
                    idError.style.display = idOk ? "none" : "block";
                }

                if (formError) {
                    formError.style.display = valid ? "none" : "block";
                }

                if (valid) {
                    window.location.href = "student_register_account.html";
                }
            });
        }

        if (backBtn) {
            backBtn.addEventListener("click", function () {
                window.location.href = "student_login.html";
            });
        }
    }

    if (accountForm) {
        var username = document.getElementById("reg-username");
        var password = document.getElementById("reg-password");
        var passwordConfirm = document.getElementById("reg-password-confirm");

        var usernameError = document.getElementById("username-error");
        var passwordError = document.getElementById("password-error");

        var registerBtn = document.getElementById("account-register");
        var backAccountBtn = document.getElementById("account-back");

       

        if (registerBtn) {
            registerBtn.addEventListener("click", function () {
                var userVal = username ? username.value.trim() : "";
                var passVal = password ? password.value : "";
                var confirmVal = passwordConfirm ? passwordConfirm.value : "";

                var userOk = userVal !== "";
                var passStrong = hasStrongPassword(passVal);
                var passMatch = passVal !== "" && passVal === confirmVal;

                if (usernameError) {
                    usernameError.style.display = userOk ? "none" : "block";
                }

                if (passwordError) {
                    passwordError.style.display = passStrong && passMatch ? "none" : "block";
                }

                if (userOk && passStrong && passMatch) {
                    window.location.href = "student_login.html";
                }
            });
        }

        if (backAccountBtn) {
            backAccountBtn.addEventListener("click", function () {
                window.location.href = "student_register.html";
            });
        }
    }
});
