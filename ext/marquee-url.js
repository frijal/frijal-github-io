/**
 * ===================================================================
 * SKRIP GABUNGAN v8.3: MARQUEE, PENCARIAN & NAVIGASI DINAMIS
 * ===================================================================
 * - Kompatibel dengan Cloudflare Pages (Pretty URLs).
 * - Fetch data hanya satu kali untuk semua fitur.
 * - Navigasi ikon (Next/Prev) berputar di dalam kategori yang sama.
 * - Tooltip judul artikel yang lebih deskriptif.
 * - Ikon RSS dan penampil kategori yang bisa diklik.
 */

// -------------------------------------------------------------------
// FUNGSI-FUNGSI BANTUAN (HELPER FUNCTIONS)
// -------------------------------------------------------------------

function isMobileDevice() {
  return (
    window.innerWidth <= 768 ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  );
}

function registerReadTracker() {
  const marqueeContainer = document.getElementById('related-marquee-container');
  if (marqueeContainer) {
    marqueeContainer.addEventListener('click', function (event) {
      const clickedLink = event.target.closest('a');
      if (clickedLink) {
        const articleId = clickedLink.getAttribute('data-article-id');
        if (articleId) {
          const readArticles = JSON.parse(
            localStorage.getItem('read_marquee_articles') || '[]',
          );
          if (!readArticles.includes(articleId)) {
            readArticles.push(articleId);
            localStorage.setItem(
              'read_marquee_articles',
              JSON.stringify(readArticles),
            );
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
    jsonData[category].forEach((article) => {
      const title = article[0] || '';
      const description = article[4] || '';
      if (
        title.toLowerCase().includes(lowerCaseQuery) ||
        description.toLowerCase().includes(lowerCaseQuery)
      ) {
        results.push({
          category: category,
          title: title,
          url: article[1],
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
      if (allData[categoryName].find((item) => item[1] === currentFilename)) {
        targetCategory = categoryName;
        articlesInCategory = allData[categoryName];
        break;
      }
    }

    if (!targetCategory) return;
    const filteredArticles = articlesInCategory.filter(
      (item) => item[1] !== currentFilename,
    );
    const readArticles = JSON.parse(
      localStorage.getItem('read_marquee_articles') || '[]',
    );
    const unreadArticles = filteredArticles.filter(
      (item) => !readArticles.includes(item[1]),
    );
    if (unreadArticles.length === 0) {
      marqueeContainer.innerHTML =
        '<p style="margin:0; text-align:center; color: #aaa; font-style: italic;">Semua artikel terkait sudah dibaca. 😊</p>';
      return;
    }

    unreadArticles.sort(() => 0.5 - Math.random());
    let contentHTML = '';
    const separator = ' • ';
    const isMobile = isMobileDevice();
    unreadArticles.forEach((post) => {
      const [title, articleId, , , description] = post;
      const url = `/artikel/${articleId}`;
      const tooltipText = isMobile ? title : description || title;
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
    clearButton.style.display = query.length > 0 ? 'block' : 'none';
    const results = searchArticles(query, allArticlesData);
    resultsContainer.innerHTML = '';
    if (results.length > 0) {
      results.slice(0, 20).forEach((item) => {
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
    if (searchContainer && !searchContainer.contains(event.target)) {
      resultsContainer.style.display = 'none';
    }
  });
}

function initNavIcons(allArticlesData, currentFilename) {
    function generateCategoryUrl(name) {
        const noEmoji = name.replace(/^[^\w\s]*/, '').trim();
        return noEmoji.toLowerCase().replace(/ & /g, '-and-').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    }

    let articlesInCategory = [];
    let currentIndexInCategory = -1;
    let currentCategoryName = null;

    for (const [category, articles] of Object.entries(allArticlesData)) {
        articles.sort((a, b) => new Date(b[3]) - new Date(a[3]));
        const idx = articles.findIndex(a => a[1] === currentFilename);
        if (idx !== -1) {
            currentCategoryName = category;
            articlesInCategory = articles;
            currentIndexInCategory = idx;
            break;
        }
    }

    // Buat elemen navigasi utama
    const navContainer = document.createElement('div');
    navContainer.className = 'floating-nav';
    
    // Siapkan struktur HTML dasar. Tombol prev/next dibuat tapi mungkin disembunyikan.
    navContainer.innerHTML = `
        <div class="nav-left">
            <a id="category-link" class="category-link"></a>
        </div>
        <div class="nav-right">
           <a id="next-article" title="Berikutnya" class="btn-emoji">▶️</a>
            <a href="https://frijal.pages.dev/sitemap.html" title="Daftar Isi" class="btn-emoji">📄</a>
            <a href="https://frijal.pages.dev" title="Home" class="btn-emoji">🏠</a>
            <a href="https://frijal.pages.dev/feed.html" title="Update harian" class="btn-emoji">📡</a>
             <a id="prev-article" title="Sebelumnya" class="btn-emoji">◀️</a>
                    </div>
    `;
    document.body.appendChild(navContainer);

    // Ambil elemen yang baru saja dibuat
    const categoryLink = document.getElementById('category-link');
    const prevBtn = document.getElementById('prev-article');
    const nextBtn = document.getElementById('next-article');

    // Keluar jika artikel tidak ditemukan
    if (currentIndexInCategory === -1) {
        navContainer.style.display = 'none';
        return;
    }

    // Update link kategori di kiri bawah
    if (categoryLink && currentCategoryName) {
        categoryLink.textContent = currentCategoryName;
        categoryLink.href = `/artikel/-/${generateCategoryUrl(currentCategoryName)}`;
        categoryLink.title = `Kategori: ${currentCategoryName}`;
        setTimeout(() => categoryLink.classList.add('visible'), 100);
    } else if(categoryLink) {
        categoryLink.style.display = 'none';
    }

    const totalArticles = articlesInCategory.length;
    
    // Logika infinite loop
    if (totalArticles <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        const nextIndex = (currentIndexInCategory + 1) % totalArticles;
        const prevIndex = (currentIndexInCategory - 1 + totalArticles) % totalArticles;
        
        const nextArticle = articlesInCategory[nextIndex];
        const prevArticle = articlesInCategory[prevIndex];

        prevBtn.href = `/artikel/${prevArticle[1]}`;
        prevBtn.title = `Sebelumnya: ${prevArticle[0]}`;
        
        nextBtn.href = `/artikel/${nextArticle[1]}`;
        nextBtn.title = `Berikutnya: ${nextArticle[0]}`;
    }
}


// -------------------------------------------------------------------
// FUNGSI UTAMA & PEMICU (MAIN & TRIGGER)
// -------------------------------------------------------------------

async function initializeApp() {
  try {
    const response = await fetch('/artikel.json');
    if (!response.ok) throw new Error(`Gagal memuat artikel.json`);
    const allArticlesData = await response.json();

    const currentPath = window.location.pathname;
    let currentFilename;

    if (currentPath.endsWith('.html')) {
      // Kasus 1: URL adalah path file langsung (misal: saat development lokal)
      currentFilename = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    } else {
      // Kasus 2: Pretty URL (Cloudflare Pages)
      const cleanPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
      const slug = cleanPath.substring(cleanPath.lastIndexOf('/') + 1);
      currentFilename = `${slug}.html`;
    }

    const clearButton = document.getElementById('floatingSearchClear');
    if (clearButton) {
      clearButton.innerHTML = '❌';
    }

    // Inisialisasi semua fitur
    initCategoryMarquee(allArticlesData, currentFilename);
    initFloatingSearch(allArticlesData);
    initNavIcons(allArticlesData, currentFilename);

  } catch (error) {
    console.error('Gagal menginisialisasi aplikasi:', error);
    const searchInput = document.getElementById('floatingSearchInput');
    if (searchInput) {
      searchInput.placeholder = 'Gagal memuat data';
      searchInput.disabled = true;
    }
  }
}

// Menjalankan semua fungsi saat dokumen siap
document.addEventListener('DOMContentLoaded', initializeApp);
