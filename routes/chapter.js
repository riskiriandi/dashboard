const express = require('express');
const cheerio = require('cheerio');
const { smartRequest, SCRAPER_CONFIG, proxyImageUrl } = require('../config/scraper');

const router = express.Router();

// Get chapter content
router.get('/:manga/:chapter', async (req, res) => {
  try {
    const { manga, chapter } = req.params;
    const chapterUrl = `${SCRAPER_CONFIG.BASE_URL}/${manga}/${chapter}`;
    
    const response = await smartRequest(chapterUrl);
    const $ = cheerio.load(response.data);
    
    // Extract chapter info
    const chapterTitle = $('h1, .chapter-title, .entry-title').text().trim();
    const mangaTitle = $('.manga-title, .series-title').text().trim();
    
    // Extract chapter images
    const images = [];
    $('.chapter-images img, .entry-content img, .reader-content img').each((i, element) => {
      const $img = $(element);
      let imgSrc = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src');
      
      if (imgSrc) {
        images.push({
          page: i + 1,
          url: proxyImageUrl(imgSrc),
          alt: `Page ${i + 1}`
        });
      }
    });
    
    // Extract navigation
    const prevChapter = $('.prev-chapter, .nav-previous a').attr('href');
    const nextChapter = $('.next-chapter, .nav-next a').attr('href');
    
    const chapterData = {
      title: chapterTitle,
      mangaTitle,
      images,
      totalPages: images.length,
      navigation: {
        prev: prevChapter ? prevChapter.replace(SCRAPER_CONFIG.BASE_URL, '') : null,
        next: nextChapter ? nextChapter.replace(SCRAPER_CONFIG.BASE_URL, '') : null
      }
    };
    
    res.json({
      success: true,
      data: chapterData
    });
    
  } catch (error) {
    console.error('Error fetching chapter:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chapter content'
    });
  }
});

// Image proxy endpoint to bypass hotlink protection
router.get('/proxy/image', async (req, res) => {
  try {
    const imageUrl = decodeURIComponent(req.query.url);
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'URL parameter required' });
    }
    
    const response = await smartRequest(imageUrl, {
      responseType: 'stream',
      headers: {
        'Referer': SCRAPER_CONFIG.BASE_URL,
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
      }
    });
    
    // Set appropriate headers
    res.set({
      'Content-Type': response.headers['content-type'] || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'Access-Control-Allow-Origin': '*'
    });
    
    // Pipe the image
    response.data.pipe(res);
    
  } catch (error) {
    console.error('Error proxying image:', error.message);
    res.status(404).json({ error: 'Image not found' });
  }
});

module.exports = router;