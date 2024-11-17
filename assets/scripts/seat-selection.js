document.addEventListener("DOMContentLoaded", function () {
    // Extract query parameters
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");
    const theatreName = params.get("theatre");
    const showtime = params.get("showtime");

    // Containers
    const movieTitleElement = document.getElementById("movie-title");
    const theatreDetailsElement = document.getElementById("theatre-details");
    const contentContainer = document.getElementById("content");

    // Validate query parameters
    if (!movieId || !theatreName || !showtime) {
        contentContainer.innerHTML = "<p>Invalid selection. Please go back and select a movie.</p>";
        return;
    }

    // Fetch movie data
    fetch('../data/movies.json')
        .then(response => response.json())
        .then(data => {
            const movie = data.movies.find(movie => movie.id === movieId);
            if (movie) {
                // Populate the page with movie title and theatre details
                movieTitleElement.textContent = movie.title;
                theatreDetailsElement.textContent = `${theatreName} | Showtime: ${showtime}`;
            } else {
                contentContainer.innerHTML = "<p>Movie details not found.</p>";
            }
        })
        .catch(error => {
            console.error("Error fetching movie data:", error);
            contentContainer.innerHTML = "<p>Unable to load details.</p>";
        });
});
