const fs = require("fs");
const path = require("path");
const { titleToCategory } = require("./titleToCategory");

// folder artikel ada di root
const artikelDir = path.join(__dirname, "../artikel");
const jsonOut = path.join(__dirname, "../artikel.json");
const xmlOut = path.join(__dirname, "../sitemap.xml");

// Ambil judul dari <title>
function extractTitle(content) {
  const match = content.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : "Periksa title Judul";
}

// Cari gambar: og:image > img pertama > fallback thumbnail.jpg
function extractImage(content) {
  const og = content.match(/property=["']og:image["'] content=["'](.*?)["']/i);
  if (og && og[1]) return og[1].trim();

  const img = content.match(/<img[^>]+src=["'](.*?)["']/i);
  if (img && img[1]) return img[1].trim();

  return "https://frijal.github.io/artikel/thumbnail.jpg"; // fallback
}

// Ambil semua file HTML
const files = fs.readdirSync(artikelDir).filter(f => f.endsWith(".html"));

let grouped = {};
let xmlUrls = [];

files.forEach(file => {
  const fullPath = path.join(artikelDir, file);
  const content = fs.readFileSync(fullPath, "utf8");

  const title = extractTitle(content);
  const category = titleToCategory(title);
  const image = extractImage(content);

  if (!grouped[category]) grouped[category] = [];
  grouped[category].push([title,file]);

  // Sitemap entry
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  xmlUrls.push(`
  <url>
    <loc>https://frijal.github.io/artikel/${file}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.6</priority>
    <changefreq>monthly</changefreq>
    <image:image>
      <image:loc>${image}</image:loc>
    </image:image>
  </url>`);
});

// Simpan artikel.json (grouping per kategori)
fs.writeFileSync(jsonOut, JSON.stringify(grouped, null, 2), "utf8");

// Simpan sitemap.xml
const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlUrls.join("\n")}
</urlset>`;
fs.writeFileSync(xmlOut, xmlContent, "utf8");

console.log("✅ artikel.json & sitemap.xml berhasil dibuat (gambar dinamis + fallback thumbnail)");
