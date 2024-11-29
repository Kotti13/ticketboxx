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
                    <button class="tab active">Showlisting</button>
                    <button class="tab">Reviews & More</button>
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
        <div id="show-times" class="show-times-container"></div>
    </div>
    `;
    movieDetailsContainer.innerHTML = html;
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
                            <a href="seat-selection.html?movieName=${encodeURIComponent(movie.title)}&theatre=${encodeURIComponent(theatre.name)}" 
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



    // Add loading behavior for showtime links
    const showtimeLinks = document.querySelectorAll('.showtime-link');
    showtimeLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            document.getElementById('loading').style.display = 'flex';

            setTimeout(function () {
                window.location.href = link.getAttribute('href');
            }, 1000);
        });
    });

    // Add hover functionality to showtime items
    initializeHoverEffects();
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

// Global loading spinner behavior for dynamic links
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('showtime-link')) {
        event.preventDefault(); // Prevent immediate navigation
        
        // Show the loading spinner
        document.getElementById('loading').style.display = 'flex';
        
        // Simulate a brief delay before redirect
        setTimeout(function () {
            window.location.href = event.target.href;
        }, 1000);
    }
});
