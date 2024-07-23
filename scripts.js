const apiKey = 'c7775f8a27b5480688df83b142bd92a3';

$(document).ready(function() {
    // Initial load
    fetchFeaturedMovie();
    fetchSuggestedMovies();

    // Home button functionality
    $('#home-btn').on('click', function() {
        fetchFeaturedMovie();
        fetchSuggestedMovies();
    });

    // Movies button functionality
    $('#movies-btn').on('click', function() {
        fetchFeaturedMovie('movie');
        fetchSuggestedMovies('movie');
    });

    // Shows button functionality
    $('#shows-btn').on('click', function() {
        fetchFeaturedMovie('tv');
        fetchSuggestedMovies('tv');
    });

    // Search functionality
    $('#search-button').on('click', function() {
        const query = $('#search-input').val();
        if (query) {
            searchMovies(query);
        } else {
            alert('Please enter a search query');
        }
    });

    // Keep navbar stagnant after scrolling
    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 50) {
            $('#navbar').addClass('fixed');
        } else {
            $('#navbar').removeClass('fixed');
        }
    });
});

function fetchFeaturedMovie(type = 'movie') {
    const url = type === 'movie' ? 
        `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=1` : 
        `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&page=1`;
    
    $.ajax({
        url: url,
        method: 'GET',
        success: function(response) {
            const item = response.results[Math.floor(Math.random() * response.results.length)];
            displayFeaturedItem(item);
        },
        error: function(error) {
            console.error('Error fetching featured item:', error);
        }
    });
}

function displayFeaturedItem(item) {
    const featuredDiv = $('#featured');
    const backdropPath = item.backdrop_path || item.poster_path;
    featuredDiv.css('background-image', `url(https://image.tmdb.org/t/p/w1280${backdropPath})`);
    const itemElement = `
        <div class="featured-text">
            <h2>${item.title || item.name}</h2>
            <p>${item.overview}</p>
            <button onclick="showItemDetails(${item.id}, '${item.media_type || 'movie'}')">Watch Now</button>
            <button onclick="showItemDetails(${item.id}, '${item.media_type || 'movie'}')">Details</button>
        </div>
    `;
    $('.featured-text').empty().append(itemElement);
}

function fetchSuggestedMovies(type = 'movie') {
    const url = type === 'movie' ? 
        `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&page=1` : 
        `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&page=1`;
    
    $.ajax({
        url: url,
        method: 'GET',
        success: function(response) {
            displaySuggestedItems(response.results, type);
        },
        error: function(error) {
            console.error('Error fetching suggested items:', error);
        }
    });
}

function displaySuggestedItems(items, type) {
    const suggestedContainer = $('#suggested-container');
    suggestedContainer.empty();
    items.forEach(item => {
        const itemElement = `
            <div class="movie-card" onclick="showItemDetails(${item.id}, '${type}')">
                <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${item.title || item.name}">
                <h3>${item.title || item.name}</h3>
            </div>
        `;
        suggestedContainer.append(itemElement);
    });
}

function searchMovies(query) {
    $.ajax({
        url: `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${query}`,
        method: 'GET',
        success: function(response) {
            const topResult = response.results[0];
            displayFeaturedItem(topResult);
            displaySuggestedItems(response.results.slice(1), 'search');
            $('#section-title').text('Results');
        },
        error: function(error) {
            console.error('Error searching items:', error);
        }
    });
}

function showItemDetails(itemId, type) {
    const url = type === 'movie' ? 
        `https://api.themoviedb.org/3/movie/${itemId}?api_key=${apiKey}` : 
        `https://api.themoviedb.org/3/tv/${itemId}?api_key=${apiKey}`;
    
    $.ajax({
        url: url,
        method: 'GET',
        success: function(response) {
            const backdropPath = response.backdrop_path || response.poster_path;
            const itemDetailsDiv = $('#featured');
            itemDetailsDiv.empty().css('background-image', `url(https://image.tmdb.org/t/p/w1280${backdropPath})`);
            const itemDetails = `
                <div class="featured-text">
                    <h2>${response.title || response.name}</h2>
                    <p>${response.overview}</p>
                    <img src="https://image.tmdb.org/t/p/w500${response.poster_path}" alt="${response.title || response.name}">
                    <p>Release Date: ${response.release_date || response.first_air_date}</p>
                    <p>Rating: ${response.vote_average}</p>
                    <button onclick="fetchFeaturedMovie('${type}')">Back</button>
                </div>
            `;
            $('.featured-text').append(itemDetails);
        },
        error: function(error) {
            console.error('Error fetching item details:', error);
        }
    });
}
