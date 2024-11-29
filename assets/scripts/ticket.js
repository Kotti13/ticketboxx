document.addEventListener("DOMContentLoaded", () => {
    // Retrieve values from sessionStorage
    const movieName = sessionStorage.getItem('movieName') || "N/A";
    const theatreName = sessionStorage.getItem('theatre') || "N/A";
    const showTime = sessionStorage.getItem('showTime') || "N/A";
    const date = sessionStorage.getItem('date') || "N/A";
    const seats = sessionStorage.getItem('seats') || "N/A";
    const amount = sessionStorage.getItem('price') || "₹0";

    // Generate a random 7-character booking ID
    const bookingId = generateBookingId();

    // Set values in the HTML elements for ticket details
    document.getElementById('movieName').textContent = movieName;
    document.getElementById('theatreName').textContent = theatreName;
    document.getElementById('showTime').textContent = showTime;
    document.getElementById('date').textContent = date;
    document.getElementById('seats').textContent = seats;
    document.getElementById('bookingId').textContent = bookingId;
    document.getElementById('amount').textContent = amount;

    // Fetch movie poster dynamically based on movie name
    fetchMoviePoster(movieName).then(poster => {
        document.getElementById('moviePoster').src = poster;
    }).catch(error => {
        console.error('Error fetching movie poster:', error);
        document.getElementById('moviePoster').src = "../images/default-poster.png"; // Default image if error occurs
    });

    // Save the booking ID in sessionStorage (optional)
    sessionStorage.setItem('bookingId', bookingId);

    // Generate QR Code
    const qrData = {
        movieName,
        theatreName,
        showTime,
        date,
        seats,
        bookingId,
    };
    new QRCode(document.getElementById("qrcode"), {
        text: JSON.stringify(qrData),
        width: 128,
        height: 128,
    });

    // Add event listener to the download button
    document.getElementById('downloadBtn').addEventListener('click', () => {
        downloadTicketPDF(movieName, theatreName, showTime, date, seats, bookingId, amount, poster);
    });
});

// Function to generate a random booking ID
function generateBookingId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let id = "";
    for (let i = 0; i < 7; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

async function fetchMoviePoster(movieName) {
    try {
        // Check if movieName is provided
        if (!movieName) {
            throw new Error("Movie name is undefined or empty.");
        }

        const response = await fetch('../data/movies.json');
        if (!response.ok) {
            throw new Error('Failed to fetch movie data');
        }

        const data = await response.json();
        console.log('Fetched movie data:', data);  // Log the entire data for debugging

        // Validate that data.movies is an array
        if (!Array.isArray(data.movies)) {
            throw new Error('Movies data is not an array');
        }

        const movie = data.movies.find(movie => {
            console.log('Checking movie:', movie);  // Log each movie
            // Ensure movie.title is a valid string
            if (movie.title && typeof movie.title === 'string') {
                return movie.title.toLowerCase() === movieName.toLowerCase();
            }
            return false; // If title is missing or not a string, skip this movie
        });

        if (movie) {
            console.log('Found movie:', movie);  // Log the found movie
            return movie.poster;
        } else {
            console.log('Movie not found:', movieName);  // Log if movie is not found
            throw new Error('Movie not found');
        }
    } catch (error) {
        console.error('Error fetching movie poster:', error);
        return "../images/default-poster.png";  // Return default poster if there's an error
    }
}




function downloadTicketPDF(movieName, theatreName, showTime, date, seats, bookingId, amount, poster) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add ticket details to the PDF
    doc.setFontSize(16);
    doc.text('Your Movie Ticket', 20, 20);
    doc.setFontSize(12);
    doc.text(`Movie: ${movieName}`, 20, 30);
    doc.text(`Theatre: ${theatreName}`, 20, 40);
    doc.text(`Show Time: ${showTime}`, 20, 50);
    doc.text(`Date: ${date}`, 20, 60);
    doc.text(`Seats: ${seats}`, 20, 70);
    doc.text(`Booking ID: ${bookingId}`, 20, 80);
    doc.text(`Amount: ${amount}`, 20, 90);

    // Load the movie poster asynchronously and add it to the PDF
    loadImage(poster).then((img) => {
        // Adding the image to the PDF
        doc.addImage(img, 'JPEG', 20, 100, 50, 75);
        doc.save(`ticket_${bookingId}.pdf`);
    }).catch(() => {
        // In case of an error, just save the PDF without the image
        console.error("Failed to load the image.");
        doc.save(`ticket_${bookingId}.pdf`);
    });
}

// Helper function to load the image asynchronously
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}
