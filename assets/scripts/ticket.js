document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");
    const ticketPrice = params.get("price");
    const seatCount = params.get("seats");
    const seatNumbers = params.get("seatNumbers");

    if (!movieId) {
        alert("No movie selected.");
        return;
    }

    fetch('../data/movies.json')
        .then(response => response.json())
        .then(data => {
            const movie = data.movies.find(movie => movie.id === movieId);
            if (movie) {
                displayTicketDetails(movie, ticketPrice, seatCount, seatNumbers);
            } else {
                alert("Movie not found.");
            }
        })
        .catch(error => console.error("Error fetching movie data:", error));
});

function displayTicketDetails(movie, ticketPrice, seatCount, seatNumbers) {
    document.getElementById("movie-image").src = movie.poster;
    document.getElementById("movie-name").textContent = movie.name;
    document.getElementById("movie-info").textContent = `${movie.language}, ${movie.format}`;
    document.getElementById("theatre-info").textContent = movie.theatre.name;
    document.getElementById("showtime").textContent = movie.theatre.showtime;

    // Generate QR Code
    const qrCodeText = `Movie: ${movie.name}\nSeats: ${seatNumbers}\nBooking ID: ${generateBookingID()}`;
    generateQRCode(qrCodeText);

    // Display ticket info
    document.getElementById("seats").textContent = `${seatCount} Ticket(s): ${seatNumbers}`;
    document.getElementById("booking-id").textContent = `Booking ID: ${generateBookingID()}`;
    document.getElementById("total-amount").textContent = `₹${ticketPrice}`;
}

function generateQRCode(text) {
    const qrCode = new QRCode(document.getElementById("qr-code"), {
        text: text,
        width: 150,
        height: 150,
    });
}

function generateBookingID() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let id = "";
    for (let i = 0; i < 6; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}