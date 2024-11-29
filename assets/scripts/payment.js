document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const totalPrice = params.get('price');
    const continueButton = document.getElementById('continueButton');
    const googlePayButton = document.getElementById('googlePayButton');
    const googlePaySection = document.getElementById('googlePaySection');
    const emailInput = document.getElementById('email');
    const mobileInput = document.getElementById('mobile');
    const loadingSpinner = document.getElementById('loading');

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
            totalPrice: totalPrice || '0',
            currencyCode: 'INR'
        },
        merchantInfo: {
            merchantName: 'Ticketboxx',
            merchantId: '1234567890'
        }
    };

    // Validate input fields
    function validateInputs() {
        const email = emailInput.value.trim();
        const mobile = mobileInput.value.trim();
        continueButton.disabled = !(email && mobile.length === 10);
    }

    function onContinue() {
        const email = emailInput.value.trim();
        const mobile = mobileInput.value.trim();
    
        if (mobile.length === 10) { // Basic validation
            sessionStorage.setItem('customerPhone', mobile); // Store phone in sessionStorage
        } else {
            alert('Invalid mobile number!');
            return;
        }
    
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userMobile', mobile);
    
        document.querySelector('.form-section').style.display = 'none';
        googlePaySection.style.display = 'block';
    
        // Continue with the Google Pay readiness check
        googlePayClient.isReadyToPay(paymentDataRequest).then((response) => {
            if (response.result) {
                googlePayButton.style.display = 'block';
                googlePayButton.disabled = false;
                googlePayButton.addEventListener('click', onGooglePayButtonClicked);
            }
        }).catch((err) => {
            console.error('Error checking Google Pay readiness:', err);
        });
    }
    

    // Process payment with Google Pay
    function onGooglePayButtonClicked() {
        googlePayClient.loadPaymentData(paymentDataRequest)
            .then((paymentData) => {
                sessionStorage.setItem('movieName', params.get('movieName'));
                sessionStorage.setItem('theatre', params.get('theatre'));
                sessionStorage.setItem('showTime', params.get('showTime'));
                sessionStorage.setItem('seats', params.get('seats'));
                sessionStorage.setItem('price', totalPrice);

                processPayment(paymentData);
            })
            .catch((err) => {
                console.error('Google Pay payment failed:', err);
                alert('Payment failed. Please try again.');
            });
    }

    // Simulate payment processing
    function processPayment(paymentData) {
        loadingSpinner.style.display = 'block';
        setTimeout(() => {
            window.location.href = 'ticket.html';
        }, 1000);
    }

    // Event Listeners
    emailInput.addEventListener('input', validateInputs);
    mobileInput.addEventListener('input', validateInputs);
    continueButton.addEventListener('click', onContinue);
});
