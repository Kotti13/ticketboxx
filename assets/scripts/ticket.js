import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2.0.0';

const supabaseUrl = 'https://srjumswibbswcwjntcad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyanVtc3dpYmJzd2N3am50Y2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2Nzk5MzcsImV4cCI6MjA0NTI1NTkzN30.e_ZkFg_EPI8ObvFz70Ejc1W4RGpQurr0SoDlK6IoEXY';

const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
    const selectedMovie = JSON.parse(localStorage.getItem('selectedMovie')) || {};
    const movieName = sessionStorage.getItem('movieName') || "N/A";
    const theatreName = sessionStorage.getItem('theatre') || "N/A";
    const date = selectedMovie.selectedDate || "N/A";
    const seats = sessionStorage.getItem('seats') || "N/A";
    const amount = sessionStorage.getItem('price') || "₹0";
    const showTime = selectedMovie ? selectedMovie.selectedShowtime : null;
    const customerEmail = localStorage.getItem("usermail");
    const customerName = "Customer Name";
    const bookingId = generateBookingId();

    document.getElementById('movieName').textContent = movieName;
    document.getElementById('theatreName').textContent = theatreName;
    document.getElementById('showTime').textContent = showTime;
    document.getElementById('date').textContent = date;
    document.getElementById('seats').textContent = seats;
    document.getElementById('bookingId').textContent = bookingId;
    document.getElementById('amount').textContent = amount;

    fetchMoviePoster(movieName).then(poster => {
        document.getElementById('moviePoster').src = poster;
        sendTicketEmail(movieName, theatreName, showTime, date, seats, bookingId, amount, poster, customerEmail, customerName);
    }).catch(error => {
        console.error('Error fetching movie poster:', error);
        document.getElementById('moviePoster').src = "../images/default-poster.png";
        sendTicketEmail(movieName, theatreName, showTime, date, seats, bookingId, amount, "../images/default-poster.png", customerEmail, customerName);
    });

    sessionStorage.setItem('bookingId', bookingId);

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
        if (!movieName) 
            throw new Error("Movie name is undefined or empty.");
        const response = await fetch('../data/movies.json');

        if (!response.ok) 
            throw new Error('Failed to fetch movie data');
        const data = await response.json();
        const movie = data.movies.find(movie => movie.title.toLowerCase() === movieName.toLowerCase());
        if (movie) return movie.poster;
        throw new Error('Movie not found');
    } catch (error) {
        console.error('Error fetching movie poster:', error);
        return "../images/default-poster.png";
    }
}

function showSuccessMessageAndRedirect() {
    const successMessage = document.createElement('div');
    successMessage.textContent = 'Your ticket has been successfully emailed to you!';
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

    setTimeout(() => {
        window.location.href = "../pages/home.html";
    }, 5000); // Redirect after 5 seconds
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });
}

emailjs.init('ZuZLrLJOaiaonlV8M');

function sendTicketEmail(movieName, theatreName, showTime, date, seats, bookingId, amount, poster, customerEmail, customerName) {
    return emailjs.send('service_jeimr7d', 'template_ow3x08t', {
        movie_poster: poster,
        to_name: customerName,
        to_email: customerEmail,
        movie_name: movieName,
        theatre_name: theatreName,
        show_time: showTime,
        date: date,
        seats: seats,
        booking_id: bookingId,
        amount: amount,
    })
    .then(() => {
        console.log('Email sent successfully!');
        showSuccessMessageAndRedirect();
    })
    .catch((err) => {
        console.error('Error sending email:', err);
        alert('Failed to send email. Please try again.');
    });
}

async function saveBookingToSupabase(ticketData) {
    try {
        // Ensure showTime is not null or undefined. If it is, provide a fallback value.
        const showTime = ticketData.showTime || "N/A";  // Fallback value "N/A"

        const { data, error } = await supabase
            .from('bookings')
            .insert([{
                booking_id: ticketData.bookingId,
                movie_name: ticketData.movieName,
                theatre_name: ticketData.theatreName,
                show_time: showTime,  
                booking_date: formatDate(ticketData.date),
                seats: ticketData.seats,
                amount: parseFloat(ticketData.amount.replace('₹', '').trim()),
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

function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
