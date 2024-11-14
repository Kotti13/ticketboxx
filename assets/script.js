document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const movieId = parseInt(params.get('id')); // Get movie ID from URL

    fetch('movieData.json')
        .then(response => response.json())
        .then(data => {
            const movie = data.movies.find(m => m.id === movieId);
            if (movie) {
                document.getElementById('movie-title').textContent = movie.title;
                document.getElementById('movie-rating').textContent = `${movie.rating}/10 (${movie.votes} Votes)`;
                document.getElementById('movie-info').textContent = `${movie.language} • ${movie.duration}`;
                document.getElementById('movie-description').textContent = movie.description;

                const castList = document.getElementById('cast-list');
                movie.cast.forEach(member => {
                    const card = document.createElement('div');
                    card.className = 'cast-crew-card';
                    card.innerHTML = `
                        <img src="${member.image}" alt="${member.name}">
                        <p>${member.name}</p>
                        <small>${member.role}</small>
                    `;
                    castList.appendChild(card);
                });

                const crewList = document.getElementById('crew-list');
                movie.crew.forEach(member => {
                    const card = document.createElement('div');
                    card.className = 'cast-crew-card';
                    card.innerHTML = `
                        <img src="${member.image}" alt="${member.name}">
                        <p>${member.name}</p>
                        <small>${member.role}</small>
                    `;
                    crewList.appendChild(card);
                });

                document.getElementById('play-trailer').onclick = () => {
                    window.open(movie.trailer, '_blank');
                };

                document.getElementById('book-ticket').onclick = () => {
                    alert("Booking functionality goes here.");
                };
            } else {
                console.error('Movie not found');
            }
        })
        .catch(err => console.error('Error fetching movie data:', err));
});

