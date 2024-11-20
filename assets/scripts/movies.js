document.getElementById('logoutButton').addEventListener('click', function () {
    // Clear session storage on logout
    sessionStorage.removeItem('userLoggedIn');
    
    // Redirect to the login page after logout
    window.location.href = '../../index.html';
});
