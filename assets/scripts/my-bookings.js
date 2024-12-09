// Initialize Supabase client
const supabaseUrl = 'https://srjumswibbswcwjntcad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyanVtc3dpYmJzd2N3am50Y2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2Nzk5MzcsImV4cCI6MjA0NTI1NTkzN30.e_ZkFg_EPI8ObvFz70Ejc1W4RGpQurr0SoDlK6IoEXY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get bookings based on the logged-in user's email
const getUserBookings = async () => {
    const userEmail = localStorage.getItem('userEmail');  // Retrieve the email from localStorage
    
    if (!userEmail) {
        alert("You need to be logged in to view your bookings.");
        window.location.href = "login.html";  // Redirect to login if no email is found
        return;
    }

    try {
        // Fetch the user's bookings from Supabase based on their email
        const { data, error } = await supabase
            .from('tickets')  // Assuming the table where bookings are stored is called 'tickets'
            .select('*')
            .eq('customer_email', userEmail);  // Filter by email

        if (error) {
            console.error('Error fetching user bookings:', error.message);
            return;
        }

        if (data.length === 0) {
            document.getElementById('bookingsContainer').innerHTML = '<p>You have no bookings yet.</p>';
            return;
        }

        // Display the bookings by calling a function to create the HTML elements
        displayBookings(data);
    } catch (error) {
        console.error('Error retrieving bookings:', error.message);
    }
};

// Function to display the bookings in the page
const displayBookings = (bookings) => {
    const bookingsContainer = document.getElementById('bookingsContainer');
    bookingsContainer.innerHTML = '';  // Clear any existing content

    bookings.forEach(booking => {
        const ticketCard = document.createElement('div');
        ticketCard.classList.add('ticket-card');
        
        ticketCard.innerHTML = `
            <h3>${booking.movie_name}</h3>
            <img src="${booking.poster_url}" alt="${booking.movie_name}" class="ticket-poster"/>
            <p><strong>Theatre:</strong> ${booking.theatre_name}</p>
            <p><strong>Show Time:</strong> ${booking.show_time}</p>
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Seats:</strong> ${booking.seats}</p>
            <p><strong>Amount:</strong> ${booking.amount}</p>
            <p><strong>Booking ID:</strong> ${booking.booking_id}</p>
            <button onclick="viewTicketDetails('${booking.booking_id}')">View Details</button>
        `;

        bookingsContainer.appendChild(ticketCard);
    });
};

// Function to handle "View Details" button click (optional)
function viewTicketDetails(bookingId) {
    console.log('Viewing details for booking:', bookingId);
    // You can implement additional logic to fetch more details from Supabase or show a modal
}

// Call getUserBookings on page load to display the bookings
window.onload = getUserBookings;
