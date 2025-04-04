// Import Firebase modules (single version)
import { 
    initializeApp 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { 
    getAuth, 
    signOut, 
    setPersistence, 
    browserLocalPersistence, 
    onIdTokenChanged, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    get 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBcFRNdsErrXYHiiuYlCf6txDjupaNwRno",
    authDomain: "ticketboxx-c4049.firebaseapp.com",
    databaseURL: "https://ticketboxx-c4049-default-rtdb.firebaseio.com",
    projectId: "ticketboxx-c4049",
    storageBucket: "ticketboxx-c4049.firebasestorage.app",
    messagingSenderId: "1029974974410",
    appId: "1:1029974974410:web:a94d9c5fe267f3e51db933",
    measurementId: "G-F7PEJ1WQRV"
};

// Initialize Firebase (single instance)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Set session persistence to local
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log("Session persistence set to local.");
    })
    .catch((error) => {
        console.error("Error setting session persistence:", error);
    });

// Monitor user session
onIdTokenChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in:", user);
        // Refresh user token automatically
        user.getIdToken(true).catch((error) => {
            console.error("Error refreshing token:", error);
        });
    } else {
        console.log("User logged out or token expired.");
        sessionStorage.setItem("loggedOut", "true");
        window.location.href = "../../index.html";
    }
});

// Logout functionality
document.getElementById('logoutButton').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const confirmLogout = confirm("Are you sure you want to log out?");
        if (!confirmLogout) return;

        await signOut(auth);

        // Clear session and local storage
        localStorage.clear();
        sessionStorage.clear();

        alert("Logged out successfully!");
        window.location.href = "../../index.html";
    } catch (error) {
        console.error("Error during logout:", error.message);
        alert("Failed to log out. Please try again.");
    }
});

// Redirect to login if user is not authenticated
function redirectIfLoggedOut() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            sessionStorage.setItem("loggedOut", "true");
            window.location.href = "../../index.html";
        }
    });
}
redirectIfLoggedOut();

// Prevent back navigation after logout
window.addEventListener('load', () => {
    if (sessionStorage.getItem("loggedOut") === "true") {
        window.history.pushState(null, null, window.location.href);
        window.onpopstate = function () {
            window.history.pushState(null, null, window.location.href);
            alert("You cannot go back. Please log in again.");
        };
    }
});

function preventBackNavigation() {
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
        window.history.pushState(null, null, window.location.href);
    };
}
preventBackNavigation();

// Handle search form submission
document.getElementById("searchForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const queryText = document.getElementById("searchQuery").value.trim().toLowerCase();
    if (!queryText ) return;

    const moviesRef = ref(database, 'movies');
    const searchResultsContainer = document.getElementById("searchResults");
    searchResultsContainer.innerHTML = "<p>Loading results...</p>";

    get(moviesRef).then((snapshot) => {
        if (snapshot.exists()) {
            const allMovies = snapshot.val();
            const matchedMovies = Object.entries(allMovies).filter(([id, movie]) =>
                movie.title.toLowerCase().includes(queryText)
            );

            if (matchedMovies.length === 0) {
                searchResultsContainer.innerHTML = "<p>No movies found.</p>";
                return;
            }

            searchResultsContainer.innerHTML = matchedMovies.map(([id, movie]) => `
                <div class="movie-result">
                    <img src="${movie.poster}" alt="${movie.title}" class="movie-poster img-thumbnail" >
                    <div class="balance-details">
                        <h5>${movie.title}</h5>
                        <p><strong>Release Date:</strong> ${movie.releaseDate}</p>
                        <a href="./moviesdetails.html?id=${id}" class="btn btn-primary">View Details</a>
                    </div>
                </div>
            `).join('');
        } else {
            searchResultsContainer.innerHTML = "<p>No movies found.</p>";
        }
    }).catch((error) => {
        console.error("Error fetching data:", error);
        searchResultsContainer.innerHTML = "<p>Error loading results.</p>";
    });
});

// Function to fetch user data (with Supabase)
async function getUserData() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('username')
            .single();

        if (error) throw error;

        const username = data ? data.username : "Guest";
        showUsernamePopup(username);
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

// Show username popup
function showUsernamePopup(username) {
    const popup = document.getElementById('usernamePopup');
    popup.innerHTML = `Welcome back, ${username}!`;
    popup.classList.add('show');
    setTimeout(() => {
        popup.classList.remove('show');
    }, 3000);
}
console.log(localStorage.getItem('username'));