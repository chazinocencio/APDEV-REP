document.addEventListener('DOMContentLoaded', async function(){
   const techprofile = document.getElementById('back')
   const viewrev = document.getElementById('viewrev')
    const blockbutt = document.getElementById('blockbutt')
    const confirmblock = document.getElementById('confirmblock')
    const cancelblock = document.getElementById('cancelblock')
   let studentIdNumber = null;

    if (techprofile) techprofile.addEventListener('click', function(){
       window.location.href = "../technician.html";
    }) 

    if (viewrev) viewrev.addEventListener('click', function(){
       // open reservations page for this student (use idNumber if available)
       if (studentIdNumber) window.location.href = `../userreservations.html?id=${studentIdNumber}`;
       else window.location.href = "../userreservations.html";
    }) 

    if (blockbutt) blockbutt.addEventListener('click', function(){
       document.getElementById('blockroom1').classList.remove('hidden');
    }) 

    if (confirmblock) confirmblock.addEventListener('click', function(){
       document.getElementById('blockroom1').classList.add('hidden');
    }) 
    if (cancelblock) cancelblock.addEventListener('click', function(){
       document.getElementById('blockroom1').classList.add('hidden');
    })

    // populate profile based on ?id=username
   const params = new URLSearchParams(window.location.search);
   const username = params.get('id');

    if (!username) return; // nothing to load

    try {
        const res = await fetch(`api/student/view_profile/${username}`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        const profile = await res.json();

      if (!profile) return;

        const profilePic = document.getElementById('profilepic');
        const profileUsernameSpan = document.getElementById('profileusername_span');
        const profileUsernameCard = document.getElementById('profileusername_card');
        const profileUsernameEdit = document.getElementById('profileusername_edit');
        const profId = document.getElementById('prof-id');
        const campus = document.getElementById('campus');
        const profProgram = document.getElementById('prof-program');
        const bio = document.getElementById('bio');

        if (profilePic && profile.profilePicture) profilePic.src = profile.profilePicture;
        if (profileUsernameSpan) profileUsernameSpan.textContent = profile.username || '';
        if (profileUsernameCard) profileUsernameCard.textContent = profile.username || '';
        if (profileUsernameEdit) profileUsernameEdit.textContent = profile.username || '';
        if (profId) profId.textContent = profile.idNumber || '';
        if (campus) campus.textContent = profile.college || '';
        if (profProgram) profProgram.textContent = profile.degreeProgram || '';
        if (bio) bio.textContent = profile.bio || '';
      // store idNumber for other pages (like viewing reservations)
      if (profile.idNumber) studentIdNumber = profile.idNumber;

    } catch (err) {
        console.error('Error loading student profile', err);
    }

})
