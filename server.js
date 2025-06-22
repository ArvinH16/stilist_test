const express = require('express');
const cors = require('cors');
const https = require('https');
const querystring = require('querystring');
const path = require('path');
const axios = require('axios');
const FirecrawlApp = require('@mendable/firecrawl-js').default;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firecrawl
const firecrawl = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Function to call Llama API for selecting the best product image
async function callLlamaAPI(response, link) {
    try {
        const llamaResponse = await axios.post('https://api.llama.com/v1/chat/completions', {
            model: "Llama-3.3-8B-Instruct",
            messages: [
                {
                    role: "system",
                    content: "You are an assistant that selects the best product image from scraped webpage content."
                },
                {
                    role: "user",
                    content: `Here is the link to the product: ${link}
                    Here is the markdown: ${response}
                    
                    Find the main product image from the markdown above. Pick the most relevant image for the product. 
                    Should be near the beginning of the markdown most of the time. If there is a size, then pick the image with the largest size. 
                    
                    RESPOND WITH ONLY THIS JSON FORMAT - NO OTHER TEXT:
                    {
                        "image_url": "the_image_url_here"
                    }`
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.LLAMA_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Llama API Response:', llamaResponse.data);
        
        // Handle the actual Llama API response structure
        let content;
        if (llamaResponse.data.completion_message && llamaResponse.data.completion_message.content) {
            content = llamaResponse.data.completion_message.content.text;
        } else if (llamaResponse.data.choices && llamaResponse.data.choices[0]) {
            content = llamaResponse.data.choices[0].message.content;
        } else {
            console.error('Unexpected Llama API response structure');
            return null;
        }
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const parsedResponse = JSON.parse(jsonMatch[0]);
            return parsedResponse.image_url;
        }
        
        return null;
    } catch (error) {
        console.error('Llama API Error:', error.response?.data || error.message);
        return null;
    }
}

// Function to get better product image using Firecrawl and Llama
async function getBetterProductImage(productLink) {
    try {
        console.log(`Getting better image for: ${productLink}`);
        
        const scrapeResult = await firecrawl.scrapeUrl(productLink, {
            formats: ['markdown'],
            onlyMainContent: true,
            includeTags: ['img']
        });

        console.log(`Firecrawl scrape result for ${productLink}:`, scrapeResult ? 'success' : 'failed');

        if (scrapeResult && scrapeResult.markdown) {
            const betterImageUrl = await callLlamaAPI(scrapeResult.markdown, productLink);
            return betterImageUrl;
        }
        
        return null;
    } catch (error) {
        console.error('Firecrawl Error for', productLink, ':', error.message);
        return null;
    }
}

// Separate better image selection endpoint removed - now integrated into search endpoint

// API endpoint for product search with integrated better image selection
app.post('/api/search', async (req, res) => {
    const { query, page = '1', country = 'us' } = req.body;
    
    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    const options = {
        method: 'POST',
        hostname: 'product-search-api.p.rapidapi.com',
        port: null,
        path: '/api/google/shopping',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': process.env.RAPIDAPI_HOST,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    try {
        console.log(`Starting search for: ${query}`);
        
        const apiData = await new Promise((resolve, reject) => {
            const apiReq = https.request(options, (apiRes) => {
                const chunks = [];
                
                apiRes.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                
                apiRes.on('end', () => {
                    const body = Buffer.concat(chunks);
                    try {
                        const data = JSON.parse(body.toString());
                        resolve(data);
                    } catch (error) {
                        reject(new Error('Failed to parse API response'));
                    }
                });
            });
            
            apiReq.on('error', (error) => {
                reject(error);
            });
            
            apiReq.write(querystring.stringify({
                query: query,
                page: page,
                country: country
            }));
            
            apiReq.end();
        });

        // Limit to only 2 products as requested
        if (apiData.products && apiData.products.length > 0) {
            const limitedProducts = apiData.products.slice(0, 2);
            console.log(`Found ${apiData.products.length} products, processing first 2`);
            
            // Process each product through Firecrawl and Llama to get better images
            const productsWithBetterImages = await Promise.all(
                limitedProducts.map(async (product) => {
                    try {
                        console.log(`Processing product: ${product.title}`);
                        console.log(`Product link: ${product.link}`);
                        
                        if (product.link) {
                            const betterImageUrl = await getBetterProductImage(product.link);
                            return {
                                ...product,
                                betterImageUrl: betterImageUrl || product.imageUrl,
                                imageImproved: !!betterImageUrl
                            };
                        } else {
                            console.log(`No link found for product: ${product.title}`);
                            return {
                                ...product,
                                betterImageUrl: product.imageUrl,
                                imageImproved: false
                            };
                        }
                    } catch (error) {
                        console.error(`Failed to get better image for product: ${product.title}`, error);
                        return {
                            ...product,
                            betterImageUrl: product.imageUrl,
                            imageImproved: false
                        };
                    }
                })
            );

            const improvedCount = productsWithBetterImages.filter(p => p.imageImproved).length;
            console.log(`Image selection completed. ${improvedCount} images improved.`);
            
            res.json({
                ...apiData,
                products: productsWithBetterImages,
                originalCount: apiData.products.length,
                improvedCount: improvedCount
            });
        } else {
            res.json(apiData);
        }
        
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 