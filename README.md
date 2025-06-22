# Product Search Application

A modern, responsive product search application that allows users to search for products using the RapidAPI product search service. Now enhanced with AI-powered image quality enhancement using Firecrawl and Llama API.

## Features

- 🔍 **Product Search**: Search for products across multiple platforms
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🎨 **Modern UI**: Clean, intuitive interface with smooth animations
- 🛒 **Product Details**: View product information including prices, ratings, and availability
- 🆕 **Image Enhancement**: AI-powered image quality enhancement using Firecrawl and Llama API
- ⚡ **Real-time Results**: Fast and reliable product search results

## New Image Enhancement Feature

This application now includes an advanced image enhancement feature that:

1. Takes product links from search results
2. Uses Firecrawl to scrape the product page for high-quality images
3. Uses Llama AI to intelligently select the best product image
4. Replaces low-quality images with enhanced versions
5. Provides visual indicators for enhanced images

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
