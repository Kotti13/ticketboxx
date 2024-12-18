document.addEventListener('DOMContentLoaded', function () {
    // Fetch URL parameters
    var params = new URLSearchParams(window.location.search);
    var movieName = params.get('movieName');
    var theatreName = params.get('theatre');

    // Fetch movie details from localStorage
    var selectedMovie = JSON.parse(localStorage.getItem('selectedMovie'));

    // Set movie title and theatre name
    var headerTitle = document.getElementById('movieTitle');
    var headerDetails = document.getElementById('theatreName');

    if (movieName && theatreName) {
        headerTitle.textContent = movieName;
        headerDetails.textContent = theatreName;
    } else {
        headerTitle.textContent = selectedMovie ? selectedMovie.name : "Movie not found";
        headerDetails.textContent = selectedMovie ? selectedMovie.theatre : "";
    }

    // Seat data setup
    var seatData = {
        rs190: { rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'], totalSeats: 30 },
        rs60: { rows: ['P', 'Q', 'R','S'], totalSeats: 30 },
    };

    var unavailableSeats = ['B7', 'C15','B12', 'D19', 'L4', 'M10','C7','L20']; 
    // var bestsellerSeats = ['B12', 'C7', 'L20'];

    var selectedSeats = [];
    var totalPrice = 0;

    // Generate seat grid for Rs. 190 and Rs. 60 sections
    var sectionKeys = Object.keys(seatData);
    for (var i = 0; i < sectionKeys.length; i++) {
        var section = sectionKeys[i];
        var seatContainer = document.getElementById(section);
        var rows = seatData[section].rows;

        for (var j = 0; j < rows.length; j++) {
            var row = rows[j];
            for (var k = 1; k <= 18; k++) {
                var seatId = row + k;
                var seat = document.createElement('div');
                seat.classList.add('seat');
                seat.textContent = k;

                
                if (unavailableSeats.indexOf(seatId) !== -1) {
                    seat.classList.add('sold');}
                // } else if (bestsellerSeats.indexOf(seatId) !== -1) {
                //     seat.classList.add('bestseller', 'available');
                // } 
                else {
                    seat.classList.add('available');
                }

                // Bind the price for each seat directly in the click listener
                seat.addEventListener('click', function (section, seatId) {
                    return function () {
                        if (this.classList.contains('sold')) return;

                        this.classList.toggle('selected');
                        if (this.classList.contains('selected')) {
                            selectedSeats.push(seatId);
                            totalPrice += (section === 'rs60') ? 60 : 190;
                        } else {
                            var index = selectedSeats.indexOf(seatId);
                            if (index > -1) {
                                selectedSeats.splice(index, 1);
                                totalPrice -= (section === 'rs60') ? 60 : 190;
                            }
                        }

                        // Update the popup
                        var seatDisplay = document.getElementById('selectedSeats');
                        var priceDisplay = document.getElementById('totalPrice');
                        var ticketSummary = document.getElementById('ticketSummary');
                        var confirmLink = document.getElementById('confirmBooking');

                        seatDisplay.textContent = "Selected Seats: " + (selectedSeats.length ? selectedSeats.join(', ') : "None");
                        priceDisplay.textContent = "Total Price: ₹" + totalPrice;
                        ticketSummary.textContent = selectedSeats.length + " Tickets";

                        if (selectedSeats.length > 0) {
                            if (totalPrice === 60 * selectedSeats.length) {
                                confirmLink.href = "https://rzp.io/rzp/x7sANvs";
                            } else if (totalPrice === 190 * selectedSeats.length) {
                                confirmLink.href = "https://rzp.io/rzp/xsPr0q8N";
                            } else {
                                confirmLink.href = "../pages/payment.html";  // Mixed selection
  }
                            // confirmLink.classList.remove('disabled');
                        } else {
                            confirmLink.href = "payment.html";
                            confirmLink.classList.add('disabled');
                        }

                        document.getElementById('popup').style.display = selectedSeats.length ? 'flex' : 'none';
                    };
                }(section, seatId));

                seatContainer.appendChild(seat);
            }
        }
    }

    // Confirm booking button
    var confirmBookingButton = document.getElementById('confirmBooking');
    confirmBookingButton.addEventListener('click', function (e) {
        e.preventDefault();
        var loadingSpinner = document.getElementById('loading');
        loadingSpinner.style.display = 'block';

        setTimeout(function () {
            window.location.href = e.target.href;
        }, 2000);
    });
});
