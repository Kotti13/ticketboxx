document.addEventListener("DOMContentLoaded", () => {
    // Firebase configuration
    // const firebaseConfig = {
    //     apiKey: "AIzaSyBcFRNdsErrXYHiiuYlCf6txDjupaNwRno",
    //     authDomain: "ticketboxx-c4049.firebaseapp.com",
    //     databaseURL: "https://ticketboxx-c4049-default-rtdb.firebaseio.com",
    //     projectId: "ticketboxx-c4049",
    //     storageBucket: "ticketboxx-c4049.firebasestorage.app",
    //     messagingSenderId: "1029974974410",
    //     appId: "1:1029974974410:web:a94d9c5fe267f3e51db933",
    //     measurementId: "G-F7PEJ1WQRV"
    // };

    // // Initialize Firebase
    // const app = initializeApp(firebaseConfig);
    // const analytics = getAnalytics(app);
    // const storage = getStorage(app); // Firebase Storage
    // const db = getFirestore(app); // Firestore Database

    const movieName = sessionStorage.getItem('movieName') || "N/A";
    const theatreName = sessionStorage.getItem('theatre') || "N/A";
    const showTime = sessionStorage.getItem('showTime') || "N/A";
    const date = sessionStorage.getItem('date') || "N/A";
    const seats = sessionStorage.getItem('seats') || "N/A";
    const amount = sessionStorage.getItem('price') || "₹0";

    let customerPhone = sessionStorage.getItem('customerPhone');
    if (!customerPhone) {
        customerPhone = prompt("Enter your WhatsApp number (with country code, e.g., +91XXXXXXXXXX):");
        if (customerPhone) {
            sessionStorage.setItem('customerPhone', customerPhone);
        } else {
            alert("Phone number is required to send the ticket.");
            return;
        }
    }

    const bookingId = generateBookingId();
    document.getElementById('movieName').textContent = movieName;
    document.getElementById('theatreName').textContent = theatreName;
    document.getElementById('showTime').textContent = showTime;
    document.getElementById('date').textContent = date;
    document.getElementById('seats').textContent = seats;
    document.getElementById('bookingId').textContent = bookingId;
    document.getElementById('amount').textContent = amount;

    fetchMoviePoster(movieName)
        .then((poster) => {
            document.getElementById('moviePoster').src = poster;
            return downloadTicketPDF(movieName, theatreName, showTime, date, seats, bookingId, amount, poster);
        })
        .then((pdfBlob) => uploadToFirebaseStorage(storage, pdfBlob, `${bookingId}.pdf`))
        .then((pdfUrl) => {
            storeTicketInFirestore(bookingId, pdfUrl); // Store the PDF URL in Firestore
            sendTicketToWhatsApp(customerPhone, pdfUrl); // Send the ticket via WhatsApp
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Something went wrong. Please try again.");
        });

    sessionStorage.setItem('bookingId', bookingId);

    const qrData = { movieName, theatreName, showTime, date, seats, bookingId };
    new QRCode(document.getElementById("qrcode"), {
        text: JSON.stringify(qrData),
        width: 128,
        height: 128,
    });
});

function generateBookingId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function fetchMoviePoster(movieName) {
    try {
        const response = await fetch('../data/movies.json');
        const data = await response.json();
        const movie = data.movies.find((m) => m.title?.toLowerCase() === movieName.toLowerCase());
        return movie ? movie.poster : "../images/default-poster.png";
    } catch (error) {
        console.error("Error fetching movie poster:", error);
        return "../images/default-poster.png";
    }
}

function downloadTicketPDF(movieName, theatreName, showTime, date, seats, bookingId, amount, poster) {
    return new Promise((resolve) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16).text("Your Movie Ticket", 20, 20);
        doc.setFontSize(12);
        doc.text(`Movie: ${movieName}`, 20, 30);
        doc.text(`Theatre: ${theatreName}`, 20, 40);
        doc.text(`Show Time: ${showTime}`, 20, 50);
        doc.text(`Date: ${date}`, 20, 60);
        doc.text(`Seats: ${seats}`, 20, 70);
        doc.text(`Booking ID: ${bookingId}`, 20, 80);
        doc.text(`Amount: ${amount}`, 20, 90);

        loadImage(poster).then((img) => {
            doc.addImage(img, "JPEG", 20, 100, 50, 75);
            resolve(doc.output("blob"));
        }).catch(() => resolve(doc.output("blob")));
    });
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function uploadToFirebaseStorage(storage, pdfBlob, fileName) {
    return new Promise((resolve, reject) => {
        const storageRef = storage.ref().child(`tickets/${fileName}`);
        const uploadTask = storageRef.put(pdfBlob);

        uploadTask.on(
            "state_changed",
            null,
            (error) => reject(error),
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then(resolve).catch(reject);
            }
        );
    });
}

function storeTicketInFirestore(bookingId, pdfUrl) {
    const ticketRef = collection(db, "tickets");
    addDoc(ticketRef, {
        bookingId: bookingId,
        pdfUrl: pdfUrl,
        timestamp: new Date(),
    })
    .then(() => {
        console.log("Ticket stored in Firestore.");
    })
    .catch((error) => {
        console.error("Error storing ticket in Firestore:", error);
    });
}

function sendTicketToWhatsApp(phoneNumber, pdfUrl) {
    const twilioSid = "ACeb95140570b84ca002899458dbd37f84";
    const twilioAuthToken = "dd408be60ee222d3a26f5541b825b46f";
    const twilioPhoneNumber = "whatsapp:+17755428939";
    const customerPhone = `whatsapp:${phoneNumber}`;

    const formData = new FormData();
    formData.append("To", customerPhone);
    formData.append("From", twilioPhoneNumber);
    formData.append("Body", "Here is your movie ticket!");
    formData.append("MediaUrl", pdfUrl);

    fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: "POST",
        headers: { Authorization: "Basic " + btoa(`${twilioSid}:${twilioAuthToken}`) },
        body: formData,
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.status === 400) {
            console.error("Failed to send ticket:", data);
            alert("Failed to send the ticket to WhatsApp.");
        } else {
            console.log("Ticket sent to WhatsApp:", data);
            alert("Your ticket has been sent to your WhatsApp!");
        }
    })
    .catch((error) => {
        console.error("Error sending ticket to WhatsApp:", error);
        alert("Failed to send the ticket via WhatsApp.");
    });
}
