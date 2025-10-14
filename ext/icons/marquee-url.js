/**
 * ===================================================================
 * SKRIP GABUNGAN v8: MARQUEE, PENCARIAN & IKON NAVIGASI KATEGORI
 * ===================================================================
 * - Fetch data hanya satu kali untuk semua fitur.
 * - Navigasi ikon (Next/Prev) berputar di dalam kategori yang sama.
 * - Tooltip judul artikel yang lebih deskriptif.
 * - Ikon RSS dikembalikan.
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
      const articleMatch = allData[categoryName].find(
        (item) => item[1] === currentFilename,
      )
      if (articleMatch) {
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
      results.slice(0, 10).forEach((item) => {
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
  const iconContainer = document.createElement('div')
  iconContainer.className = 'ikon-kanan-bawah'
  iconContainer.innerHTML = `
      <!-- Panah Kanan (Next) -->
      <a id="next-article" href="#" title="Artikel Berikutnya">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <defs><linearGradient id="gNext" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FF6F00"/><stop offset="100%" stop-color="#FFA726"/>
          </linearGradient></defs>
          <rect width="48" height="48" rx="12" fill="url(#gNext)"/>
          <path d="M20 14l10 10-10 10" stroke="#fff" stroke-width="4" fill="none"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
      <!-- Ikon RSS (RESTORED) -->
      <a href="https://frijal.pages.dev/feed.html" title="Update harian berisi 30 judul artikel terbaru dari berbagai topik populer. Ringkas, informatif, dan siap dibaca.">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FF6F00"/><stop offset="100%" stop-color="#FFA726"/>
          </linearGradient></defs>
          <rect width="48" height="48" rx="12" fill="url(#g1)"/>
          <circle cx="14" cy="34" r="4" fill="#fff"/>
          <path d="M12 22a16 16 0 0 1 14 14" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M12 14a24 24 0 0 1 22 22" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
        </svg>
      </a>
      <!-- Ikon Home -->
      <a href="https://frijal.pages.dev" title="Home">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <defs><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#388E3C"/><stop offset="100%" stop-color="#66BB6A"/>
          </linearGradient></defs>
          <rect width="48" height="48" rx="12" fill="url(#g2)"/>
          <path d="M24 14L12 24h4v10h8v-6h4v6h8V24h4L24 14z" fill="#fff"/>
        </svg>
      </a>
      <!-- Ikon Sitemap -->
      <a href="https://frijal.pages.dev/sitemap.html" title="Daftar Isi">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <defs><linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1976D2"/><stop offset="100%" stop-color="#64B5F6"/>
          </linearGradient></defs>
          <rect width="48" height="48" rx="12" fill="url(#g3)"/>
          <rect x="18" y="10" width="12" height="8" rx="2" fill="#fff"/>
          <line x1="24" y1="18" x2="24" y2="26" stroke="#fff" stroke-width="2"/>
          <rect x="8" y="28" width="8" height="8" rx="2" fill="#fff"/>
          <rect x="20" y="28" width="8" height="8" rx="2" fill="#fff"/>
          <rect x="32" y="28" width="8" height="8" rx="2" fill="#fff"/>
        </svg>
      </a>
      <!-- Panah Kiri (Prev) -->
      <a id="prev-article" href="#" title="Artikel Sebelumnya">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <defs><linearGradient id="gPrev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1976D2"/><stop offset="100%" stop-color="#64B5F6"/>
          </linearGradient></defs>
          <rect width="48" height="48" rx="12" fill="url(#gPrev)"/>
          <path d="M28 14L18 24l10 10" stroke="#fff" stroke-width="4" fill="none"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
    `
  document.body.appendChild(iconContainer)

  // --- Logika Navigasi Berbasis Kategori ---
  let currentCategoryName = null
  let articlesInCurrentCategory = []
  let currentIndexInCategory = -1

  for (const [category, articles] of Object.entries(allArticlesData)) {
    const idx = articles.findIndex((a) => a[1] === currentFilename)
    if (idx !== -1) {
      currentCategoryName = category
      articlesInCurrentCategory = articles
      currentIndexInCategory = idx
      break
    }
  }

  if (!articlesInCurrentCategory.length) {
    document.getElementById('next-article').style.display = 'none'
    document.getElementById('prev-article').style.display = 'none'
    return
  }

  const total = articlesInCurrentCategory.length
  const nextBtn = document.getElementById('next-article')
  const prevBtn = document.getElementById('prev-article')

  function updateUI() {
    const nextIndex = (currentIndexInCategory + 1) % total
    const prevIndex = (currentIndexInCategory - 1 + total) % total

    const nextArticle = articlesInCurrentCategory[nextIndex]
    const prevArticle = articlesInCurrentCategory[prevIndex]

    nextBtn.href = `/artikel/${nextArticle[1]}`
    prevBtn.href = `/artikel/${prevArticle[1]}`

    // Update tooltip with format: Judul Artikel - Kategori
    nextBtn.title = `${nextArticle[0]} - ${currentCategoryName}`
    prevBtn.title = `${prevArticle[0]} - ${currentCategoryName}`
  }

  updateUI()

  nextBtn.addEventListener('click', (e) => {
    e.preventDefault()
    const nextIndex = (currentIndexInCategory + 1) % total
    window.location.href = `/artikel/${articlesInCurrentCategory[nextIndex][1]}`
  })

  prevBtn.addEventListener('click', (e) => {
    e.preventDefault()
    const prevIndex = (currentIndexInCategory - 1 + total) % total
    window.location.href = `/artikel/${articlesInCurrentCategory[prevIndex][1]}`
  })
}

function initActiveCategoryText(allArticlesData, currentFilename) {
  const kategoriDiv = document.getElementById('kategori-aktif')
  if (!kategoriDiv) return

  let kategoriAktif = null

  for (const [kategori, articles] of Object.entries(allArticlesData)) {
    const idx = articles.findIndex((a) => a[1] === currentFilename)
    if (idx !== -1) {
      kategoriAktif = kategori
      break
    }
  }

  if (kategoriAktif) {
    kategoriDiv.textContent = kategoriAktif
  }
}

// -------------------------------------------------------------------
// FUNGSI UTAMA & PEMICU (MAIN & TRIGGER)
// -------------------------------------------------------------------
async function initializeApp() {
  try {
    const response = await fetch('/artikel.json')
    if (!response.ok) throw new Error(`Gagal memuat artikel.json`)
    const allArticlesData = await response.json()

    const currentURL = window.location.pathname
    const currentFilename = currentURL.substring(
      currentURL.lastIndexOf('/') + 1,
    )

    const clearButton = document.getElementById('floatingSearchClear')
    if (clearButton) {
      clearButton.innerHTML = '&times;'
    }

    // Initialize all features with the fetched data
    initCategoryMarquee(allArticlesData, currentFilename)
    initFloatingSearch(allArticlesData)
    initNavIcons(allArticlesData, currentFilename)
    initActiveCategoryText(allArticlesData, currentFilename)
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
