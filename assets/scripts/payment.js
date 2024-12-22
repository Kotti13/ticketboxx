document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const mobileInput = document.getElementById('mobile');
    const continueButton = document.getElementById('continueButton');

    // Get payment details from URL
    const params = new URLSearchParams(window.location.search);
    const totalPrice = params.get('price') || '0';
    const movieName = params.get('movieName');
    const theatre = params.get('theatre');
    const showTime = params.get('showTime');
    const seats = params.get('seats');

    // Input validation function
    const validateInputs = () => {
        const email = emailInput.value.trim();
        const mobile = mobileInput.value.trim();
        const isMobileValid = /^\d{10}$/.test(mobile);
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        // Enable or disable continue button based on input validity
        continueButton.disabled = !(isMobileValid && isEmailValid);
    };

    // Handle form submission
    const onContinue = () => {
        const email = emailInput.value.trim();
        const mobile = mobileInput.value.trim();

        // Validate mobile number
        if (!/^\d{10}$/.test(mobile)) {
            alert('Invalid mobile number! Please enter a 10-digit mobile number.');
            return;
        }

        // Save user details to sessionStorage
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userMobile', mobile);

        // Save payment details to sessionStorage
        sessionStorage.setItem('movieName', movieName);
        sessionStorage.setItem('theatre', theatre);
        sessionStorage.setItem('showTime', showTime);
        sessionStorage.setItem('seats', seats);
        sessionStorage.setItem('price', totalPrice);

        // Redirect to the confirmation page
        window.location.href = '../pages/ticket.html';
    };

    // Event listeners
    emailInput.addEventListener('input', validateInputs);
    mobileInput.addEventListener('input', validateInputs);
    continueButton.addEventListener('click', onContinue);

    // Initial validation check
    validateInputs();
});
