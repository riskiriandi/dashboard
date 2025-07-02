const express = require('express');
const router = express.Router();
const { 
    getChapterDetail, 
    getChapterList,
    formatImageUrl,
    CHAPTER_CDN 
} = require('../config/scraper');

// Get chapter content with images
router.get('/:manga/:chapter', async (req, res) => {
    try {
        const { manga, chapter } = req.params;
        console.log(`Fetching chapter: ${manga}/${chapter}`);
        
        // For URL compatibility, chapter param might be chapter ID
        const chapterId = chapter;
        
        const response = await getChapterDetail(chapterId);
        
        if (response && response.data) {
            const chapterData = response.data;
            
            // Format chapter images
            const images = [];
            if (chapterData.images && Array.isArray(chapterData.images)) {
                chapterData.images.forEach((image, index) => {
                    let imageUrl = image;
                    
                    // If image is object with URL property
                    if (typeof image === 'object' && image.url) {
                        imageUrl = image.url;
                    }
                    
                    // If not full URL, construct using CDN pattern
                    if (!imageUrl.startsWith('http')) {
                        // Pattern: delivery.shngm.id/chapter/manga_{manga_id}/chapter_{chapter_id}/{page}-{hash}.jpg
                        imageUrl = `${CHAPTER_CDN}/chapter/manga_${manga}/chapter_${chapterId}/${index + 1}-${imageUrl}`;
                    }
                    
                    images.push({
                        url: imageUrl,
                        alt: `Page ${index + 1}`,
                        page: index + 1
                    });
                });
            }
            
            // Get navigation info (previous/next chapters)
            let navigation = { prev: null, next: null };
            
            try {
                // Try to get chapter list to find prev/next
                const chaptersResponse = await getChapterList(manga, 1, 100);
                if (chaptersResponse && chaptersResponse.data) {
                    const chapters = chaptersResponse.data;
                    const currentIndex = chapters.findIndex(ch => ch.id === chapterId);
                    
                    if (currentIndex > 0) {
                        navigation.prev = `/manga/${manga}/chapter/${chapters[currentIndex - 1].id}`;
                    }
                    if (currentIndex < chapters.length - 1) {
                        navigation.next = `/manga/${manga}/chapter/${chapters[currentIndex + 1].id}`;
                    }
                }
            } catch (navError) {
                console.warn('Navigation error:', navError.message);
            }
            
            const formattedChapter = {
                id: chapterData.id,
                title: chapterData.title || `Chapter ${chapterData.chapter_number || chapter}`,
                manga: manga,
                chapter: chapter,
                chapterNumber: chapterData.chapter_number,
                images: images,
                navigation: navigation,
                totalPages: images.length,
                createdAt: chapterData.created_at,
                updatedAt: chapterData.updated_at
            };
            
            res.json({
                success: true,
                data: formattedChapter
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Chapter not found or no images available'
            });
        }
    } catch (error) {
        console.error(`Chapter error for ${req.params.manga}/${req.params.chapter}:`, error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch chapter',
            message: error.message
        });
    }
});

// Get chapter list for a manga
router.get('/:manga', async (req, res) => {
    try {
        const manga = req.params.manga;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 24;
        
        console.log(`Fetching chapter list for: ${manga}`);
        
        const response = await getChapterList(manga, page, pageSize);
        
        if (response && response.data) {
            const chapters = response.data.map(chapter => ({
                id: chapter.id,
                title: chapter.title || `Chapter ${chapter.chapter_number}`,
                url: `/manga/${manga}/chapter/${chapter.id}`,
                number: chapter.chapter_number,
                date: chapter.created_at || chapter.published_at,
                views: chapter.views,
                mangaId: manga
            }));
            
            res.json({
                success: true,
                data: {
                    manga: manga,
                    chapters: chapters,
                    totalChapters: response.total || chapters.length,
                    page: page,
                    pageSize: pageSize,
                    hasNext: chapters.length === pageSize
                }
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'No chapters found for this manga'
            });
        }
    } catch (error) {
        console.error(`Chapter list error for ${req.params.manga}:`, error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch chapter list',
            message: error.message
        });
    }
});

// Get specific chapter by ID only
router.get('/detail/:chapterId', async (req, res) => {
    try {
        const chapterId = req.params.chapterId;
        console.log(`Fetching chapter detail: ${chapterId}`);
        
        const response = await getChapterDetail(chapterId);
        
        if (response && response.data) {
            const chapterData = response.data;
            
            res.json({
                success: true,
                data: {
                    id: chapterData.id,
                    title: chapterData.title,
                    chapterNumber: chapterData.chapter_number,
                    mangaId: chapterData.manga_id,
                    images: chapterData.images || [],
                    createdAt: chapterData.created_at,
                    updatedAt: chapterData.updated_at,
                    views: chapterData.views
                }
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Chapter not found'
            });
        }
    } catch (error) {
        console.error(`Chapter detail error for ${req.params.chapterId}:`, error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch chapter detail',
            message: error.message
        });
    }
});

module.exports = router;