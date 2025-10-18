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
  const iconContainer = document.createElement('div')
  iconContainer.className = 'ikon-kanan-bawah'
  iconContainer.innerHTML = `
    <a id="next-article" href="#" title="Berikutnya" class="btn-emoji" style="--bg: linear-gradient(135deg, #FF6F00, #FFA726);">
        ▶️ </a>
    <a href="https://frijal.pages.dev/feed.html" title="Update harian" class="btn-emoji" style="--bg: linear-gradient(135deg, #FF6F00, #FFA726);">
        📡 </a>
    <a href="https://frijal.pages.dev" title="Home" class="btn-emoji" style="--bg: linear-gradient(135deg, #388E3C, #66BB6A);">
        🏠 </a>
    <a href="https://frijal.pages.dev/sitemap.html" title="Daftar Isi" class="btn-emoji" style="--bg: linear-gradient(135deg, #1976D2, #64B5F6);">
        🗺️ </a>
    <a id="prev-article" href="#" title="Sebelumnya" class="btn-emoji" style="--bg: linear-gradient(135deg, #1976D2, #64B5F6);">
        ◀️ </a>
    `
  document.body.appendChild(iconContainer)

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

  function generateCategoryUrl(name) {
    const noEmoji = name.replace(/^[^\w\s]*/, '').trim()
    const slug = noEmoji
      .toLowerCase()
      .replace(/ & /g, '-and-')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    return `${slug}.html`
  }

  if (currentCategoryName) {
    const categoryLink = document.createElement('a')
    categoryLink.className = 'kategori-kiri-bawah'
    categoryLink.textContent = currentCategoryName
    const categoryUrl = generateCategoryUrl(currentCategoryName)
    categoryLink.href = `/artikel/-/${categoryUrl}`
    document.body.appendChild(categoryLink)

    setTimeout(() => categoryLink.classList.add('visible'), 100)
  }

  if (!articlesInCurrentCategory.length) {
    document.getElementById('next-article').style.display = 'none'
    document.getElementById('prev-article').style.display = 'none'
    return
  }

  const total = articlesInCurrentCategory.length
  const nextBtn = document.getElementById('next-article')
  const prevBtn = document.getElementById('prev-article')

  const nextIndex = (currentIndexInCategory + 1) % total
  const prevIndex = (currentIndexInCategory - 1 + total) % total
  const nextArticle = articlesInCurrentCategory[nextIndex]
  const prevArticle = articlesInCurrentCategory[prevIndex]

  nextBtn.href = `/artikel/${nextArticle[1]}`
  prevBtn.href = `/artikel/${prevArticle[1]}`
  nextBtn.title = `${nextArticle[0]} - ${currentCategoryName}`
  prevBtn.title = `${prevArticle[0]} - ${currentCategoryName}`
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
