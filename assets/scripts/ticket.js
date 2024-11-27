document.addEventListener("DOMContentLoaded", () => {
    // Retrieve ticket details from localStorage
    const movieName = sessionStorage.getItem('movieName');
    const theatreName = sessionStorage.getItem('theatre');
    const showTime = sessionStorage.getItem('showTime');
    const date = sessionStorage.getItem('date');
    const seats = sessionStorage.getItem('seats');
    const poster = sessionStorage.getItem('poster');
    const amount = sessionStorage.getItem('price') || '₹0';

    // Generate a random 7-character booking ID
    const bookingId = generateBookingId();

    // Set values in the HTML
    document.getElementById('movieName').textContent = movieName || "N/A";
    document.getElementById('theatreName').textContent = theatreName || "N/A";
    document.getElementById('showTime').textContent = showTime || "N/A";
    document.getElementById('date').textContent = date || "N/A";
    document.getElementById('seats').textContent = seats || "N/A";
    document.getElementById('moviePoster').src = poster || "../images/default-poster.png";
    document.getElementById('bookingId').textContent = bookingId;
    document.getElementById('amount').textContent = amount;

    // Save the booking ID in localStorage
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
    const qrCodeContainer = document.getElementById("qrcode");
    new QRCode(qrCodeContainer, {
        text: JSON.stringify(qrData),
        width: 128,
        height: 128,
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
