const apiKey = 'c7775f8a27b5480688df83b142bd92a3';

$(document).ready(function() {
    // Fetch and display featured movie
    fetchFeaturedMovie();

    // Fetch and display suggested movies
    fetchSuggestedMovies();

    // Search functionality
    $('#search-button').on('click', function() {
        const query = $('#search-input').val();
        if (query) {
            searchMovies(query);
        } else {
            alert('Please enter a search query');
        }
    });
});

function fetchFeaturedMovie() {
    $.ajax({
        url: `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=1`,
        method: 'GET',
        success: function(response) {
            const movie = response.results[0]; // Get the first popular movie
            displayFeaturedMovie(movie);
        },
        error: function(error) {
            console.error('Error fetching featured movie:', error);
        }
    });
}

function displayFeaturedMovie(movie) {
    const featuredMovieDiv = $('#featured-movie');
    featuredMovieDiv.empty();
    featuredMovieDiv.css('background-image', `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})`);
    const movieElement = `
        <div>
            <h2>${movie.title}</h2>
            <p>${movie.overview}</p>
            <button>Watch Now</button>
            <button>Details</button>
        </div>
    `;
    featuredMovieDiv.append(movieElement);
}

function fetchSuggestedMovies() {
    $.ajax({
        url: `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&page=1`,
        method: 'GET',
        success: function(response) {
            displaySuggestedMovies(response.results);
        },
        error: function(error) {
            console.error('Error fetching suggested movies:', error);
        }
    });
}

function displaySuggestedMovies(movies) {
    const suggestedContainer = $('#suggested-container');
    suggestedContainer.empty();
    movies.forEach(movie => {
        const movieElement = `
            <div class="movie-card">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                <h3>${movie.title}</h3>
            </div>
        `;
        suggestedContainer.append(movieElement);
    });
}

function searchMovies(query) {
    $.ajax({
        url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
        method: 'GET',
        success: function(response) {
            displaySuggestedMovies(response.results);
        },
        error: function(error) {
            console.error('Error searching movies:', error);
        }
    });
}
