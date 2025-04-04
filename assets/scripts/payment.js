document.addEventListener('DOMContentLoaded', () => {
    console.log("Document loaded and ready!");
    const selectedMovie = JSON.parse(localStorage.getItem('selectedMovie'));
    const { title: movieName, selectedTheatre: theatreName, selectedDate, selectedShowtime } = selectedMovie;
    console.log(selectedDate)

    const selectedseat = JSON.parse(localStorage.getItem('clickedSeatsDetails')) || []; 
    // const seat = selectedseat.map(item => item.seats);
    // console.log(seat)
    console.log(selectedseat.join(", "))
    

    // console.log(seat[0])
    // const seatsfordebug=seat[0];
    // console.log("fordebug :  "+seatsfordebug)



    // Selecting form inputs
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryDateInput = document.getElementById('expiryDate');
    const cvvInput = document.getElementById('cvv');
    const continueLink = document.getElementById('continueLink');

    // Fetch URL parameters (if any)
    const params = new URLSearchParams(window.location.search);
    const totalPrice = params.get('price') || '0';
    // const movieName = params.get('movieName');
    const theatre = params.get('theatre');
    const showTime = params.get('showTime');
    const seats = params.get('seats');

    console.log('Initial Parameters:', { totalPrice, movieName, theatre, selectedShowtime, seats });

    // Validate inputs before enabling the continue link
    const validateInputs = () => {
        const cardNumber = cardNumberInput.value.trim();
        const expiryDate = expiryDateInput.value;
        const cvv = cvvInput.value.trim();

        const isCardValid = /^\d{16}$/.test(cardNumber); // Card number validation
        const isExpiryValid = expiryDate && new Date(expiryDate) > new Date(); // Expiry date validation
        const isCvvValid = /^\d{3}$/.test(cvv); // CVV validation

        console.log('Card Valid:', isCardValid, 'Expiry Valid:', isExpiryValid, 'CVV Valid:', isCvvValid);

        // Enable or disable continue link based on validation
        continueLink.style.pointerEvents = isCardValid && isExpiryValid && isCvvValid ? 'auto' : 'none';
        continueLink.style.opacity = isCardValid && isExpiryValid && isCvvValid ? '1' : '0.6';
    };

    cardNumberInput.addEventListener('input', validateInputs);
    expiryDateInput.addEventListener('input', validateInputs);
    cvvInput.addEventListener('input', validateInputs);

    
    validateInputs();
});
console.log(localStorage.getItem('clickedSeatsDetails'))
const a=JSON.parse(localStorage.getItem('clickedSeatsDetails'))
console.log(`selected seats:  ${a}`)
// console.log(localStorage.getItem('usermail'+"hi"))

