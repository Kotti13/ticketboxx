document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const totalPrice = params.get('price');
    const amountInput = document.getElementById('amount');
    amountInput.value = `₹${totalPrice || 0}`;

    const paymentForm = document.getElementById('paymentForm');
    const submitButton = document.getElementById('submitPayment');
    const googlePayButton = document.getElementById('googlePayButton');
    const loadingSpinner = document.getElementById('loading');


    const googlePayClient = new google.payments.api.PaymentsClient({ environment: 'TEST' });

    const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['MASTERCARD', 'VISA']
            },
            tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                    'gateway': 'example', 
                    'gatewayMerchantId': 'exampleMerchantId'
                }
            }
        }],
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

   
    googlePayClient.isReadyToPay(paymentDataRequest)
        .then(function(response) {
            if (response.result) {
                googlePayButton.style.display = 'block';
                googlePayButton.addEventListener('click', onGooglePayButtonClicked);
            }
        })
        .catch(function(err) {
            console.error("Error checking Google Pay readiness:", err);
        });

   
    function onGooglePayButtonClicked() {
        googlePayClient.loadPaymentData(paymentDataRequest)
            .then(function(paymentData) {
                
                processPayment(paymentData);
            })
            .catch(function(err) {
                console.error("Google Pay payment failed:", err);
                alert("Payment failed. Please try again.");
            });
    }

    
    function processPayment(paymentData) {
        loadingSpinner.style.display = 'block';
        submitButton.disabled = true;

        // Store booking details in sessionStorage
        sessionStorage.setItem('movieName', params.get('movieName'));
        sessionStorage.setItem('theatre', params.get('theatre'));
        sessionStorage.setItem('showTime', params.get('showTime'));
        sessionStorage.setItem('seats', params.get('seats'));
        sessionStorage.setItem('price', totalPrice);

        // Simulate a successful payment after processing
        setTimeout(() => {
            window.location.href = 'ticket.html';
        }, 2000);
    }
});
