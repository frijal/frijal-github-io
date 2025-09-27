const fs = require("fs");
const path = require("path");
const { DOMParser } = require("@xmldom/xmldom");

const sitemapPath = path.join(__dirname, "../sitemap.xml");
const rssPath = path.join(__dirname, "../rss.xml");
const artikelJsonPath = path.join(__dirname, "../artikel.json");

// --- Helpers ---
function extractDescription(filePath) {
  if (!fs.existsSync(filePath)) return "";
  const html = fs.readFileSync(filePath, "utf8");

  const metaMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
  );
  if (metaMatch) return metaMatch[1];

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

function cleanCategory(raw) {
  if (!raw) return "Umum";
  return raw.replace(/^\p{Emoji_Presentation}\s*/u, "").trimStart();
}

function cleanTitle(raw) {
  if (!raw) return "";
  return raw.replace(/^\p{Emoji_Presentation}\s*/u, "").trimStart();
}

// --- Build kategori map dari artikel.json ---
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

// --- Baca sitemap ---
const sitemapContent = fs.readFileSync(sitemapPath, "utf8");
const doc = new DOMParser().parseFromString(sitemapContent, "text/xml");
const urls = doc.getElementsByTagName("url");

// --- Kumpulkan item ---
let itemsArr = [];
for (let i = 0; i < urls.length; i++) {
  const loc = urls[i].getElementsByTagName("loc")[0]?.textContent;
  if (loc) {
    const fileName = path.basename(loc);
    const localPath = path.join(__dirname, "../artikel", fileName);

    const desc = extractDescription(localPath);
    const title = cleanTitle(sanitizeTitle(fileName));
    const category = cleanCategory(kategoriMap[fileName] || "Umum");

    const dateObj = extractDate(localPath) || new Date();
    const pubDate = dateObj.toUTCString();

    itemsArr.push({ title, loc, pubDate, desc, category, dateObj });
  }
}

// --- Sort & limit ---
itemsArr.sort((a, b) => b.dateObj - a.dateObj);
const limit = parseInt(process.env.RSS_LIMIT || "30", 10);
itemsArr = itemsArr.slice(0, limit);

// --- Generate RSS items ---
let items = itemsArr
  .map(
    it => `    <item>
      <title><![CDATA[${it.title}]]></title>
      <link><![CDATA[${it.loc}]]></link>
      <guid><![CDATA[${it.loc}]]></guid>
      <pubDate>${it.pubDate}</pubDate>
      <description><![CDATA[${it.desc}]]></description>
      <category><![CDATA[${it.category}]]></category>
    </item>`
  )
  .join("\n");

// --- Template RSS ---
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

// --- Tulis file utama ---
fs.writeFileSync(path.join(__dirname, "../rss.xml"), rss, "utf8");

// --- Tulis duplikat identik di root repo ---
["rss", "atom", "feed"].forEach(name => {
  const outPath = path.join(__dirname, "..", name);
  fs.writeFileSync(outPath, rss, "utf8");
});

console.log(`✅ rss.xml + alias (/rss, /atom, /feed) berhasil dibuat (${itemsArr.length} item)`);
