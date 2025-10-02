const fs = require("fs");
const path = require("path");
const { titleToCategory } = require("./titleToCategory");

// --- KEMBALI KE STRUKTUR LAMA: Lokasi folder input adalah 'artikel' ---
const artikelDir = path.join(__dirname, "../artikel"); 
const jsonOut = path.join(__dirname, "../artikel.json");
const xmlOut = path.join(__dirname, "../sitemap.xml");

// --- FUNGSI REKURSIF DIHAPUS KARENA TIDAK DIPERLUKAN LAGI ---

// ... (Semua fungsi pembantu seperti formatISO8601, extractTitle, dll. tetap sama) ...
function formatISO8601(date = new Date()) {
    const tzOffset = -date.getTimezoneOffset();
    const diff = tzOffset >= 0 ? "+" : "-";
    const pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
    const hours = pad(tzOffset / 60);
    const minutes = pad(tzOffset % 60);
    return date.toISOString().replace("Z", `${diff}${hours}:${minutes}`);
}
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
                // Path gambar sekarang relatif terhadap folder 'artikel'
                src = `https://frijal.github.io/artikel/${src.replace(/^\/+/, "")}`;
            }
        }
    }
    if (!src) {
        const baseName = file.replace(/\.html?$/i, "");
        // Fallback ke folder 'artikel'
        src = `https://frijal.github.io/artikel/${baseName}.jpg`;
    }
    const validExt = /\.(jpe?g|png|gif|webp|avif|svg)$/i;
    if (!src || !validExt.test(src.split("?")[0])) {
        return "https://frijal.github.io/thumbnail.jpg";
    }
    return src;
}

// ... (Blok 'if (!fs.existsSync(artikelDir))' diupdate) ...
if (!fs.existsSync(artikelDir)) {
    console.warn("⚠️ Folder artikel/ tidak ditemukan. Membuat output kosong.");
    fs.writeFileSync(jsonOut, JSON.stringify({}, null, 2), "utf8");
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    fs.writeFileSync(xmlOut, emptyXml, "utf8");
    process.exit(0);
}


// --- KEMBALI KE CARA LAMA: Langsung baca file di folder 'artikel' ---
console.log(`🔎 Mencari file .html di dalam folder '${artikelDir}'...`);
const files = fs.readdirSync(artikelDir).filter(f => f.endsWith(".html"));
console.log(`✅ Ditemukan ${files.length} file artikel.`);

let grouped = {};
let xmlUrls = [];

files.forEach(file => {
    // 'file' sekarang adalah nama file langsung, misal: 'nama-file.html'
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

    const stats = fs.statSync(fullPath);
    const lastmod = formatISO8601(stats.mtime);

    if (!grouped[category]) grouped[category] = [];
    
    // Path file sekarang hanya nama filenya saja
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

// ... (Fungsi formatArrayBlocks dan penulisan file tetap sama) ...
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

console.log("✅ artikel.json & sitemap.xml dibuat (struktur folder 'artikel' flat).");


