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

// Perform search API call
async function performSearch(query) {
    try {
        // Show loading state
        showLoading();
        hideError();
        hideResults();
        
        const startTime = Date.now();
        
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
        const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
        
        // Hide loading state
        hideLoading();
        
        if (data.products && data.products.length > 0) {
            currentProducts = data.products;
            displayResults(currentProducts, query, data, processingTime);
        } else {
            showError(data.message || 'No products found. Try a different search term.');
        }
        
    } catch (error) {
        hideLoading();
        showError(error.message || 'Something went wrong. Please try again.');
    }
}

// Display search results
function displayResults(products, query, searchData, processingTime) {
    resultsTitle.textContent = `Amazon Results for "${query}"`;
    
    // Result summary
    const totalProducts = searchData.totalProducts || products.length;
    const source = searchData.source || 'Amazon';
    
    resultsCount.innerHTML = `
        <div class="results-summary">
            <div class="results-main">
                Showing ${products.length} products from ${source}
                ${totalProducts > products.length ? ` (${totalProducts.toLocaleString()} total found)` : ''}
            </div>
            <div class="results-meta">
                Search completed in ${processingTime}s
            </div>
        </div>
    `;
    
    productsGrid.innerHTML = '';
    
    products.forEach((product, index) => {
        const productCard = createProductCard(product, index + 1);
        productsGrid.appendChild(productCard);
    });
    
    showResults();
    
    // Smooth scroll to results
    resultsSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// Create product card HTML
function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Generate star rating
    const starRating = generateStarRating(product.rating);
    
    // Format price display
    const priceDisplay = formatPrice(product.price, product.originalPrice);
    
    // Create badges
    const badges = createBadges(product);
    
    card.innerHTML = `
        <div class="ranking-badge">#${index}</div>
        <img 
            src="${product.imageUrl || '/placeholder-image.png'}" 
            alt="${escapeHtml(product.title)}"
            class="product-image"
            onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjdGQUZDIi8+CjxwYXRoIGQ9Ik0xMDAgMTAwTDc1IDc1SDE1MEw3NSAxMDBMMTAwIDEyNUwxMjUgMTAwSDE1MEwxMjUgNzVMMTAwIDEwMFoiIGZpbGw9IiNFMkU4RjAiLz4KPHN2Zz4K'"
        >
        ${badges}
        <div class="product-info">
            <h3 class="product-title">${escapeHtml(product.title)}</h3>
            <div class="product-source">from ${escapeHtml(product.source)}</div>
            <div class="product-price-section">
                ${priceDisplay}
            </div>
            ${product.delivery ? `<div class="product-delivery">${escapeHtml(product.delivery)}</div>` : ''}
            ${product.rating ? `
                <div class="product-rating">
                    <span class="rating-stars">${starRating}</span>
                    ${product.ratingCount ? `<span class="rating-count">(${product.ratingCount.toLocaleString()})</span>` : ''}
                </div>
            ` : ''}
            ${product.salesVolume ? `<div class="product-sales">${escapeHtml(product.salesVolume)}</div>` : ''}
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

// Format price display
function formatPrice(price, originalPrice) {
    let priceHtml = `<span class="current-price">${escapeHtml(price || 'Price not available')}</span>`;
    
    if (originalPrice && originalPrice !== price) {
        priceHtml += ` <span class="original-price">${escapeHtml(originalPrice)}</span>`;
    }
    
    return priceHtml;
}

// Create product badges
function createBadges(product) {
    const badges = [];
    
    if (product.isBestSeller) {
        badges.push('<div class="badge badge-bestseller">Best Seller</div>');
    }
    
    if (product.isAmazonChoice) {
        badges.push('<div class="badge badge-choice">Amazon\'s Choice</div>');
    }
    
    if (product.isPrime) {
        badges.push('<div class="badge badge-prime">Prime</div>');
    }
    
    if (product.badge) {
        badges.push(`<div class="badge badge-special">${escapeHtml(product.badge)}</div>`);
    }
    
    return badges.length > 0 ? `<div class="badges">${badges.join('')}</div>` : '';
}

// Show loading state
function showLoading() {
    loadingIndicator.classList.remove('hidden');
    loadingIndicator.querySelector('.loading-text p').textContent = 'Searching Amazon products...';
}

// Hide loading state
function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

// Hide error message
function hideError() {
    errorMessage.classList.add('hidden');
}

// Show results section
function showResults() {
    resultsSection.classList.remove('hidden');
}

// Hide results section
function hideResults() {
    resultsSection.classList.add('hidden');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, (m) => map[m]);
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