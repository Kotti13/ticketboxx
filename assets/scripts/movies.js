document.addEventListener('DOMContentLoaded', () => {
    // Logout functionality
    document.getElementById('logoutButton').addEventListener('click', function (event) {
        // Clear session storage on logout
        sessionStorage.removeItem('userLoggedIn');
        sessionStorage.removeItem('userEmail'); // If needed

        // Redirect to the landing page after logout
        window.location.replace('../../index.html'); // Update this path to your landing page URL
    });

    // Prevent Back Button after logout (or on specific pages)
    if (sessionStorage.getItem('userLoggedIn') === null) {
        preventBackNavigation();
    }

    // If user is logged out, make sure we show appropriate UI (hide user details, show login prompt)
    if (sessionStorage.getItem('userLoggedIn') === null) {
        const usernamePopup = document.getElementById('usernamePopup');
        if (usernamePopup) {
            usernamePopup.innerHTML = "Please log in to access your account.";
        }
    } else {
        // Call function to get user data if logged in
        getUserData();
    }
});

// Function to prevent back navigation after logout
function preventBackNavigation() {
    // Push a new state into the history to prevent going back to the previous page
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
        window.history.pushState(null, null, window.location.href); // Keeps the user on the same page
    };
}

// Function to fetch user data (you can customize based on your DB and requirements)
async function getUserData() {
    // Example of how you might get user data from Supabase (or any API)
    const { data, error } = await supabase
        .from('users')  // Replace with your table name
        .select('username')  // Assuming you have a 'username' column
        .single();  // Fetch a single row

    if (error) {
        console.error("Error fetching user data:", error);
    } else {
        const username = data ? data.username : "Guest";
        showUsernamePopup(username);
    }
}

// Show username in a popup (can be customized)
function showUsernamePopup(username) {
    const popup = document.getElementById('usernamePopup');
    popup.innerHTML = `Welcome back, ${username}!`;  // Display username
    popup.classList.add('show');
    setTimeout(() => {
        popup.classList.remove('show');
    }, 3000); // Hide after 3 seconds
}

// Initialize Supabase client here (if needed)
const supabaseUrl = 'https://srjumswibbswcwjntcad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyanVtc3dpYmJzd2N3am50Y2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2Nzk5MzcsImV4cCI6MjA0NTI1NTkzN30.e_ZkFg_EPI8ObvFz70Ejc1W4RGpQurr0SoDlK6IoEXY';  // Replace with your actual Supabase key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);
