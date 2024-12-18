document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);

    // Get data from URL parameters (as Razorpay redirection contains these)
    const movieName = params.get('movieName') || "N/A";
    const theatreName = params.get('theatre') || "N/A";
    const seats = params.get('seats') || "N/A";
    const amount = params.get('amount') || "₹0";

    const showTime = sessionStorage.getItem('showTime') || "N/A"; // Assuming this is saved elsewhere
    const date = sessionStorage.getItem('selectedDate') || "N/A";
    const customerEmail = localStorage.getItem("usermail");
    const customerName = "Customer Name"; // Replace with actual customer name if available
    const bookingId = generateBookingId();

    // Populate the ticket details
    document.getElementById('movieName').textContent = movieName;
    document.getElementById('theatreName').textContent = theatreName;
    document.getElementById('showTime').textContent = showTime;
    document.getElementById('date').textContent = date;
    document.getElementById('seats').textContent = seats;
    document.getElementById('bookingId').textContent = bookingId;
    document.getElementById('amount').textContent = amount;

    // Fetch the movie poster
    try {
        const poster = await fetchMoviePoster(movieName);
        document.getElementById('moviePoster').src = poster;
    } catch (error) {
        console.error('Error fetching movie poster:', error);
        document.getElementById('moviePoster').src = "../images/default-poster.png";
    }

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

// Remove the downloadTicketPDF function entirely

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });
}

async function saveBookingToSupabase(ticketData) {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .insert([{
                booking_id: ticketData.bookingId,
                movie_name: ticketData.movieName,
                theatre_name: ticketData.theatreName,
                show_time: ticketData.showTime,
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
