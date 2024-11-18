// firebase.js

// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBcFRNdsErrXYHiiuYlCf6txDjupaNwRno",
    authDomain: "ticketboxx-c4049.firebaseapp.com",
    projectId: "ticketboxx-c4049",
    storageBucket: "ticketboxx-c4049.appspot.com",
    messagingSenderId: "1029974974410",
    appId: "1:1029974974410:web:a94d9c5fe267f3e51db933",
    measurementId: "G-F7PEJ1WQRV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Enhanced Form Validation with Firebase Integration

document.querySelector('.signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous error messages
    document.getElementById('usernameError').textContent = "";
    document.getElementById('emailError').textContent = "";
    document.getElementById('passwordError').textContent = "";
    document.getElementById('confirmPasswordError').textContent = "";

    // Get values
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation patterns
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    let isValid = true;

    // Username validation - check if username is empty, contains spaces, or is too short
    if (username === "") {
        document.getElementById('usernameError').textContent = "Username is required.";
        isValid = false;
    } else if (/\s/.test(username)) {  // Check if the username contains spaces
        document.getElementById('usernameError').textContent = "Username cannot contain spaces.";
        isValid = false;
    } else if (username.length < 5) {  // Check if the username is too short (less than 5 characters)
        document.getElementById('usernameError').textContent = "Username must be at least 5 characters long.";
        isValid = false;
    }

    // Email validation
    if (!emailPattern.test(email)) {
        document.getElementById('emailError').textContent = "Please enter a valid email address.";
        isValid = false;
    }

    // Password validation
    if (!passwordPattern.test(password)) {
        document.getElementById('passwordError').textContent = "Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character.";
        isValid = false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = "Passwords do not match.";
        isValid = false;
    }

    if (isValid) {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Sign up successful!");
        } catch (error) {
            console.error("Error during sign up:", error);
            alert(error.message);
        }
    }
});

document.querySelector('.login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous error messages
    document.getElementById('loginEmailError').textContent = "";
    document.getElementById('loginPasswordError').textContent = "";

    // Get values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Validation patterns
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = true;

    // Email validation
    if (!emailPattern.test(email)) {
        document.getElementById('loginEmailError').textContent = "Please enter a valid email address.";
        isValid = false;
    }

    // Password validation
    if (password === "") {
        document.getElementById('loginPasswordError').textContent = "Password is required.";
        isValid = false;
    }

    // If form is valid, attempt login
    if (isValid) {
        try {
            // Attempt to sign in
            await signInWithEmailAndPassword(auth, email, password);
            alert("Login successful!");
            window.location.href = "./assets/pages/home.html";
        } catch (error) {
            console.error("Error during login:", error);

            // Generic error message for invalid username or password
            document.getElementById('loginEmailError').textContent = "Invalid username or password.";
            document.getElementById('loginPasswordError').textContent = "Invalid username or password.";
        }
    }
});
