document.getElementById('logoutButton').addEventListener('click', function (event) {
    // Clear session storage on logout
    sessionStorage.removeItem('userLoggedIn');
    
    // Redirect to the login page after logout, replacing the current page in history
    window.location.replace('../../index.html');
});
