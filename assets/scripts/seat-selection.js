import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.0.0/+esm';

// Initialize Supabase client
const supabaseUrl = 'https://srjumswibbswcwjntcad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyanVtc3dpYmJzd2N3am50Y2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2Nzk5MzcsImV4cCI6MjA0NTI1NTkzN30.e_ZkFg_EPI8ObvFz70Ejc1W4RGpQurr0SoDlK6IoEXY';
const supabase = createClient(supabaseUrl, supabaseKey);



document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const movieName = params.get('movieName'); 
    const theatreName = params.get('theatre'); 

    // Get movie details from localStorage
    const selectedMovie = JSON.parse(localStorage.getItem('selectedMovie'));
    console.log(`selectedDate:  ${selectedMovie.selectedDate}`);
    console.log(`showtime: ${selectedMovie.selectedShowtime}`);
   
    const headerTitle = document.querySelector('header h1');
    const headerDetails = document.querySelector('header p');

    if (movieName && theatreName) {
        headerTitle.textContent = movieName;
        headerDetails.textContent = theatreName;
    } else {
        headerTitle.textContent = "Movie not found";
        headerDetails.textContent = "";
    }

    // Seat data and initialization
    const seatData = {
        rs190: { rows: ['A', 'B', 'C', 'D', 'E', 'F',"G","H","I","J","K","L","M","N","O"], totalSeats: 30 },
        rs60: { rows: ['P', 'Q', "R"], totalSeats: 30 },
    };

    const unavailableSeats = []; 
    const bestsellerSeats = []; 

    const selectedSeats = [];
    const clickedSeatsDetails = [];  // New variable to store clicked seat details
    let totalPrice = 0;

    // Generate seat grid
    Object.keys(seatData).forEach((section) => {
        const seatContainer = document.getElementById(section);
        seatData[section].rows.forEach((row) => {
            for (let i = 1; i <= 18; i++) {
                const seatId = `${row}${i}`;
                const seat = document.createElement('div');

                seat.classList.add('seat');
                seat.textContent = i;

                if (unavailableSeats.includes(seatId)) {
                    seat.classList.add('sold');
                } else if (bestsellerSeats.includes(seatId)) {
                    seat.classList.add('bestseller', 'available');
                } else {
                    seat.classList.add('available');
                }

                seat.addEventListener('click', () => {
                    if (seat.classList.contains('sold')) return;

                    seat.classList.toggle('selected');
                    if (seat.classList.contains('selected')) {
                        selectedSeats.push(seatId);
                        clickedSeatsDetails.push({ seatId, section, row });  // Store seat details
                        totalPrice += section === 'rs190' ? 190 : 60;
                    } else {
                        const index = selectedSeats.indexOf(seatId);
                        selectedSeats.splice(index, 1);
                        const seatIndex = clickedSeatsDetails.findIndex(seat => seat.seatId === seatId);
                        clickedSeatsDetails.splice(seatIndex, 1);  // Remove seat from clicked details
                        totalPrice -= section === 'rs190' ? 190 : 60;
                    }
                    updatePopup();
                });

                seatContainer.appendChild(seat);
            }
        });
    });

    // Update Popup
    const updatePopup = () => {
        const popup = document.getElementById('popup');
        const seatDisplay = document.getElementById('selectedSeats');
        const priceDisplay = document.getElementById('totalPrice');
        const confirmLink = document.getElementById('confirmBooking');

        seatDisplay.textContent = `Selected Seats: ${selectedSeats.join(', ') || 'None'}`;
        priceDisplay.textContent = `Total Price: ₹${totalPrice}`;
        popup.style.display = selectedSeats.length ? 'flex' : 'none';

        // Store the total price in localStorage
        localStorage.setItem('totalPrice', totalPrice);

        if (selectedSeats.length) {
            confirmLink.href = `payments.html?movieName=${encodeURIComponent(movieName)}&theatre=${encodeURIComponent(theatreName)}&seats=${encodeURIComponent(selectedSeats.join(','))}&price=${totalPrice}`;
            confirmLink.classList.remove('disabled');
        } else {
            confirmLink.href = "payments.html";
            confirmLink.classList.add('disabled');
        }

        document.getElementById('ticketSummary').textContent = `${selectedSeats.length} Tickets`;
        
        // Optionally, store clicked seat details in localStorage for later use
        localStorage.setItem('clickedSeatsDetails', JSON.stringify(clickedSeatsDetails));
    };
});

// When confirming booking, ensure the clicked seats are in localStorage if needed
document.getElementById('confirmBooking').addEventListener('click', (e) => {
    e.preventDefault();

    const loadingSpinner = document.getElementById('loading');
    loadingSpinner.style.display = 'block';

    setTimeout(() => {
        window.location.href = e.target.href;
    }, 2000);
});

// Get the showtime value from the stored object
const selectedShowtime = selectedMovie ? selectedMovie.selectedShowtime : null;

// Print the selected showtime to the console
console.log(selectedShowtime);
// Fetch booked seats from Supabase
async function fetchBookedSeats() {
    const { data, error } = await supabase
        .from('bookings')
        .select('seats')
        .match({ movie_name: movieName, theatre_name: theatreName, show_time: showTime });

    if (error) {
        console.error("Error fetching booked seats", error);
        return [];
    }

    // Flatten the array of booked seats if needed
    return data.map(booking => booking.seats).flat();
}

// Update seat grid based on fetched booked seats
async function updateSeatGrid() {
    const bookedSeats = await fetchBookedSeats();
    Object.keys(seatData).forEach((section) => {
        const seatContainer = document.getElementById(section);
        seatData[section].rows.forEach((row) => {
            for (let i = 1; i <= 18; i++) {
                const seatId = `${row}${i}`;
                const seat = document.createElement('div');
                seat.classList.add('seat');
                seat.textContent = i;

                if (unavailableSeats.includes(seatId) || bookedSeats.includes(seatId)) {
                    seat.classList.add('sold');
                } else if (bestsellerSeats.includes(seatId)) {
                    seat.classList.add('bestseller', 'available');
                } else {
                    seat.classList.add('available');
                }

                seat.addEventListener('click', () => {
                    if (seat.classList.contains('sold')) return;

                    seat.classList.toggle('selected');
                    if (seat.classList.contains('selected')) {
                        selectedSeats.push(seatId);
                        totalPrice += section === 'rs190' ? 190 : 60;
                    } else {
                        const index = selectedSeats.indexOf(seatId);
                        selectedSeats.splice(index, 1);
                        totalPrice -= section === 'rs190' ? 190 : 60;
                    }
                    updatePopup();
                });

                seatContainer.appendChild(seat);
            }
        });
    });
}