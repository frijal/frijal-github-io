import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { titleToCategory } from './titleToCategory.js' // pastikan pakai .js

// Setup __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path utama
const rootDir = path.join(__dirname, '..')
const artikelDir = path.join(rootDir, 'artikel')

// Master acuan (di dalam folder artikel/)
const masterJson = path.join(artikelDir, 'artikel.json')

// Output hasil generate (di root)
const jsonOut = path.join(rootDir, 'artikel.json')
const xmlOut = path.join(rootDir, 'sitemap.xml')

// Fungsi format tanggal ISO 8601
function formatISO8601(date) {
  const d = new Date(date)
  if (isNaN(d)) {
    console.warn(`⚠️ Tanggal tidak valid, fallback ke sekarang.`)
    return new Date().toISOString()
  }
  const tzOffset = -d.getTimezoneOffset()
  const diff = tzOffset >= 0 ? '+' : '-'
  const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, '0')
  const hours = pad(tzOffset / 60)
  const minutes = pad(tzOffset % 60)
  return d.toISOString().replace('Z', `${diff}${hours}:${minutes}`)
}

function extractPubDate(content) {
  const match = content.match(
    /<meta\s+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
  )
  return match ? match[1].trim() : null
}

function extractTitle(content) {
  const match = content.match(/<title>([\s\S]*?)<\/title>/i)
  return match ? match[1].trim() : 'Tanpa Judul'
}

function extractDescription(content) {
  const match = content.match(
    /<meta\s+name=["']description["'][^>]+content=["']([^"']+)["']/i,
  )
  return match ? match[1].trim() : ''
}

function fixTitleOneLine(content) {
  return content.replace(
    /<title>([\s\S]*?)<\/title>/gi,
    (m, p1) => `<title>${p1.trim()}</title>`,
  )
}

function extractImage(content, file) {
  let src = null
  const og =
    content.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["'](.*?)["']/i,
    ) ||
    content.match(
      /<meta[^>]+content=["'](.*?)["'][^>]+property=["']og:image["']/i,
    )
  if (og && og[1]) src = og[1].trim()

  if (!src) {
    const img = content.match(/<img[^>]+src=["'](.*?)["']/i)
    if (img && img[1]) {
      src = img[1].trim()
      if (!/^https?:\/\//i.test(src)) {
        src = `https://frijal.pages.dev/artikel/${src.replace(/^\/+/, '')}`
      }
    }
  }
  if (!src) {
    const baseName = file.replace(/\.html?$/i, '')
    src = `https://frijal.pages.dev/artikel/${baseName}.jpg`
  }

  const validExt = /\.(jpe?g|png|gif|webp|avif|svg)$/i
  if (!src || !validExt.test(src.split('?')[0])) {
    return 'https://frijal.pages.dev/thumbnail.jpg'
  }
  return src
}

// === Mulai Proses ===
const generate = async () => {
  try {
    await fs.access(artikelDir)
  } catch {
    console.warn('⚠️ Folder artikel/ tidak ditemukan.')
    return
  }

  // Load master JSON
  let grouped = {}
  try {
    const masterContent = await fs.readFile(masterJson, 'utf8')
    grouped = JSON.parse(masterContent)
  } catch {
    console.warn(
      '⚠️ artikel/artikel.json rusak atau kosong, mulai dari kosong.',
    )
    grouped = {}
  }

  const files = (await fs.readdir(artikelDir)).filter((f) =>
    f.endsWith('.html'),
  )
  let xmlUrls = []

  // Buat set daftar existing dari master JSON
  const existingFiles = new Set()
  Object.values(grouped).forEach((arr) => {
    arr.forEach((item) => existingFiles.add(item[1]))
  })

  for (const file of files) {
    if (existingFiles.has(file)) {
      console.log(`⏩ Skip ${file}, sudah ada di master.`)
      continue
    }

    const fullPath = path.join(artikelDir, file)
    let content = await fs.readFile(fullPath, 'utf8')
    let needsSave = false

    const fixedTitleContent = fixTitleOneLine(content)
    if (fixedTitleContent !== content) {
      content = fixedTitleContent
      needsSave = true
      console.log(`🔧 Fixed <title> di ${file}`)
    }

    const title = extractTitle(content)
    const category = titleToCategory(title)
    const image = extractImage(content, file)
    const description = extractDescription(content)

    let pubDate = extractPubDate(content)
    if (!pubDate) {
      const stats = await fs.stat(fullPath)
      const mtimeDate = stats.mtime
      pubDate = mtimeDate
      const newMetaTag = `    <meta property="article:published_time" content="${formatISO8601(mtimeDate)}">`
      if (content.includes('</head>')) {
        content = content.replace('</head>', `${newMetaTag}\n</head>`)
        needsSave = true
        console.log(`➕ Tambah meta tanggal ke '${file}'`)
      }
    }

    if (needsSave) {
      await fs.writeFile(fullPath, content, 'utf8')
    }

    const lastmod = formatISO8601(pubDate)

    if (!grouped[category]) grouped[category] = []
    grouped[category].push([title, file, image, lastmod, description])

    xmlUrls.push(
      `<url>
  <loc>https://frijal.pages.dev/artikel/${file}</loc>
  <lastmod>${lastmod}</lastmod>
  <priority>0.6</priority>
  <changefreq>monthly</changefreq>
  <image:image>
    <image:loc>${image}</image:loc>
  </image:image>
</url>`,
    )
  }

  // Format JSON agar rapi
  function formatArrayBlocks(obj) {
    let jsonString = JSON.stringify(obj, null, 2)
    jsonString = jsonString.replace(
      /\[(\s*\[.*?\])\s*\]/gs,
      (match, inner, offset, str) => {
        const before = str.slice(0, offset)
        const lastLine = before.split('\n').pop() || ''
        const indent = lastLine.match(/^\s*/)[0]
        const itemIndent = indent + '  '
        const items = inner
          .split('],')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => (s.endsWith(']') ? s : s + ']'))
        return (
          '[\n' +
          itemIndent +
          items.join(',\n' + itemIndent) +
          '\n' +
          indent +
          ']'
        )
      },
    )
    return jsonString
  }

  // Simpan artikel.json baru di root
  const jsonString = formatArrayBlocks(grouped)
  await fs.writeFile(jsonOut, jsonString, 'utf8')

  // Simpan sitemap.xml di root
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" 
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
  http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd 
  http://www.google.com/schemas/sitemap-image/1.1 
  http://www.google.com/schemas/sitemap/1.1/sitemap-image.xsd" 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls.join('\n')}
</urlset>`

  await fs.writeFile(xmlOut, xmlContent, 'utf8')

  console.log(
    '✅ artikel.json & sitemap.xml selesai dibuat di root (merge dengan master).',
  )
}

// Jalankan
generate()
