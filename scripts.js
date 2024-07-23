const apiKey = 'c7775f8a27b5480688df83b142bd92a3';
let currentPage = 1;
let currentType = 'movie';
let currentQuery = '';
let currentSort = 'popularity.desc';
let currentGenre = '';

$(document).ready(function() {
    // Initial load
    fetchFeaturedMovie();
    fetchSuggestedMovies();
    fetchGenres();

    // Home button functionality
    $('#home-btn').on('click', function() {
        currentQuery = '';
        fetchFeaturedMovie();
        fetchSuggestedMovies();
    });

    // Movies button functionality
    $('#movies-btn').on('click', function() {
        currentQuery = '';
        fetchFeaturedMovie('movie');
        fetchSuggestedMovies('movie');
    });

    // Shows button functionality
    $('#shows-btn').on('click', function() {
        currentQuery = '';
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

    // Sorting and Filtering functionality
    $('#sort-select').on('change', function() {
        currentSort = $(this).val();
        if (currentQuery) {
            searchMovies(currentQuery, 1);
        } else {
            fetchSuggestedMovies(currentType, 1);
        }
    });

    $('#genre-select').on('change', function() {
        currentGenre = $(this).val();
        if (currentQuery) {
            searchMovies(currentQuery, 1);
        } else {
            fetchSuggestedMovies(currentType, 1);
        }
    });
});

function fetchFeaturedMovie(type = 'movie') {
    currentType = type;
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
            <p>Release Date: ${item.release_date || item.first_air_date}</p>
            <p>Rating: ${item.vote_average}</p>
        </div>
    `;
    $('.featured-text').empty().append(itemElement);
}

function fetchSuggestedMovies(type = 'movie', page = 1, sort = 'popularity.desc', genre = '') {
    currentType = type;
    currentPage = page;
    currentSort = sort;
    currentGenre = genre;
    let url = `https://api.themoviedb.org/3/discover/${type}?api_key=${apiKey}&page=${page}&sort_by=${sort}`;
    if (genre) {
        url += `&with_genres=${genre}`;
    }

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
    // Add paging controls at the top and bottom
    const pagingControls = `
        <div id="paging-controls">
            <button onclick="fetchSuggestedMovies('${type}', ${currentPage - 1}, '${currentSort}', '${currentGenre}')" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
            <button onclick="fetchSuggestedMovies('${type}', ${currentPage + 1}, '${currentSort}', '${currentGenre}')">Next</button>
        </div>
    `;
    suggestedContainer.prepend(pagingControls);
    suggestedContainer.append(pagingControls);
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
            // Scroll to the featured section
            $('html, body').animate({
                scrollTop: $("#featured").offset().top
            }, 500);
        },
        error: function(error) {
            console.error('Error fetching item details:', error);
        }
    });
}

function searchMovies(query, page = 1) {
    currentQuery = query;
    currentPage = page;
    $.ajax({
        url: `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${query}&page=${page}&sort_by=${currentSort}&with_genres=${currentGenre}`,
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

function fetchGenres() {
    $.ajax({
        url: `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`,
        method: 'GET',
        success: function(response) {
            populateGenres(response.genres);
        },
        error: function(error) {
            console.error('Error fetching genres:', error);
        }
    });
}

function populateGenres(genres) {
    const genreSelect = $('#genre-select');
    genreSelect.empty();
    genreSelect.append('<option value="">All</option>');
    genres.forEach(genre => {
        const optionElement = `<option value="${genre.id}">${genre.name}</option>`;
        genreSelect.append(optionElement);
    });
}

function showPersonDetails(personId) {
    $.ajax({
        url: `https://api.themoviedb.org/3/person/${personId}?api_key=${apiKey}`,
        method: 'GET',
        success: function(response) {
            displayPersonDetails(response);
        },
        error: function(error) {
            console.error('Error fetching person details:', error);
        }
    });
}

function displayPersonDetails(person) {
    const personDetailsDiv = $('#person-info');
    const personDetails = `
        <h3>${person.name}</h3>
        <p>Birthday: ${person.birthday}</p>
        <p>Place of Birth: ${person.place_of_birth}</p>
        <p>Biography: ${person.biography}</p>
    `;
    personDetailsDiv.empty().append(personDetails);
    $('#person-details').show();
}
