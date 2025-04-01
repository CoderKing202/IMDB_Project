const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const express = require('express');
const cors = require('cors'); // Import CORS middleware

const app = express();
const port = 3000;  // You can change the port if necessary

// Scraping function that gets the IMDb reviews
async function scrapeIMDB(VcToken) {
    try {
        // Launch Puppeteer browser instance
        const browser = await puppeteer.launch({ headless: false }); // You can set headless: false for debugging
        const page = await browser.newPage();

        // Navigate to the IMDb reviews page (replace with your URL)
        const url = `https://www.imdb.com/title/${VcToken}/reviews`;
        await page.goto(url, { waitUntil: 'networkidle2' }); // Wait until network activity settles

        // Wait for a few seconds to ensure the page has fully loaded
        await page.waitForSelector('.ipc-list-card__content', { visible: true });

        // Extract page content (HTML) after JavaScript rendering
        const html = await page.content();

        // Load HTML into Cheerio for parsing
        const $ = cheerio.load(html);

        // Select all the elements with the 'ipc-list-card__content' class
        const reviewElements = $('.ipc-list-card__content');

        // Iterate through all review elements and extract relevant data
        const reviews = [];
        reviewElements.each((index, element) => {
            const title = $(element).find('.ipc-title__text').text().trim();
            const contentSpan = $(element).find('.ipc-rating-star--rating').text().trim();
            const contentDiv = $(element).find('.ipc-html-content-inner-div').text().trim();
            let headline=title || 'NA'
            let rating= contentSpan || 'NA'
            let opinion= contentDiv || 'NA'
            if( (headline != 'NA') && (rating != 'NA') && (opinion != 'NA')){
                reviews.push({
                    headline: headline,
                    rating: rating,
                    opinion: opinion,
                });
            }
            
        });

        // Close the browser
        await browser.close();

        return reviews;
    } catch (error) {
        console.error('Error scraping data:', error);
        throw error;  // Re-throw the error to be caught in the API call
    }
}
app.use(cors());
// Create an API endpoint that responds with scraped reviews
app.get('/scrape-reviews', async (req, res) => {
    try {
        const VcToken = req.query.VcToken;
        const reviews = await scrapeIMDB(VcToken);
        res.json({ reviews });  // Send the reviews as JSON response
    } catch (error) {
        res.status(500).json({ message: 'Error scraping reviews', error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
