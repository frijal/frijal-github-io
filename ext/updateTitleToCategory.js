// ext/updateTitleToCategory.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Impor fungsi dan data kategori yang ada dari file target
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
    console.log("🚀 Memulai analisis untuk memperbarui keywords...");

    // 1. Kumpulkan semua keyword yang sudah ada
    const existingKeywords = new Set(categories.flatMap(cat => cat.keywords));
    console.log(`🔍 Ditemukan ${existingKeywords.size} keyword yang sudah ada.`);

    // 2. Baca dan parse file artikel.json
    let articleData;
    try {
        const fileContent = await fs.readFile(ARTIKEL_JSON_PATH, 'utf8');
        articleData = JSON.parse(fileContent);
    } catch (error) {
        console.error(`❌ Gagal membaca ${ARTIKEL_JSON_PATH}:`, error.message);
        process.exit(1);
    }

    // 3. Analisis deskripsi dan kelompokkan keyword baru berdasarkan kategori
    const newKeywordsByCategory = {};
    const allArticles = Object.values(articleData).flat();

    for (const article of allArticles) {
        const title = article[0];
        const description = article[4];

        if (!description || typeof description !== 'string') continue;

        // Tentukan kategori artikel ini menggunakan fungsi yang ada
        const categoryName = titleToCategory(title);

        const words = description.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);

        for (const word of words) {
            if (
                word.length > 3 &&
                !stopWords.has(word) &&
                !existingKeywords.has(word) &&
                !/^\d+$/.test(word)
            ) {
                // Inisialisasi Set jika belum ada
                if (!newKeywordsByCategory[categoryName]) {
                    newKeywordsByCategory[categoryName] = new Set();
                }
                newKeywordsByCategory[categoryName].add(word);
            }
        }
    }

    // 4. Tambahkan keyword baru ke dalam struktur data 'categories'
    let keywordsAddedCount = 0;
    for (const category of categories) {
        const newKeywords = newKeywordsByCategory[category.name];
        if (newKeywords && newKeywords.size > 0) {
            const originalSize = category.keywords.length;
            const updatedKeywords = new Set([...category.keywords, ...newKeywords]);
            category.keywords = Array.from(updatedKeywords).sort(); // Tambahkan, unikkan, dan urutkan
            keywordsAddedCount += category.keywords.length - originalSize;
        }
    }

    if (keywordsAddedCount === 0) {
        console.log("\n✅ Tidak ada keyword baru yang signifikan untuk ditambahkan. File tidak diubah.");
        return;
    }

    console.log(`\n🔥 Ditemukan dan akan ditambahkan ${keywordsAddedCount} keyword baru.`);

    // 5. Buat ulang konten file titleToCategory.js secara dinamis
    const newFileContent = `// titleToCategory.js
const categories = ${JSON.stringify(categories, null, 2)};

// Langsung ekspor fungsi dengan kata kunci 'export'
export function titleToCategory(title) {
  const t = title.toLowerCase();
  const found = categories.find(cat =>
    cat.keywords.some(k => t.includes(k))
  );
  return found ? found.name : "🗂️ Lainnya";
}
`;

    // 6. Tulis ulang (overwrite) file titleToCategory.js
    try {
        await fs.writeFile(CATEGORY_FILE_PATH, newFileContent, 'utf8');
        console.log(`\n✨ File ${CATEGORY_FILE_PATH} berhasil diperbarui dengan ${keywordsAddedCount} keyword baru!`);
    } catch (error) {
        console.error(`❌ Gagal menulis ulang file ${CATEGORY_FILE_PATH}:`, error.message);
        process.exit(1);
    }
}

main();
