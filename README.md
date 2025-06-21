# Product Search Application

A modern Node.js web application that allows users to search for products using the RapidAPI Product Search API. The app displays search results in a beautiful, responsive grid layout with product images, prices, ratings, and links to purchase.

## Features

- 🔍 **Product Search**: Search for any product using natural language queries
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- ⚡ **Fast API Integration**: Uses RapidAPI's Product Search API for real-time results
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 🛒 **Direct Shopping Links**: Click on products to visit the retailer's website
- ⭐ **Product Information**: View prices, ratings, shipping info, and available offers

## Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

## Installation

1. **Clone or download this repository**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Optional: Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   The app comes with a working API key, but you can replace it with your own RapidAPI key if needed.

## Running the Application

1. **Start the development server**:
   ```bash
   npm run dev
   ```
   or for production:
   ```bash
   npm start
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

1. Enter a product search query in the search box (e.g., "blue jeans", "wireless headphones", "running shoes")
2. Click the "Search" button or press Enter
3. Browse through the search results
4. Click on any product card to visit the retailer's website

## API Information

This application uses the RapidAPI Product Search API to fetch product data from various online retailers. The API provides:

- Product titles and descriptions
- Pricing information
- Product images
- Retailer information
- Customer ratings and reviews
- Shipping details
- Available offers

## Project Structure

```
product-search-app/
├── server.js          # Express server and API routes
├── package.json       # Project dependencies and scripts
├── .env.example       # Environment variables template
├── README.md          # Project documentation
└── public/            # Static frontend files
    ├── index.html     # Main HTML page
    ├── styles.css     # CSS styling
    └── app.js         # Client-side JavaScript
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **API**: RapidAPI Product Search API
- **Styling**: Modern CSS with gradients and animations
- **Responsive Design**: CSS Grid and Flexbox

## Customization

You can easily customize the application by:

- Modifying the CSS in `public/styles.css` to change the appearance
- Adding new features in `public/app.js`
- Extending the server functionality in `server.js`
- Updating the search parameters or adding filters

## License

This project is open source and available under the MIT License.
