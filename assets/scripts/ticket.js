import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2.0.0';
// Import the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const supabaseUrl = 'https://srjumswibbswcwjntcad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyanVtc3dpYmJzd2N3am50Y2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2Nzk5MzcsImV4cCI6MjA0NTI1NTkzN30.e_ZkFg_EPI8ObvFz70Ejc1W4RGpQurr0SoDlK6IoEXY';

//  const movieRef = ref(database, 'movies/' + movieId);

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
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
    // Retrieve data from localStorage
    const selectedMovie = JSON.parse(localStorage.getItem('selectedMovie')) || {};
    const selectedSeats = JSON.parse(localStorage.getItem('clickedSeatsDetails')) || [];
    console.log(selectedMovie)
    
    // const { title: movieName, selectedTheatre: theatreName, date, showTime } = selectedMovie;
    console.log(`selected movie${selectedMovie.selectedDate}`)
    console.log(`${selectedMovie.selectedShowtime}`)


    const movieName = selectedMovie.title || "N/A";
    const theatreName = selectedMovie.selectedTheatre || "N/A";
    const date = selectedMovie.selectedDate || "N/A";
    const showTime = selectedMovie.selectedShowtime || "N/A";
    
    // Use the selectedSeats array to display the seats on the page
    const seats = selectedSeats.join(", ");  
    console.log(seats)
    const amount = JSON.parse(localStorage.getItem('totalPrice')) || "₹0";
    const customerEmail = localStorage.getItem("usermail") || "";
    const customerName = localStorage.getItem('username');  // Replace this with actual user data if available
    const bookingId = generateBookingId();

    // Update UI with booking information
    document.getElementById('movieName').textContent = movieName;
    document.getElementById('theatreName').textContent = theatreName;
    document.getElementById('showTime').textContent = showTime;
    document.getElementById('date').textContent = date;
    document.getElementById('seats').textContent = seats;
    document.getElementById('bookingId').textContent = bookingId;
    document.getElementById('amount').textContent = amount;

    // Fetch movie poster and generate ticket
    fetchMoviePoster(movieName).then(poster => {
        document.getElementById('moviePoster').src = poster;
        downloadTicketPDF(movieName, theatreName, showTime, date, seats, bookingId, amount, poster, customerEmail, customerName);
    }).catch(error => {
        console.error('Error fetching movie poster:', error);
        document.getElementById('moviePoster').src = "../images/default-poster.png";
        downloadTicketPDF(movieName, theatreName, showTime, date, seats, bookingId, amount, "../images/default-poster.png", customerEmail, customerName);
    });

    // Store bookingId in sessionStorage
    sessionStorage.setItem('bookingId', bookingId);

    // Generate QR Code with booking details
    const qrData = { movieName, theatreName, showTime, date, seats, bookingId };
    new QRCode(document.getElementById("qrcode"), {
        text: JSON.stringify(qrData),
        width: 128,
        height: 128,
    });

   
    // Save booking to Supabase
await saveBookingToSupabase({
    bookingId,
    movieName,
    theatreName,
    showTime,
    date,
    seats,
    amount,
    customerEmail,
    customerName,
    selectedDate: selectedMovie.selectedDate || date, // Pass selectedDate explicitly
});

});

// Generate a random booking ID
function generateBookingId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let id = "";
    for (let i = 0; i < 7; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}
const selected=JSON.parse(localStorage.getItem('selectedMovie'))
console.log(selected)
const poster =selected.poster;

// Fetch movie poster from local data source
async function fetchMoviePoster() {
    const selected=JSON.parse(localStorage.getItem('selectedMovie'))
console.log(selected)
const poster =selected.poster;
console.log(poster)
   return poster
}


// Download ticket as PDF
function downloadTicketPDF(movieName, theatreName, showTime, date, seats, bookingId, amount, poster, customerEmail, customerName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

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

    loadImage(poster).then((img) => {
        doc.addImage(img, 'JPEG', 20, 100, 50, 75);
        const pdfData = doc.output('datauristring');

        // Send ticket email and redirect
        sendTicketEmail(pdfData, customerEmail, customerName, movieName, theatreName, showTime, date, seats, bookingId, amount)
            .then(() => {
                console.log('Email sent successfully!');
                showSuccessMessageAndRedirect();
            })
            .catch((err) => {
                console.error('Error sending email:', err);
                alert('Failed to send email. Please try again.');
            });
    }).catch((err) => {
        console.error("Failed to load the image:", err);
        alert('Failed to generate the ticket. Please try again.');
    });
}

// Show success message and redirect after ticket is generated
function showSuccessMessageAndRedirect() {
    const successMessage = document.createElement('div');
    successMessage.textContent = 'Your ticket has been successfully generated and emailed to you!';
    successMessage.style.position = 'fixed';
    successMessage.style.top = '50%';
    successMessage.style.left = '50%';
    successMessage.style.transform = 'translate(-50%, -50%)';
    successMessage.style.padding = '20px';
    successMessage.style.backgroundColor = '#4caf50';
    successMessage.style.color = '#fff';
    successMessage.style.borderRadius = '5px';
    successMessage.style.zIndex = '1000';
    document.body.appendChild(successMessage);

    // Clear local storage data after success message
    // clearLocalStorageData();

    setTimeout(() => {
        window.location.href = "../pages/home.html";
    }, 5000);  // Redirect after 5 seconds
}

// Function to clear local storage items after booking is completed
function clearLocalStorageData() {
    // localStorage.removeItem('selectedMovie');
    // localStorage.removeItem('clickedSeatsDetails');
    // localStorage.removeItem('totalPrice');
    // sessionStorage.removeItem('bookingId');  // Optional: if you want to clear session storage as well
    // console.log("Local storage cleared.");
}

// Load an image asynchronously
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });
}

// Initialize EmailJS
emailjs.init('ZuZLrLJOaiaonlV8M');

// Send ticket email using EmailJS
function sendTicketEmail(pdfData, customerEmail, customerName, movieName, theatreName, showTime, date, seats, bookingId, amount) {
    return emailjs.send('service_jeimr7d', 'template_ow3x08t', {
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
    });
}

// Save booking data to Supabase
async function saveBookingToSupabase(ticketData) {
    try {
        const bookingDate = formatDate(ticketData.selectedDate);
        if (!bookingDate) {
            throw new Error('Invalid booking date');
        }

        const { data, error } = await supabase
            .from('bookings')
            .insert([{
                booking_id: ticketData.bookingId,
                movie_name: ticketData.movieName,
                theatre_name: ticketData.theatreName,
                show_time: ticketData.showTime,
                booking_date: bookingDate,
                seats: ticketData.seats,
                amount: Math.round(ticketData.amount), // Ensure amount is a valid integer
                customer_email: ticketData.customerEmail,
                customer_name: ticketData.customerName || '',
            }]);

        if (error) {
            throw new Error(error.message);
        } else {
            console.log('Ticket saved to Supabase:', data);
        }
    } catch (error) {
        console.error('Error saving ticket to Supabase:', error);
    }
}




// Format date as YYYY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
console.log(seats)