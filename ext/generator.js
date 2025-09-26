const fs = require("fs");
const path = require("path");
const { titleToCategory } = require("./titleToCategory");

// folder artikel ada di root
const artikelDir = path.join(__dirname, "../artikel");
const jsonOut = path.join(__dirname, "../artikel.json");
const xmlOut = path.join(__dirname, "../sitemap.xml");

// Fungsi ambil judul dari <title>
function extractTitle(content) {
  const match = content.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : "Tanpa Judul";
}

// Fungsi fix <title> agar selalu satu baris
function fixTitleOneLine(content) {
  return content.replace(/<title>([\s\S]*?)<\/title>/gi, (m, p1) => {
    return `<title>${p1.trim()}</title>`;
  });
}

// Fungsi cari gambar: og:image > img pertama > fallback thumbnail.jpg
function extractImage(content, file) {
  const og = content.match(/property=["']og:image["'] content=["'](.*?)["']/i);
  if (og && og[1]) return og[1].trim();

  const img = content.match(/<img[^>]+src=["'](.*?)["']/i);
  if (img && img[1]) {
    let src = img[1].trim();
    // kalau path relatif, ubah jadi absolut
    if (!/^https?:\/\//i.test(src)) {
      src = `https://frijal.github.io/artikel/${src}`;
    }
    return src;
  }

  return "https://frijal.github.io/artikel/thumbnail.jpg"; // fallback
}

// Ambil semua file HTML
const files = fs.readdirSync(artikelDir).filter(f => f.endsWith(".html"));

let grouped = {};
let xmlUrls = [];

files.forEach(file => {
  const fullPath = path.join(artikelDir, file);
  let content = fs.readFileSync(fullPath, "utf8");

  // Perbaiki <title> jadi satu baris
  const fixedContent = fixTitleOneLine(content);
  if (fixedContent !== content) {
    fs.writeFileSync(fullPath, fixedContent, "utf8");
    console.log(`🔧 Fixed <title> di ${file}`);
  }

  // Ambil judul & kategori
  const title = extractTitle(fixedContent);
  const category = titleToCategory(title);
  const image = extractImage(fixedContent, file);

  if (!grouped[category]) grouped[category] = [];
  grouped[category].push([title,file]);

  // Sitemap entry
const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
xmlUrls.push(
`<url>
  <loc>https://frijal.github.io/artikel/${file}</loc>
  <lastmod>${today}</lastmod>
  <priority>0.6</priority>
  <changefreq>monthly</changefreq>
  <image:image>
    <image:loc>${image}</image:loc>
  </image:image>
</url>`
);

// Simpan artikel.json (grouping per kategori)
fs.writeFileSync(jsonOut, JSON.stringify(grouped, null, 2), "utf8");

// Simpan sitemap.xml
const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlUrls.join("\n")}
</urlset>`;
fs.writeFileSync(xmlOut, xmlContent, "utf8");

console.log("✅ artikel.json & sitemap.xml berhasil dibuat (title fix + gambar dinamis + fallback thumbnail)");
