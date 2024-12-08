document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");
    
    if (!movieId) {
        document.getElementById("movie-details").innerHTML = "<p>No movie selected.</p>";
        return;
    }

    fetch('../data/movies.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const movie = data.movies.find(movie => movie.id === movieId);
            if (movie) {
                displayMovieDetails(movie);
                populateShowTimes(movie.theatres, movie);

                // Store movie details in localStorage
                localStorage.setItem('selectedMovie', JSON.stringify({
                    title: movie.title,
                    poster: movie.poster,
                    duration: movie.duration,
                    genre: movie.genre,
                    language: movie.language
                }));
            } else {
                document.getElementById("movie-details").innerHTML = "<p>Movie not found.</p>";
            }
        })
        .catch(error => {
            console.error("Error fetching movie data:", error);
            document.getElementById("movie-details").innerHTML = "<p>Unable to load movie details.</p>";
        });
});

function displayMovieDetails(movie) {
    const movieDetailsContainer = document.getElementById("movie-details");
    const html = `
    <div class="movie-details-container">
        <h1 class="movie-title">${movie.title}</h1>
        <div class="overall-movie-container">
            <div class="movie-info">
                <p class="movie-rating">U/A • ${movie.duration}</p>
                <p class="movie-genre">${movie.genre}</p>
                <p class="movie-languages">${movie.language}</p>
                <a href="${movie.trailerLink}" target="_blank" class="btn watch-trailer-btn">
                    <span>▶</span> Watch Trailer
                </a>
                <div class="tabs">
                    <button class="tab active" id="showlisting-tab">Showlisting</button>
                    <button class="tab" id="reviews-tab">Reviews & More</button>
                </div>
            </div>
            <div class="movie-poster">
                <img src="${movie.poster}" alt="${movie.title} Poster" class="img-fluid">
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
        
        <!-- Date scroll added here -->
        <div class="date-selection">
            <label for="date-picker">Select Date:</label>
            <div id="date-scroll-container" class="date-scroll-container">
                <!-- Date items will be injected here by JS -->
            </div>
        </div>
        
        <div id="show-times" class="show-times-container"></div>
        <div id="reviews" class="reviews-container" style="display: none;"></div>
    </div>
    `;
    movieDetailsContainer.innerHTML = html;

    // Add event listeners for tabs
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

    // Generate the date selection scroll
    generateDateScroll();
}

function generateDateScroll() {
    const dateScrollContainer = document.getElementById("date-scroll-container");
    const currentDate = new Date();

    // Format date to YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];

    // Create date elements for the next 6 days
    for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setDate(currentDate.getDate() + i);

        const dateStr = formatDate(date);
        const dateText = date.toLocaleDateString('en-GB', {
            weekday: 'short',  // "Mon", "Tue", etc.
            day: 'numeric',    // "1", "2", etc.
            month: 'short'     // "Jan", "Feb", etc.
        });

        const dateElement = document.createElement("div");
        dateElement.classList.add("date-item");
        dateElement.dataset.date = dateStr;
        dateElement.innerText = dateText;

        // Add click event to select a date
        dateElement.addEventListener("click", function() {
            // Remove the 'selected' class from all dates
            document.querySelectorAll(".date-item").forEach(item => item.classList.remove("selected"));
            // Add the 'selected' class to the clicked date
            dateElement.classList.add("selected");

            // Store the selected date along with movie details in localStorage
            const selectedMovie = JSON.parse(localStorage.getItem('selectedMovie')) || {};
            selectedMovie.selectedDate = dateStr; // Add selected date
            localStorage.setItem('selectedMovie', JSON.stringify(selectedMovie));
        });

        dateScrollContainer.appendChild(dateElement);
    }
}

function populateShowTimes(theatres, movie) {
    const showTimesContainer = document.getElementById("show-times");
    showTimesContainer.innerHTML = ''; 

    theatres.forEach(theatre => {
        const theatreBlock = `
            <div class="theatre-section">
                <h3>${theatre.name}</h3>
                <div class="showtimes-container">
                    ${theatre.showtimes.map(showtime => `
                        <div class="showtime-item">
                            <a href="seat-selection.html?movieName=${encodeURIComponent(movie.title)}&theatre=${encodeURIComponent(theatre.name)}&date=${JSON.parse(localStorage.getItem('selectedMovie')).selectedDate}" 
                               class="showtime-link">
                                ${showtime.time}
                            </a>
                            <div class="tooltip">Showtime: ${showtime.time}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        showTimesContainer.innerHTML += theatreBlock;
    });

    // Add hover functionality to showtime items
    initializeHoverEffects();
}

function fetchReviews(movieId) {
    // Simulate a fetch to get reviews for the movie
    const reviewsContainer = document.getElementById("reviews");
    reviewsContainer.innerHTML = ""; // Clear existing reviews if any

    // Example reviews data (in real-world scenarios, you can fetch from an API)
    const reviews = [
        {
            username: "john_doe",
            review: "Amazing movie! The storyline was fantastic, and the acting was top-notch.",
            rating: 4
        },
        {
            username: "jane_smith",
            review: "Not as good as expected. The pacing was slow, but the visuals were great.",
            rating: 3
        }
    ];

    // Display reviews
    reviews.forEach(review => {
        const reviewHtml = `
            <div class="review-item">
                <p><strong>${review.username}</strong> - ⭐ ${review.rating} / 5</p>
                <p>${review.review}</p>
            </div>
        `;
        reviewsContainer.innerHTML += reviewHtml;
    });
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
