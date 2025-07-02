const axios = require('axios');

// Real API configuration from HTTP Canary data
const BASE_URL = 'https://api.shngm.io/v1';
const IMAGE_CDN = 'https://storage.shngm.id';
const CHAPTER_CDN = 'https://delivery.shngm.id';
const DELAY_MIN = 500;
const DELAY_MAX = 2000;
const MAX_RETRIES = 3;

// Headers from HTTP Canary
const getHeaders = () => ({
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
    'Sec-CH-UA': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://06.shinigami.asia/',
    'Origin': 'https://06.shinigami.asia',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'Connection': 'keep-alive'
});

// Random delay function
const randomDelay = () => {
    const delay = Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1)) + DELAY_MIN;
    return new Promise(resolve => setTimeout(resolve, delay));
};

// Create axios instance with proper headers
const createAxiosInstance = () => {
    return axios.create({
        timeout: 15000,
        headers: getHeaders()
    });
};

// Smart request function with retry logic
const smartRequest = async (url, options = {}) => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            if (attempt > 1) {
                console.log(`Retry attempt ${attempt} for: ${url}`);
                await randomDelay();
            }

            const axiosInstance = createAxiosInstance();
            const response = await axiosInstance.get(url, options);
            
            // Add delay between requests
            await randomDelay();
            
            return response;
        } catch (error) {
            console.error(`Attempt ${attempt} failed for ${url}:`, error.message);
            
            if (attempt === MAX_RETRIES) {
                throw new Error(`Failed after ${MAX_RETRIES} attempts: ${error.message}`);
            }
            
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
    }
};

// Get manga list (mirror content only)
const getMangaList = async (page = 1, pageSize = 24) => {
    const url = `${BASE_URL}/manga/list?type=mirror&page=${page}&page_size=${pageSize}&is_update=true&sort=latest&sort_order=desc`;
    console.log(`Fetching manga list: ${url}`);
    const response = await smartRequest(url);
    return response.data;
};

// Get manga detail
const getMangaDetail = async (mangaId) => {
    const url = `${BASE_URL}/manga/detail/${mangaId}`;
    console.log(`Fetching manga detail: ${url}`);
    const response = await smartRequest(url);
    return response.data;
};

// Get chapter list
const getChapterList = async (mangaId, page = 1, pageSize = 24) => {
    const url = `${BASE_URL}/chapter/${mangaId}/list?page=${page}&page_size=${pageSize}&sort_by=chapter_number&sort_order=desc`;
    console.log(`Fetching chapter list: ${url}`);
    const response = await smartRequest(url);
    return response.data;
};

// Get chapter detail
const getChapterDetail = async (chapterId) => {
    const url = `${BASE_URL}/chapter/detail/${chapterId}`;
    console.log(`Fetching chapter detail: ${url}`);
    const response = await smartRequest(url);
    return response.data;
};

// Search manga
const searchManga = async (query, page = 1, pageSize = 24) => {
    const url = `${BASE_URL}/manga/search?q=${encodeURIComponent(query)}&type=mirror&page=${page}&page_size=${pageSize}`;
    console.log(`Searching manga: ${url}`);
    try {
        const response = await smartRequest(url);
        return response.data;
    } catch (error) {
        // Fallback to list filter if search endpoint doesn't exist
        console.log('Search endpoint not found, using list filter');
        const listResponse = await getMangaList(page, pageSize);
        if (listResponse.data) {
            const filtered = listResponse.data.filter(manga => 
                manga.title && manga.title.toLowerCase().includes(query.toLowerCase())
            );
            return { data: filtered, total: filtered.length };
        }
        throw error;
    }
};

// Format image URL with proper CDN
const formatImageUrl = (imageUrl, type = 'thumbnail') => {
    if (!imageUrl) return null;
    
    // If already full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // Build URL based on type
    if (type === 'cover') {
        return `${IMAGE_CDN}/thumbnail/cover/${imageUrl}`;
    } else if (type === 'chapter') {
        return `${CHAPTER_CDN}/${imageUrl}`;
    } else {
        return `${IMAGE_CDN}/low/unsafe/filters:format(webp):quality(70)/thumbnail/image/${imageUrl}`;
    }
};

// Format manga data for frontend
const formatMangaData = (manga) => {
    return {
        id: manga.id,
        title: manga.title || manga.name,
        url: `/manga/${manga.id}`,
        image: formatImageUrl(manga.thumbnail || manga.cover_image),
        latestChapter: manga.latest_chapter?.title || manga.latest_chapter_title,
        description: manga.description || manga.synopsis,
        author: manga.author,
        status: manga.status,
        genres: manga.genres || [],
        type: manga.type
    };
};

// Format chapter data for frontend
const formatChapterData = (chapter, mangaId) => {
    return {
        id: chapter.id,
        title: chapter.title || `Chapter ${chapter.chapter_number}`,
        url: `/manga/${mangaId}/chapter/${chapter.id}`,
        number: chapter.chapter_number,
        date: chapter.created_at || chapter.published_at,
        mangaId: mangaId
    };
};

module.exports = {
    BASE_URL,
    IMAGE_CDN,
    CHAPTER_CDN,
    smartRequest,
    getMangaList,
    getMangaDetail,
    getChapterList,
    getChapterDetail,
    searchManga,
    formatImageUrl,
    formatMangaData,
    formatChapterData,
    randomDelay,
    getHeaders
};