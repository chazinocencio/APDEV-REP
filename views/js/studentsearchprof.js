document.addEventListener("DOMContentLoaded", function(){
    const studentprofile = document.getElementById('back');
    const searchBar = document.querySelector('#searchbar');
    const searchButton = document.querySelector('#searchbutt');
    const searchResults = document.querySelector('#search-results');

    searchButton.addEventListener('click', async function(){
        searchResults.innerHTML = ''; // clear previous search results
        if (searchBar.value != ''){
            const response = await fetch(`api/common_routes/search_profile/${searchBar.value}`);
            const data = await response.json();
            const profiles = data.data;
            
            if(profiles.length > 0){
                profiles.forEach(profile => {
                // profile picture to be changed to actual profile picture when implemented, currently default
                searchResults.innerHTML += `
                    <div class="results" data-id="${profile.username}">
                        <img src="/assets/images/diffusersym.png" alt="Profile Picture"> 
                        <div class="resultdeets">
                            <h3>${profile.lastName}, ${profile.firstName} ${profile.middleName ? profile.middleName[0] + '.' : ''}</h3>
                            <p>@${profile.username}</p>
                        </div>
                    </div>
                `
                })
                document.querySelectorAll(".results").forEach(result => {
                    result.addEventListener("click", function() {
                        const studentUsername = this.dataset.id;

                        window.location.href = `studentprof.html?id=${studentUsername}`;
                    });
                });
            } else {
                searchResults.innerHTML += '<h3>No results found.</h3>'
            }
        }
    })

    studentprofile.addEventListener('click', function(){
        window.location.href = "../student.html";
    })
})

