// Import Firebase and Supabase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2.0.0';

// Firebase and Supabase configuration
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

const supabaseUrl = 'https://srjumswibbswcwjntcad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyanVtc3dpYmJzd2N3am50Y2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2Nzk5MzcsImV4cCI6MjA0NTI1NTkzN30.e_ZkFg_EPI8ObvFz70Ejc1W4RGpQurr0SoDlK6IoEXY';
const supabase = createClient(supabaseUrl, supabaseKey);

function getMovieIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}
// Get Movie ID from URL
document.addEventListener("DOMContentLoaded", function () {
    const movieId = getMovieIdFromUrl();
    if (!movieId) {
        document.getElementById("movie-details").innerHTML = "<p>No movie selected.</p>";
        return;
    }

    const movieRef = ref(database, `movies/${movieId}`);
    get(movieRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const movie = snapshot.val();
                displayMovieDetails(movie);
                //populateshowtimesremoved
                localStorage.setItem('selectedMovie', JSON.stringify(movie));
            } else {
                document.getElementById("movie-details").innerHTML = "<p>Movie not found.</p>";
            }
        })
        .catch((error) => {
            console.error("Error fetching movie data:", error);
            document.getElementById("movie-details").innerHTML = "<p>Unable to load movie details. Please try again later.</p>";
        });
});


