// Initialize Supabase at the top
// Import Firebase and Supabase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
// Using jsdelivr CDN
// Using unpkg CDN
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2.0.0';


const supabaseUrl = 'https://srjumswibbswcwjntcad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyanVtc3dpYmJzd2N3am50Y2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2Nzk5MzcsImV4cCI6MjA0NTI1NTkzN30.e_ZkFg_EPI8ObvFz70Ejc1W4RGpQurr0SoDlK6IoEXY'; // Your Supabase key
// const supabase = supabase.createClient(supabaseUrl, supabaseKey);
// Initialize Firebase & Supabase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
   
    const selectedMovie = JSON.parse(localStorage.getItem('selectedMovie')) || {};
    const movieName = sessionStorage.getItem('movieName') || "N/A";
    const theatreName = sessionStorage.getItem('theatre') || "N/A";
    // const showTime = sessionStorage.getItem('showTime') || "N/A";
    const date = selectedMovie.selectedDate || "N/A"; // Retrieve the stored date
    const seats = sessionStorage.getItem('seats') || "N/A";
    const amount = sessionStorage.getItem('price') || "₹0";
    const showTime = selectedMovie ? selectedMovie.selectedShowtime : null;

   
    const customerEmail=localStorage.getItem("usermail");
    const customerName = "Customer Name"; 
    
    const bookingId = generateBookingId();

    // Populate the elements with data
    document.getElementById('movieName').textContent = movieName;
    document.getElementById('theatreName').textContent = theatreName;
    document.getElementById('showTime').textContent = showTime;
    document.getElementById('date').textContent = date;
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
        customerName
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

// Fetch movie poster
async function fetchMoviePoster(movieName) {
    try {
        if (!movieName) throw new Error("Movie name is undefined or empty.");
        const response = await fetch('../data/movies.json');
        if (!response.ok) throw new Error('Failed to fetch movie data');
        const data = await response.json();
        const movie = data.movies.find(movie => movie.title.toLowerCase() === movieName.toLowerCase());
        if (movie) return movie.poster;
        throw new Error('Movie not found');
    } catch (error) {
        console.error('Error fetching movie poster:', error);
        return "../images/default-poster.png"; // Return default poster if there's an error
    }
}

// Function to download the ticket PDF
function downloadTicketPDF(movieName, theatreName, showTime, date, seats, bookingId, amount, poster, customerEmail, customerName) {
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

    // Load the movie poster and add it to the PDF
    loadImage(poster).then((img) => {
        doc.addImage(img, 'JPEG', 20, 100, 50, 75);
        const pdfData = doc.output('datauristring');
        sendTicketEmail(pdfData, customerEmail, customerName, movieName, theatreName, showTime, date, seats, bookingId, amount).then(() => {
            // Show popup and redirect only after email is sent
            document.getElementById("emailPopup").style.display = "block";
            setTimeout(() => {
                window.location.href = "home.html"; // Redirect after the email is sent
            }, 10000000000000); // Reasonable delay after email is sent
        }).catch((err) => {
            console.error('Error sending email:', err);
            setTimeout(() => {
                window.location.href = "home.html"; // Redirect even if email sending fails
            }, 2000); // Redirect after 2 seconds even if email fails
        });
    }).catch((err) => {
        console.error("Failed to load the image:", err);
        const pdfData = doc.output('datauristring');
        sendTicketEmail(pdfData, customerEmail, customerName, movieName, theatreName, showTime, date, seats, bookingId, amount).then(() => {
            document.getElementById("emailPopup").style.display = "block";
            setTimeout(() => {
                window.location.href = "home.html"; // Redirect after the email is sent
            }, 2000);
        }).catch((err) => {
            console.error('Error sending email:', err);
            setTimeout(() => {
                window.location.href = "home.html"; // Redirect even if email sending fails
            }, 2000); // Redirect after 2 seconds
        });
    });
}


// Function to load image (poster)
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });
}
emailjs.init('HUyUhaCECVcKvYEaJ');  // Replace with your actual public key
// Send ticket email via EmailJS
function sendTicketEmail(pdfData, customerEmail, customerName, movieName, theatreName, showTime, date, seats, bookingId, amount) {
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
    }).then((response) => {
        console.log('Email sent successfully:', response);
    }).catch((error) => {
        console.error('Failed to send email:', error);
    });
}

// Save ticket details to Supabase
async function saveBookingToSupabase(ticketData) {
    try {
        const { data, error } = await supabase
            .from('bookings') // Your Supabase table name
            .insert([
                {
                    booking_id: ticketData.bookingId,
                    movie_name: ticketData.movieName,
                    theatre_name: ticketData.theatreName,
                    show_time: ticketData.showTime,
                    booking_date: formatDate(ticketData.date), // Ensure the date is in the correct format
                    seats: ticketData.seats,
                    amount: parseFloat(ticketData.amount.replace('₹', '').trim()), // Ensure amount is stored as a number
                    customer_email: ticketData.customerEmail,
                    customer_name: ticketData.customerName || '', // Handle missing customer name
                }
            ]);
        
        if (error) {
            throw new Error(error.message); // More detailed error message
        } else {
            console.log('Ticket saved to Supabase:', data);
        }
    } catch (error) {
        console.error('Error saving ticket to Supabase:', error);
    }
}

// Function to format date as YYYY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
