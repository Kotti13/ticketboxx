document.addEventListener("DOMContentLoaded", () => {
    // Retrieve values from sessionStorage
    const selectedMovie = JSON.parse(localStorage.getItem('selectedMovie')) || {};
    const movieName = sessionStorage.getItem('movieName') || "N/A";
    const theatreName = sessionStorage.getItem('theatre') || "N/A";
    const showTime = sessionStorage.getItem('showTime') || "N/A";
    const date = selectedMovie.selectedDate || "N/A"; // Retrieve the stored date
    const seats = sessionStorage.getItem('seats') || "N/A";
    const amount = sessionStorage.getItem('price') || "₹0";

    const customerEmail = localStorage.getItem('userEmail');
    const customerName = "Customer Name"; 

    const bookingId = generateBookingId();

    // Populate the elements with data
    document.getElementById('movieName').textContent = movieName;
    document.getElementById('theatreName').textContent = theatreName;
    document.getElementById('showTime').textContent = showTime;
    document.getElementById('date').textContent = date; // Set the date here
    document.getElementById('seats').textContent = seats;
    document.getElementById('bookingId').textContent = bookingId;
    document.getElementById('amount').textContent = amount;

    fetchMoviePoster(movieName).then(poster => {
        document.getElementById('moviePoster').src = poster;

        downloadTicketPDF(movieName, theatreName, showTime, date, seats, bookingId, amount, poster, customerEmail, customerName);
    }).catch(error => {
        console.error('Error fetching movie poster:', error);
        document.getElementById('moviePoster').src = "../images/default-poster.png"; // Default image if error occurs

        downloadTicketPDF(movieName, theatreName, showTime, date, seats, bookingId, amount, "../images/default-poster.png", customerEmail, customerName);
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
        console.log('Fetched movie data:', data);  

        // Validate that data.movies is an array
        if (!Array.isArray(data.movies)) {
            throw new Error('Movies data is not an array');
        }

        const movie = data.movies.find(movie => {
            console.log('Checking movie:', movie);  
            // Ensure movie.title is a valid string
            if (movie.title && typeof movie.title === 'string') {
                return movie.title.toLowerCase() === movieName.toLowerCase();
            }
            return false; // If title is missing or not a string, skip this movie
        });

        if (movie) {
            console.log('Found movie:', movie);  
            return movie.poster;
        } else {
            console.log('Movie not found:', movieName);  
            throw new Error('Movie not found');
        }
    } catch (error) {
        console.error('Error fetching movie poster:', error);
        return "../images/default-poster.png";  // Return default poster if there's an error
    }
}

function downloadTicketPDF(movieName, theatreName, showTime, date, seats, bookingId, amount, poster, customerEmail, customerName) {
    const { jsPDF } = window.jspdf; // Return default poster if there's an error
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
        console.log("Image loaded successfully.");
        doc.addImage(img, 'JPEG', 20, 100, 50, 75); // Add the image to the PDF
        const pdfData = doc.output('datauristring');
        console.log("PDF generated successfully with image.");

        // Send email without checking if it was already sent
        sendTicketEmail(pdfData, customerEmail, customerName, movieName, theatreName, showTime, date, seats, bookingId, amount);

        // Set timeout of 1000ms and then redirect to home.html
        setTimeout(() => {
            window.location.href = "home.html"; // Redirect after 1000ms (1 second)
        }, 100000000000000);

    }).catch((err) => {
        console.error("Failed to load the image:", err);
        const pdfData = doc.output('datauristring');
        console.log("PDF generated without image.");

        // Send email without checking if it was already sent
        sendTicketEmail(pdfData, customerEmail, customerName, movieName, theatreName, showTime, date, seats, bookingId, amount);

        // Set timeout of 1000ms and then redirect to home.html
        setTimeout(() => {
            window.location.href = "home.html"; // Redirect after 1000ms (1 second)
        }, 10000000);
    });
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });
}

// Initialize EmailJS with your public key (make sure this comes before calling emailjs.send())
emailjs.init('HUyUhaCECVcKvYEaJ');  // Replace with your actual public key

// Send email function remains the same
function sendTicketEmail(pdfData, customerEmail, customerName, movieName, theatreName, showTime, date, seats, bookingId, amount) {
    console.log("Sending email to:", customerEmail);
    emailjs.send('service_pxdwrds', 'template_x9p0hwb', {
        movie_poster: movieName,
        to_name: customerName,
        to_email: customerEmail,
        movie_name: movieName,
        theatre_name: theatreName,
        show_time: showTime,
        date: date,
        seats: seats,
        booking_id: bookingId,
        amount: amount,
        // attachment: pdfData  // Attach PDF as base64 string
    }).then((response) => {
        console.log('Email sent successfully:', response);
    }).catch((error) => {
        console.error('Failed to send email:', error);
    });
}