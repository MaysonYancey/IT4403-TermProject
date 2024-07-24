const apiKey = 'c7775f8a27b5480688df83b142bd92a3';
let currentPage = 1;
let currentType = 'movie';
let currentQuery = '';
let isGridView = true;
let currentItems = []; // To keep track of the current items displayed

$(document).ready(function() {
    // Initial load
    fetchFeaturedMovie();
    fetchSuggestedMovies();
    fetchGenres();

    // Home button functionality
    $('#home-btn').on('click', function() {
        currentQuery = '';
        currentPage = 1;
        fetchFeaturedMovie();
        fetchSuggestedMovies();
        $('#toggle-view').show(); // Ensure toggle view is shown on these pages
        $('#section-title').text('Trending'); // Reset section title
        $('#person-details').hide(); // Hide person details on navigation
    });

    // Movies button functionality
    $('#movies-btn').on('click', function() {
        currentQuery = '';
        currentPage = 1;
        fetchFeaturedMovie('movie');
        fetchSuggestedMovies('movie');
        $('#toggle-view').show(); // Ensure toggle view is shown on these pages
        $('#section-title').text('Trending'); // Reset section title
        $('#person-details').hide(); // Hide person details on navigation
    });

    // Shows button functionality
    $('#shows-btn').on('click', function() {
        currentQuery = '';
        currentPage = 1;
        fetchFeaturedMovie('tv');
        fetchSuggestedMovies('tv');
        $('#toggle-view').show(); // Ensure toggle view is shown on these pages
        $('#section-title').text('Trending'); // Reset section title
        $('#person-details').hide(); // Hide person details on navigation
    });

    // Show of the Month button functionality
    $('#show-of-the-month-btn').on('click', function() {
        displayShowOfTheMonth();
        $('#toggle-view').hide(); // Hide toggle view on this page
        $('#section-title').text('Details'); // Change section title
        $('#person-details').hide(); // Hide person details on navigation
    });

    // Search functionality
    $('#search-button').on('click', function() {
        const query = $('#search-input').val();
        if (query) {
            searchMovies(query);
            $('#search-input').val('');  // Clear the search input field after searching
        } else {
            alert('Please enter a search query');
        }
    });

    $('#search-input').on('keypress', function(e) {
        if (e.key === 'Enter') {
            $('#search-button').click();
        }
    });

    // Toggle view functionality
    $('#toggle-view').on('click', function() {
        isGridView = !isGridView;
        renderItems(currentItems, currentType); // Re-render the current items with the new view
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

function fetchSuggestedMovies(type = 'movie', page = 1) {
    currentType = type;
    currentPage = page;
    const url = `https://api.themoviedb.org/3/discover/${type}?api_key=${apiKey}&page=${page}`;

    $.ajax({
        url: url,
        method: 'GET',
        success: function(response) {
            currentItems = response.results; // Save the current items
            renderItems(response.results, type); // Render the items with the current view
        },
        error: function(error) {
            console.error('Error fetching suggested items:', error);
        }
    });
}

function renderItems(items, type) {
    const suggestedContainer = $('#suggested-container');
    suggestedContainer.empty();
    items.forEach(item => {
        const itemElement = `
            <div class="movie-card ${isGridView ? 'grid-view' : 'list-view'}" onclick="updateFeaturedItem(${item.id}, '${type}')">
                <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${item.title || item.name}">
                <h3>${item.title || item.name}</h3>
            </div>
        `;
        suggestedContainer.append(itemElement);
    });
    // Add paging controls at the top and bottom
    const pagingControls = `
        <div id="paging-controls" class="${isGridView ? '' : 'list-view'}">
            <button class="prev-page" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
            <button class="next-page">Next</button>
        </div>
    `;
    suggestedContainer.prepend(pagingControls);
    suggestedContainer.append(pagingControls);

    // Re-bind the click events for pagination buttons
    $('.prev-page').on('click', function() {
        if (currentPage > 1) {
            currentPage -= 1;
            if (currentQuery) {
                searchMovies(currentQuery, currentPage);
            } else {
                fetchSuggestedMovies(currentType, currentPage);
            }
        }
    });
    
    $('.next-page').on('click', function() {
        currentPage += 1;
        if (currentQuery) {
            searchMovies(currentQuery, currentPage);
        } else {
            fetchSuggestedMovies(currentType, currentPage);
        }
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
        url: `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${query}&page=${page}`,
        method: 'GET',
        success: function(response) {
            currentItems = response.results.slice(1); // Save the current items, excluding the top result
            const topResult = response.results[0];
            displayFeaturedItem(topResult);
            renderItems(response.results.slice(1), 'search');
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

function displayShowOfTheMonth() {
    const showId = 2316; // The ID for "The Office"
    const url = `https://api.themoviedb.org/3/tv/${showId}?api_key=${apiKey}`;
    
    $.ajax({
        url: url,
        method: 'GET',
        success: function(response) {
            displayFeaturedItem(response);
            displayShowDetails(response);
        },
        error: function(error) {
            console.error('Error fetching show of the month details:', error);
        }
    });
}

function displayShowDetails(show) {
    const showDetailsDiv = $('#suggested-container');
    showDetailsDiv.empty();
    const showDetails = `
        <div class="show-details">
            <h3>${show.name}</h3>
            <p>${show.overview}</p>
            <p>First Air Date: ${show.first_air_date}</p>
            <p>Rating: ${show.vote_average}</p>
            <h4>Cast:</h4>
            <ul id="cast-list"></ul>
        </div>
    `;
    showDetailsDiv.append(showDetails);
    fetchShowCast(show.id);
}

function fetchShowCast(showId) {
    const url = `https://api.themoviedb.org/3/tv/${showId}/credits?api_key=${apiKey}`;
    
    $.ajax({
        url: url,
        method: 'GET',
        success: function(response) {
            const castList = response.cast;
            const castListDiv = $('#cast-list');
            castListDiv.empty();
            castList.forEach(castMember => {
                const castItem = `
                    <li>
                        ${castMember.name} as ${castMember.character}
                        <button onclick="showPersonDetails(${castMember.id})">More about them</button>
                    </li>
                `;
                castListDiv.append(castItem);
            });
        },
        error: function(error) {
            console.error('Error fetching show cast:', error);
        }
    });
}
