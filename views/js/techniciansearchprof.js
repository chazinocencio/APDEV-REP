document.addEventListener("DOMContentLoaded", async function(){
    let user = null;

	const res = await fetch('api/auth/me', {
		credentials: 'include'
	})

	if(res.ok){
		const data = await res.json();
		user = data.user
		if (!user) {
			window.location.href = "technician_login.html";
			return;
		}
	} else {
		window.location.href = "technician_login.html";
		return;
	}

    const backButton = document.getElementById('back');
    const searchBar = document.querySelector('#searchbar');
    const searchButton = document.querySelector('#searchbutt');
    const searchResults = document.querySelector('#search-results');

    if (backButton) {
        backButton.addEventListener('click', function(){
            window.location.href = "../technician.html";
        })
    }

    if (searchButton) {
        searchButton.addEventListener('click', async function(){
            if (!searchResults) return;
            searchResults.innerHTML = '';
            if (searchBar && searchBar.value != ''){
                try {
                    const response = await fetch(`api/common_routes/search_profile/${searchBar.value}`, {
                        credentials: 'include'
                    });
                    const data = await response.json();
                    const profiles = data.data;

                    if (profiles && profiles.length > 0){
                        profiles.forEach(profile => {
                            searchResults.innerHTML += `
                                <div class="results" data-id="${profile.username}">
                                    <img src="${profile.profilePicture || ''}" onerror="this.src='assets/images/diffusersym.png'" alt="Profile Picture"> 
                                    <div class="resultdeets">
                                        <h3>@${profile.username}</h3>
                                        <p>${profile.lastName}, ${profile.firstName} ${profile.middleName ? profile.middleName[0] + '.' : ''}</p>
                                    </div>
                                </div>
                            `
                        })

                        document.querySelectorAll(".results").forEach(result => {
                            result.addEventListener("click", function() {
                                const studentUsername = this.dataset.id;
                                window.location.href = `techstudentprof.html?id=${studentUsername}`;
                            });
                        });
                    } else {
                        searchResults.innerHTML += '<h3>No results found.</h3>'
                    }
                } catch (err) {
                    console.error(err);
                    searchResults.innerHTML += '<h3>Error performing search.</h3>'
                }
            }
        })
    }
})

