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

// Perform search API call with intelligent batch processing
async function performSearch(query, targetQuality = 2, maxProducts = 6) {
    try {
        // Show loading state with intelligent processing message
        showLoading(true);
        hideError();
        hideResults();
        
        const startTime = Date.now();
        
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                query,
                targetQuality: parseInt(targetQuality),
                maxProducts: parseInt(maxProducts)
            })
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
            showError('No products found. Try a different search term.');
        }
        
    } catch (error) {
        hideLoading();
        showError(error.message || 'Something went wrong. Please try again.');
    }
}

// Display search results with intelligent processing information
function displayResults(products, query, searchData, processingTime) {
    resultsTitle.textContent = `High-Quality Results for "${query}"`;
    
    // Enhanced result summary with quality filtering information
    const qualityInfo = [];
    qualityInfo.push(`${searchData.highQualityCount} high-quality products 🟢`);
    
    if (searchData.filteredOutCount > 0) {
        qualityInfo.push(`${searchData.filteredOutCount} low-quality filtered out 🚫`);
    }
    
    if (searchData.targetAchieved) {
        qualityInfo.push(`quality target achieved 🎯`);
    }
    
    const qualityText = ` (${qualityInfo.join(', ')})`;
    const processingText = ` • Processed ${searchData.processedCount} products in ${processingTime}s`;
    
    resultsCount.innerHTML = `
        <div class="results-summary">
            <div class="results-main">Showing ${products.length} products${qualityText}</div>
            <div class="results-meta">
                Found ${searchData.processedCount}/${searchData.originalCount} products, showing only high-quality${processingText}
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

// Create product card HTML with quality indicators
function createProductCard(product, index) {
    const card = document.createElement('div');
    
    // Dynamic card class based on quality
    let cardClass = 'product-card';
    if (product.qualityScore >= 50) {
        cardClass += ' high-quality-card';
    } else if (product.imageImproved) {
        cardClass += ' improved-card';
    }
    
    card.className = cardClass;
    
    // Generate star rating
    const starRating = generateStarRating(product.rating);
    
    // Format offers text
    const offersText = product.offers ? `${product.offers} offers` : '';
    
    // Use better image if available, otherwise use original
    const imageUrl = product.betterImageUrl || product.imageUrl || '/placeholder-image.png';
    const imageClass = product.imageImproved ? 'product-image improved-image' : 'product-image';
    
    // Quality indicator
    let qualityBadge = '';
    if (product.qualityScore >= 50) {
        qualityBadge = `<div class="quality-badge high-quality">🟢 High Quality (${product.qualityScore})</div>`;
    } else if (product.imageImproved) {
        qualityBadge = `<div class="quality-badge improved">🟡 Improved (${product.qualityScore})</div>`;
    } else if (product.qualityScore > 0) {
        qualityBadge = `<div class="quality-badge basic">🔴 Basic (${product.qualityScore})</div>`;
    }
    
    // Ranking indicator
    const rankingBadge = `<div class="ranking-badge">#${index}</div>`;
    
    card.innerHTML = `
        ${rankingBadge}
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
            ${qualityBadge}
            ${product.qualityReasons && product.qualityReasons.length > 0 ? 
                `<div class="quality-reasons" title="${product.qualityReasons.join(', ')}">${product.qualityReasons.slice(0, 2).join(', ')}${product.qualityReasons.length > 2 ? '...' : ''}</div>` 
                : ''
            }
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

// Utility functions
function showLoading(withIntelligentProcessing = false) {
    if (withIntelligentProcessing) {
        loadingIndicator.innerHTML = `
            <div class="spinner"></div>
            <div class="loading-text">
                <p>🤖 Intelligent Search in Progress...</p>
                <p class="loading-subtext">Finding high-quality product images ✨</p>
                <p class="loading-detail">Only showing products with professional-grade images</p>
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