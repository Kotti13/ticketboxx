document.getElementById('logoutButton').addEventListener('click', function (event) {
    // Clear session storage on logout
    sessionStorage.removeItem('userLoggedIn');
    
    // Redirect to the login page after logout, replacing the current page in history
    window.location.replace('../../index.html');
});

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
