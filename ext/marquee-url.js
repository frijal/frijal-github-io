/**
 * ===================================================================
 * SKRIP GABUNGAN v2: MARQUEE & PENCARIAN LIVE MELAYANG
 * ===================================================================
 */

// ... (semua fungsi bantuan Anda: isMobileDevice, registerReadTracker, searchArticles, tetap sama) ...

function initCategoryMarquee(allData, currentFilename) {
    // ... (fungsi marquee Anda yang sudah benar, tidak ada perubahan) ...
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

async function initializeApp() {
    // ... (fungsi initializeApp Anda yang sudah benar, tidak ada perubahan) ...
}

document.addEventListener('DOMContentLoaded', initializeApp);
