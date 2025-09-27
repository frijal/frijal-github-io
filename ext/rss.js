const fs = require("fs");
const path = require("path");
const { DOMParser } = require("@xmldom/xmldom");

const sitemapPath = path.join(__dirname, "../sitemap.xml");
const rssPath = path.join(__dirname, "../rss.xml");
const artikelJsonPath = path.join(__dirname, "../artikel.json");

function extractDescription(filePath) {
  if (!fs.existsSync(filePath)) return "";
  const html = fs.readFileSync(filePath, "utf8");

  // 1. Meta description
  const metaMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
  );
  if (metaMatch) return metaMatch[1];

  // 2. Fallback: <p> pertama
  const pMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
  if (pMatch) {
    const text = pMatch[1].replace(/<[^>]+>/g, "");
    return text.substring(0, 150) + (text.length > 150 ? "…" : "");
  }

  return "";
}

function extractDate(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const html = fs.readFileSync(filePath, "utf8");
  const dateMatch = html.match(
    /<meta[^>]+name=["']date["'][^>]+content=["']([^"']+)["']/i
  );
  if (dateMatch) {
    return new Date(dateMatch[1]);
  }
  return null;
}

function sanitizeTitle(fileName) {
  return fileName
    .replace(/\.html$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

// baca artikel.json → buat map file → kategori
let kategoriMap = {};
if (fs.existsSync(artikelJsonPath)) {
  try {
    const artikelData = JSON.parse(fs.readFileSync(artikelJsonPath, "utf8"));
    for (const [kategori, daftarArtikel] of Object.entries(artikelData)) {
      daftarArtikel.forEach(([judul, file]) => {
        kategoriMap[file] = kategori;
      });
    }
  } catch (e) {
    console.error("⚠️ Gagal parse artikel.json:", e);
  }
}

// baca sitemap
const sitemapContent = fs.readFileSync(sitemapPath, "utf8");
const doc = new DOMParser().parseFromString(sitemapContent, "text/xml");
const urls = doc.getElementsByTagName("url");

// kumpulkan item
let itemsArr = [];
for (let i = 0; i < urls.length; i++) {
  const loc = urls[i].getElementsByTagName("loc")[0]?.textContent;
  if (loc) {
    const fileName = path.basename(loc);
    const localPath = path.join(__dirname, "../artikel", fileName);

    const desc = extractDescription(localPath);
    const title = sanitizeTitle(fileName);
    const category = kategoriMap[fileName] || "Umum";

    // Ambil tanggal dari <meta name="date">
    const dateObj = extractDate(localPath) || new Date();
    const pubDate = dateObj.toUTCString();

    itemsArr.push({ title, loc, pubDate, desc, category, dateObj });
  }
}

// sort descending (artikel terbaru duluan)
itemsArr.sort((a, b) => b.dateObj - a.dateObj);

// batasi sesuai RSS_LIMIT (default 30)
const limit = parseInt(process.env.RSS_LIMIT || "30", 10);
itemsArr = itemsArr.slice(0, limit);

// generate RSS items
let items = itemsArr
  .map(
    it => `    <item>
      <title>${it.title}</title>
      <link>${it.loc}</link>
      <guid>${it.loc}</guid>
      <pubDate>${it.pubDate}</pubDate>
      <description><![CDATA[${it.desc}]]></description>
      <category>${it.category}</category>
    </item>`
  )
  .join("\n");

const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title><![CDATA[Frijal Artikel]]></title>
    <link><![CDATA[https://frijal.github.io/]]></link>
    <description><![CDATA[Feed artikel terbaru]]></description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

fs.writeFileSync(rssPath, rss, "utf8");
console.log(`✅ rss.xml berhasil dibuat (${itemsArr.length} item), disortir berdasarkan <meta name='date'>`);
