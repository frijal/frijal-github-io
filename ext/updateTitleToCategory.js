// ext/updateTitleToCategory.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Impor fungsi dan data kategori yang ada dari file target
// Pastikan titleToCategory.js sudah mengekspor 'categories'
import { titleToCategory, categories } from './titleToCategory.js';

// --- Konfigurasi ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARTIKEL_JSON_PATH = path.join(__dirname, '..', 'artikel.json');
const CATEGORY_FILE_PATH = path.join(__dirname, 'titleToCategory.js');

// Kata-kata umum yang akan diabaikan
const stopWords = new Set([
    'dan', 'di', 'ke', 'dari', 'yang', 'ini', 'itu', 'untuk', 'dengan', 'adalah',
    'pada', 'juga', 'saat', 'serta', 'namun', 'tidak', 'tapi', 'atau', 'akan',
    'sudah', 'telah', 'bisa', 'dapat', 'seperti', 'cara', 'anda', 'dalam',
    'sebagai', 'lebih', 'para', 'sebuah', 'menjadi', 'tersebut', 'tentang',
    'kepada', 'karena', 'oleh', 'saat', 'sehingga', 'saja', 'lain', 'nya'
]);

async function main() {
    console.log("🚀 Memulai analisis untuk memperbarui keywords dari JUDUL (arr[0])...");

    const existingKeywords = new Set(categories.flatMap(cat => cat.keywords));
    console.log(`🔍 Ditemukan ${existingKeywords.size} keyword yang sudah ada.`);

    let articleData;
    try {
        const fileContent = await fs.readFile(ARTIKEL_JSON_PATH, 'utf8');
        articleData = JSON.parse(fileContent);
    } catch (error) {
        console.error(`❌ Gagal membaca ${ARTIKEL_JSON_PATH}:`, error.message);
        process.exit(1);
    }

    const newKeywordsByCategory = {};
    const allArticles = Object.values(articleData).flat();

    for (const article of allArticles) {
        const title = article[0]; // --- DIUBAH: Sekarang menganalisis judul (arr[0]) ---
        
        if (!title || typeof title !== 'string') continue;

        const categoryName = titleToCategory(title);
        const words = title.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);

        for (const word of words) {
            if (
                word.length > 3 &&
                !stopWords.has(word) &&
                !existingKeywords.has(word) &&
                !/^\d+$/.test(word)
            ) {
                if (!newKeywordsByCategory[categoryName]) {
                    newKeywordsByCategory[categoryName] = new Set();
                }
                newKeywordsByCategory[categoryName].add(word);
            }
        }
    }

    let keywordsAddedCount = 0;
    for (const category of categories) {
        const newKeywords = newKeywordsByCategory[category.name];
        if (newKeywords && newKeywords.size > 0) {
            const originalSize = category.keywords.length;
            const updatedKeywords = new Set([...category.keywords, ...newKeywords]);
            category.keywords = Array.from(updatedKeywords).sort();
            keywordsAddedCount += category.keywords.length - originalSize;
        }
    }

    if (keywordsAddedCount === 0) {
        console.log("\n✅ Tidak ada keyword baru yang signifikan untuk ditambahkan. File tidak diubah.");
        return;
    }

    console.log(`\n🔥 Ditemukan dan akan ditambahkan ${keywordsAddedCount} keyword baru.`);

    // Buat ulang konten file titleToCategory.js secara dinamis
    // PENTING: Struktur ini mengharuskan titleToCategory.js juga mengekspor 'categories'
    const newFileContent = `// titleToCategory.js
export const categories = ${JSON.stringify(categories, null, 2)};

export function titleToCategory(title) {
  const t = title.toLowerCase();
  const found = categories.find(cat =>
    cat.keywords.some(k => t.includes(k))
  );
  return found ? found.name : "🗂️ Lainnya";
}
`;

    try {
        await fs.writeFile(CATEGORY_FILE_PATH, newFileContent, 'utf8');
        console.log(`\n✨ File ${CATEGORY_FILE_PATH} berhasil diperbarui dengan ${keywordsAddedCount} keyword baru!`);
    } catch (error) {
        console.error(`❌ Gagal menulis ulang file ${CATEGORY_FILE_PATH}:`, error.message);
        process.exit(1);
    }
}

main();
