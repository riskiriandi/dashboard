const express = require('express');
const cheerio = require('cheerio');
const { smartRequest, SCRAPER_CONFIG, proxyImageUrl } = require('../config/scraper');

const router = express.Router();

// Search manga
router.get('/:query', async (req, res) => {
  try {
    const query = encodeURIComponent(req.params.query);
    const page = parseInt(req.query.page) || 1;
    
    // Construct search URL (adjust based on HTTP Canary findings)
    const searchUrl = `${SCRAPER_CONFIG.BASE_URL}/?s=${query}&page=${page}`;
    
    const response = await smartRequest(searchUrl);
    const $ = cheerio.load(response.data);
    
    const searchResults = [];
    
    // Parse search results
    $('.search-item, .manga-item, .post-item').each((i, element) => {
      const $element = $(element);
      
      const title = $element.find('h3, .title, .manga-title').text().trim();
      const url = $element.find('a').attr('href');
      const image = $element.find('img').attr('src') || $element.find('img').attr('data-src');
      const description = $element.find('.description, .summary').text().trim();
      const latestChapter = $element.find('.chapter, .latest-chapter').text().trim();
      
      if (title && url) {
        searchResults.push({
          title,
          url: url.replace(SCRAPER_CONFIG.BASE_URL, ''),
          image: proxyImageUrl(image),
          description,
          latestChapter
        });
      }
    });
    
    res.json({
      success: true,
      query: req.params.query,
      data: searchResults,
      currentPage: page,
      total: searchResults.length
    });
    
  } catch (error) {
    console.error('Error searching manga:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to search manga'
    });
  }
});

module.exports = router;