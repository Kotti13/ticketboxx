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

// Sign up function
document.querySelector('.signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Sign up successful!");
        // Optionally redirect or reset the form
    } catch (error) {
        console.error("Error during sign up:", error);
        alert(error.message);
    }
});

// Login function
document.querySelector('.login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful!");
        // Optionally redirect or perform another action
        window.location.href="../home.html"
    } catch (error) {
        console.error("Error during login:", error);
        alert(error.message);
    }
});
