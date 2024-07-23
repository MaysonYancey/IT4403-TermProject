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

    $('#search-input').on('keypress', function(e) {
        if (e.key === 'Enter') {
            $('#search-button').click();
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

    // Details button functionality
    $('#details-btn').on('click', function() {
        toggleDetails();
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
        </div>
    `;
    $('.featured-text').empty().append(itemElement);
    $('#details-btn').data('itemId', item.id).data('itemType', item.media_type || 'movie');
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
            <div class="movie-card" onclick="updateFeaturedItem(${item.id}, '${type}')">
                <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${item.title || item.name}">
                <h3>${item.title || item.name}</h3>
            </div>
        `;
        suggestedContainer.append(itemElement);
    });
}

function updateFeaturedItem(itemId, type) {
    const url = type === 'movie' ? 
        `https://api.themoviedb.org/3/movie/${itemId}?api_key=${apiKey}` : 
        `https://api.themoviedb.org/3/tv/${itemId}?api_key=${apiKey}`;
    
    $.ajax({
        url: url,
        method: 'GET',
        success: function(response) {
            displayFeaturedItem(response);
        },
        error: function(error) {
            console.error('Error fetching item details:', error);
        }
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
            itemDetailsDiv.css('background-image', `url(https://image.tmdb.org/t/p/w1280${backdropPath})`);
            const itemDetails = `
                <div class="featured-text details-view">
                    <h2>${response.title || response.name}</h2>
                    <p>${response.overview}</p>
                    <p>Release Date: ${response.release_date || response.first_air_date}</p>
                    <p>Rating: ${response.vote_average}</p>
                    <button id="back-btn" onclick="toggleDetails()">Back</button>
                </div>
            `;
            $('.featured-text').empty().append(itemDetails);
            $('#featured-movie').css('transform', 'translateX(-100%)');
        },
        error: function(error) {
            console.error('Error fetching item details:', error);
        }
    });
}

function toggleDetails() {
    const isDetailsView = $('#featured-movie').css('transform') === 'matrix(1, 0, 0, 0, 0, 0)'; // Check if it's in the details view
    if (isDetailsView) {
        $('#featured-movie').css('transform', 'translateX(0)');
    } else {
        $('#featured-movie').css('transform', 'translateX(-100%)');
    }
}
