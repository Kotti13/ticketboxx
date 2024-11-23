document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const movieName = params.get('movieName'); // Fetch movie name
    const theatreName = params.get('theatre'); // Fetch theatre name

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
        rs190: { rows: ['B', 'C', 'D'], totalSeats: 30 },
        rs60: { rows: ['L', 'M', 'N'], totalSeats: 30 },
    };

    const unavailableSeats = ['B7', 'C15', 'D19', 'L4', 'M10']; // Example unavailable
    const bestsellerSeats = ['B12', 'C7', 'L20']; // Example bestseller

    const selectedSeats = [];
    let totalPrice = 0;

    // Generate seat grid
    Object.keys(seatData).forEach((section) => {
        const seatContainer = document.getElementById(section);
        seatData[section].rows.forEach((row) => {
            for (let i = 1; i <= seatData[section].totalSeats; i++) {
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

                // Seat click event
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

    // Update Popup
    const updatePopup = () => {
        const popup = document.getElementById('popup');
        const seatDisplay = document.getElementById('selectedSeats');
        const priceDisplay = document.getElementById('totalPrice');

        seatDisplay.textContent = `Selected Seats: ${selectedSeats.join(', ') || 'None'}`;
        priceDisplay.textContent = `Total Price: ₹${totalPrice}`;
        popup.style.display = selectedSeats.length ? 'flex' : 'none';

        // Update header ticket count
        document.getElementById('ticketSummary').textContent = `${selectedSeats.length} Tickets`;
    };
});
