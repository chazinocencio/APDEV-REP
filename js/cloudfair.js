const checkbox = document.getElementById('verify');

checkbox.addEventListener('change', function(){

    if(this.checked){
        window.location.href = "../index.html"
    }
})