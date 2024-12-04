document.addEventListener('DOMContentLoaded', () => {
    // Logout functionality
    document.getElementById('logoutButton').addEventListener('click', function (event) {
        // Clear session storage on logout
        sessionStorage.removeItem('userLoggedIn');
        sessionStorage.removeItem('userEmail'); // If needed
        sessionStorage.removeItem('userMobile'); // If needed

        // Redirect to the login page after logout, replacing the current page in history
        window.location.replace('../../index.html');
    });

    // Prevent Back Button after logout (or on specific pages)
    if (sessionStorage.getItem('userLoggedIn') === null) {
        preventBackNavigation();
    }
});

// Function to prevent back navigation
function preventBackNavigation() {
    // Push a new state into the history to prevent going back to the previous page
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
        window.history.pushState(null, null, window.location.href); // Keeps the user on the same page
    };
}


// Initialize Supabase client here
const supabaseUrl = 'https://srjumswibbswcwjntcad.supabase.co';
const supabaseKey = 'your-supabase-key';  // Replace with your actual Supabase key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

window.onload = function () {
    // Your other code can go here.
    async function getUserData() {
        const { data, error } = await supabase
            .from('users')  // Replace with your table name
            .select('username')  // Assuming you have 'username' column
            .single();  // Fetch a single row
        
        if (error) {
            console.error("Error fetching user data:", error);
        } else {
            const username = data ? data.username : "Guest";
            showUsernamePopup(username);
        }
    }

    // Show username in the popup
    function showUsernamePopup(username) {
        const popup = document.getElementById('usernamePopup');
        popup.innerHTML = `Welcome back, ${username}!`;  // Display username
        popup.classList.add('show');
        setTimeout(() => {
            popup.classList.remove('show');
        }, 3000); // Hide after 3 seconds
    }

    // Call getUserData after the window has loaded
    getUserData();
};
