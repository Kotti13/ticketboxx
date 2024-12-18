// First, we import the necessary SDKs from Firebase and Supabase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2.0.0';

// Accessing Firebase Configuration from Environment Variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);  
const auth = getAuth(app); 
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
console.log(apiKey)
// Accessing Supabase Configuration from Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Firebase Config:', firebaseConfig);
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey);

// Function to save user data into Supabase
const saveUserToSupabase = async (user, username) => {
    const { email, uid } = user;

    try {
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
        } else {
            console.log('User successfully saved to Supabase:', data);
        }
    } catch (error) {
        console.error('Error saving user to Supabase:', error.message);
        alert('Something went wrong while saving user data');
    }
};

// Signup form handler
document.querySelector('.signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous error messages
    document.getElementById('usernameError').textContent = "";
    document.getElementById('emailError').textContent = "";
    document.getElementById('passwordError').textContent = "";
    document.getElementById('confirmPasswordError').textContent = "";

    // Get input values
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate the form
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

    // Proceed if the form is valid
    if (isValid) {
        try {
            // Firebase sign-up
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save the user data to Supabase
            await saveUserToSupabase(user, username);

            // Hide the sign-up modal and show the login modal
            const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
            signupModal.hide();

            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();

            alert("Sign-up successful! Please log in.");
        } catch (error) {
            console.error("Error during sign-up:", error);
            alert(error.message);
        }
    }
});

// Login form handler
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

    // Proceed if the form is valid
    if (isValid) {
        try {
            // Firebase login
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store email in localStorage for session management
            localStorage.setItem("usermail", user.email);

            alert("Login successful!");
            window.location.href = "./assets/pages/home.html";
        } catch (error) {
            console.error("Error during login:", error);
            document.getElementById('loginEmailError').textContent = "Invalid email or password.";
            document.getElementById('loginPasswordError').textContent = "Invalid email or password.";
        }
    }
});

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('User is signed in:', user);
        saveUserToSupabase(user);
    } else {
        console.log('No user is signed in');
    }
});

// Function to fetch user data from Supabase
const getUserFromSupabase = async (uid) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('email, username, firebase_uid, created_at')
            .eq('firebase_uid', uid)  
            .single();

        if (error) {
            console.error('Error fetching user data from Supabase:', error.message);
        } else {
            console.log('User data from Supabase:', data);
        }
    } catch (error) {
        console.error('Error in Supabase query:', error.message);
    }
};

// Example of handling a session with Supabase (could be GitHub or other OAuth provider)
window.onload = async () => {
    const { user, error } = await supabase.auth.getSession();
    if (user) {
        console.log('Supabase user session:', user);
        saveUserToSupabase(user);  // Save user data to Supabase
    } else {
        console.error('GitHub login error:', error);
    }
};
