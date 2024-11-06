// script.js

// Simulated movie data
const movieData = {
    "Bloody Beggar": {
        "genre": "Comedy Drama",
        "language": "Tamil - 2D",
        "showtimes": [
            { "theater": "INOX: The Marina Mall, OMR", "time": "10:50 PM", "info": "M-Ticket Food & Beverage", "cancellation": "Cancellation Available" },
            { "theater": "MAYAJAAL Multiplex: ECR, Chennai", "time": "11:55 PM", "info": "M-Ticket Food & Beverage", "cancellation": "Non-cancellable" },
            { "theater": "PVR: Aerohub, Chennai", "time": "10:25 PM", "info": "M-Ticket Food & Beverage", "cancellation": "Cancellation Available" },
            // Add more showtimes as needed
        ]
    }
};

// Function to get the movie name from URL parameters
function getMovieName() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('movie') || 'Bloody Beggar'; // Default to 'Bloody Beggar' for this example
}

// Function to display movie details
function displayMovieDetails(movie) {
    const titleElement = document.getElementById('movie-title');
    const genreElement = document.getElementById('movie-genre');
    const languageElement = document.getElementById('movie-language');
    const showtimesContainer = document.getElementById('showtimes-container');

    titleElement.textContent = movie;
    genreElement.textContent = movieData[movie].genre;
    languageElement.textContent = movieData[movie].language;

    const showtimes = movieData[movie].showtimes;
    showtimesContainer.innerHTML = ''; // Clear previous showtimes

    showtimes.forEach(showtime => {
        const showtimeDiv = document.createElement('div');
        showtimeDiv.innerHTML = `
            <strong>${showtime.theater}</strong>
            <p>Time: ${showtime.time}</p>
            <p>Info: ${showtime.info}</p>
            <p>${showtime.cancellation}</p>
            <hr>
        `;
        showtimesContainer.appendChild(showtimeDiv);
    });
}

// On load, display the movie details
window.onload = function() {
    const movieName = getMovieName();
    displayMovieDetails(movieName);
};
