// DOM elements
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const resultsSection = document.getElementById('resultsSection');
const resultsTitle = document.getElementById('resultsTitle');
const resultsCount = document.getElementById('resultsCount');
const productsGrid = document.getElementById('productsGrid');

// Global variable to store current products
let currentProducts = [];

// Search functionality
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const query = searchInput.value.trim();
    if (!query) return;
    
    await performSearch(query);
});

// Perform search API call with automatic better image selection
async function performSearch(query) {
    try {
        // Show loading state with image selection message
        showLoading(true);
        hideError();
        hideResults();
        
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });
        
        if (!response.ok) {
            throw new Error('Search failed. Please try again.');
        }
        
        const data = await response.json();
        
        // Hide loading state
        hideLoading();
        
        if (data.products && data.products.length > 0) {
            currentProducts = data.products;
            displayResults(currentProducts, query, data.improvedCount);
        } else {
            showError('No products found. Try a different search term.');
        }
        
    } catch (error) {
        hideLoading();
        showError(error.message || 'Something went wrong. Please try again.');
    }
}

// Functions removed - better image selection now happens automatically during search

// Display search results with better image information
function displayResults(products, query, improvedCount = 0) {
    resultsTitle.textContent = `Search Results for "${query}"`;
    
    // Show improved image count information
    const imageInfo = improvedCount > 0 ? ` (${improvedCount} better images found ✨)` : '';
    resultsCount.textContent = `Found ${products.length} products${imageInfo}`;
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
    
    showResults();
    
    // Smooth scroll to results
    resultsSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// Better image selection functionality removed - now happens automatically during search

// Create product card HTML
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Generate star rating
    const starRating = generateStarRating(product.rating);
    
    // Format offers text
    const offersText = product.offers ? `${product.offers} offers` : '';
    
    // Use better image if available, otherwise use original
    const imageUrl = product.betterImageUrl || product.imageUrl || '/placeholder-image.png';
    const imageClass = product.imageImproved ? 'product-image improved-image' : 'product-image';
    
    card.innerHTML = `
        <img 
            src="${imageUrl}" 
            alt="${product.title}"
            class="${imageClass}"
            onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjdGQUZDIi8+CjxwYXRoIGQ9Ik0xMDAgMTAwTDc1IDc1SDE1MEw3NSAxMDBMMTAwIDEyNUwxMjUgMTAwSDE1MEwxMjUgNzVMMTAwIDEwMFoiIGZpbGw9IiNFMkU4RjAiLz4KPHN2Zz4K'"
        >
        <div class="product-info">
            <h3 class="product-title">${escapeHtml(product.title)}</h3>
            <div class="product-source">from ${escapeHtml(product.source)}</div>
            <div class="product-price">${escapeHtml(product.price)}</div>
            ${product.delivery ? `<div class="product-delivery">${escapeHtml(product.delivery)}</div>` : ''}
            ${product.rating ? `
                <div class="product-rating">
                    <span class="rating-stars">${starRating}</span>
                    ${product.ratingCount ? `<span class="rating-count">(${product.ratingCount.toLocaleString()})</span>` : ''}
                </div>
            ` : ''}
            ${offersText ? `<div class="product-offers">${offersText}</div>` : ''}
            ${product.imageImproved ? `<div class="improvement-badge">✨ Better Image</div>` : ''}
        </div>
    `;
    
    // Add click handler to open product link
    card.addEventListener('click', () => {
        if (product.link) {
            window.open(product.link, '_blank', 'noopener,noreferrer');
        }
    });
    
    return card;
}

// Generate star rating display
function generateStarRating(rating) {
    if (!rating) return '';
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    
    // Half star
    if (hasHalfStar) {
        stars += '☆';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
    }
    
    return stars + ` ${rating}`;
}

// Better image selection UI functions removed - now integrated into search

// Utility functions
function showLoading(withImageSelection = false) {
    if (withImageSelection) {
        loadingIndicator.innerHTML = `
            <div class="spinner"></div>
            <div class="loading-text">
                <p>Searching for products...</p>
                <p class="loading-subtext">Finding better images ✨</p>
            </div>
        `;
    } else {
        loadingIndicator.innerHTML = `
            <div class="spinner"></div>
            <div class="loading-text">
                <p>Searching for products...</p>
            </div>
        `;
    }
    loadingIndicator.classList.remove('hidden');
}

function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showResults() {
    resultsSection.classList.remove('hidden');
}

function hideResults() {
    resultsSection.classList.add('hidden');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auto-focus search input on page load
document.addEventListener('DOMContentLoaded', () => {
    searchInput.focus();
    
    // Add some example searches for better UX
    const examples = [
        'blue jeans',
        'running shoes',
        'wireless headphones',
        'coffee maker',
        'laptop bag'
    ];
    
    // Randomly cycle through placeholder examples
    let currentExample = 0;
    setInterval(() => {
        if (document.activeElement !== searchInput) {
            searchInput.placeholder = `Search for products (e.g., ${examples[currentExample]})`;
            currentExample = (currentExample + 1) % examples.length;
        }
    }, 3000);
}); 