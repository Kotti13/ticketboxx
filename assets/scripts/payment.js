let isProcessingPayment = false; // Flag to track if payment is already being processed

document.addEventListener('DOMContentLoaded', () => {
    const usermail=localStorage.getItem("usermail");
    console.log(usermail);
    const params = new URLSearchParams(window.location.search);
    const totalPrice = params.get('price') || '0';
    const movieName = params.get('movieName');
    const theatre = params.get('theatre');
    const showTime = params.get('showTime');
    const seats = params.get('seats');

    const continueButton = document.getElementById('continueButton');
    const googlePayButton = document.getElementById('googlePayButton');
    const googlePaySection = document.getElementById('googlePaySection');
    const emailInput = document.getElementById('email');
    const mobileInput = document.getElementById('mobile');
    const loadingSpinner = document.getElementById('loading');

    // Initialize Google Pay client
    const googlePayClient = new google.payments.api.PaymentsClient({ environment: 'TEST' });

    const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
            {
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: ['MASTERCARD', 'VISA']
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: 'example',
                        gatewayMerchantId: 'exampleMerchantId'
                    }
                }
            }
        ],
        transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice,
            currencyCode: 'INR'
        },
        merchantInfo: {
            merchantName: 'TicketBoxx',
            merchantId: '1234567890'
        }
    };

    // Input validation
    const validateInputs = () => {
        const email = emailInput.value.trim();
        const mobile = mobileInput.value.trim();
        const isMobileValid = /^\d{10}$/.test(mobile);
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        console.log('Email valid:', isEmailValid, 'Mobile valid:', isMobileValid);

        // Update the disabled state of the continue button
        continueButton.disabled = !(isMobileValid && isEmailValid);
    };

    // Proceed to payment step
    const onContinue = () => {
        const email = emailInput.value.trim();
        const mobile = mobileInput.value.trim();

        if (!/^\d{10}$/.test(mobile)) {
            alert('Invalid mobile number! Please enter a 10-digit mobile number.');
            return;
        }

        localStorage.setItem('userEmail', email);
        localStorage.setItem('userMobile', mobile);

        // Hide contact form and show Google Pay section
        document.querySelector('.form-section').style.display = 'none';
        googlePaySection.style.display = 'block';

        // Check Google Pay readiness
        googlePayClient.isReadyToPay(paymentDataRequest)
            .then((response) => {
                if (response.result) {
                    console.log('Google Pay is ready.');
                    googlePayButton.style.display = 'block';
                    googlePayButton.disabled = false;
                    googlePayButton.addEventListener('click', onGooglePayButtonClicked);
                } else {
                    console.warn('Google Pay is not available.');
                    alert('Google Pay is not available on your device.');
                    window.location.href = '../pages/ticket.html';
                }
            })
            .catch((err) => {
                console.error('Error checking Google Pay readiness:', err);
                alert('Error with Google Pay. Check the console for details.');
                window.location.href = '../pages/ticket.html';
            });
    };

    // Trigger Google Pay payment
    const onGooglePayButtonClicked = () => {
        if (isProcessingPayment) {
            alert('Payment is already being processed. Please wait.');
            return; // Prevent duplicate payment attempts
        }

        isProcessingPayment = true; // Set flag to prevent multiple submissions
        googlePayButton.disabled = true; // Disable the payment button to prevent further clicks
        loadingSpinner.style.display = 'block'; // Show loading spinner

        googlePayClient.loadPaymentData(paymentDataRequest)
            .then((paymentData) => {
                // Store session details
                sessionStorage.setItem('movieName', movieName);
                sessionStorage.setItem('theatre', theatre);
                sessionStorage.setItem('showTime', showTime);
                sessionStorage.setItem('seats', seats);
                sessionStorage.setItem('price', totalPrice);

                console.log('Payment successful:', paymentData);
                processPayment(paymentData);
            })
            .catch((err) => {
                console.error('Google Pay payment failed:', err);
                // alert('Payment failed. Please try again.');
                window.location.href = '../pages/ticket.html';
                resetPaymentState(); // Reset the payment state on failure
            });
    };

    // Simulate payment processing
    const processPayment = (paymentData) => {
        console.log('Processing payment with data:', paymentData);

        // Simulate a delay in payment processing
        setTimeout(() => {
            loadingSpinner.style.display = 'none';
            window.location.href = '../pages/ticket.html';  // Redirect to a ticket confirmation page
        }, 2000);
    };

    // Reset payment state (in case of failure or completion)
    const resetPaymentState = () => {
        isProcessingPayment = false; // Reset the flag
        googlePayButton.disabled = false; // Enable the payment button again
        loadingSpinner.style.display = 'none'; // Hide loading spinner
    };

    // Event listeners for input validation and buttons
    emailInput.addEventListener('input', validateInputs);
    mobileInput.addEventListener('input', validateInputs);
    continueButton.addEventListener('click', onContinue);

    // Initial validation check to enable or disable the button
    validateInputs(); 
});
