const checkbox = document.getElementById('verify');

checkbox.addEventListener('change', function(){

    var ver = document.getElementById("ver");
    if (ver) ver.textContent = "Verifying"

    if(this.checked){
        window.location.href = "../index.html"
    }
  
})