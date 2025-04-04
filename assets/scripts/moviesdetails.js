// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


// OMDB API key
const omdbApiKey = "308bb24e"; 


function getMovieRatingFromAPI(movieTitle) {
   
    const encodedTitle = encodeURIComponent(movieTitle);
    
    //  OMDB API URL
    const apiUrl = `https://www.omdbapi.com/?t=${encodedTitle}&apikey=${omdbApiKey}`;


    //  OMDB API
    return fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.Response === "True") {
            return data.imdbRating || "N/A"; //  "N/A" 
        } else {
            throw new Error("Movie not found in OMDB API");
        }
    })
    .catch(error => {
        console.error("Error fetching movie rating:", error);
        return "N/A"; 
    });

}



// Function to get the movie ID from the URL
function getMovieIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id'); 
}

// Fetch and display movie details
const movieId = getMovieIdFromUrl();  // Get movie ID from URL params
if (movieId) {
    displayMovieDetails(movieId);  // Fetch and display movie details
} else {
    console.log("Movie ID not found in URL.");
}

function displayMovieDetails(movieId) {
    const movieDetailsContainer = document.getElementById("movie-details");

    const movieRef = ref(database, 'movies/' + movieId);

    // Fetch movie data from Firebase
    get(movieRef).then((snapshot) => {
        if (snapshot.exists()) {
            const movie = snapshot.val();
            console.log('movie', movie); // For debugging

            // Fetch the movie rating from OMDB API using the title
            getMovieRatingFromAPI(movie.title).then(rating => {
                const html = `
                    <div class="movie-details-container">
                        <h1 class="movie-title">${movie.title}</h1>
                        <div class="overall-movie-container">
                            <div class="movie-poster">
                                <img src="${movie.poster}" alt="${movie.title} Poster" class="img-fluid">
                            </div>
                            <div class="book-ticket-container">
                                <p><strong>Rating:</strong> ${rating}/10</p>  <!-- Dynamically fetched rating -->
                                <p><strong>Release Date:</strong> ${movie.releaseDate}</p>
                                <p><strong>Duration:</strong> ${movie.duration}</p>
                                <p><strong>Language:</strong> ${movie.language}</p>
                                <p><strong>Genre:</strong> ${movie.genre}</p>
                                <a href="shows&theatres.html?id=${movie.id}" class="btn btn-success">Book Tickets</a><br><br>
                                <a href="${movie.trailerLink}" target="_blank" class="btn btn-primary">
                                    <img src="../images/play-button.png" height="40" width="40"> Watch Trailer
                                </a>
                            </div>
                        </div>
                        <p class="movie-description"><strong>Description:</strong> ${movie.description}</p>
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
                                    <div>${member.name}<br><span style="color: red; text-align: center">${member.role}</span></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                // Insert the HTML into the movie details container
                movieDetailsContainer.innerHTML = html;
            }).catch(error => {
                console.error("Error fetching movie rating:", error);
                movieDetailsContainer.innerHTML = '<p>Could not fetch rating for this movie.</p>';
            });
        } else {
            movieDetailsContainer.innerHTML = '<p>There are no shows available for this movie.</p>';
        }
    }).catch((error) => {
        console.error("Error fetching data: ", error);
        movieDetailsContainer.innerHTML = '<p>Error loading movie details.</p>';
    });
}
