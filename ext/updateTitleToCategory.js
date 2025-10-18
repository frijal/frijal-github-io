// ext/updateTitleToCategory.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Impor fungsi dan data kategori yang ada dari file target
import { titleToCategory, categories } from './titleToCategory.js';

// --- Konfigurasi ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARTIKEL_JSON_PATH = path.join(__dirname, '..', 'artikel.json');
const CATEGORY_FILE_PATH = path.join(__dirname, 'titleToCategory.js');

// --- Setup AI Gemini ---
// Ambil API Key dari GitHub Secrets
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("❌ Variabel GEMINI_API_KEY tidak ditemukan. Pastikan sudah diatur di GitHub Secrets.");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);
// GANTI NAMA MODEL DI SINI
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Fungsi baru untuk mendapatkan keyword dari AI
async function getKeywordsFromAI(text) {
    const prompt = `Analisis teks berikut dan berikan 3-5 kata kunci (keywords) yang paling relevan. Jawab HANYA dengan kata kunci yang dipisahkan koma, dalam bahasa Indonesia, dan gunakan huruf kecil semua. Contoh: 'teknologi, ai, produktivitas'. Teks: "${text}"`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const keywordsText = response.text();
        return keywordsText.split(',').map(k => k.trim()).filter(k => k); // Bersihkan dan ubah ke array
    } catch (error) {
        console.warn(`⚠️ Gagal menganalisis teks dengan AI: "${text}". Error: ${error.message}`);
        return []; // Kembalikan array kosong jika gagal
    }
}


async function main() {
    console.log("🚀 Memulai analisis untuk memperbarui keywords menggunakan AI...");

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
        const title = article[0];
        if (!title || typeof title !== 'string') continue;

        // Tentukan kategori artikel ini menggunakan fungsi yang ada
        const categoryName = titleToCategory(title);

        // --- MENGGUNAKAN FUNGSI AI ---
        console.log(`🤖 Menganalisis judul: "${title}"`);
        const aiKeywords = await getKeywordsFromAI(title);

        for (const word of aiKeywords) {
            if (word.length > 2 && !existingKeywords.has(word)) {
                if (!newKeywordsByCategory[categoryName]) {
                    newKeywordsByCategory[categoryName] = new Set();
                }
                newKeywordsByCategory[categoryName].add(word);
            }
        }
        // Beri jeda 1 detik antar request API untuk menghindari rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
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
