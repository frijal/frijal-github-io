/**
 * ===================================================================
 * SKRIP GABUNGAN v2: MARQUEE & PENCARIAN LIVE MELAYANG
 * ===================================================================
 */

// -------------------------------------------------------------------
// FUNGSI-FUNGSI BANTUAN (HELPER FUNCTIONS)
// -------------------------------------------------------------------
function isMobileDevice() {
    return (window.innerWidth <= 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
}

function registerReadTracker() {
    const marqueeContainer = document.getElementById('related-marquee-container');
    if (marqueeContainer) {
        marqueeContainer.addEventListener('click', function(event) {
            const clickedLink = event.target.closest('a');
            if (clickedLink) {
                const articleId = clickedLink.getAttribute('data-article-id');
                if (articleId) {
                    const readArticles = JSON.parse(localStorage.getItem('read_marquee_articles') || '[]');
                    if (!readArticles.includes(articleId)) {
                        readArticles.push(articleId);
                        localStorage.setItem('read_marquee_articles', JSON.stringify(readArticles));
                    }
                }
            }
        });
    }
}

function searchArticles(query, jsonData) {
    const results = [];
    const lowerCaseQuery = query.toLowerCase().trim();
    if (lowerCaseQuery.length < 2) return [];

    for (const category in jsonData) {
        jsonData[category].forEach(article => {
            const title = article[0] || '';
            const description = article[4] || '';
            if (title.toLowerCase().includes(lowerCaseQuery) || description.toLowerCase().includes(lowerCaseQuery)) {
                results.push({
                    category: category,
                    title: title,
                    url: article[1]
                });
            }
        });
    }
    return results;
}

// -------------------------------------------------------------------
// FUNGSI INTI (CORE FUNCTIONS)
// -------------------------------------------------------------------
function initCategoryMarquee(allData, currentFilename) {
    const marqueeContainer = document.getElementById('related-marquee-container');
    if (!marqueeContainer) return;

    try {
        let targetCategory = null;
        let articlesInCategory = [];

        for (const categoryName in allData) {
            const articleMatch = allData[categoryName].find(item => item[1] === currentFilename);
            if (articleMatch) {
                targetCategory = categoryName;
                articlesInCategory = allData[categoryName];
                break;
            }
        }
        
        if (!targetCategory) return;

        const filteredArticles = articlesInCategory.filter(item => item[1] !== currentFilename);
        const readArticles = JSON.parse(localStorage.getItem('read_marquee_articles') || '[]');
        const unreadArticles = filteredArticles.filter(item => !readArticles.includes(item[1]));
        
        if (unreadArticles.length === 0) {
            marqueeContainer.innerHTML = '<p style="margin:0; text-align:center; color: #aaa; font-style: italic;">Semua artikel terkait sudah dibaca. 😊</p>';
            return; 
        }
        
        unreadArticles.sort(() => 0.5 - Math.random());
        
        let contentHTML = '';
        const separator = ' • ';
        const isMobile = isMobileDevice();

        unreadArticles.forEach(post => {
            const [title, articleId, , , description] = post;
            const url = `/artikel/${articleId}`;
            const tooltipText = isMobile ? title : (description || title);
            contentHTML += `<a href="${url}" data-article-id="${articleId}" title="${tooltipText}">${title}</a>${separator}`;
        });

        marqueeContainer.innerHTML = `<div class="marquee-content">${contentHTML.repeat(30)}</div>`;
        registerReadTracker(); 

    } catch (error) {
        console.error(`Marquee Error:`, error);
    }
}

function initFloatingSearch(allArticlesData) {
    const searchInput = document.getElementById('floatingSearchInput');
    const resultsContainer = document.getElementById('floatingSearchResults');
    const clearButton = document.getElementById('floatingSearchClear');
    if (!searchInput || !resultsContainer || !clearButton) return;

    searchInput.addEventListener('keyup', () => {
        const query = searchInput.value;
        clearButton.style.display = (query.length > 0) ? 'block' : 'none';
        const results = searchArticles(query, allArticlesData);
        resultsContainer.innerHTML = '';
        if (results.length > 0) {
            results.slice(0, 10).forEach(item => {
                const link = document.createElement('a');
                link.href = `/artikel/${item.url}`;
                link.innerHTML = `${item.title} <small>${item.category}</small>`;
                resultsContainer.appendChild(link);
            });
            resultsContainer.style.display = 'block';
        } else {
            resultsContainer.style.display = 'none';
        }
    });

    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        resultsContainer.style.display = 'none';
        clearButton.style.display = 'none';
        searchInput.focus();
    });
    
    document.addEventListener('click', (event) => {
        const searchContainer = document.querySelector('.search-floating-container');
        if (!searchContainer.contains(event.target)) {
            resultsContainer.style.display = 'none';
        }
    });
}

// -------------------------------------------------------------------
// FUNGSI UTAMA & PEMICU (MAIN & TRIGGER)
// -------------------------------------------------------------------
async function initializeApp() {
    try {
        const response = await fetch('/artikel.json');
        if (!response.ok) throw new Error(`Gagal memuat artikel.json`);
        const allArticlesData = await response.json();

        const currentURL = window.location.pathname;
        const currentFilename = currentURL.substring(currentURL.lastIndexOf('/') + 1);

        // --- MODIFIKASI DIMASUKKAN DI SINI ---
        // Perbaikan untuk memastikan simbol '×' dirender sebagai HTML
        const clearButton = document.getElementById('floatingSearchClear');
        if (clearButton) {
            clearButton.innerHTML = '&times;';
        }
        // ------------------------------------

        // Jalankan semua fitur
        initCategoryMarquee(allArticlesData, currentFilename);
        initFloatingSearch(allArticlesData);

    } catch (error) {
        console.error("Gagal menginisialisasi aplikasi:", error);
        const searchInput = document.getElementById('floatingSearchInput');
        if (searchInput) {
            searchInput.placeholder = "Gagal memuat data";
            searchInput.disabled = true;
        }
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);
