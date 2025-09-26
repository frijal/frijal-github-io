const fs = require("fs");
const path = require("path");
const { titleToCategory } = require("./titleToCategory"); // 🔑 integrasi

const artikelDir = path.join(__dirname, "artikel");
const jsonOut = path.join(__dirname, "artikel.json");
const xmlOut = path.join(__dirname, "sitemap.xml");

function extractTitle(content) {
  const match = content.match(/<title>(.*?)<\/title>/i);
  return match ? match[1].trim() : "Tanpa Judul";
}

function extractImage(content) {
  const og = content.match(/property=["']og:image["'] content=["'](.*?)["']/i);
  if (og) return og[1];
  const img = content.match(/<img[^>]+src=["'](.*?)["']/i);
  if (img) return img[1];
  return "thumbnail.jpg";
}

const files = fs.readdirSync(artikelDir).filter(f => f.endsWith(".html"));

let jsonData = {};
let xmlUrls = [];

files.forEach(file => {
  const fullPath = path.join(artikelDir, file);
  const content = fs.readFileSync(fullPath, "utf8");

  const title = extractTitle(content);
  const image = extractImage(content);
  const category = titleToCategory(title); // 🔑 pakai fungsi kategori

  if (!jsonData[category]) jsonData[category] = [];
  jsonData[category].push({
    title,
    url: `https://frijal.github.io/artikel/${file}`,
    image
  });

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

fs.writeFileSync(jsonOut, JSON.stringify(jsonData, null, 2), "utf8");

const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlUrls.join("\n")}
</urlset>`;
fs.writeFileSync(xmlOut, xmlContent, "utf8");

console.log("✅ artikel.json dan sitemap.xml berhasil dibuat!");
