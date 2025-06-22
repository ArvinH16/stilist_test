# Product Search App with Intelligent Image Processing

A smart product search application that uses intelligent batch processing to find high-quality product images efficiently.

## Features

- 🔍 **Product Search**: Search for products across multiple platforms
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🎨 **Modern UI**: Clean, intuitive interface with smooth animations
- 🛒 **Product Details**: View product information including prices, ratings, and availability
- 🆕 **Image Enhancement**: AI-powered image quality enhancement using Firecrawl and Llama API
- ⚡ **Real-time Results**: Fast and reliable product search results

## 🚀 New Features: Intelligent Batch Processing

### What's New?
- **Smart Quality Assessment**: Each product image gets a quality score (0-75) based on multiple factors
- **Adaptive Batch Processing**: Dynamically adjusts processing strategy based on success rates
- **Target-Based Processing**: Stops when quality targets are achieved or continues intelligently
- **Enhanced UI**: Visual quality indicators, ranking badges, and detailed processing feedback

### How It Works

#### 1. Quality Scoring System
Products are scored based on:
- **Better Image Found** (+30 points): Successfully found improved image
- **High Resolution Indicators** (+20 points): URLs containing '1200', '800', 'large', 'xl'  
- **Professional Hosting** (+15 points): CDN, assets, or media hosting
- **Good Image Format** (+10 points): .jpg, .jpeg, .png formats
- **Good Original Image** (+15 points): Not encrypted Google thumbnail

#### 2. Intelligent Batch Processing
- **Starts with 2 products** for initial assessment
- **Adapts batch size** based on success rates:
  - Good success (≥50%): Continue with batch size 2
  - Poor success (<25%): Increase to batch size 3 for faster discovery
  - Moderate success: Maintain current approach
- **Target Achievement**: Stops when target number of high-quality images found
- **Max Limit Protection**: Won't process more than specified maximum products

