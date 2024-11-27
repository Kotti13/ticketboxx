// payment.js
document.addEventListener('DOMContentLoaded', () => {
    // Pre-fill amount from URL (assumed passed via query string)
    const params = new URLSearchParams(window.location.search);
    const totalPrice = params.get('price');
    const amountInput = document.getElementById('amount');
    amountInput.value = `₹${totalPrice || 0}`;

    // Payment form validation
    const paymentForm = document.getElementById('paymentForm');
    const submitButton = document.getElementById('submitPayment');
    const loadingSpinner = document.getElementById('loading');

    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent form submission until validation

        // Form validation
        const cardholderName = document.getElementById('cardholderName').value;
        const cardNumber = document.getElementById('cardNumber').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;

        let isValid = true;

        // Validate cardholder name
        if (!cardholderName) {
            alert("Cardholder name is required.");
            isValid = false;
        }

        // Validate card number
        if (!/^\d{16}$/.test(cardNumber)) {
            alert("Card number must be 16 digits.");
            isValid = false;
        }

        // Validate expiry date (MM/YY)
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            alert("Expiry date must be in MM/YY format.");
            isValid = false;
        }

        // Validate CVV
        if (!/^\d{3}$/.test(cvv)) {
            alert("CVV must be 3 digits.");
            isValid = false;
        }

        if (isValid) {
            loadingSpinner.style.display = 'block';
            submitButton.disabled = true;
        
            // Store ticket details in session storage
            sessionStorage.setItem('movieName', params.get('movieName'));
            sessionStorage.setItem('theatre', params.get('theatre'));
            sessionStorage.setItem('showTime', params.get('showTime'));
            sessionStorage.setItem('seats', params.get('seats'));
            sessionStorage.setItem('date', params.get('date'));
            sessionStorage.setItem('poster', params.get('poster')); // Assuming this is passed in query
        
            // Simulate payment processing and redirect
            setTimeout(() => {
                window.location.href = 'ticket.html';
            }, 2000);
        }
        
    });
});
