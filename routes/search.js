const express = require('express');
const router = express.Router();
const { searchManga, getMangaList, formatMangaData } = require('../config/scraper');

// Search manga
router.get('/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 24;
        
        console.log(`Searching for: "${query}"`);
        
        const response = await searchManga(query, page, pageSize);
        
        if (response && response.data) {
            const formattedResults = response.data.map(manga => formatMangaData(manga));
            
            res.json({
                success: true,
                data: formattedResults,
                query: query,
                total: response.total || formattedResults.length,
                page: page,
                pageSize: pageSize,
                hasNext: formattedResults.length === pageSize
            });
        } else {
            res.json({
                success: true,
                data: [],
                query: query,
                total: 0,
                message: 'No results found'
            });
        }
    } catch (error) {
        console.error(`Search error for "${req.params.query}":`, error.message);
        
        // Fallback: try to search using manga list filter
        try {
            console.log('Falling back to list filtering...');
            const listResponse = await getMangaList(1, 100); // Get more items for filtering
            
            if (listResponse && listResponse.data) {
                const filtered = listResponse.data.filter(manga => {
                    const title = (manga.title || '').toLowerCase();
                    const searchTerm = req.params.query.toLowerCase();
                    return title.includes(searchTerm);
                });
                
                const formattedResults = filtered.slice(0, pageSize).map(manga => formatMangaData(manga));
                
                res.json({
                    success: true,
                    data: formattedResults,
                    query: req.params.query,
                    total: filtered.length,
                    fallback: true,
                    message: 'Results from filtered list'
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'Search failed and fallback unsuccessful',
                    message: error.message,
                    query: req.params.query
                });
            }
        } catch (fallbackError) {
            res.status(500).json({
                success: false,
                error: 'Search failed',
                message: error.message,
                query: req.params.query
            });
        }
    }
});

// Advanced search with filters (if API supports it)
router.post('/advanced', async (req, res) => {
    try {
        const { query, type, status, genre, sort } = req.body;
        const page = parseInt(req.body.page) || 1;
        const pageSize = parseInt(req.body.page_size) || 24;
        
        console.log('Advanced search:', { query, type, status, genre, sort });
        
        // For now, use basic search and apply client-side filtering
        let searchQuery = query || '';
        const response = await searchManga(searchQuery, page, pageSize * 2); // Get more for filtering
        
        if (response && response.data) {
            let results = response.data;
            
            // Apply filters
            if (type && type !== 'all') {
                results = results.filter(manga => 
                    manga.type && manga.type.toLowerCase() === type.toLowerCase()
                );
            }
            
            if (status && status !== 'all') {
                results = results.filter(manga => 
                    manga.status && manga.status.toLowerCase().includes(status.toLowerCase())
                );
            }
            
            if (genre && genre !== 'all') {
                results = results.filter(manga => 
                    manga.genres && manga.genres.some(g => 
                        g.toLowerCase().includes(genre.toLowerCase())
                    )
                );
            }
            
            // Apply sorting
            if (sort) {
                switch (sort) {
                    case 'title_asc':
                        results.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                        break;
                    case 'title_desc':
                        results.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
                        break;
                    case 'latest':
                        // Already sorted by latest in API
                        break;
                    default:
                        break;
                }
            }
            
            // Pagination
            const startIndex = (page - 1) * pageSize;
            const paginatedResults = results.slice(startIndex, startIndex + pageSize);
            const formattedResults = paginatedResults.map(manga => formatMangaData(manga));
            
            res.json({
                success: true,
                data: formattedResults,
                filters: { query, type, status, genre, sort },
                total: results.length,
                page: page,
                pageSize: pageSize,
                hasNext: startIndex + pageSize < results.length
            });
        } else {
            res.json({
                success: true,
                data: [],
                filters: { query, type, status, genre, sort },
                total: 0,
                message: 'No results found'
            });
        }
    } catch (error) {
        console.error('Advanced search error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to perform advanced search',
            message: error.message
        });
    }
});

// Get search suggestions (autocomplete)
router.get('/suggest/:query', async (req, res) => {
    try {
        const query = req.params.query;
        
        if (query.length < 2) {
            return res.json({
                success: true,
                data: [],
                message: 'Query too short for suggestions'
            });
        }
        
        console.log(`Getting suggestions for: "${query}"`);
        
        // Get search results and format as suggestions
        const response = await searchManga(query, 1, 8); // Limit to 8 suggestions
        
        if (response && response.data) {
            const suggestions = response.data.map(manga => ({
                id: manga.id,
                title: manga.title || manga.name,
                url: `/manga/${manga.id}`,
                image: manga.thumbnail || manga.cover_image,
                type: manga.type
            }));
            
            res.json({
                success: true,
                data: suggestions,
                query: query,
                total: suggestions.length
            });
        } else {
            res.json({
                success: true,
                data: [],
                query: query,
                total: 0
            });
        }
    } catch (error) {
        console.error(`Suggestion error for "${req.params.query}":`, error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to get suggestions',
            message: error.message,
            query: req.params.query
        });
    }
});

// Get popular search terms (if available)
router.get('/popular/terms', async (req, res) => {
    try {
        // For now, return static popular terms
        // In real implementation, this could come from analytics
        const popularTerms = [
            'Solo Leveling',
            'One Piece',
            'Naruto',
            'Attack on Titan',
            'Demon Slayer',
            'My Hero Academia',
            'Jujutsu Kaisen',
            'One Punch Man'
        ];
        
        res.json({
            success: true,
            data: popularTerms,
            total: popularTerms.length
        });
    } catch (error) {
        console.error('Popular terms error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to get popular search terms',
            message: error.message
        });
    }
});

module.exports = router;