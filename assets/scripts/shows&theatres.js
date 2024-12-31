// Import the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function getMovieIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Main execution block
document.addEventListener("DOMContentLoaded", function () {
    const movieId = getMovieIdFromUrl();

    if (!movieId) {
        document.getElementById("movie-details").innerHTML = "<p>No movie selected.</p>";
        return;
    }

    // Fetch movie data from Firebase
    const movieRef = ref(database, `movies/${movieId}`);
    get(movieRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const movie = snapshot.val();
                console.log("Fetched Movie Data:", movie);
                displayMovieDetails(movie);
                populateShowTimes(movie.theatres, movie);

                // Store movie details in localStorage
                localStorage.setItem('selectedMovie', JSON.stringify({
                    title: movie.title || "Unknown",
                    poster: movie.poster || "default-poster.jpg",
                    duration: movie.duration || "N/A",
                    genre: movie.genre || "N/A",
                    language: movie.language || "N/A",
                    theatres: movie.theatres || []
                }));
            } else {
                document.getElementById("movie-details").innerHTML = "<p>Movie not found.</p>";
            }
        })
        .catch((error) => {
            console.error("Error fetching movie data:", error);
            document.getElementById("movie-details").innerHTML = "<p>Unable to load movie details. Please try again later.</p>";
        });
});

// Function to display movie details
function displayMovieDetails(movie) {
    const movieDetailsContainer = document.getElementById("movie-details");

    const html = `
        <div class="movie-details-container">
            <h1 class="movie-title">${movie.title || "Title Not Available"}</h1>
            <div class="overall-movie-container">
                <div class="movie-info">
                    <p class="movie-rating">U/A • ${movie.duration || "N/A"}</p>
                    <p class="movie-genre">${movie.genre || "N/A"}</p>
                    <p class="movie-languages">${movie.language || "N/A"}</p>
                    <a href="${movie.trailerLink || "#"}" target="_blank" class="btn watch-trailer-btn">
                        <span>▶</span> Watch Trailer
                    </a>
                    <div class="tabs">
                        <button class="tab active" id="showlisting-tab">Showlisting</button>
                        <button class="tab" id="reviews-tab">Reviews & More</button>
                    </div>
                </div>
                <div class="movie-poster">
                    <img src="${movie.poster || 'default-poster.jpg'}" alt="${movie.title || 'Poster'}" class="img-fluid">
                </div>
            </div>
            <div class="location-dropdown">
                <span class="location-icon">📍</span>
                <select class="location-select">
                    <option>Chennai (Only)</option>
                    
                </select>
            </div>
            <div class="date-selection">
                <label for="date-picker">Select Date:</label>
                <div id="date-scroll-container" class="date-scroll-container"></div>
            </div>
            <div id="show-times" class="show-times-container" style="display: none;"></div>
            <div id="reviews" class="reviews-container" style="display: none;"></div>
        </div>
    `;
    movieDetailsContainer.innerHTML = html;

    // Add tab event listeners
    const showlistingTab = document.getElementById("showlisting-tab");
    const reviewsTab = document.getElementById("reviews-tab");

    showlistingTab.addEventListener("click", () => {
        showlistingTab.classList.add("active");
        reviewsTab.classList.remove("active");
        document.getElementById("show-times").style.display = "block";
        document.getElementById("reviews").style.display = "none";
    });

    reviewsTab.addEventListener("click", () => {
        reviewsTab.classList.add("active");
        showlistingTab.classList.remove("active");
        document.getElementById("show-times").style.display = "none";
        document.getElementById("reviews").style.display = "block";

        // Fetch and display reviews
        fetchReviews(movie.id);
    });

    // Generate date scroll
    generateDateScroll();
}

// Generate Date Scroll Function
function generateDateScroll() {
    const dateScrollContainer = document.getElementById("date-scroll-container");
    const showTimesContainer = document.getElementById("show-times");

    if (!dateScrollContainer) {
        console.error("Error: #date-scroll-container not found in DOM");
        return;
    }

    const currentDate = new Date();
    
    // Clear any previous date selections
    dateScrollContainer.innerHTML = '';

    // Loop to generate the next 5 dates
    for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(currentDate.getDate() + i);

        // Format the date to 'Day, Date Month' 
        const dateText = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

        const dateElement = document.createElement("div");
        dateElement.classList.add("date-item");
        dateElement.innerText = dateText;

        // Add event listener to handle selection of date
        dateElement.addEventListener("click", function () {
            document.querySelectorAll(".date-item").forEach(item => item.classList.remove("selected")); // Remove selection from all dates
            dateElement.classList.add("selected"); // Highlight the clicked date

            const selectedMovie = JSON.parse(localStorage.getItem('selectedMovie')) || {};  // Get selected movie to store date 
            selectedMovie.selectedDate = date.toISOString().split('T')[0];  // Store the selected date in ISO format
            localStorage.setItem('selectedMovie', JSON.stringify(selectedMovie)); // Save updated date to localStorage

            // Show showtimes after date selection
            populateShowTimes(selectedMovie.theatres, selectedMovie);
            showTimesContainer.style.display = "block";  // Show the showtimes section
        });

        dateScrollContainer.appendChild(dateElement);
    }
}

// Function to populate the showtimes for the movie
function populateShowTimes(theatres = [], movie) {
    const showTimesContainer = document.getElementById("show-times");
    showTimesContainer.innerHTML = ''; // Clear previous showtimes

    if (!theatres || theatres.length === 0) {
        showTimesContainer.innerHTML = "<p>No showtimes available.</p>";
        return;
    }

    theatres.forEach(theatre => {
        const theatreBlock = `
            <div class="theatre-section">
                <h3>${theatre.name}</h3>
                <div class="showtimes-container">
                    ${theatre.showtimes.map(showtime => `
                        <div class="showtime-item">
                            <a href="../pages/seat-selection.html"
                               class="showtime-link" data-showtime="${showtime.time}" data-theatre="${theatre.name}">
                               ${showtime.time}
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        showTimesContainer.innerHTML += theatreBlock;
    });

    // Add event listeners to each showtime link
    const showtimeLinks = document.querySelectorAll('.showtime-link');
    showtimeLinks.forEach(link => {
        link.addEventListener('click', function () {
            const selectedMovie = JSON.parse(localStorage.getItem('selectedMovie')) || {};
            selectedMovie.selectedShowtime = this.getAttribute('data-showtime');
            selectedMovie.selectedTheatre = this.getAttribute('data-theatre');
            localStorage.setItem('selectedMovie', JSON.stringify(selectedMovie));
        });
    });
}

// Fetch reviews (placeholder logic)
function fetchReviews(movieId) {
    const reviewsContainer = document.getElementById("reviews");
    reviewsContainer.innerHTML = "<p>Loading reviews...</p>";

    const reviews = [
        { username: "sheriff", review: "Nice movie!", rating: 4 },
        { username: "santhosh", review: "One-time watch.", rating: 3 }
    ];

    const reviewsHTML = reviews.map(review => `
        <div class="review-item">
            <p><strong>${review.username}</strong> - ⭐ ${review.rating} / 5</p>
            <p>${review.review}</p>
        </div>
    `).join('');

    reviewsContainer.innerHTML = reviewsHTML;
}

console.log(localStorage.getItem('selectedMovie'));
