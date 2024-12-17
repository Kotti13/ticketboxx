document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");

    if (!movieId) {
        document.getElementById("movie-details").innerHTML = "<p>No movie selected.</p>";
        return;
    }

    // Fetch movies data
    fetch('../data/movies.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log("Fetched Movies Data:", data.movies); // Debugging
            const movie = data.movies.find(movie => movie.id === movieId);

            if (movie) {
                console.log("Found Movie:", movie); // Debugging
                displayMovieDetails(movie);
                populateShowTimes(movie.theatres, movie);

                // Store movie details in localStorage
                localStorage.setItem('selectedMovie', JSON.stringify({
                    title: movie.title || "Unknown",
                    poster: movie.poster || "default-poster.jpg",
                    duration: movie.duration || "N/A",
                    genre: movie.genre || "N/A",
                    language: movie.language || "N/A"
                }));
            } else {
                document.getElementById("movie-details").innerHTML = "<p>Movie not found.</p>";
            }
        })
        .catch(error => {
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
                <option>Chennai</option>
                <option>Hyderabad</option>
                <option>Bangalore</option>
                <option>Mumbai</option>
            </select>
        </div>
        <div class="date-selection">
            <label for="date-picker">Select Date:</label>
            <div id="date-scroll-container" class="date-scroll-container"></div>
        </div>
        <div id="show-times" class="show-times-container"></div>
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
    if (!dateScrollContainer) {
        console.error("Error: #date-scroll-container not found in DOM");
        return;
    }

    const currentDate = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];

    for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setDate(currentDate.getDate() + i);

        const dateStr = formatDate(date);
        const dateText = date.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });

        const dateElement = document.createElement("div");
        dateElement.classList.add("date-item");
        dateElement.dataset.date = dateStr;
        dateElement.innerText = dateText;

        dateElement.addEventListener("click", function () {
            document.querySelectorAll(".date-item").forEach(item => item.classList.remove("selected"));
            dateElement.classList.add("selected");

            const selectedMovie = JSON.parse(localStorage.getItem('selectedMovie')) || {};
            selectedMovie.selectedDate = dateStr;
            localStorage.setItem('selectedMovie', JSON.stringify(selectedMovie));
        });

        dateScrollContainer.appendChild(dateElement);
    }
}

// Populate Show Times Function
function populateShowTimes(theatres = [], movie) {
    const showTimesContainer = document.getElementById("show-times");
    showTimesContainer.innerHTML = ''; // Clear any existing showtimes

    theatres.forEach(theatre => {
        const theatreBlock = `
            <div class="theatre-section">
                <h3>${theatre.name}</h3>
                <div class="showtimes-container">
                    ${theatre.showtimes.map(showtime => `
                        <div class="showtime-item">
                            <a href="seat-selection.html?movieName=${encodeURIComponent(movie.title)}&theatre=${encodeURIComponent(theatre.name)}&date=${JSON.parse(localStorage.getItem('selectedMovie'))?.selectedDate}&movieId=${movie.id}&showtime=${encodeURIComponent(showtime.time)}" 
                               class="showtime-link">
                                ${showtime.time}
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        showTimesContainer.innerHTML += theatreBlock;
    });
}

// Fetch Reviews Function (Mock Example)
function fetchReviews(movieId) {
    const reviewsContainer = document.getElementById("reviews");
    reviewsContainer.innerHTML = "<p>Loading reviews...</p>";

    const reviews = [
        { username: "john_doe", review: "Fantastic movie!", rating: 5 },
        { username: "jane_smith", review: "Great visuals, but pacing was slow.", rating: 3 }
    ];

    const reviewsHTML = reviews.map(review => `
        <div class="review-item">
            <p><strong>${review.username}</strong> - ⭐ ${review.rating} / 5</p>
            <p>${review.review}</p>
        </div>
    `).join('');

    reviewsContainer.innerHTML = reviewsHTML;
}


function initializeHoverEffects() {
    const showtimeItems = document.querySelectorAll('.showtime-item');

    showtimeItems.forEach(item => {
        const tooltip = item.querySelector('.tooltip');
        if (!tooltip) return; // Skip if no tooltip present

        item.addEventListener('mouseenter', () => {
            tooltip.style.display = 'block';
            tooltip.style.opacity = '1';
            tooltip.style.transition = 'opacity 0.3s ease-in-out';
        });

        item.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                tooltip.style.display = 'none';
            }, 300); // Matches the transition duration
        });
    });
}
