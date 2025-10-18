/**
 * ===================================================================
 * SKRIP GABUNGAN v8.1: MARQUEE, PENCARIAN & IKON NAVIGASI KATEGORI
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
  )
}

function registerReadTracker() {
  const marqueeContainer = document.getElementById('related-marquee-container')
  if (marqueeContainer) {
    marqueeContainer.addEventListener('click', function (event) {
      const clickedLink = event.target.closest('a')
      if (clickedLink) {
        const articleId = clickedLink.getAttribute('data-article-id')
        if (articleId) {
          const readArticles = JSON.parse(
            localStorage.getItem('read_marquee_articles') || '[]',
          )
          if (!readArticles.includes(articleId)) {
            readArticles.push(articleId)
            localStorage.setItem(
              'read_marquee_articles',
              JSON.stringify(readArticles),
            )
          }
        }
      }
    })
  }
}

function searchArticles(query, jsonData) {
  const results = []
  const lowerCaseQuery = query.toLowerCase().trim()
  if (lowerCaseQuery.length < 2) return []

  for (const category in jsonData) {
    jsonData[category].forEach((article) => {
      const title = article[0] || ''
      const description = article[4] || ''
      if (
        title.toLowerCase().includes(lowerCaseQuery) ||
        description.toLowerCase().includes(lowerCaseQuery)
      ) {
        results.push({
          category: category,
          title: title,
          url: article[1],
        })
      }
    })
  }
  return results
}

// -------------------------------------------------------------------
// FUNGSI INTI (CORE FUNCTIONS)
// -------------------------------------------------------------------

function initCategoryMarquee(allData, currentFilename) {
  const marqueeContainer = document.getElementById('related-marquee-container')
  if (!marqueeContainer) return

  try {
    let targetCategory = null
    let articlesInCategory = []
    for (const categoryName in allData) {
      if (allData[categoryName].find((item) => item[1] === currentFilename)) {
        targetCategory = categoryName
        articlesInCategory = allData[categoryName]
        break
      }
    }

    if (!targetCategory) return
    const filteredArticles = articlesInCategory.filter(
      (item) => item[1] !== currentFilename,
    )
    const readArticles = JSON.parse(
      localStorage.getItem('read_marquee_articles') || '[]',
    )
    const unreadArticles = filteredArticles.filter(
      (item) => !readArticles.includes(item[1]),
    )
    if (unreadArticles.length === 0) {
      marqueeContainer.innerHTML =
        '<p style="margin:0; text-align:center; color: #aaa; font-style: italic;">Semua artikel terkait sudah dibaca. 😊</p>'
      return
    }

    unreadArticles.sort(() => 0.5 - Math.random())
    let contentHTML = ''
    const separator = ' • '
    const isMobile = isMobileDevice()
    unreadArticles.forEach((post) => {
      const [title, articleId, , , description] = post
      const url = `/artikel/${articleId}`
      const tooltipText = isMobile ? title : description || title
      contentHTML += `<a href="${url}" data-article-id="${articleId}" title="${tooltipText}">${title}</a>${separator}`
    })
    marqueeContainer.innerHTML = `<div class="marquee-content">${contentHTML.repeat(30)}</div>`
    registerReadTracker()
  } catch (error) {
    console.error(`Marquee Error:`, error)
  }
}

function initFloatingSearch(allArticlesData) {
  const searchInput = document.getElementById('floatingSearchInput')
  const resultsContainer = document.getElementById('floatingSearchResults')
  const clearButton = document.getElementById('floatingSearchClear')
  if (!searchInput || !resultsContainer || !clearButton) return

  searchInput.addEventListener('keyup', () => {
    const query = searchInput.value
    clearButton.style.display = query.length > 0 ? 'block' : 'none'
    const results = searchArticles(query, allArticlesData)
    resultsContainer.innerHTML = ''
    if (results.length > 0) {
      results.slice(0, 20).forEach((item) => {
        const link = document.createElement('a')
        link.href = `/artikel/${item.url}`
        link.innerHTML = `${item.title} <small>${item.category}</small>`
        resultsContainer.appendChild(link)
      })
      resultsContainer.style.display = 'block'
    } else {
      resultsContainer.style.display = 'none'
    }
  })
  clearButton.addEventListener('click', () => {
    searchInput.value = ''
    resultsContainer.style.display = 'none'
    clearButton.style.display = 'none'
    searchInput.focus()
  })
  document.addEventListener('click', (event) => {
    const searchContainer = document.querySelector('.search-floating-container')
    if (searchContainer && !searchContainer.contains(event.target)) {
      resultsContainer.style.display = 'none'
    }
  })
}

function initNavIcons(allArticlesData, currentFilename) {
    // Helper function untuk membuat slug URL kategori
    function generateCategoryUrl(name) {
        const noEmoji = name.replace(/^[^\w\s]*/, '').trim();
        return noEmoji.toLowerCase()
            .replace(/ & /g, '-and-')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

    let articlesInCategory = [];
    let currentIndexInCategory = -1;
    let currentCategoryName = null;

    // 1. Cari kategori dan indeks artikel saat ini
    for (const [category, articles] of Object.entries(allArticlesData)) {
        // Urutkan artikel di dalam kategori berdasarkan tanggal terbaru
        articles.sort((a, b) => new Date(b[3]) - new Date(a[3]));
        const idx = articles.findIndex(a => a[1] === currentFilename);
        if (idx !== -1) {
            currentCategoryName = category;
            articlesInCategory = articles;
            currentIndexInCategory = idx;
            break;
        }
    }

    // Jika artikel tidak ditemukan, jangan lakukan apa-apa
    if (currentIndexInCategory === -1) return;

    // 2. Tentukan artikel sebelumnya dan berikutnya (logika non-sirkular)
    const prevArticle = currentIndexInCategory > 0 ? articlesInCategory[currentIndexInCategory - 1] : null;
    const nextArticle = currentIndexInCategory < articlesInCategory.length - 1 ? articlesInCategory[currentIndexInCategory + 1] : null;

    // 3. Buat satu kontainer navigasi terpadu
    const navContainer = document.createElement('div');
    navContainer.className = 'floating-nav'; // Satu kelas untuk semua

    // 4. Bangun HTML secara dinamis
    // Tombol akan muncul hanya jika ada artikel sebelum/sesudahnya
    navContainer.innerHTML = `
        <div class="nav-left">
            <a href="/artikel/-/${generateCategoryUrl(currentCategoryName)}" class="category-link" title="Kategori: ${currentCategoryName}">
                ${currentCategoryName}
            </a>
        </div>
        <div class="nav-right">
            ${nextArticle ? `
            <a href="/artikel/${nextArticle[1]}" title="Berikutnya: ${nextArticle[0]}" class="btn-emoji" style="--bg: linear-gradient(135deg, #FF6F00, #FFA726);">
                ▶️
            </a>` : ''}
            <a href="https://frijal.pages.dev/sitemap.html" title="Daftar Isi" class="btn-emoji" style="--bg: linear-gradient(135deg, #1976D2, #64B5F6);">
                ⛔
            </a>
            <a href="https://frijal.pages.dev" title="Home" class="btn-emoji" style="--bg: linear-gradient(135deg, #388E3C, #66BB6A);">
                🏠
            </a>
            <a href="https://frijal.pages.dev/feed.html" title="Update harian" class="btn-emoji" style="--bg: linear-gradient(135deg, #FF6F00, #FFA726);">
                📡
            </a>
            ${prevArticle ? `
            <a href="/artikel/${prevArticle[1]}" title="Sebelumnya: ${prevArticle[0]}" class="btn-emoji" style="--bg: linear-gradient(135deg, #1976D2, #64B5F6);">
                ◀️
            </a>` : ''}
        </div>
    `;

    document.body.appendChild(navContainer);
}

