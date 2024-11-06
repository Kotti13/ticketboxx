// document.addEventListener('DOMContentLoaded', function() {
//     const movieId = new URLSearchParams(window.location.search).get('id'); // Assuming the movie ID is passed in the query string
//     const movieDetails = fetch('../data/movie.json') // Adjust path as needed
//         .then(response => response.json())
//         .then(data => {
//             const movie = data.find(m => m.id === movieId);
//             document.getElementById('movie-title').textContent = movie.title;

//             const castList = document.getElementById('cast-list');
//             movie.cast.forEach(member => {
//                 const memberCard = document.createElement('div');
//                 memberCard.innerHTML = `<img src="${member.photo}" alt="${member.name}">
//                                         <p>${member.name}</p>`;
//                 castList.appendChild(memberCard);
//             });

//             const crewList = document.getElementById('crew-list');
//             movie.crew.forEach(member => {
//                 const memberCard = document.createElement('div');
//                 memberCard.innerHTML = `<img src="${member.photo}" alt="${member.name}">
//                                         <p>${member.name}</p>`;
//                 crewList.appendChild(memberCard);
//             });

//             document.getElementById('play-trailer').onclick = function() {
//                 const videoId = movie.trailer; // Assuming `trailer` contains the YouTube video ID
//                 document.getElementById('youtube-player').src = `https://www.youtube.com/embed/${videoId}`;
//                 document.getElementById('trailer-video').style.display = 'block';
//             };

//             document.getElementById('book-ticket').onclick = function() {
//                 // Redirect to booking page or handle ticket booking logic here
//                 alert("Redirecting to ticket booking...");
//             };
//         })
//         .catch(error => console.error('Error fetching movie data:', error));
// });
