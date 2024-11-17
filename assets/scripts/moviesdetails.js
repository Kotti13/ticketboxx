document.addEventListener("DOMContentLoaded", function() { 
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");

    if (!movieId) {
        document.getElementById("movie-details").innerHTML = "<p>No movie selected.</p>";
        return;
    }

    fetch('../data/movies.json')
        .then(response => response.json())
        .then(data => {
            const movie = data.movies.find(movie => movie.id === movieId);
            if (movie) {
                displayMovieDetails(movie);
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
            <div class="movie-poster">
                <img src="${movie.poster}" alt="${movie.title} Poster" class="img-fluid">
            </div>
            <div class="book-ticket-container">
                <p><strong>Rating:</strong> ${movie.rating}</p>
                <p><strong>Release Date:</strong> ${movie.releaseDate}</p>
                <p><strong>Duration:</strong> ${movie.duration}</p>
                <p><strong>Language:</strong> ${movie.language}</p>
                <p><strong>Genre:</strong> ${movie.genre}</p>
                <a href="shows&theatres.html?id=${movie.id}" class="btn btn-success">Book Tickets</a>
            </div>
        </div>
        <p><strong>Description:</strong> ${movie.description}</p>
        <p><strong>About Movie:</strong> ${movie.about}</p>

        <h2>Cast</h2>
        <div class="cast-container">
            ${movie.cast.map(actor => `
                <div class="cast-member">
                    <img src="${actor.image}" alt="${actor.name}" class="cast-photo">
                    <div>${actor.name} <br><span style="color: red; text-align: center">${actor.role}</span></div>
                </div>
            `).join('')}
        </div>

        <h2>Crew</h2>
        <div class="crew-container">
            ${movie.crew.map(member => `
                <div class="crew-member">
                    <img src="${member.image}" alt="${member.name}" class="crew-photo">
                    <div>${member.name}</div>
                </div>
            `).join('')}
        </div>

        <h2>Trailer</h2>
        <a href="${movie.trailerLink}" target="_blank" class="btn btn-primary">
            <img src="../images/play-button.png" height="40" width="40"> Watch Trailer
        </a>
        <br><br>
    </div>
    
    `;
    movieDetailsContainer.innerHTML = html;
}
