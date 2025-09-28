const fs = require("fs");
const path = require("path");
const { titleToCategory } = require("./titleToCategory");

// folder artikel ada di root
const artikelDir = path.join(__dirname, "../artikel");
const jsonOut = path.join(__dirname, "../artikel.json");
const xmlOut = path.join(__dirname, "../sitemap.xml");

// Fungsi format tanggal ISO 8601 penuh dengan offset lokal
function formatISO8601(date = new Date()) {
  const tzOffset = -date.getTimezoneOffset(); // dalam menit
  const diff = tzOffset >= 0 ? "+" : "-";
  const pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");

  const hours = pad(tzOffset / 60);
  const minutes = pad(tzOffset % 60);

  return date.toISOString().replace("Z", `${diff}${hours}:${minutes}`);
}

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
  let src = null;

  // cari meta og:image
  const og = content.match(/property=["']og:image["'] content=["'](.*?)["']/i);
  if (og && og[1]) src = og[1].trim();

  // kalau og:image tidak ada, cari <img>
  if (!src) {
    const img = content.match(/<img[^>]+src=["'](.*?)["']/i);
    if (img && img[1]) {
      src = img[1].trim();
      // kalau path relatif, ubah jadi absolut
      if (!/^https?:\/\//i.test(src)) {
        src = `https://frijal.github.io/artikel/${src}`;
      }
    }
  }

  // fallback jika kosong atau tidak ada ekstensi valid
  if (!src || !/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(src.split("?")[0])) {
    return "https://frijal.github.io/artikel/thumbnail.jpg";
  }

  return src;
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
  grouped[category].push([title, file]);

  // Sitemap entry dengan tanggal ISO 8601 penuh
  const today = formatISO8601(new Date());
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
});

// Simpan artikel.json (grouping per kategori)
fs.writeFileSync(jsonOut, JSON.stringify(grouped, null, 2), "utf8");

// Simpan sitemap.xml
const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls.join("\n")}
</urlset>`;
fs.writeFileSync(xmlOut, xmlContent, "utf8");

console.log("✅ artikel.json & sitemap.xml berhasil dibuat (title fix + gambar dinamis + fallback ekstensi + tanggal ISO 8601 penuh)");
