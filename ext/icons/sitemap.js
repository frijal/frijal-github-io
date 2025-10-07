const visitedLinks = JSON.parse(localStorage.getItem('visitedLinks') || '[]')
let grouped = {} // global

function formatDate(dateStr) {
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${dd}.${mm}.${yy}`
}

async function loadTOC() {
  try {
    const res = await fetch('artikel.json')
    const data = await res.json()
    const toc = document.getElementById('toc')
    toc.innerHTML = ''

    const totalCount = document.getElementById('totalCount')

    // --- Kelompokkan data per kategori + urutkan terbaru ---
    grouped = {}
    Object.keys(data).forEach((cat) => {
      grouped[cat] = data[cat]
        .map((arr) => ({
          title: arr[0],
          file: arr[1],
          image: arr[2],
          lastmod: arr[3],
          description: arr[4],
          category: cat,
        }))
        .sort((a, b) => new Date(b.lastmod) - new Date(a.lastmod))
    })

    // --- Hitung total artikel ---
    const totalArticles = Object.values(grouped).reduce(
      (sum, arr) => sum + arr.length,
      0,
    )
    totalCount.textContent = `Total artikel: ${totalArticles}`

    // --- Render kategori (urut berdasarkan jumlah artikel terbanyak) ---
    Object.keys(grouped)
      .sort((a, b) => grouped[b].length - grouped[a].length)
      .forEach((cat) => {
        const catDiv = document.createElement('div')
        catDiv.className = 'category'

        catDiv.innerHTML = `
          <div class="category-header">
            ${cat} <span class="badge">${grouped[cat].length}</span>
          </div>
          <div class="toc-list"></div>
        `

        const catList = catDiv.querySelector('.toc-list')

        // --- Tambahkan item TOC ---
        grouped[cat].forEach((item, i) => {
          const el = document.createElement('div')
          el.className = 'toc-item'
          el.dataset.text = item.title.toLowerCase()

          const a = document.createElement('a')
          a.href = `artikel/${item.file}`
          a.textContent = `${i + 1}. [${formatDate(item.lastmod)}] ${item.title}`

          const statusSpan = document.createElement('span')
          if (visitedLinks.includes(item.file)) {
            statusSpan.className = 'label-visited'
            statusSpan.textContent = 'sudah dibaca 👍'
            a.classList.add('visited')
          } else {
            statusSpan.className = 'label-new'
            statusSpan.textContent = '📚 belum dibaca'
          }

          a.addEventListener('click', () => {
            if (!visitedLinks.includes(item.file)) {
              visitedLinks.push(item.file)
              localStorage.setItem('visitedLinks', JSON.stringify(visitedLinks))
              statusSpan.className = 'label-visited'
              statusSpan.textContent = 'sudah dibaca 👍'
              a.classList.add('visited')
            }
          })

          const titleDiv = document.createElement('div')
          titleDiv.className = 'toc-title'
          titleDiv.appendChild(a)
          titleDiv.appendChild(statusSpan)

          el.appendChild(titleDiv)
          catList.appendChild(el)
        })

        // --- Toggle kategori individu ---
        catDiv
          .querySelector('.category-header')
          .addEventListener('click', () => {
            catList.style.display =
              catList.style.display === 'block' ? 'none' : 'block'
            updateTOCToggleText()
          })

        toc.appendChild(catDiv)
      })

    // --- Isi marquee dengan artikel random ---
    const m = document.getElementById('marquee-content')
    const allArticles = Object.values(grouped).flat()

    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    }

    const shuffled = shuffle(allArticles)
    m.innerHTML = shuffled
      .map((d) => `<a href="artikel/${d.file}" target="">${d.title}</a>`)
      .join(' • ')
  } catch (e) {
    console.error('Gagal load artikel.json', e)
  }
}

// --- Search + tombol clear ---
const searchInput = document.getElementById('search')
const clearBtn = document.getElementById('clearSearch')

searchInput.addEventListener('input', function () {
  const term = this.value.toLowerCase()
  clearBtn.style.display = this.value ? 'block' : 'none'

  let countVisible = 0
  document.querySelectorAll('.category').forEach((category) => {
    let catVisible = false
    category.querySelectorAll('.toc-item').forEach((item) => {
      const text = item.dataset.text
      const link = item.querySelector('a')
      if (term && text.includes(term)) {
        item.style.display = 'flex'
        catVisible = true
        countVisible++
        const regex = new RegExp(`(${term})`, 'gi')
        link.innerHTML = link.textContent.replace(
          regex,
          '<span class="highlight">$1</span>',
        )
      } else {
        item.style.display = term ? 'none' : 'flex'
        link.innerHTML = link.textContent
        if (!term) countVisible++
      }
    })
    category.style.display = catVisible ? 'block' : term ? 'none' : 'block'
    const tocList = category.querySelector('.toc-list')
    tocList.style.display = catVisible ? 'block' : tocList.style.display
  })

  document.getElementById('totalCount').textContent =
    `Total artikel: ${countVisible}`
  updateTOCToggleText()
})

clearBtn.addEventListener('click', () => {
  searchInput.value = ''
  searchInput.dispatchEvent(new Event('input'))
  clearBtn.style.display = 'none'
})

// --- Tombol global Buka/Tutup ---
let tocCollapsed = false
const tocToggleBtn = document.getElementById('tocToggle')

function updateTOCToggleText() {
  const allCollapsed = Array.from(document.querySelectorAll('.toc-list')).every(
    (list) => list.style.display === 'none',
  )
  tocCollapsed = allCollapsed
  tocToggleBtn.textContent = tocCollapsed ? 'Buka' : 'Tutup'
}

tocToggleBtn.addEventListener('click', () => {
  tocCollapsed = !tocCollapsed
  document.querySelectorAll('.toc-list').forEach((list) => {
    list.style.display = tocCollapsed ? 'none' : 'block'
  })
  tocToggleBtn.textContent = tocCollapsed ? 'Buka' : 'Tutup'
})

// --- Inisialisasi ---
loadTOC()

// ===== Perbaikan gradient + dark-mode =====

// get clean category name from .category-header element (ignore .badge text)
function getHeaderName(el) {
  if (!el) return ''
  const badge = el.querySelector && el.querySelector('.badge')
  if (badge) {
    return el.textContent.replace(badge.textContent, '').trim()
  }
  // fallback: take first non-empty text node
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent.trim()
      if (t) return t
    }
  }
  return el.textContent.trim()
}

// simple hash function
function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

const gradients = [
  'linear-gradient(90deg, #FF4500, #FF7F50)',
  'linear-gradient(90deg, #FFA500, #FFD700)',
  'linear-gradient(90deg, #2E8B57, #3CB371)',
  'linear-gradient(90deg, #8A2BE2, #9370DB)',
  'linear-gradient(90deg, #1E90FF, #4682B4)',
  'linear-gradient(90deg, #2F4F4F, #708090)',
  'linear-gradient(90deg, #696969, #A9A9A9)',
  'linear-gradient(90deg, #ff7e5f, #feb47b)',
  'linear-gradient(90deg, #00c6ff, #0072ff)',
]

function generateGradientMap(categories) {
  const map = {}
  ;(categories || []).forEach((cat) => {
    map[cat] = gradients[hashString(cat) % gradients.length]
  })
  return map
}

function isDarkModeActive() {
  const saved = localStorage.getItem('darkMode')
  if (saved === 'true') return true
  if (saved === 'false') return false
  return (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

function applyGradients(categories) {
  const gradientMap = generateGradientMap(categories || [])
  const headers = document.querySelectorAll('.category-header')
  headers.forEach((el) => {
    const name = getHeaderName(el)
    // try exact match first
    let key = Object.keys(gradientMap).find((k) => k.trim() === name)
    // try fuzzy: key contains name or name contains key
    if (!key) {
      key = Object.keys(gradientMap).find(
        (k) => k.includes(name) || name.includes(k),
      )
    }
    const gradient = key ? gradientMap[key] : null

    // respect manual dark-mode and prefered dark
    if (isDarkModeActive()) {
      // keep dark fallback (avoid bright gradients in dark mode)
      el.style.background = el.dataset._origBg || '#222'
    } else {
      if (gradient) {
        el.style.background = gradient
      } else {
        // fallback: generate random inline gradient (keadaan langka)
        const a =
          '#' +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, '0')
        const b =
          '#' +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, '0')
        el.style.background = `linear-gradient(90deg, ${a}, ${b})`
      }
    }
    // mark applied so observer can skip or check later
    el.dataset._grad_applied = '1'
  })
}

// Init dark-mode and bind switch (but do not BLOCK applying gradients if switch missing)
function initDarkMode(categories) {
  const darkSwitch = document.getElementById('darkSwitch')

  // If user saved a preference, respect it; otherwise use system preference
  const saved = localStorage.getItem('darkMode')
  if (saved === 'true') {
    document.body.classList.add('dark-mode')
    if (darkSwitch) darkSwitch.checked = true
  } else if (saved === 'false') {
    document.body.classList.remove('dark-mode')
    if (darkSwitch) darkSwitch.checked = false
  } else {
    // no saved preference → follow system
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      document.body.classList.add('dark-mode')
      if (darkSwitch) darkSwitch.checked = true
    } else {
      document.body.classList.remove('dark-mode')
      if (darkSwitch) darkSwitch.checked = false
    }
  }

  // always apply gradients (even when no switch present)
  applyGradients(categories)

  // wire toggle if exists
  if (darkSwitch) {
    darkSwitch.addEventListener('change', () => {
      if (darkSwitch.checked) {
        document.body.classList.add('dark-mode')
        localStorage.setItem('darkMode', 'true')
      } else {
        document.body.classList.remove('dark-mode')
        localStorage.setItem('darkMode', 'false')
      }
      applyGradients(categories)
    })
  }

  // Re-apply when TOC changes dynamically
  const target = document.getElementById('toc') || document.body
  if (target) {
    const mo = new MutationObserver(() => {
      // small debounce
      clearTimeout(window._applyGradTimeout)
      window._applyGradTimeout = setTimeout(
        () => applyGradients(categories),
        50,
      )
    })
    mo.observe(target, { childList: true, subtree: true })
  }
}

// expose functions if needed
window.generateGradientMap = generateGradientMap
window.applyGradients = applyGradients
window.initDarkMode = initDarkMode

// di sitemap.js
document.addEventListener('DOMContentLoaded', () => {
  loadTOC().then(() => {
    const tocEl = document.getElementById('toc')
    if (tocEl) {
      const categories = Array.from(
        tocEl.querySelectorAll('.category-header'),
      ).map((el) => el.textContent.trim())
      initDarkMode(categories)
    }
  })
})
