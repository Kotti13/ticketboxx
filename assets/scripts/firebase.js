// Import Firebase and Supabase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2.0.0';

// Firebase Configuration
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
const app = initializeApp(firebaseConfig); // Initialize Firebase app
const auth = getAuth(app); // Now you can safely use Firebase authentication


// Supabase Configuration
const supabaseUrl = 'https://srjumswibbswcwjntcad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyanVtc3dpYmJzd2N3am50Y2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2Nzk5MzcsImV4cCI6MjA0NTI1NTkzN30.e_ZkFg_EPI8ObvFz70Ejc1W4RGpQurr0SoDlK6IoEXY';

// // Initialize Firebase & Supabase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Example of a query
const saveUserToSupabase = async (user, username) => {
    const { email, uid } = user;

    try {
        // Try inserting the user data into Supabase
        const { data, error } = await supabase
            .from('users')
            .upsert({
                email,
                username,
                firebase_uid: uid,
                created_at: new Date()
            });

        if (error) {
            console.error('Error saving user to Supabase:', error.message);
            alert('Failed to save user data to Supabase');
        } else {
            console.log('User successfully saved to Supabase:', data);
        }
    } catch (error) {
        console.error('Error saving user to Supabase:', error.message);
        alert('Something went wrong while saving user data');
    }
};


// // GitHub login handler
// document.getElementById('githubLoginLink').addEventListener('click', async (event) => {
//     event.preventDefault(); // Prevent the default link behavior

//     try {
//         // Initiate GitHub OAuth login via Supabase
//         const { error } = await supabase.auth.signInWithOAuth({
//             provider: 'github', // GitHub as the OAuth provider
//             redirectTo: 'https://srjumswibbswcwjntcad.supabase.co/auth/v1/callback', // Callback URL
//         });

//         if (error) {
//             console.error('Error during GitHub login:', error.message);
//             alert('GitHub login failed. Please try again.');
//         }
//     } catch (error) {
//         console.error('Error during GitHub login process:', error);
//         alert('Something went wrong with GitHub login. Please try again.');
//     }
// });

// Sign-up handler
document.querySelector('.signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous error messages
    document.getElementById('usernameError').textContent = "";
    document.getElementById('emailError').textContent = "";
    document.getElementById('passwordError').textContent = "";
    document.getElementById('confirmPasswordError').textContent = "";

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    let isValid = true;

    // Username validation
    if (username === "") {
        document.getElementById('usernameError').textContent = "Username is required.";
        isValid = false;
    } else if (/\s/.test(username)) {
        document.getElementById('usernameError').textContent = "Username cannot contain spaces.";
        isValid = false;
    } else if (username.length < 5) {
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

    // Proceed if validation is successful
    if (isValid) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save user to Supabase, including the username
            await saveUserToSupabase(user, username);
      
            // Close the sign-up modal
            const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
            signupModal.hide(); // Hide the signup modal

            // Open the login modal
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show(); // Show the login modal
             
            alert("Sign up successful! Please log in.");

        } catch (error) {
            console.error("Error during sign up:", error);
            alert(error.message);
        }
    }
});

// Login handler
document.querySelector('.login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous error messages
    document.getElementById('loginEmailError').textContent = "";
    document.getElementById('loginPasswordError').textContent = "";

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = true;

    // Validate email
    if (!emailPattern.test(email)) {
        document.getElementById('loginEmailError').textContent = "Please enter a valid email address.";
        isValid = false;
    }

    // Validate password
    if (password === "") {
        document.getElementById('loginPasswordError').textContent = "Password is required.";
        isValid = false;
    }

    // Proceed if validation is successful
    if (isValid) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            localStorage.setItem("usermail",user.email)
            alert("Login successful!");
            window.location.href = "./assets/pages/home.html";
        } catch (error) {
            console.error("Error during login:", error);
            document.getElementById('loginEmailError').textContent = "Invalid email or password.";
            document.getElementById('loginPasswordError').textContent = "Invalid email or password.";
        }
    }
});

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('User is signed in:', user);
        saveUserToSupabase(user);
    } else {
        console.log('No user is signed in');
    }
});

// Example of querying user data from Supabase
const getUserFromSupabase = async (uid) => {
    try {
        // Fetch user from Supabase using the Firebase UID
        const { data, error } = await supabase
            .from('users')
            .select('email, username, firebase_uid, created_at')
            .eq('firebase_uid', uid)  // Searching based on Firebase UID
            .single();  // Return a single row

        if (error) {
            console.error('Error fetching user data from Supabase:', error.message);
        } else {
            console.log('User data from Supabase:', data);
            // Use `data` for any further processing
        }
    } catch (error) {
        console.error('Error in Supabase query:', error.message);
    }
};

// Handle Supabase callback after GitHub login
window.onload = async () => {
    const { user, error } = await supabase.auth.getSession();
    if (user) {
        console.log('Supabase user session:', user);
        saveUserToSupabase(user);  // Save user info to Supabase
    } else {
        console.error('GitHub login error:', error);
    }
};
