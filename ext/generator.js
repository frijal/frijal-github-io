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

// ⭐ FUNGSI BARU: Ambil deskripsi dari meta tag
function extractDescription(content) {
  // Mencari <meta name="description" content="...">
  const match = content.match(
    /<meta\s+name=["']description["'][^>]+content=["']([^"']+)["']/i
  );
  if (match && match[1]) {
    return match[1].trim();
  }
  return "";
}

// Fungsi fix <title> agar selalu satu baris
function fixTitleOneLine(content) {
  return content.replace(/<title>([\s\S]*?)<\/title>/gi, (m, p1) => {
    return `<title>${p1.trim()}</title>`;
  });
}

function extractImage(content, file) {
  let src = null;

  // 1. Cari og:image
  const og =
    content.match(/<meta[^>]+property=["']og:image["'][^>]+content=["'](.*?)["']/i) ||
    content.match(/<meta[^>]+content=["'](.*?)["'][^>]+property=["']og:image["']/i);
  if (og && og[1]) src = og[1].trim();

  // 2. Kalau og:image tidak ada → cari <img>
  if (!src) {
    const img = content.match(/<img[^>]+src=["'](.*?)["']/i);
    if (img && img[1]) {
      src = img[1].trim();
      if (!/^https?:\/\//i.test(src)) {
        src = `https://frijal.github.io/artikel/${src.replace(/^\/+/, "")}`;
      }
    }
  }

  // 3. Kalau masih kosong → coba fallback ke gambar dengan nama sama
  if (!src) {
    const baseName = file.replace(/\.html?$/i, ""); // hapus .html
    src = `https://frijal.github.io/artikel/${baseName}.jpg`;
  }

  // 4. Validasi ekstensi (jpg, jpeg, png, gif, webp, avif, svg)
  const validExt = /\.(jpe?g|png|gif|webp|avif|svg)$/i;
  if (!src || !validExt.test(src.split("?")[0])) {
    return "https://frijal.github.io/thumbnail.jpg";
  }

  return src;
}

// Pastikan folder artikel ada; kalau tidak, tetap buat output kosong
if (!fs.existsSync(artikelDir)) {
  console.warn("⚠️ Folder artikel/ tidak ditemukan. Membuat output kosong.");
  fs.writeFileSync(jsonOut, JSON.stringify({}, null, 2), "utf8");
  const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
  fs.writeFileSync(xmlOut, emptyXml, "utf8");
  process.exit(0);
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

  // Ambil data-data
  const title = extractTitle(fixedContent);
  const category = titleToCategory(title);
  const image = extractImage(fixedContent, file);
  const description = extractDescription(fixedContent); // ⭐ PANGGIL FUNGSI BARU

  // Ambil lastmod dari mtime file
  const stats = fs.statSync(fullPath);
  const lastmod = formatISO8601(stats.mtime);

  if (!grouped[category]) grouped[category] = [];
  
  // Format array diperbarui: [title, file, image, lastmod, description]
  grouped[category].push([title, file, image, lastmod, description]); // ⭐ DESKRIPSI DITAMBAHKAN

  // Sitemap entry dengan tanggal file
  xmlUrls.push(
`<url>
  <loc>https://frijal.github.io/artikel/${file}</loc>
  <lastmod>${lastmod}</lastmod>
  <priority>0.6</priority>
  <changefreq>monthly</changefreq>
  <image:image>
    <image:loc>${image}</image:loc>
  </image:image>
</url>`
  );
});

function formatArrayBlocks(obj) {
  // stringify dulu dengan indentasi 2 spasi
  let jsonString = JSON.stringify(obj, null, 2);

  // Regex cari array of arrays → [ [..], [..], ... ]
  jsonString = jsonString.replace(/\[(\s*\[.*?\])\s*\]/gs, (match, inner, offset, str) => {
    // Hitung indentasi level berdasarkan posisi dalam string
    const before = str.slice(0, offset);
    const lastLine = before.split("\n").pop() || "";
    const indent = lastLine.match(/^\s*/)[0]; // ambil jumlah spasi di baris itu
    const itemIndent = indent + "  ";         // isi array +2 spasi

    // Pecah sub-array
    const items = inner
      .split("],")
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => (s.endsWith("]") ? s : s + "]"));

    return "[\n" + itemIndent + items.join(",\n" + itemIndent) + "\n" + indent + "]";
  });

  return jsonString;
}

// Pemakaian
let jsonString = formatArrayBlocks(grouped);
fs.writeFileSync(jsonOut, jsonString, "utf8");

// Simpan sitemap.xml
const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls.join("\n")}
</urlset>`;
fs.writeFileSync(xmlOut, xmlContent, "utf8");

console.log("✅ artikel.json & sitemap.xml dibuat (array format, koma rapat, lastmod dari mtime, og:image fleksibel, title fix)");
