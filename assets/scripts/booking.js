document.addEventListener("DOMContentLoaded", function() { 
    // Get movie ID from URL parameters
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");

    // If no movieId is provided in the URL, display a message
    if (!movieId) {
        document.getElementById("movie-details").innerHTML = "<p>No movie selected.</p>";
        return;
    }

    // Fetch the movie data from the JSON file
    fetch('../data/movies.json')
        .then(response => response.json())
        .then(data => {
            // Find the movie by its ID
            const movie = data.movies.find(movie => movie.id === movieId);
            if (movie) {
                // If movie found, display the movie details
                displayMovieDetails(movie);
            } else {
                // If movie not found, display an error message
                document.getElementById("movie-details").innerHTML = "<p>Movie not found.</p>";
            }
        })
        .catch(error => {
            // Handle any errors with fetching the movie data
            console.error("Error fetching movie data:", error);
            document.getElementById("movie-details").innerHTML = "<p>Unable to load movie details.</p>";
        });
});

function displayMovieDetails(movie) {
    const movieDetailsContainer = document.getElementById("movie-details");

    // Generate the HTML content for the movie details
    const html = `
    <div class="movie-details-container">
        <h1 class="movie-title">${movie.title}</h1>
        <div class="overall-movie-container">
            <div class="movie-poster">
                <img src="${movie.poster}" alt="${movie.title} Poster" class="img-fluid">
            </div>
            <div class="book-ticket-container">
                <p><strong>Rating:</strong> ${movie.rating || "N/A"}</p>
                <p><strong>Release Date:</strong> ${movie.releaseDate || "N/A"}</p>
                <p><strong>Duration:</strong> ${movie.duration || "N/A"}</p>
                <p><strong>Language:</strong> ${movie.language || "N/A"}</p>
                <p><strong>Genre:</strong> ${movie.genre || "N/A"}</p>
                <a href="booking.html?id=${movie.id}" class="btn btn-success">Book Tickets</a>
            </div>
        </div>
        <p><strong>Description:</strong> ${movie.description || "No description available."}</p>
        <p><strong>About Movie:</strong> ${movie.about || "No additional information."}</p>

        <h2>Cast</h2>
        <div class="cast-container">
            ${movie.cast && movie.cast.length > 0 
                ? movie.cast.map(actor => `
                    <div class="cast-member">
                        <img src="${actor.image}" alt="${actor.name}" class="cast-photo">
                        <div>${actor.name} <br><span style="color: red; text-align: center">${actor.role}</span></div>
                    </div>`).join('')
                : "<p>No cast information available.</p>"
            }
        </div>

        <h2>Crew</h2>
        <div class="crew-container">
            ${movie.crew && movie.crew.length > 0 
                ? movie.crew.map(member => `
                    <div class="crew-member">
                        <img src="${member.image}" alt="${member.name}" class="crew-photo">
                        <div>${member.name}</div>
                    </div>`).join('')
                : "<p>No crew information available.</p>"
            }
        </div>

        <h2>Trailer</h2>
        <a href="${movie.trailerLink}" target="_blank" class="btn btn-primary">
            <img src="../images/play-button.png" height="40" width="40" alt="Play Button"> Watch Trailer
        </a>
        <br><br>
    </div>
    `;
    
    // Insert the generated HTML into the container
    movieDetailsContainer.innerHTML = html;
}
