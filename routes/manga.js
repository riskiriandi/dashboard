const express = require('express');
const router = express.Router();
const { 
    getMangaList, 
    getMangaDetail, 
    getChapterList,
    formatMangaData, 
    formatChapterData 
} = require('../config/scraper');

// Get homepage manga list (mirror content)
router.get('/home', async (req, res) => {
    try {
        console.log('Fetching homepage manga list...');
        const response = await getMangaList(1, 24);
        
        if (response && response.data) {
            const formattedManga = response.data.map(manga => formatMangaData(manga));
            
            res.json({
                success: true,
                data: formattedManga,
                total: response.total || formattedManga.length,
                page: 1,
                pageSize: 24
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'No manga data found'
            });
        }
    } catch (error) {
        console.error('Homepage error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch homepage manga',
            message: error.message
        });
    }
});

// Get manga by page
router.get('/page/:page', async (req, res) => {
    try {
        const page = parseInt(req.params.page) || 1;
        console.log(`Fetching page ${page}...`);
        
        const response = await getMangaList(page, 24);
        
        if (response && response.data) {
            const formattedManga = response.data.map(manga => formatMangaData(manga));
            
            res.json({
                success: true,
                data: formattedManga,
                page: page,
                total: response.total || formattedManga.length,
                hasNext: formattedManga.length === 24,
                pageSize: 24
            });
        } else {
            res.status(404).json({
                success: false,
                error: `No manga found for page ${page}`
            });
        }
    } catch (error) {
        console.error(`Page ${req.params.page} error:`, error.message);
        res.status(500).json({
            success: false,
            error: `Failed to fetch page ${req.params.page}`,
            message: error.message
        });
    }
});

// Get manga detail by ID
router.get('/detail/:id', async (req, res) => {
    try {
        const mangaId = req.params.id;
        console.log(`Fetching manga detail: ${mangaId}`);
        
        // Get manga detail and chapter list in parallel
        const [mangaResponse, chaptersResponse] = await Promise.all([
            getMangaDetail(mangaId),
            getChapterList(mangaId, 1, 50) // Get first 50 chapters
        ]);
        
        if (mangaResponse && mangaResponse.data) {
            const manga = mangaResponse.data;
            const chapters = chaptersResponse?.data || [];
            
            const formattedManga = {
                id: manga.id,
                title: manga.title || manga.name,
                description: manga.description || manga.synopsis || 'No description available.',
                author: manga.author || 'Unknown',
                status: manga.status || 'Unknown',
                type: manga.type,
                image: manga.thumbnail || manga.cover_image,
                genres: manga.genres || [],
                rating: manga.rating,
                views: manga.views,
                totalChapters: chapters.length,
                chapters: chapters.map(chapter => formatChapterData(chapter, mangaId))
            };
            
            res.json({
                success: true,
                data: formattedManga
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Manga not found'
            });
        }
    } catch (error) {
        console.error(`Manga detail error for ${req.params.id}:`, error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch manga detail',
            message: error.message
        });
    }
});

// Get popular manga
router.get('/popular', async (req, res) => {
    try {
        console.log('Fetching popular manga...');
        // Use regular list with different sorting if available
        const response = await getMangaList(1, 24);
        
        if (response && response.data) {
            const formattedManga = response.data.map(manga => formatMangaData(manga));
            
            res.json({
                success: true,
                data: formattedManga,
                total: response.total || formattedManga.length
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'No popular manga found'
            });
        }
    } catch (error) {
        console.error('Popular manga error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch popular manga',
            message: error.message
        });
    }
});

// Get latest updates
router.get('/latest', async (req, res) => {
    try {
        console.log('Fetching latest updates...');
        const response = await getMangaList(1, 24); // Already sorted by latest
        
        if (response && response.data) {
            const formattedManga = response.data.map(manga => formatMangaData(manga));
            
            res.json({
                success: true,
                data: formattedManga,
                total: response.total || formattedManga.length
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'No latest updates found'
            });
        }
    } catch (error) {
        console.error('Latest updates error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch latest updates',
            message: error.message
        });
    }
});

// Get manga by genre (if supported by API)
router.get('/genre/:genre', async (req, res) => {
    try {
        const genre = req.params.genre;
        const page = parseInt(req.query.page) || 1;
        
        console.log(`Fetching manga by genre: ${genre}`);
        
        // For now, get all manga and filter by genre
        const response = await getMangaList(page, 24);
        
        if (response && response.data) {
            const filtered = response.data.filter(manga => 
                manga.genres && manga.genres.some(g => 
                    g.toLowerCase().includes(genre.toLowerCase())
                )
            );
            
            const formattedManga = filtered.map(manga => formatMangaData(manga));
            
            res.json({
                success: true,
                data: formattedManga,
                genre: genre,
                total: formattedManga.length
            });
        } else {
            res.status(404).json({
                success: false,
                error: `No manga found for genre: ${genre}`
            });
        }
    } catch (error) {
        console.error(`Genre error for ${req.params.genre}:`, error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch manga by genre',
            message: error.message
        });
    }
});

module.exports = router;