document.getElementById('logoutButton').addEventListener('click', function() {
    // Clear session data or tokens
    sessionStorage.removeItem('userLoggedIn'); // Assuming 'userLoggedIn' is set upon login

    // Redirect to index page
    window.location.href = 'index.html';
});
