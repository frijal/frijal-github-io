const fs = require("fs");
const path = require("path");
const { titleToCategory } = require("./titleToCategory");

// folder artikel ada di root
const artikelDir = path.join(__dirname, "../artikel");
const jsonOut = path.join(__dirname, "../artikel.json");
const xmlOut = path.join(__dirname, "../sitemap.xml");

// Fungsi format tanggal ISO 8601
function formatISO8601(date) {
    const d = new Date(date);
    if (isNaN(d)) { // Penanganan jika tanggal tidak valid
        console.warn(`⚠️ Tanggal tidak valid terdeteksi, menggunakan tanggal saat ini sebagai fallback.`);
        return new Date().toISOString();
    }
    const tzOffset = -d.getTimezoneOffset();
    const diff = tzOffset >= 0 ? "+" : "-";
    const pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
    const hours = pad(tzOffset / 60);
    const minutes = pad(tzOffset % 60);
    return d.toISOString().replace("Z", `${diff}${hours}:${minutes}`);
}

// ⭐ FUNGSI BARU: Ambil tanggal publikasi dari meta tag
function extractPubDate(content) {
    const match = content.match(
        /<meta\s+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i
    );
    return match ? match[1].trim() : null; // Kembalikan null jika tidak ditemukan
}


// ... (Fungsi-fungsi lain tetap sama) ...
function extractTitle(content) {
    const match = content.match(/<title>([\s\S]*?)<\/title>/i);
    return match ? match[1].trim() : "Tanpa Judul";
}
function extractDescription(content) {
    const match = content.match(/<meta\s+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    return match ? match[1].trim() : "";
}
function fixTitleOneLine(content) {
    return content.replace(/<title>([\s\S]*?)<\/title>/gi, (m, p1) => `<title>${p1.trim()}</title>`);
}
function extractImage(content, file) {
    let src = null;
    const og = content.match(/<meta[^>]+property=["']og:image["'][^>]+content=["'](.*?)["']/i) || content.match(/<meta[^>]+content=["'](.*?)["'][^>]+property=["']og:image["']/i);
    if (og && og[1]) src = og[1].trim();
    if (!src) {
        const img = content.match(/<img[^>]+src=["'](.*?)["']/i);
        if (img && img[1]) {
            src = img[1].trim();
            if (!/^https?:\/\//i.test(src)) {
                src = `https://frijal.github.io/artikel/${src.replace(/^\/+/, "")}`;
            }
        }
    }
    if (!src) {
        const baseName = file.replace(/\.html?$/i, "");
        src = `https://frijal.github.io/artikel/${baseName}.jpg`;
    }
    const validExt = /\.(jpe?g|png|gif|webp|avif|svg)$/i;
    if (!src || !validExt.test(src.split("?")[0])) {
        return "https://frijal.github.io/thumbnail.jpg";
    }
    return src;
}


if (!fs.existsSync(artikelDir)) {
    console.warn("⚠️ Folder artikel/ tidak ditemukan. Membuat output kosong.");
    fs.writeFileSync(jsonOut, JSON.stringify({}, null, 2), "utf8");
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    fs.writeFileSync(xmlOut, emptyXml, "utf8");
    process.exit(0);
}


const files = fs.readdirSync(artikelDir).filter(f => f.endsWith(".html"));
let grouped = {};
let xmlUrls = [];

files.forEach(file => {
    const fullPath = path.join(artikelDir, file);
    let content = fs.readFileSync(fullPath, "utf8");
    const fixedContent = fixTitleOneLine(content);
    if (fixedContent !== content) {
        fs.writeFileSync(fullPath, fixedContent, "utf8");
        console.log(`🔧 Fixed <title> di ${file}`);
    }

    const title = extractTitle(fixedContent);
    const category = titleToCategory(title);
    const image = extractImage(fixedContent, file);
    const description = extractDescription(fixedContent);

    // === PERUBAHAN LOGIKA PENGAMBILAN TANGGAL DI SINI ===
    // Prioritas 1: Ambil tanggal dari meta tag 'article:published_time'
    let pubDate = extractPubDate(fixedContent);

    // Prioritas 2 (Fallback): Jika meta tag tidak ada, gunakan tanggal modifikasi file
    if (!pubDate) {
        const stats = fs.statSync(fullPath);
        pubDate = stats.mtime;
        console.warn(`- ⚠️ Peringatan: Meta tag tanggal tidak ditemukan di '${file}'. Menggunakan tanggal modifikasi file sebagai fallback.`);
    }

    // Format tanggal yang sudah didapat
    const lastmod = formatISO8601(pubDate);

    if (!grouped[category]) grouped[category] = [];
    grouped[category].push([title, file, image, lastmod, description]);

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

// ... (sisa skrip tetap sama) ...
function formatArrayBlocks(obj) {
    let jsonString = JSON.stringify(obj, null, 2);
    jsonString = jsonString.replace(/\[(\s*\[.*?\])\s*\]/gs, (match, inner, offset, str) => {
        const before = str.slice(0, offset);
        const lastLine = before.split("\n").pop() || "";
        const indent = lastLine.match(/^\s*/)[0];
        const itemIndent = indent + "  ";
        const items = inner.split("],").map(s => s.trim()).filter(Boolean).map(s => (s.endsWith("]") ? s : s + "]"));
        return "[\n" + itemIndent + items.join(",\n" + itemIndent) + "\n" + indent + "]";
    });
    return jsonString;
}
let jsonString = formatArrayBlocks(grouped);
fs.writeFileSync(jsonOut, jsonString, "utf8");
const xmlContent = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xmlUrls.join("\n")}</urlset>`;
fs.writeFileSync(xmlOut, xmlContent, "utf8");

console.log("✅ artikel.json & sitemap.xml dibuat (prioritas tanggal dari meta tag).");
```

### Langkah Selanjutnya Untuk Anda

1.  **Perbarui `ext/generator.js`:** Ganti isi file `ext/generator.js` Anda dengan kode lengkap di atas.
2.  **Tambahkan Meta Tag ke Artikel Anda:** Ini adalah langkah manual yang paling penting. Buka setiap file `.html` di dalam folder `artikel/` Anda. Di dalam bagian `<head>`, tambahkan baris ini, dan **sesuaikan tanggalnya** dengan tanggal publikasi yang benar.

    ```html
    <meta property="article:published_time" content="YYYY-MM-DDTHH:MM:SS+08:00">
    ```
    Contoh:
    ```html
    <meta property="article:published_time" content="2024-05-20T09:00:00+08:00">
    


