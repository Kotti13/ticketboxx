document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const mobileInput = document.getElementById('mobile');
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryDateInput = document.getElementById('expiryDate');
    const cvvInput = document.getElementById('cvv');
    const continueButton = document.getElementById('continueButton');

    const params = new URLSearchParams(window.location.search);
    const totalPrice = params.get('price') || '0';
    const movieName = params.get('movieName');
    const theatre = params.get('theatre');
    const showTime = params.get('showTime');
    const seats = params.get('seats');

    console.log('Initial Parameters:', { totalPrice, movieName, theatre, showTime, seats });

    const validateInputs = () => {
        const email = emailInput.value.trim();
        const mobile = mobileInput.value.trim();
        const cardNumber = cardNumberInput.value.trim();
        const expiryDate = expiryDateInput.value;
        const cvv = cvvInput.value.trim();

        const isMobileValid = /^\d{10}$/.test(mobile);
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const isCardValid = /^\d{16}$/.test(cardNumber); // Card number validation
        const isExpiryValid = expiryDate && new Date(expiryDate) > new Date(); // Expiry date validation
        const isCvvValid = /^\d{3}$/.test(cvv); // CVV validation

        console.log('Email Valid:', isEmailValid, 'Mobile Valid:', isMobileValid);
        console.log('Card Valid:', isCardValid, 'Expiry Valid:', isExpiryValid, 'CVV Valid:', isCvvValid);

        continueButton.disabled = !(isMobileValid && isEmailValid && isCardValid && isExpiryValid && isCvvValid);
    };

    const onContinue = () => {
        const email = emailInput.value.trim();
        const mobile = mobileInput.value.trim();
        const cardNumber = cardNumberInput.value.trim();
        const expiryDate = expiryDateInput.value;
        const cvv = cvvInput.value.trim();

        if (!/^\d{10}$/.test(mobile)) {
            alert('Invalid mobile number! Please enter a 10-digit mobile number.');
            return;
        }
        if (!/^\d{16}$/.test(cardNumber)) {
            alert('Invalid card number! Please enter a valid 16-digit card number.');
            return;
        }
        if (!/^\d{3}$/.test(cvv)) {
            alert('Invalid CVV! Please enter a valid 3-digit CVV.');
            return;
        }
        if (!expiryDate || new Date(expiryDate) <= new Date()) {
            alert('Invalid expiry date! Please enter a future expiry date.');
            return;
        }

        console.log('Storing Details:', { email, mobile, cardNumber, expiryDate, cvv });

        // Store all details in sessionStorage
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userMobile', mobile);
        sessionStorage.setItem('movieName', movieName);
        sessionStorage.setItem('theatre', theatre);
        sessionStorage.setItem('showTime', showTime);
        sessionStorage.setItem('seats', seats);
        sessionStorage.setItem('price', totalPrice);

        // Simulate payment processing
        setTimeout(() => {
            alert('Payment Successful!');
            window.location.href = '../pages/ticket.html';
        }, 2000);
    };

    // Add input listeners to validate as the user types
    emailInput.addEventListener('input', validateInputs);
    mobileInput.addEventListener('input', validateInputs);
    cardNumberInput.addEventListener('input', validateInputs);
    expiryDateInput.addEventListener('input', validateInputs);
    cvvInput.addEventListener('input', validateInputs);

    continueButton.addEventListener('click', () => {
        console.log('Continue Button Clicked');
        onContinue();
    });

    // Initial validation to disable button if any fields are invalid
    validateInputs();
});
