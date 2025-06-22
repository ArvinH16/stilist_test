const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Amazon API search function
async function searchAmazonProducts(query, page = 1) {
    const options = {
        method: 'GET',
        url: 'https://real-time-amazon-data.p.rapidapi.com/search',
        params: {
            query: query,
            page: page.toString(),
            country: 'US',
            sort_by: 'RELEVANCE',
            category_id: 'fashion, fashion-womens, fashion-mens, fashion-girls, fashion-boys, fashion-baby',
            product_condition: 'ALL',
            is_prime: 'false',
            deals_and_discounts: 'NONE'
        },
        headers: {
            'x-rapidapi-key': '***REMOVED***',
            'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error('Amazon API Error:', error.message);
        throw error;
    }
}

// Transform Amazon API response to our format
function transformAmazonProducts(amazonData) {
    if (!amazonData.data || !amazonData.data.products) {
        return [];
    }

    return amazonData.data.products.map(product => ({
        asin: product.asin,
        title: product.product_title,
        price: product.product_price,
        originalPrice: product.product_original_price,
        rating: parseFloat(product.product_star_rating) || null,
        ratingCount: product.product_num_ratings || null,
        imageUrl: product.product_photo,
        link: product.product_url,
        delivery: product.delivery,
        badge: product.product_badge || null,
        isPrime: product.is_prime,
        isBestSeller: product.is_best_seller,
        isAmazonChoice: product.is_amazon_choice,
        salesVolume: product.sales_volume,
        source: 'Amazon'
    }));
}

// API Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Search endpoint
app.post('/api/search', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Query parameter is required and must be a non-empty string' 
            });
        }

        console.log(`🚀 Searching Amazon for: "${query}"`);
        
        // Search Amazon products
        const amazonResponse = await searchAmazonProducts(query.trim());
        
        // Transform the products
        const products = transformAmazonProducts(amazonResponse);
        
        console.log(`📦 Found ${products.length} products from Amazon`);
        
        if (products.length === 0) {
            return res.json({
                products: [],
                totalProducts: 0,
                query: query.trim(),
                message: 'No products found for this search term'
            });
        }

        // Return the results
        res.json({
            products: products,
            totalProducts: amazonResponse.data?.total_products || products.length,
            query: query.trim(),
            source: 'Amazon',
            message: `Found ${products.length} products`
        });

    } catch (error) {
        console.error('Search Error:', error.message);
        
        if (error.response) {
            console.error('API Response Error:', error.response.status, error.response.data);
        }
        
        res.status(500).json({ 
            error: 'Failed to search products',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Access the app at http://localhost:${PORT}`);
});

module.exports = app; 