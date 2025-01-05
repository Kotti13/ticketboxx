// Form Validation
function validateForm(event) {
    
    event.preventDefault();

    // Get form elements
    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var message = document.getElementById("message").value.trim();

   
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

   
    var nameRegex = /^[a-zA-Z\s]{3,50}$/;  // Name should be 3-50 characters, only letters and spaces

    // Validation messages
    var errors = [];

    // Name validation
    if (name === "") {
        errors.push("Name is required.");
    } else if (!nameRegex.test(name)) {
        errors.push("Please enter a valid name.");
    }

    // Email validation
    if (email === "") {
        errors.push("Email is required.");
    } else if (!emailRegex.test(email)) {
        errors.push("Please enter a valid email address.");
    }

    // Message validation
    if (message === "") {
        errors.push("Message is required.");
    } else if (message.length < 10) {
        errors.push("Message must be at least 10 characters long.");
    }

    // Show validation errors
    var errorContainer = document.getElementById("errorMessages");
    errorContainer.innerHTML = "";
    if (errors.length > 0) {
        errors.forEach(function(error) {
            var errorElement = document.createElement("p");
            errorElement.style.color = "red";
            errorElement.textContent = error;
            errorContainer.appendChild(errorElement);
        });
    } else {
        // If no errors, submit the form
        event.target.submit();
    }
}