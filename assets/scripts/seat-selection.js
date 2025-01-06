import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-database.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js';

// Supabase configuration
const supabaseUrl = 'https://srjumswibbswcwjntcad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyanVtc3dpYmJzd2N3am50Y2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2Nzk5MzcsImV4cCI6MjA0NTI1NTkzN30.e_ZkFg_EPI8ObvFz70Ejc1W4RGpQurr0SoDlK6IoEXY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBcFRNdsErrXYHiiuYlCf6txDjupaNwRno",
    authDomain: "ticketboxx-c4049.firebaseapp.com",
    projectId: "ticketboxx-c4049",
    storageBucket: "ticketboxx-c4049.appspot.com",
    messagingSenderId: "1029974974410",
    appId: "1:1029974974410:web:a94d9c5fe267f3e51db933",
    measurementId: "G-F7PEJ1WQRV"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', async () => {
    const selectedMovie = JSON.parse(localStorage.getItem('selectedMovie'));
    console.log(selectedMovie.selectedDate)
    if (!selectedMovie) {
        alert("Movie details not found. Redirecting...");
        window.location.href = "../pages/home.html"; 
        return;
    }

    const { title: movieName, selectedTheatre: theatreName, selectedDate, selectedShowtime } = selectedMovie;
    const six=document.getElementById('six');
    const headerTitle = document.querySelector('header h1');

    const headerDetails = document.querySelector('header p');
    
    headerTitle.textContent = movieName || "Movie not found";
    headerDetails.textContent = `${theatreName || "Unknown Theatre"} | ${selectedDate || "Unknown Date"} | ${selectedShowtime || "Unknown Showtime"}`;

    const seatLayout = await fetchSeatLayoutFromFirebase(theatreName);
    const unavailableSeats = await fetchUnavailableSeats(movieName, theatreName, selectedDate, selectedShowtime);

    let selectedSeats = [];
    let totalPrice = 0;

    // Render Seat Layout
    renderSeatLayout(seatLayout, unavailableSeats);

    // Function to render the seat layout
    function renderSeatLayout(seatLayout, unavailableSeats) {
        const seatContainer = document.querySelector('.seats');
        if (!seatContainer) {
            console.error("Seat container not found in the HTML.");
            return;
        }

        seatContainer.innerHTML = '';  
        
        if (!seatLayout || seatLayout.length === 0) {
            seatContainer.textContent = 'No seat layout available.';
            return;
        }

        // Render each row of seats
        seatLayout.forEach((row, rowIndex) => {
            const rowContainer = document.createElement('div');
            rowContainer.classList.add('row');

            // Split the row string into individual seats and render them
            row.trim().split(/\s+/).forEach((seat, seatIndex) => {
                const seatId = `${String.fromCharCode(65 + rowIndex)}${seat}`;
                const seatElement = document.createElement('div');
                seatElement.classList.add('seat');
                seatElement.dataset.seatId = seatId;

                if (seat === '_') {
                    seatElement.classList.add('empty');   // Empty space div
                } else if (unavailableSeats.includes(seatId)) {
                    seatElement.classList.add('sold'); // Sold seat
                    seatElement.title = `${seatId} (Sold)`;
                } else {
                    seatElement.classList.add('available'); // Available seat
                    seatElement.title = `${seatId} (Available)`;

                    seatElement.addEventListener('click', () => toggleSeatSelection(seatElement, seatId, rowIndex));
                }

                seatElement.textContent = seat;   // Display seat number
                rowContainer.appendChild(seatElement);
            });

            seatContainer.appendChild(rowContainer);
        });
    }

    function toggleSeatSelection(seatElement, seatId, rowIndex) {
        // Determine the price of the seat
       
        let seatPrice = 190; // deafault price
        

        // Check imax screen
        const isImax = selectedShowtime.toLowerCase().includes("imax");

        // If imax screen rs400 seat will appear
        if (isImax) {
            seatPrice = 400;
        } 
        // If the seat is in the first two rows, apply +60
        else if (rowIndex === seatLayout.length-1 || rowIndex === seatLayout.length-2) {
            
            seatPrice = 60; 
            
        }
        else if(rowIndex===0||rowIndex==1){
            seatPrice=250;

        }


        // Handle seat selection
        if (seatElement.classList.contains('selected')) {
            seatElement.classList.remove('selected');
            selectedSeats = selectedSeats.filter(seat => seat !== seatId);
            totalPrice -= seatPrice;
        } else {
            seatElement.classList.add('selected');
            selectedSeats.push(seatId);
            totalPrice += seatPrice;
        }

        updatePopup();
    }

    // Update Popup with selected seat details and total price
    function updatePopup() {
        const popup = document.getElementById('popup');
        const seatDisplay = document.getElementById('selectedSeats');
        const priceDisplay = document.getElementById('totalPrice');
        const confirmLink = document.getElementById('confirmBooking');

        seatDisplay.textContent = `Selected Seats: ${selectedSeats.join(', ') || 'None'}`;
        priceDisplay.textContent = `Total Price: ₹${totalPrice}`;
        popup.style.display = selectedSeats.length ? 'flex' : 'none';

        // Store total price and seat details in localStorage
        localStorage.setItem('totalPrice', totalPrice);

        if (selectedSeats.length) {
            confirmLink.href = `payments.html?movieName=${encodeURIComponent(movieName)}&theatre=${encodeURIComponent(theatreName)}&seats=${encodeURIComponent(selectedSeats.join(','))}&price=${totalPrice}`;
            confirmLink.classList.remove('disabled');
        } else {
            confirmLink.href = "payments.html";
            confirmLink.classList.add('disabled');
        }

        // Store selected seats in localStorage as an array
        localStorage.setItem('clickedSeatsDetails', JSON.stringify(selectedSeats));  // Store selected seat object

        document.getElementById('ticketSummary').textContent = `${selectedSeats.length} Tickets`;

        // Prepare the confirmation link with the selected seats and other details
    }
});

// Fetch seat layout from Firebase
async function fetchSeatLayoutFromFirebase(theatre) {
    try {
        const seatLayoutRef = ref(db, `theatres/${theatre}/seats`);
        const snapshot = await get(seatLayoutRef);

        if (snapshot.exists()) {
            const seatLayout = snapshot.val();
            console.log('Fetched Seat Layout from Firebase:', seatLayout);
            return seatLayout;
        } else {
            console.error('No seat layout found for this theatre.');
            return [];
        }
    } catch (err) {
        console.error("Error fetching seat layout from Firebase:", err);
        return [];
    }
}

// Fetch unavailable seats from Supabase
async function fetchUnavailableSeats(movieName, theatreName, bookingDate, showTime) {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('seats')
            .eq('movie_name', movieName)
            .eq('theatre_name', theatreName)
            .eq('booking_date', bookingDate)
            .eq('show_time', showTime);

        if (error) {
            console.error("Error fetching unavailable seats:", error);
            return [];
        }

        const unavailableSeats = data.flatMap(booking => booking.seats.split(',').map(seat => seat.trim()));
        return unavailableSeats;
    } catch (err) {
        console.error("Error fetching unavailable seats from Supabase:", err);
        return [];
    }
}


const selectedMovie=JSON.parse(localStorage.getItem('selectedMovie'))
const { title, poster, selectedDate, selectedShowtime, selectedTheatre } = selectedMovie;
// console.log(a)

console.log(selectedMovie)