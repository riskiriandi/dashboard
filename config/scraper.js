const axios = require('axios');
const UserAgent = require('user-agents');

// Anti-detection configuration
const SCRAPER_CONFIG = {
  // Base URL for shinigami
  BASE_URL: 'https://05.shinigami.asia',
  
  // Request delays (randomized)
  MIN_DELAY: 500,
  MAX_DELAY: 2000,
  
  // Timeout settings
  TIMEOUT: 10000,
  
  // Retry attempts
  MAX_RETRIES: 3
};

// User agents pool (from HTTP Canary findings + proven ones)
const USER_AGENTS = [
  'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

// Get random user agent
const getRandomUserAgent = () => {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

// Get random delay
const getRandomDelay = () => {
  return Math.floor(Math.random() * (SCRAPER_CONFIG.MAX_DELAY - SCRAPER_CONFIG.MIN_DELAY + 1)) + SCRAPER_CONFIG.MIN_DELAY;
};

// Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Create axios instance with anti-detection headers
const createAxiosInstance = () => {
  return axios.create({
    timeout: SCRAPER_CONFIG.TIMEOUT,
    headers: {
      'User-Agent': getRandomUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0',
      'DNT': '1'
    }
  });
};

// Smart request function with retry and delay
const smartRequest = async (url, options = {}) => {
  let lastError;
  
  for (let attempt = 1; attempt <= SCRAPER_CONFIG.MAX_RETRIES; attempt++) {
    try {
      // Random delay before request
      await sleep(getRandomDelay());
      
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get(url, options);
      
      // Success
      return response;
      
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed for ${url}:`, error.message);
      
      // If it's the last attempt, throw the error
      if (attempt === SCRAPER_CONFIG.MAX_RETRIES) {
        throw lastError;
      }
      
      // Wait longer before retry
      await sleep(getRandomDelay() * attempt);
    }
  }
};

// Proxy image URL to bypass hotlink protection
const proxyImageUrl = (originalUrl, req) => {
  if (!originalUrl) return '';
  
  // If it's already a full URL, proxy it
  if (originalUrl.startsWith('http')) {
    const encodedUrl = encodeURIComponent(originalUrl);
    return `/api/proxy/image?url=${encodedUrl}`;
  }
  
  // If it's a relative URL, make it absolute then proxy
  const fullUrl = originalUrl.startsWith('/') 
    ? `${SCRAPER_CONFIG.BASE_URL}${originalUrl}`
    : `${SCRAPER_CONFIG.BASE_URL}/${originalUrl}`;
  
  const encodedUrl = encodeURIComponent(fullUrl);
  return `/api/proxy/image?url=${encodedUrl}`;
};

module.exports = {
  SCRAPER_CONFIG,
  USER_AGENTS,
  getRandomUserAgent,
  getRandomDelay,
  sleep,
  createAxiosInstance,
  smartRequest,
  proxyImageUrl
};