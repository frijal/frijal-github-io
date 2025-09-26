const fs = require("fs");
const path = require("path");

// Folder artikel
const artikelDir = path.join(__dirname, "artikel");

// Output file
const jsonOut = path.join(__dirname, "artikel.json");
const xmlOut = path.join(__dirname, "sitemap.xml");

// Fungsi bantu: ambil judul dari <title>
function extractTitle(content) {
  const match = content.match(/<title>(.*?)<\/title>/i);
  return match ? match[1].trim() : "Tanpa Judul";
}

// Fungsi bantu: ambil gambar (og:image atau img pertama)
function extractImage(content) {
  const og = content.match(/property=["']og:image["'] content=["'](.*?)["']/i);
  if (og) return og[1];
  const img = content.match(/<img[^>]+src=["'](.*?)["']/i);
  if (img) return img[1];
  return "thumbnail.jpg";
}

// Fungsi bantu: tentukan kategori dari judul
function categorize(title) {
  const lower = title.toLowerCase();
  if (lower.includes("linux") || lower.includes("ubuntu")) return "Linux & Open Source";
  if (lower.includes("islam") || lower.includes("alquran")) return "Islam & Kehidupan";
  if (lower.includes("windows") || lower.includes("microsoft")) return "Windows & Teknologi";
  return "Lainnya";
}

// Ambil semua file HTML
const files = fs.readdirSync(artikelDir).filter(f => f.endsWith(".html"));

let jsonData = {};
let xmlUrls = [];

files.forEach(file => {
  const fullPath = path.join(artikelDir, file);
  const content = fs.readFileSync(fullPath, "utf8");

  const title = extractTitle(content);
  const image = extractImage(content);
  const category = categorize(title);

  // Tambah ke JSON
  if (!jsonData[category]) jsonData[category] = [];
  jsonData[category].push({
    title,
    url: `https://frijal.github.io/artikel/${file}`,
    image
  });

  // Tambah ke XML sitemap
  xmlUrls.push(`
  <url>
    <loc>https://frijal.github.io/artikel/${file}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${image}</image:loc>
      <image:title>${title}</image:title>
    </image:image>
  </url>`);
});

// Simpan JSON
fs.writeFileSync(jsonOut, JSON.stringify(jsonData, null, 2), "utf8");

// Simpan XML
const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlUrls.join("\n")}
</urlset>`;
fs.writeFileSync(xmlOut, xmlContent, "utf8");

console.log("✅ artikel.json dan sitemap.xml berhasil dibuat!");
