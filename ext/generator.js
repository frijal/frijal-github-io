import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { titleToCategory } from "./titleToCategory.js";

// ===================================================================
// KONFIGURASI TERPUSAT
// ===================================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
    rootDir: path.join(__dirname, ".."),
    artikelDir: path.join(__dirname, "..", "artikel"),
    masterJson: path.join(__dirname, "..", "artikel", "artikel.json"),
    jsonOut: path.join(__dirname, "..", "artikel.json"),
    xmlOut: path.join(__dirname, "..", "sitemap.xml"),
    baseUrl: "https://frijal.github.io",
    defaultThumbnail: "https://frijal.github.io/thumbnail.jpg",
    xmlPriority: "0.6",
    xmlChangeFreq: "monthly"
};

// ===================================================================
// FUNGSI-FUNGSI BANTUAN (HELPER FUNCTIONS)
// ===================================================================

/** Format tanggal ke standar ISO 8601 dengan timezone lokal (VERSI LAMA). */
function formatISO8601(date) {
    const d = new Date(date);
    if (isNaN(d)) {
        console.warn(`⚠️ Tanggal tidak valid, fallback ke sekarang.`);
        return new Date().toISOString();
    }
    const tzOffset = -d.getTimezoneOffset();
    const diff = tzOffset >= 0 ? "+" : "-";
    const pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
    const hours = pad(tzOffset / 60);
    const minutes = pad(tzOffset % 60);
    return d.toISOString().replace("Z", `${diff}${hours}:${minutes}`);
}

/** Ekstrak `article:published_time` dari konten HTML. */
function extractPubDate(content) {
    const match = content.match(/<meta\s+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i);
    return match ? match[1].trim() : null;
}

/** Ekstrak <title> dari konten HTML. */
function extractTitle(content) {
    const match = content.match(/<title>([\s\S]*?)<\/title>/i);
    return match ? match[1].trim() : "Tanpa Judul";
}

/** Ekstrak `description` dari konten HTML. */
function extractDescription(content) {
    const match = content.match(/<meta\s+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    return match ? match[1].trim() : "";
}

/** Pastikan <title> hanya satu baris. */
function fixTitleOneLine(content) {
    return content.replace(/<title>([\s\S]*?)<\/title>/gi, (m, p1) => `<title>${p1.trim()}</title>`);
}

/** Ekstrak gambar dengan beberapa metode fallback. */
function extractImage(content, file) {
    let src = null;
    const ogMatch = content.match(/<meta[^>]+property=["']og:image["'][^>]+content=["'](.*?)["']/i);
    if (ogMatch && ogMatch[1]) src = ogMatch[1].trim();

    if (!src) {
        const imgMatch = content.match(/<img[^>]+src=["'](.*?)["']/i);
        if (imgMatch && imgMatch[1]) {
            src = imgMatch[1].trim();
        }
    }
    
    if (!src) {
        return CONFIG.defaultThumbnail;
    }

    const validExt = /\.(jpe?g|png|gif|webp|avif|svg)$/i;
    if (!validExt.test(src.split("?")[0])) {
        return CONFIG.defaultThumbnail;
    }
    return src;
}

/** Merapikan format JSON agar setiap array berada di baris baru. */
function formatJsonOutput(obj) {
    return JSON.stringify(obj, null, 2)
        .replace(/\[\s*\[/g, '[\n      [')
        .replace(/\]\s*\]/g, ']\n    ]')
        .replace(/(\],)\s*\[/g, '$1\n      [');
}

// ===================================================================
// FUNGSI UTAMA (MAIN GENERATOR)
// ===================================================================
const generate = async () => {
    console.log("🚀 Memulai proses generator...");

    try {
        await fs.access(CONFIG.artikelDir);
    } catch {
        console.error("❌ Folder 'artikel' tidak ditemukan. Proses dibatalkan.");
        return;
    }

    let grouped = {};
    try {
        const masterContent = await fs.readFile(CONFIG.masterJson, "utf8");
        grouped = JSON.parse(masterContent);
        console.log("📂 Master JSON berhasil dimuat.");
    } catch {
        console.warn("⚠️ Master JSON (artikel/artikel.json) tidak ditemukan atau rusak, memulai dari awal.");
        grouped = {};
    }

    const files = (await fs.readdir(CONFIG.artikelDir)).filter(f => f.endsWith(".html"));
    const xmlUrls = [];
    const existingFiles = new Set(Object.values(grouped).flat().map(item => item[1]));
    let newArticlesCount = 0;

    for (const file of files) {
        try {
            if (existingFiles.has(file)) {
                continue;
            }

            const fullPath = path.join(CONFIG.artikelDir, file);
            let content = await fs.readFile(fullPath, "utf8");
            let needsSave = false;

            const fixedTitleContent = fixTitleOneLine(content);
            if (fixedTitleContent !== content) {
                content = fixedTitleContent;
                needsSave = true;
                console.log(`🔧 Merapikan <title> di ${file}`);
            }

            const title = extractTitle(content);
            const category = titleToCategory(title);
            const image = extractImage(content, file);
            const description = extractDescription(content);

            let pubDate = extractPubDate(content);
            if (!pubDate) {
                const stats = await fs.stat(fullPath);
                pubDate = stats.mtime;
                const newMetaTag = `    <meta property="article:published_time" content="${formatISO8601(pubDate)}">`;
                if (content.includes("</head>")) {
                    content = content.replace("</head>", `${newMetaTag}\n</head>`);
                    needsSave = true;
                    console.log(`➕ Menambahkan meta tanggal ke '${file}'`);
                }
            }

            if (needsSave) {
                await fs.writeFile(fullPath, content, "utf8");
            }

            const lastmod = formatISO8601(pubDate);

            if (!grouped[category]) grouped[category] = [];
            grouped[category].push([title, file, image, lastmod, description]);
            newArticlesCount++;
            console.log(`➕ Memproses artikel baru: ${file}`);

        } catch (error) {
            console.error(`❌ Gagal memproses file ${file}:`, error.message);
        }
    }
    
    if (newArticlesCount > 0) {
        for (const category in grouped) {
            grouped[category].sort((a, b) => new Date(b[3]) - new Date(a[3]));
        }

        Object.values(grouped).flat().forEach(item => {
            const [title, file, image, lastmod] = item;
            xmlUrls.push(
                `  <url>\n` +
                `    <loc>${CONFIG.baseUrl}/artikel/${file}</loc>\n` +
                `    <lastmod>${lastmod}</lastmod>\n` +
                `    <priority>${CONFIG.xmlPriority}</priority>\n` +
                `    <changefreq>${CONFIG.xmlChangeFreq}</changefreq>\n` +
                `    <image:image>\n` +
                `      <image:loc>${image}</image:loc>\n` +
                `    </image:image>\n` +
                `  </url>`
            );
        });

        const jsonString = formatJsonOutput(grouped);
        await fs.writeFile(CONFIG.jsonOut, jsonString, "utf8");

        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ` +
            `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ` +
            `xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap/1.1/sitemap-image.xsd" ` +
            `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
            `${xmlUrls.join("\n")}\n` +
            `</urlset>`;

        await fs.writeFile(CONFIG.xmlOut, xmlContent, "utf8");

        console.log(`\n✅ ${newArticlesCount} artikel baru diproses.`);
        console.log("✅ artikel.json & sitemap.xml berhasil diperbarui di root.");
    } else {
        console.log("\n✅ Tidak ada artikel baru. File tidak diubah.");
    }
};

generate();
