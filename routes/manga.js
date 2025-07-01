const express = require('express');
const cheerio = require('cheerio');
const { smartRequest, SCRAPER_CONFIG, proxyImageUrl } = require('../config/scraper');

const router = express.Router();

// Get homepage manga list
router.get('/home', async (req, res) => {
  try {
    const response = await smartRequest(`${SCRAPER_CONFIG.BASE_URL}`);
    const $ = cheerio.load(response.data);
    
    const mangaList = [];
    
    // Parse manga items (adjust selectors based on HTTP Canary findings)
    $('.manga-item, .post-item, .series-item').each((i, element) => {
      const $element = $(element);
      
      const title = $element.find('h3, .title, .series-title').text().trim();
      const url = $element.find('a').attr('href');
      const image = $element.find('img').attr('src') || $element.find('img').attr('data-src');
      const latestChapter = $element.find('.chapter, .latest-chapter').text().trim();
      
      if (title && url) {
        mangaList.push({
          title,
          url: url.replace(SCRAPER_CONFIG.BASE_URL, ''),
          image: proxyImageUrl(image),
          latestChapter,
          type: 'manga'
        });
      }
    });
    
    res.json({
      success: true,
      data: mangaList,
      total: mangaList.length
    });
    
  } catch (error) {
    console.error('Error fetching home:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch manga list'
    });
  }
});

// Get manga by page
router.get('/page/:page', async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const response = await smartRequest(`${SCRAPER_CONFIG.BASE_URL}/page/${page}`);
    const $ = cheerio.load(response.data);
    
    const mangaList = [];
    
    $('.manga-item, .post-item, .series-item').each((i, element) => {
      const $element = $(element);
      
      const title = $element.find('h3, .title, .series-title').text().trim();
      const url = $element.find('a').attr('href');
      const image = $element.find('img').attr('src') || $element.find('img').attr('data-src');
      const latestChapter = $element.find('.chapter, .latest-chapter').text().trim();
      
      if (title && url) {
        mangaList.push({
          title,
          url: url.replace(SCRAPER_CONFIG.BASE_URL, ''),
          image: proxyImageUrl(image),
          latestChapter
        });
      }
    });
    
    res.json({
      success: true,
      data: mangaList,
      currentPage: page,
      total: mangaList.length
    });
    
  } catch (error) {
    console.error('Error fetching page:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch manga page'
    });
  }
});

// Get manga details
router.get('/detail/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const response = await smartRequest(`${SCRAPER_CONFIG.BASE_URL}/${slug}`);
    const $ = cheerio.load(response.data);
    
    // Extract manga details
    const title = $('h1, .series-title, .manga-title').text().trim();
    const image = $('.series-image img, .manga-image img').attr('src') || $('.series-image img, .manga-image img').attr('data-src');
    const description = $('.series-description, .manga-description, .summary').text().trim();
    const author = $('.author, .manga-author').text().trim();
    const status = $('.status, .manga-status').text().trim();
    const genres = [];
    
    // Extract genres
    $('.genre, .manga-genre, .tags a').each((i, element) => {
      const genre = $(element).text().trim();
      if (genre) genres.push(genre);
    });
    
    // Extract chapters
    const chapters = [];
    $('.chapter-list a, .chapters a, .episode-list a').each((i, element) => {
      const $element = $(element);
      const chapterTitle = $element.text().trim();
      const chapterUrl = $element.attr('href');
      const chapterDate = $element.find('.date, .chapter-date').text().trim();
      
      if (chapterTitle && chapterUrl) {
        chapters.push({
          title: chapterTitle,
          url: chapterUrl.replace(SCRAPER_CONFIG.BASE_URL, ''),
          date: chapterDate
        });
      }
    });
    
    const mangaDetail = {
      title,
      image: proxyImageUrl(image),
      description,
      author,
      status,
      genres,
      chapters: chapters.reverse(), // Latest first
      totalChapters: chapters.length
    };
    
    res.json({
      success: true,
      data: mangaDetail
    });
    
  } catch (error) {
    console.error('Error fetching manga detail:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch manga details'
    });
  }
});

module.exports = router;