#### 3. Visual Quality Indicators
- **🟢 High Quality (50+ score)**: Green border, professional image found
- **🟡 Improved (any score)**: Orange border, image was enhanced
- **🔴 Basic**: Red indicator, original image used
- **Ranking badges**: Shows processing order (#1, #2, etc.)
- **Quality reasons**: Hover to see why an image got its score

### API Parameters

```javascript
POST /api/search
{
  "query": "dresses",           // Search term
  "targetQuality": 2,           // Number of high-quality images needed
  "maxProducts": 6,             // Maximum products to process
  "page": "1",                  // Results page
  "country": "us"               // Country code
}
```

### Response Format

```javascript
{
  "products": [...],                    // Processed products with quality scores
  "originalCount": 20,                  // Total products from search API
  "processedCount": 4,                  // Products actually processed
  "highQualityCount": 2,               // Products with quality score ≥50
  "improvedCount": 3,                  // Products with improved images
  "targetAchieved": true,              // Whether quality target was met
  "searchParams": {
    "targetQuality": 2,
    "maxProducts": 6
  }
}
```

### Product Quality Scores

Each product includes:
```javascript
{
  "title": "Product Name",
  "betterImageUrl": "https://...",      // Best image found
  "imageImproved": true,                // Whether image was enhanced
  "qualityScore": 65,                   // Quality score (0-75)
  "qualityReasons": [                   // Why it got this score
    "Better image found",
    "High resolution indicators",
    "Professional hosting"
  ]
}
```

## 🎯 Benefits

### Speed
- **Stops Early**: Achieves targets without unnecessary processing
- **Adaptive Strategy**: Increases batch size when needed for faster discovery
- **Parallel Processing**: Processes multiple products simultaneously

### Quality
- **Objective Scoring**: Consistent quality assessment criteria
- **Professional Images**: Prioritizes CDN-hosted, high-resolution images
- **Fallback Protection**: Always provides an image, even if not improved

### User Experience
- **Clear Feedback**: Shows exactly what was processed and achieved
- **Visual Quality Cues**: Immediate visual indication of image quality
- **Processing Transparency**: Shows timing and efficiency metrics

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   RAPIDAPI_KEY=your_key
   RAPIDAPI_HOST=product-search-api.p.rapidapi.com
   FIRECRAWL_API_KEY=your_key
   LLAMA_API_KEY=your_key
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Visit `http://localhost:3000`

## 📊 Example Processing Flow

```
🎯 Target: 2 high-quality images from up to 6 products

📦 Processing batch 1: 2 products (indices 0-1)
🔍 Processing product 1: Blue Summer Dress
📊 Product 1 Quality Score: 65/75
📝 Reasons: Better image found, High resolution indicators, Professional hosting

🔍 Processing product 2: Red Evening Gown  
📊 Product 2 Quality Score: 35/75
📝 Reasons: Better image found, Good image format

📈 Batch 1 Results:
   • High Quality (50+ score): 1/2
   • Images Improved: 2/2

🎯 Progress: 1/2 high-quality images found

📦 Processing batch 2: 2 products (indices 2-3)
🔍 Processing product 3: Black Cocktail Dress
📊 Product 3 Quality Score: 55/75

✅ Target achieved! Found 2 high-quality images

🏆 Final Results Summary:
   🟢 #1: Blue Summer Dress (Score: 65)
   🟢 #2: Black Cocktail Dress (Score: 55) 
   🟡 #3: Red Evening Gown (Score: 35)
```

This intelligent system ensures you get the best possible product images while maintaining optimal performance!

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd product-search-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# RapidAPI Configuration
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=product-search-api.p.rapidapi.com

# Firecrawl Configuration
FIRECRAWL_API_KEY=fc-c2099db0b3cc4a81ae838cd5e246ac2a

# Llama API Configuration
LLAMA_API_KEY=LLM|735385235845626|c9HgURQwgaSe8JIpXTRdtg4LZbE
```

### 4. Get API Keys

#### RapidAPI Key
1. Go to [RapidAPI](https://rapidapi.com/)
2. Create an account or sign in
3. Subscribe to the "Product Search API"
4. Copy your API key

#### Firecrawl API Key
1. Go to [Firecrawl](https://firecrawl.dev/)
2. Sign up for an account
3. Get your API key from the dashboard
4. The provided key is already configured

#### Llama API Key
1. The provided Llama API key is already configured
2. This key is used for AI-powered image selection

### 5. Run the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### Basic Search
1. Enter a product search term in the search box
2. Click "Search Products" or press Enter
3. View the search results with product information

### Image Enhancement
1. After performing a search, click the "✨ Enhance Images with AI" button
2. The application will:
   - Scrape each product page using Firecrawl
   - Use Llama AI to select the best quality image
   - Replace existing images with enhanced versions
   - Show visual indicators for successfully enhanced images

## API Endpoints

### Search Products
- **Endpoint**: `POST /api/search`
- **Body**: `{ "query": "search term", "page": 1, "country": "us" }`
- **Response**: Array of product objects

### Enhance Images
- **Endpoint**: `POST /api/enhance-images`
- **Body**: `{ "products": [array of product objects] }`
- **Response**: `{ "success": true, "products": [enhanced products], "enhancedCount": number }`

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **APIs**: 
  - RapidAPI (Product Search)
  - Firecrawl (Web Scraping)
  - Llama API (AI Image Selection)
- **Styling**: Modern CSS with Flexbox and Grid
- **Responsive Design**: Mobile-first approach

## Development

### Development Mode

```bash
npm run dev
```

This will start the server with nodemon for automatic restarts on file changes.

### Project Structure

```
product-search-app/
├── public/
│   ├── index.html      # Main HTML file
│   ├── app.js          # Frontend JavaScript
│   └── styles.css      # CSS styles
├── server.js           # Express server with API endpoints
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## How Image Enhancement Works

1. **Product Link Extraction**: The application extracts product links from search results
2. **Firecrawl Scraping**: Each product page is scraped using Firecrawl to get clean markdown content with images
3. **AI Selection**: Llama AI analyzes the scraped content and selects the best product image based on:
   - Relevance to the product
   - Image size and quality
   - Position in the content
4. **Image Replacement**: The selected high-quality images replace the original lower-quality images
5. **Visual Feedback**: Enhanced images are marked with badges and visual indicators

## Performance Considerations

- **Batch Processing**: Images are enhanced in batches of 3 to respect API rate limits
- **Error Handling**: Graceful fallback to original images if enhancement fails
- **Loading States**: Clear visual feedback during the enhancement process
- **Rate Limiting**: Built-in delays between API calls to prevent overwhelming services

## Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure all API keys are correctly set in the `.env` file
2. **Network Issues**: Check internet connection and API service status
3. **Rate Limiting**: If you encounter rate limits, wait a few minutes before retrying
4. **Image Loading**: Some enhanced images may take time to load due to external sources

### Debug Mode

To enable debug logging, check the browser console and server logs for detailed information about the enhancement process.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please open an issue in the repository or contact the development team.
