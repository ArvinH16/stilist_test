const express = require('express');
const cors = require('cors');
const https = require('https');
const querystring = require('querystring');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for product search
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
        
        res.json(apiData);
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