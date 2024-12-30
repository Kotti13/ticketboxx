import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.0.0/+esm';

// Initialize Supabase client
const supabaseUrl = 'https://srjumswibbswcwjntcad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyanVtc3dpYmJzd2N3am50Y2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2Nzk5MzcsImV4cCI6MjA0NTI1NTkzN30.e_ZkFg_EPI8ObvFz70Ejc1W4RGpQurr0SoDlK6IoEXY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchBookings() {
    const userEmail = localStorage.getItem("usermail");

    if (!userEmail) {
        console.log("No user is logged in.");
        return;
    }

    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('customer_email', userEmail);

        if (error) {
            console.error('Error fetching bookings:', error.message);
            return;
        }

        if (data && data.length > 0) {
            displayBookings(data);
        } else {
            document.getElementById('bookingsContainer').innerHTML = '<p>No bookings found.</p>';
        }
    } catch (error) {
        console.error('Error in fetchBookings function:', error);
    }
}

function displayBookings(bookings) {
    const bookingsContainer = document.getElementById('bookingsContainer');
    bookingsContainer.innerHTML = ''; 

    bookings.forEach(booking => {
        const bookingDiv = document.createElement('div');
        bookingDiv.classList.add('booking');

        bookingDiv.innerHTML = `
            <h3>Booking ID: ${booking.booking_id}</h3>
            <p><strong>Movie:</strong> ${booking.movie_name}</p>
            <p><strong>Theatre:</strong> ${booking.theatre_name}</p>
            <p><strong>Show Time:</strong> ${booking.show_time}</p>
            <p><strong>Booking Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</p>
            <p><strong>Seats:</strong> ${booking.seats}</p>
            <p><strong>Amount:</strong> ₹${booking.amount.toFixed(2)}</p>
        `;

        bookingsContainer.appendChild(bookingDiv);
    });
}

fetchBookings();
