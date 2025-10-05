const fs = require("fs");
const path = require("path");
const { DOMParser } = require("@xmldom/xmldom");

// Tentukan path input dan output
const artikelJsonPath = path.join(__dirname, "../artikel.json");
const rssOutPath = path.join(__dirname, "../rss.xml");
const sitemapPath = path.join(__dirname, "../sitemap.xml");

// Urutan data dalam array artikel.json:
const IDX_TITLE = 0;
const IDX_FILE = 1;
const IDX_IMAGE = 2;
const IDX_LASTMOD = 3;
const IDX_DESCRIPTION = 4; // Deskripsi berada di indeks 4

// --- Helpers ---

/**
 * Mengambil data lastmod dari sitemap.xml berdasarkan nama file.
 * Kami menggunakan lastmod dari  sitemap karena nilainya adalah ISO 8601 (lebih bersih).
 * @param {string} fileName - Nama file (mis: 'artikel.html').
 * @param {object} sitemapData - Objek URL dari sitemap.
 * @returns {string} Tanggal dalam format string atau null.
 */
function getSitemapData(fileName, sitemapData) {
    const url = sitemapData[fileName];
    if (url) {
        return {
            lastmod: url.lastmod || new Date().toUTCString(),
            image: url.imageLoc || '',
        };
    }
    return null;
}

/**
 * Mengambil data kategori dari judul (Jika diperlukan, untuk kasus non-JSON).
 * Di sini kita menggunakan data JSON, jadi ini mungkin tidak diperlukan,
 * tapi disertakan untuk jaga-jaga.
 */
function sanitizeTitle(raw) {
    if (!raw) return "";
    return raw.replace(/^\p{Emoji_Presentation}\s*/u, "").trimStart();
}

/**
 * Memuat dan mengurai sitemap.xml menjadi objek yang mudah dicari.
 * @returns {object} Objek dengan key: nama file, value: {lastmod, imageLoc}
 */
function loadSitemapMap() {
    if (!fs.existsSync(sitemapPath)) return {};
    
    const sitemapContent = fs.readFileSync(sitemapPath, "utf8");
    const doc = new DOMParser().parseFromString(sitemapContent, "text/xml");
    const urls = doc.getElementsByTagName("url");
    const map = {};

    for (let i = 0; i < urls.length; i++) {
        const locElement = urls[i].getElementsByTagName("loc")[0];
        const lastmodElement = urls[i].getElementsByTagName("lastmod")[0];
        const imageLocElement = urls[i].getElementsByTagName("image:loc")[0];

        if (locElement) {
            const loc = locElement.textContent;
            const fileName = path.basename(loc);
            
            map[fileName] = {
                lastmod: lastmodElement ? lastmodElement.textContent : null,
                imageLoc: imageLocElement ? imageLocElement.textContent : null,
            };
        }
    }
    return map;
}

// --- Logika Utama ---
if (!fs.existsSync(artikelJsonPath)) {
    console.error("❌ ERROR: File artikel.json tidak ditemukan. Jalankan generator.js terlebih dahulu.");
    process.exit(1);
}

// 1. Muat Data
const artikelData = JSON.parse(fs.readFileSync(artikelJsonPath, "utf8"));
const sitemapMap = loadSitemapMap();

let allItems = [];

// 2. Iterasi melalui data artikel.json
for (const [category, articles] of Object.entries(artikelData)) {
    articles.forEach(arr => {
        const fileName = arr[IDX_FILE];
        const sitemapInfo = getSitemapData(fileName, sitemapMap);

        // Pastikan kami memiliki data esensial
        if (sitemapInfo) {
            allItems.push({
                title: arr[IDX_TITLE],
                file: fileName,
                loc: `https://frijal.github.io/artikel/${fileName}`,
                pubDate: new Date(sitemapInfo.lastmod).toUTCString(), // Konversi ISO ke RFC 822/UTC String
                desc: arr[IDX_DESCRIPTION] || sanitizeTitle(arr[IDX_TITLE]), // Fallback ke judul jika deskripsi kosong
                category: category,
                imageLoc: arr[IDX_IMAGE], // Ambil gambar dari JSON
                dateObj: new Date(sitemapInfo.lastmod),
            });
        }
    });
}

// 3. Sortir dan Batasi
allItems.sort((a, b) => b.dateObj - a.dateObj);
const limit = parseInt(process.env.RSS_LIMIT || "30", 10);
const itemsArr = allItems.slice(0, limit);

// 4. Generate RSS items
let items = itemsArr
    .map(
        it => {
            // Gunakan imageLoc dari artikel.json
            const enclosure = it.imageLoc ? 
                `    <enclosure url="${it.imageLoc}" length="0" type="image/jpeg" />` : 
                '';
            
            return `    <item>
      <title><![CDATA[${it.title}]]></title>
      <link><![CDATA[${it.loc}]]></link>
      <guid><![CDATA[${it.loc}]]></guid>
      <pubDate>${it.pubDate}</pubDate>
      <description><![CDATA[${it.desc}]]></description>
      <category><![CDATA[${it.category}]]></category>
${enclosure}
    </item>`;
        }
    )
    .join("\n");

// 5. Template RSS
const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[Frijal Artikel]]></title>
    <link><![CDATA[https://frijal.github.io/]]></link>
    <description><![CDATA[Feed artikel terbaru]]></description>
    <language>id-ID</language>
    <atom:link href="https://frijal.github.io/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

// 6. Tulis file utama
fs.writeFileSync(rssOutPath, rss, "utf8");

console.log(`✅ rss.xml berhasil dibuat dari artikel.json (${itemsArr.length} item)`);
