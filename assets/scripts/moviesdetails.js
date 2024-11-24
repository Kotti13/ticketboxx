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

// Function to get the movie ID from the URL
function getMovieIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id'); // 'id' is the query parameter for movieId
}

// Function to display movie details
function displayMovieDetails(movieId) {
    const movieDetailsContainer = document.getElementById("movie-details");

    // Reference to the movie in Firebase based on movie ID
    const movieRef = ref(database, 'movies/' + movieId);

    // Fetch movie data from Firebase
    get(movieRef).then((snapshot) => {
        if (snapshot.exists()) {
            const movie = snapshot.val();

            // Create the HTML structure based on the movie data
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

            // Insert the HTML into the movie details container
            movieDetailsContainer.innerHTML = html;
        } else {
            movieDetailsContainer.innerHTML = '<p>Movie not found.</p>';
        }
    }).catch((error) => {
        console.error("Error fetching data: ", error);
        movieDetailsContainer.innerHTML = '<p>Error loading movie details.</p>';
    });
}

// Example usage: Get the movie ID from URL and display movie details
const movieId = getMovieIdFromUrl();  // Get movie ID from URL params
if (movieId) {
    displayMovieDetails(movieId);  // Fetch and display movie details
} else {
    console.log("Movie ID not found in URL.");
}