// Display movie details on the page
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
                    <a href="${movie.trailerLink || "#"}" target="_blank" class="btn watch-trailer-btn">▶ Watch Trailer</a>
                    <div class="tabs">
                        <button class="tab active" id="showlisting-tab">Showlisting</button>
                        <button class="tab" id="reviews-tab">Reviews</button>
                    </div>
                </div>
                <div class="movie-poster">
                    <img src="${movie.poster || 'default-poster.jpg'}" alt="${movie.title || 'Poster'}" class="img-fluid">
                </div>
            </div>
            <div class="location-dropdown"><span class="location-icon">📍</span><select class="location-select"><option>Chennai (only)</option></select></div>
            <div class="date-selection"><label for="date-picker">Select Date:</label><div id="date-scroll-container" class="date-scroll-container"></div></div>
            <div id="show-times" class="show-times-container" style="display: none;"></div>
            <div id="reviews" class="reviews-container" style="display: none;"></div>
            <div id="comment-section">
                <h3>Leave a Comment</h3>
                <textarea id="comment-box" placeholder="Write your comment here..."></textarea>
                <button id="submit-comment" class="btn">Submit Comment</button>
                <div id="comment-list"><h4>Comments:</h4></div>
            </div>
        </div>
    `;
    movieDetailsContainer.innerHTML = html;

    document.getElementById("showlisting-tab").addEventListener("click", () => {
        toggleTabs(true);
    });
    document.getElementById("reviews-tab").addEventListener("click", () => {
        toggleTabs(false);
        fetchComments(movie.id);
    });

    generateDateScroll();
    fetchComments(movie.id);

    document.getElementById("submit-comment").addEventListener("click", () => {
        const commentText = document.getElementById("comment-box").value.trim();
        if (commentText) {
            const username = localStorage.getItem('username') || 'Guest';
            addComment(movie.id, username, commentText);
            document.getElementById("comment-box").value = '';
        } else {
            alert("Please write a comment before submitting.");
        }
    });
}

// Toggle between showtimes and reviews tab
function toggleTabs(showShowtimes) {
    document.getElementById("showlisting-tab").classList.toggle("active", showShowtimes);
    document.getElementById("reviews-tab").classList.toggle("active", !showShowtimes);
    document.getElementById("show-times").style.display = showShowtimes ? "block" : "none";
    document.getElementById("reviews").style.display = showShowtimes ? "none" : "block";
}

// Fetch and display comments
async function fetchComments(movieId) {
    const { data, error } = await supabase
        .from('comments')
        .select('username, comment, timestamp')
        .eq('movie_id', movieId);

    if (error) {
        console.error("Error fetching comments:", error);
        return;
    }

    const commentList = document.getElementById("comment-list");
    commentList.innerHTML = data.length ? data.map(comment => `
        <div class="comment-item">
            <p><strong>${comment.username}</strong> - ${new Date(comment.timestamp).toLocaleString()}</p>
            <p>${comment.comment}</p>
        </div>
    `).join('') : "<p>No comments yet.</p>";
}

// Add new comment to Supabase
 async function addComment(movieId, username, commentText) {
    const { error } =await  supabase
        .from('comments')
        .insert([{ movie_id: movieId, username, comment: commentText }]);

    if (error) {
        console.error("Error adding comment:", error);
        return;
    }

    fetchComments(movieId);
}


// Generate the date selection scroll
function generateDateScroll() {
    const dateScrollContainer = document.getElementById("date-scroll-container");
    const currentDate = new Date();
    const allDates = Array.from({ length: 5 }, (_, i) => {
        const date = new Date();
        date.setDate(currentDate.getDate() + i);
        return { dateText: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }), date };
    });

    allDates.forEach((dateObj, index) => {
        const dateElement = document.createElement("div");
        dateElement.classList.add("date-item");
        dateElement.innerText = dateObj.dateText;

        dateElement.addEventListener("click", () => {
            // Clear previous selections
            document.querySelectorAll(".date-item").forEach(item => item.classList.remove("selected"));
            dateElement.classList.add("selected");

            // Update local storage with selected date
            const selectedMovie = JSON.parse(localStorage.getItem('selectedMovie')) || {};
            selectedMovie.selectedDate = dateObj.date.toISOString().split('T')[0];
            localStorage.setItem('selectedMovie', JSON.stringify(selectedMovie));

            // Check if selected date is today
            const isCurrentDate = dateObj.date.toDateString() === currentDate.toDateString();

            // Fetch and show showtimes
            populateShowTimes(selectedMovie.theatres, selectedMovie, isCurrentDate);
        });

        dateScrollContainer.appendChild(dateElement);
    });
}





// Populate the showtimes for the selected movie
function populateShowTimes(theatres = [], movie, isCurrentDate = false) {
    const showTimesContainer = document.getElementById("show-times");

    // Clear previous showtimes and ensure the container is hidden initially
    showTimesContainer.innerHTML = '';
    showTimesContainer.style.display = 'none';

    if (!theatres.length) {
        showTimesContainer.innerHTML = "<p>No showtimes available.</p>";
        showTimesContainer.style.display = 'block'; // Show this message if no theatres exist
        return;
    }

    const currentTime = new Date().getHours() * 60 + new Date().getMinutes(); // Current time in minutes
    theatres.forEach(theatre => {
        const theatreBlock = `
            <div class="theatre-section">
                <h3>${theatre.name}</h3>
                <div class="showtimes-container">
                    ${theatre.showtimes.filter(showtime => {
                        const [_, time] = parseShowtime(showtime.time);
                        const [hours, minutes] = convertTo24HourFormat(time).split(":").map(Number);
                        const showtimeInMinutes = hours * 60 + minutes;

                        // Validate based on selected date
                        if (isCurrentDate) {
                            return showtimeInMinutes >= currentTime;
                        }
                        return true;
                    }).map(showtime => `
                        <div class="showtime-item">
                            <a href="seat-selection.html" class="showtime-link" data-showtime="${showtime.time}" data-theatre="${theatre.name}">
                                ${showtime.time} ${showtime.screenType ? `(${showtime.screenType})` : ''}
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        showTimesContainer.innerHTML += theatreBlock;
    });

    // Add event listeners to showtime links
    document.querySelectorAll('.showtime-link').forEach(link => {
        link.addEventListener('click', function () {
            const selectedMovie = JSON.parse(localStorage.getItem('selectedMovie')) || {};
            selectedMovie.selectedShowtime = this.getAttribute('data-showtime');
            selectedMovie.selectedTheatre = this.getAttribute('data-theatre');
            localStorage.setItem('selectedMovie', JSON.stringify(selectedMovie));
        });
    });

    // Display the container after populating it
    showTimesContainer.style.display = 'block';
}





// Convert time to 24-hour format
function convertTo24HourFormat(time) {
    const [hours, minutes, suffix] = time.split(/[:\s]/);
    let newHours = parseInt(hours);
    if (suffix === "PM" && newHours !== 12) {
        newHours += 12;
    }
    if (suffix === "AM" && newHours === 12) {
        newHours = 0;
    }
    return `${newHours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

// Parse showtime for screen type and time
function parseShowtime(showtime) {
    let screenType = '';
    let time = showtime;
    if (showtime.includes('Imax')) {
        screenType = 'Imax';
        time = showtime.replace('Imax', '').trim();
    } 
    return [screenType, time];
}







console.log(localStorage.getItem('selectedMovie'));
