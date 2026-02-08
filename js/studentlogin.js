function checkForm(){
    var username = document.getElementById('studentusername');
    var password = document.getElementById('studentpassword');
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
    }

    return all_fields
}