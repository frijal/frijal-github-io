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

// ... (Sisa fungsi bantuan lainnya tetap sama) ...
function extractPubDate(content) {
    const match = content.match(/<meta\s+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i);
    return match ? match[1].trim() : null;
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
    const ogMatch = content.match(/<meta[^>]+property=["']og:image["'][^>]+content=["'](.*?)["']/i);
    if (ogMatch && ogMatch[1]) src = ogMatch[1].trim();
    if (!src) {
        const imgMatch = content.match(/<img[^>]+src=["'](.*?)["']/i);
        if (imgMatch && imgMatch[1]) {
            src = imgMatch[1].trim();
        }
    }
    if (!src) return CONFIG.defaultThumbnail;
    const validExt = /\.(jpe?g|png|gif|webp|avif|svg)$/i;
    if (!validExt.test(src.split("?")[0])) return CONFIG.defaultThumbnail;
    return src;
}
function formatJsonOutput(obj) {
    return JSON.stringify(obj, null, 2)
        .replace(/\[\s*\[/g, '[\n      [')
        .replace(/\]\s*\]/g, ']\n    ]')
        .replace(/(\],)\s*\[/g, '$1\n      [');
}
// ... (setelah fungsi formatJsonOutput)

/** Membuat halaman HTML untuk setiap kategori secara otomatis. */
async function generateCategoryPages(groupedData) {
    console.log("🔄 Memulai pembuatan halaman kategori...");
    const templatePath = path.join(CONFIG.rootDir, '_category-template.html');
    const kategoriDir = path.join(CONFIG.rootDir, 'kategori');

    try {
        await fs.mkdir(kategoriDir, { recursive: true });
        const templateContent = await fs.readFile(templatePath, 'utf8');

        for (const categoryName in groupedData) {
            // Fungsi untuk membuat slug URL (bisa disalin dari skrip marquee-url.js Anda)
            const noEmoji = categoryName.replace(/^[^\w\s]*/, '').trim();
            const slug = noEmoji.toLowerCase().replace(/ \& /g, '-and-').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
            const fileName = `${slug}.html`;
            
            const canonicalUrl = `${CONFIG.baseUrl}/kategori/${fileName}`;

            // Ganti placeholder di template dengan data sebenarnya
            let pageContent = templateContent
                .replace(/%%TITLE%%/g, categoryName)
                .replace(/%%DESCRIPTION%%/g, categoryName)
                .replace(/%%CANONICAL_URL%%/g, canonicalUrl)
                .replace(/%%CATEGORY_NAME%%/g, categoryName);

            // Tulis file HTML baru
            await fs.writeFile(path.join(kategoriDir, fileName), pageContent, 'utf8');
            console.log(`✅ Halaman kategori dibuat: ${fileName}`);
        }
        console.log("👍 Semua halaman kategori berhasil dibuat.");
    } catch (error) {
        console.error("❌ Gagal membuat halaman kategori:", error.message);
    }
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

    // --- LANGKAH BARU 1: Baca daftar file yang SEBENARNYA ADA di folder ---
    const filesOnDisk = (await fs.readdir(CONFIG.artikelDir)).filter(f => f.endsWith(".html"));
    const existingFilesOnDisk = new Set(filesOnDisk);

    let grouped = {};
    let masterDataChanged = false;

    try {
        const masterContent = await fs.readFile(CONFIG.masterJson, "utf8");
        grouped = JSON.parse(masterContent);
        console.log("📂 Master JSON berhasil dimuat.");
    } catch {
        console.warn("⚠️ Master JSON (artikel/artikel.json) tidak ditemukan, memulai dari awal.");
        grouped = {};
    }

    // --- LANGKAH BARU 2: Bersihkan master data dari file yang sudah dihapus ---
    const cleanedGrouped = {};
    let deletedCount = 0;
    for (const category in grouped) {
        const survivingArticles = grouped[category].filter(item => {
            const fileExists = existingFilesOnDisk.has(item[1]);
            if (!fileExists) {
                console.log(`🗑️ File terhapus terdeteksi, menghapus dari data: ${item[1]}`);
                deletedCount++;
            }
            return fileExists;
        });

        if (survivingArticles.length > 0) {
            cleanedGrouped[category] = survivingArticles;
        }
    }
    if (deletedCount > 0) {
        masterDataChanged = true;
    }
    grouped = cleanedGrouped; // Gunakan data yang sudah bersih

    const xmlUrls = [];
    const existingFiles = new Set(Object.values(grouped).flat().map(item => item[1]));
    let newArticlesCount = 0;

    for (const file of filesOnDisk) { // Loop dari file yang ada di disk
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

    if (newArticlesCount > 0 || deletedCount > 0) {
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

        console.log(`\n✅ Ringkasan: ${newArticlesCount} artikel baru ditambahkan, ${deletedCount} artikel lama dihapus.`);
        console.log("✅ artikel.json & sitemap.xml berhasil diperbarui di root.");
    } else {
        console.log("\n✅ Tidak ada perubahan. File tidak diubah.");
    }
};

generate();
