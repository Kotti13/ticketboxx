document.addEventListener("DOMContentLoaded", function() { 
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("movieId");
    const language = params.get("language");

    if (!movieId || !language) {
        document.getElementById("movie-details").innerHTML = "<p>No movie selected or invalid language.</p>";
        return;
    }

    fetch('../data/movies.json')
        .then(response => response.json())
        .then(data => {
            const movie = data.movies.find(movie => movie.id === movieId);
            if (movie) {
                displayMovieDetails(movie, language);
            } else {
                document.getElementById("movie-details").innerHTML = "<p>Movie not found.</p>";
            }
        })
        .catch(error => {
            console.error("Error fetching movie data:", error);
            document.getElementById("movie-details").innerHTML = "<p>Unable to load movie details.</p>";
        });
});

function displayMovieDetails(movie, language) {
    const movieDetailsContainer = document.getElementById("movie-details");
    const html = `
    <div class="movie-details-container">
        <h1 class="movie-title">${movie.title} - ${language}</h1>
        <div class="overall-movie-container">
            <div class="movie-poster">
                <img src="${movie.poster}" alt="${movie.title} Poster" class="img-fluid">
            </div>
            <div class="showtimes-container">
                <p><strong>Showtimes for ${language}:</strong></p>
                <ul>
                    ${movie.showtimes[language].map(showtime => `
                        <li><a href="#" class="showtime">${showtime}</a></li>
                    `).join('')}
                </ul>
            </div>
        </div>
    </div>
    `;
    movieDetailsContainer.innerHTML = html;
}
