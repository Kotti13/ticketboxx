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
            // Show loading spinner
            loadingSpinner.style.display = 'block';
            submitButton.disabled = true;

            // Simulate payment processing (e.g., 2 seconds delay)
            setTimeout(() => {
                // Payment successful, redirect to confirmation page
                window.location.href = 'ticket.html'; // Or use an actual payment gateway
            }, 2000); // Simulated delay (2 seconds)
        }
    });
});