// -------------------------------------------------------------------
// FUNGSI UTAMA & PEMICU (MAIN & TRIGGER)
// -------------------------------------------------------------------
async function initializeApp() {
  try {
    const response = await fetch('/artikel.json')
    if (!response.ok) throw new Error(`Gagal memuat artikel.json`)
    const allArticlesData = await response.json()

    // === PERUBAHAN DI SINI ===
    const currentPath = window.location.pathname;
    let currentFilename;

    if (currentPath.endsWith('.html')) {
      // Kasus 1: URL adalah path file langsung (misal: saat development lokal)
      // Contoh: /artikel/judul-artikel.html -> "judul-artikel.html"
      currentFilename = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    } else {
      // Kasus 2: Pretty URL (Cloudflare Pages)
      // Hapus trailing slash jika ada, contoh: /artikel/judul-artikel/ -> /artikel/judul-artikel
      const cleanPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
      // Ambil bagian terakhir dari path, contoh: /artikel/judul-artikel -> "judul-artikel"
      const slug = cleanPath.substring(cleanPath.lastIndexOf('/') + 1);
      // Tambahkan kembali ekstensi .html agar cocok dengan data di artikel.json
      currentFilename = `${slug}.html`;
    }
    // === AKHIR PERUBAHAN ===

    const clearButton = document.getElementById('floatingSearchClear')
    if (clearButton) {
      clearButton.innerHTML = '&times;'
    }

    initCategoryMarquee(allArticlesData, currentFilename)
    initFloatingSearch(allArticlesData)
    initNavIcons(allArticlesData, currentFilename)
  } catch (error) {
    console.error('Gagal menginisialisasi aplikasi:', error)
    const searchInput = document.getElementById('floatingSearchInput')
    if (searchInput) {
      searchInput.placeholder = 'Gagal memuat data'
      searchInput.disabled = true
    }
  }
}

// Menjalankan semua fungsi saat dokumen siap
document.addEventListener('DOMContentLoaded', initializeApp)
