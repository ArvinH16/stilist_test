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

// Helper function to validate image URLs
function isValidImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    // Check if it's a valid URL format
    try {
        new URL(url);
    } catch {
        return false;
    }
    
    // Check if it has a valid image extension or is from a known image hosting service
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)(\?|$)/i;
    const imageHostingServices = /(images\.|img\.|cdn\.|static\.|media\.|assets\.)/i;
    
    return imageExtensions.test(url) || imageHostingServices.test(url);
}

// Function to call Llama API for selecting the best product image
async function callLlamaAPI(response, link, productTitle = '') {
    try {
        const llamaResponse = await axios.post('https://api.llama.com/v1/chat/completions', {
            model: "Llama-3.3-8B-Instruct",
            messages: [
                {
                    role: "system",
                    content: "You are an expert assistant that selects the highest quality, most appropriate product image from scraped webpage content. You prioritize images that show the complete product clearly and are suitable for e-commerce display."
                },
                {
                    role: "user",
                    content: `PRODUCT INFORMATION:
                    - Product Link: ${link}
                    - Product Title: ${productTitle}
                    
                    SCRAPED WEBPAGE CONTENT:
                    ${response}
                    
                    TASK: Analyze the ENTIRE scraped content above and select the BEST product image URL.
                    
                    SELECTION STRATEGY:
                    1. SCAN ALL IMAGES: Look through the entire markdown content for ALL image URLs
                    2. IDENTIFY MAIN PRODUCT: Find images that show the complete product matching "${productTitle}"
                    3. PRIORITIZE QUALITY: Choose the highest resolution/largest image available
                    4. VERIFY RELEVANCE: Ensure the image directly corresponds to the product title
                    
                    SELECTION CRITERIA (in priority order):
                    1. COMPLETENESS: Shows the ENTIRE product, not just parts/details/close-ups
                    2. SIZE/QUALITY: Largest available image (look for dimensions like 1200x1200, 800x800, etc.)
                    3. RELEVANCE: Directly matches the product title "${productTitle}"
                    4. CLARITY: High resolution, not blurry or pixelated
                    5. MAIN PRODUCT: The primary product, not accessories or related items
                    6. PROFESSIONAL: Clean product photography, not lifestyle shots
                    7. CONTEXT: Images near product descriptions are usually better
                    
                    AVOID THESE IMAGE TYPES:
                    - Small thumbnails or icons (usually <200px)
                    - Detail shots showing only parts of the product
                    - Lifestyle images where product is partially hidden
                    - Product packaging or box images only
                    - Screenshots, UI elements, or buttons
                    - Images with heavy text overlays or watermarks
                    - Related/suggested/similar products
                    - Brand logos or promotional banners
                    
                    ANALYSIS INSTRUCTIONS:
                    - Look for image URLs with size indicators (e.g., "_1200x1200", "800w", "large", "xl")
                    - Check image context - images near product titles/descriptions are usually main product images
                    - If multiple similar images exist, choose the one with largest dimensions
                    - Ensure the selected image URL is complete and accessible
                    
                    RESPOND WITH ONLY THIS JSON FORMAT - NO OTHER TEXT:
                    {
                        "image_url": "the_best_product_image_url_here"
                    }`
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.LLAMA_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Llama API Response Status:', llamaResponse.status);
        console.log('Llama API Response Data:', JSON.stringify(llamaResponse.data, null, 2));
        
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
            try {
                const parsedResponse = JSON.parse(jsonMatch[0]);
                const imageUrl = parsedResponse.image_url;
                
                // Additional validation - ensure the URL is not empty or placeholder
                if (imageUrl && imageUrl.trim() !== '' && 
                    !imageUrl.includes('placeholder') && 
                    !imageUrl.includes('example.com')) {
                    return imageUrl;
                }
            } catch (parseError) {
                console.error('Failed to parse JSON response:', parseError);
            }
        }
        
        return null;
    } catch (error) {
        console.error('Llama API Error:', error.response?.data || error.message);
        return null;
    }
}

// Function to get better product image using Firecrawl and Llama
async function getBetterProductImage(productLink, productTitle = '') {
    try {
        console.log(`Getting better image for: ${productTitle} - ${productLink}`);
        
        const scrapeResult = await firecrawl.scrapeUrl(productLink, {
            formats: ['markdown'],
            onlyMainContent: false, // Get full content for better context
            includeTags: ['img'],
            waitFor: 3000 // Wait for dynamic content to load
        });

        console.log(`Firecrawl scrape result for ${productLink}:`, scrapeResult ? 'success' : 'failed');
        
        if (scrapeResult && scrapeResult.markdown) {
            console.log(`Scraped content length: ${scrapeResult.markdown.length} characters`);
            console.log(`Image count in markdown: ${(scrapeResult.markdown.match(/!\[.*?\]\(.*?\)/g) || []).length} images found`);
            
            // Log first few images found for debugging
            const imageMatches = scrapeResult.markdown.match(/!\[.*?\]\(.*?\)/g) || [];
            if (imageMatches.length > 0) {
                console.log(`First few images found:`, imageMatches.slice(0, 3));
            }
            const betterImageUrl = await callLlamaAPI(scrapeResult.markdown, productLink, productTitle);
            
            // Validate the selected image URL
            if (betterImageUrl && isValidImageUrl(betterImageUrl)) {
                console.log(`Successfully selected better image for ${productTitle}: ${betterImageUrl}`);
                return betterImageUrl;
            } else {
                console.log(`No valid image selected for ${productTitle}, falling back to original`);
                return null;
            }
        }
        
        return null;
    } catch (error) {
        console.error('Firecrawl Error for', productLink, ':', error.message);
        return null;
    }
}

// Function to evaluate image quality score
function evaluateImageQuality(product, betterImageUrl, originalImageUrl) {
    let score = 0;
    let reasons = [];
    
    // Check if we successfully got a better image
    if (betterImageUrl && betterImageUrl !== originalImageUrl) {
        score += 30;
        reasons.push('Better image found');
        
        // Check for high-quality indicators in URL
        if (betterImageUrl.includes('1200') || betterImageUrl.includes('800') || 
            betterImageUrl.includes('large') || betterImageUrl.includes('xl')) {
            score += 20;
            reasons.push('High resolution indicators');
        }
        
        // Check for CDN or professional hosting
        if (betterImageUrl.includes('cdn') || betterImageUrl.includes('assets') || 
            betterImageUrl.includes('media')) {
            score += 15;
            reasons.push('Professional hosting');
        }
        
        // Check for image format quality
        if (betterImageUrl.includes('.jpg') || betterImageUrl.includes('.jpeg') || 
            betterImageUrl.includes('.png')) {
            score += 10;
            reasons.push('Good image format');
        }
    } else {
        reasons.push('No better image found');
    }
    
    // Check original image quality as baseline
    if (originalImageUrl && !originalImageUrl.includes('encrypted-tbn')) {
        score += 15;
        reasons.push('Good original image');
    }
    
    return { score, reasons };
}

// Intelligent batch processing function
async function processProductBatchIntelligently(products, targetQualityCount = 2, maxAttempts = 6) {
    let processedProducts = [];
    let highQualityCount = 0;
    let currentIndex = 0;
    let batchSize = 2; // Start with 2 products
    
    console.log(`🎯 Target: ${targetQualityCount} high-quality images from up to ${maxAttempts} products`);
    
    while (highQualityCount < targetQualityCount && currentIndex < Math.min(products.length, maxAttempts)) {
        const currentBatch = products.slice(currentIndex, currentIndex + batchSize);
        console.log(`\n📦 Processing batch ${Math.floor(currentIndex/batchSize) + 1}: ${currentBatch.length} products (indices ${currentIndex}-${currentIndex + currentBatch.length - 1})`);
        
        // Process current batch
        const batchResults = await Promise.all(
            currentBatch.map(async (product, batchIndex) => {
                const globalIndex = currentIndex + batchIndex;
                try {
                    console.log(`🔍 Processing product ${globalIndex + 1}: ${product.title}`);
                    
                    if (!product.link) {
                        console.log(`❌ No link found for product: ${product.title}`);
                        return {
                            ...product,
                            betterImageUrl: product.imageUrl,
                            imageImproved: false,
                            qualityScore: 0,
                            qualityReasons: ['No product link available']
                        };
                    }
                    
                    const betterImageUrl = await getBetterProductImage(product.link, product.title);
                    const quality = evaluateImageQuality(product, betterImageUrl, product.imageUrl);
                    
                    const result = {
                        ...product,
                        betterImageUrl: betterImageUrl || product.imageUrl,
                        imageImproved: !!betterImageUrl,
                        qualityScore: quality.score,
                        qualityReasons: quality.reasons
                    };
                    
                    console.log(`📊 Product ${globalIndex + 1} Quality Score: ${quality.score}/75`);
                    console.log(`📝 Reasons: ${quality.reasons.join(', ')}`);
                    
                    return result;
                } catch (error) {
                    console.error(`❌ Failed to process product ${globalIndex + 1}: ${product.title}`, error.message);
                    return {
                        ...product,
                        betterImageUrl: product.imageUrl,
                        imageImproved: false,
                        qualityScore: 0,
                        qualityReasons: ['Processing error']
                    };
                }
            })
        );
        
        // Evaluate batch results
        const batchHighQuality = batchResults.filter(p => p.qualityScore >= 50);
        const batchSuccess = batchResults.filter(p => p.imageImproved);
        
        console.log(`\n📈 Batch ${Math.floor(currentIndex/batchSize) + 1} Results:`);
        console.log(`   • High Quality (50+ score): ${batchHighQuality.length}/${batchResults.length}`);
        console.log(`   • Images Improved: ${batchSuccess.length}/${batchResults.length}`);
        
        // Add successful products to our collection
        processedProducts.push(...batchResults);
        highQualityCount += batchHighQuality.length;
        
        console.log(`\n🎯 Progress: ${highQualityCount}/${targetQualityCount} high-quality images found`);
        
        // Update current index
        currentIndex += batchSize;
        
        // Decide on next batch strategy
        if (highQualityCount >= targetQualityCount) {
            console.log(`✅ Target achieved! Found ${highQualityCount} high-quality images`);
            break;
        }
        
        if (currentIndex >= Math.min(products.length, maxAttempts)) {
            console.log(`🔚 Reached maximum attempts (${maxAttempts}) or end of products`);
            break;
        }
        
        // Adaptive batch sizing based on success rate
        const successRate = batchSuccess.length / batchResults.length;
        const qualityRate = batchHighQuality.length / batchResults.length;
        
        if (successRate >= 0.5 && qualityRate >= 0.5) {
            // Good success rate, continue with current batch size
            batchSize = 2;
            console.log(`👍 Good success rate (${Math.round(successRate * 100)}%), continuing with batch size ${batchSize}`);
        } else if (successRate < 0.25 || qualityRate < 0.25) {
            // Poor success rate, increase batch size to find better products faster
            batchSize = Math.min(3, Math.min(products.length, maxAttempts) - currentIndex);
            console.log(`🔄 Low success rate (${Math.round(successRate * 100)}%), increasing batch size to ${batchSize}`);
        } else {
            // Moderate success rate, keep current approach
            batchSize = 2;
            console.log(`🔄 Moderate success rate (${Math.round(successRate * 100)}%), maintaining batch size ${batchSize}`);
        }
    }
    
    // Sort by quality score and return best results
    const sortedResults = processedProducts.sort((a, b) => b.qualityScore - a.qualityScore);
    
    // Filter to only show high-quality products (score >= 50)
    const highQualityProducts = sortedResults.filter(product => product.qualityScore >= 50);
    
    console.log(`\n🏆 Final Results Summary:`);
    sortedResults.forEach((product, index) => {
        const status = product.qualityScore >= 50 ? '🟢' : product.imageImproved ? '🟡' : '🔴';
        const included = product.qualityScore >= 50 ? ' ✓ INCLUDED' : ' ✗ FILTERED OUT';
        console.log(`   ${status} #${index + 1}: ${product.title.substring(0, 50)}... (Score: ${product.qualityScore})${included}`);
    });
    
    console.log(`\n🎯 Quality Filter Applied:`);
    console.log(`   • Total Processed: ${processedProducts.length}`);
    console.log(`   • High Quality Found: ${highQualityProducts.length}`);
    console.log(`   • Filtered Out: ${processedProducts.length - highQualityProducts.length}`);
    
    return {
        products: highQualityProducts, // Only return high-quality products
        allProcessedProducts: sortedResults, // Keep full list for stats
        stats: {
            totalProcessed: processedProducts.length,
            highQualityCount: highQualityProducts.length,
            improvedCount: sortedResults.filter(p => p.imageImproved).length,
            targetAchieved: highQualityCount >= targetQualityCount,
            filteredOutCount: processedProducts.length - highQualityProducts.length
        }
    };
}

// API endpoint for product search with intelligent batch processing
app.post('/api/search', async (req, res) => {
    const { query, page = '1', country = 'us', targetQuality = 2, maxProducts = 6 } = req.body;
    
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
        console.log(`🚀 Starting intelligent search for: "${query}"`);
        console.log(`📋 Parameters: Target Quality: ${targetQuality}, Max Products: ${maxProducts}`);
        
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

        if (apiData.products && apiData.products.length > 0) {
            console.log(`📦 Found ${apiData.products.length} total products from API`);
            
            // Use intelligent batch processing
            const result = await processProductBatchIntelligently(
                apiData.products, 
                parseInt(targetQuality), 
                parseInt(maxProducts)
            );
            
            console.log(`\n✨ Final Summary:`);
            console.log(`   • Total Processed: ${result.stats.totalProcessed}`);
            console.log(`   • High Quality: ${result.stats.highQualityCount}`);
            console.log(`   • Images Improved: ${result.stats.improvedCount}`);
            console.log(`   • Target Achieved: ${result.stats.targetAchieved ? 'Yes' : 'No'}`);
            
            res.json({
                ...apiData,
                products: result.products,
                originalCount: apiData.products.length,
                processedCount: result.stats.totalProcessed,
                highQualityCount: result.stats.highQualityCount,
                improvedCount: result.stats.improvedCount,
                targetAchieved: result.stats.targetAchieved,
                searchParams: {
                    targetQuality: parseInt(targetQuality),
                    maxProducts: parseInt(maxProducts)
                }
            });
        } else {
            console.log('❌ No products found in API response');
            res.json(apiData);
        }
        
    } catch (error) {
        console.error('💥 API Error:', error);
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