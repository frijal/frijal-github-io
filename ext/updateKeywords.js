// updateKeywords.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

// --- Konfigurasi path ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARTIKEL_JSON_PATH = path.join(__dirname, "artikel.json");
const CATEGORY_FILE_PATH = path.join(__dirname, "ext", "titleToCategory.js");

// --- Setup Azure OpenAI ---
// Pastikan Secrets di GitHub sudah diisi:
// AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT
const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
  defaultQuery: { "api-version": "2024-08-01-preview" },
  defaultHeaders: { "api-key": process.env.AZURE_OPENAI_KEY },
});

// --- Fungsi untuk generate keyword ---
async function getKeywordsFromAI(text) {
  const prompt = `Analisis teks berikut dan berikan 3-5 kata kunci (keywords) paling relevan.
Jawab HANYA dengan kata kunci dipisahkan koma, bahasa Indonesia, huruf kecil semua.
Contoh: 'teknologi, ai, produktivitas'.
Teks: "${text}"`;

  try {
    const response = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: process.env.AZURE_OPENAI_DEPLOYMENT,
      temperature: 0.3,
      max_tokens: 100,
    });

    const keywordsText = response.choices[0].message.content;
    return keywordsText.split(",").map(k => k.trim()).filter(Boolean);
  } catch (err) {
    console.warn(`⚠️ Gagal analisis "${text}": ${err.message}`);
    return [];
  }
}

// --- Main ---
async function main() {
  console.log("🚀 Mulai generate keyword dengan Azure OpenAI...");

  let artikel;
  try {
    const raw = await fs.readFile(ARTIKEL_JSON_PATH, "utf8");
    artikel = JSON.parse(raw);
  } catch (err) {
    console.error(`❌ Gagal baca ${ARTIKEL_JSON_PATH}: ${err.message}`);
    process.exit(1);
  }

  // Baca file kategori lama
  let categories = [];
  try {
    const oldFile = await fs.readFile(CATEGORY_FILE_PATH, "utf8");
    const match = oldFile.match(/export const categories = (.*?);\n/s);
    if (match) {
      categories = JSON.parse(match[1]);
    }
  } catch {
    console.warn("⚠️ File kategori lama tidak ditemukan, mulai dari kosong.");
  }

  const existingKeywords = new Set(categories.flatMap(cat => cat.keywords));
  const allArticles = Object.values(artikel).flat();

  for (const art of allArticles) {
    const title = art[0];
    if (!title) continue;

    console.log(`🤖 Analisis judul: "${title}"`);
    const keywords = await getKeywordsFromAI(title);

    // Tentukan kategori berdasarkan titleToCategory lama
    const t = title.toLowerCase();
    let category = categories.find(cat =>
      cat.keywords.some(k => t.includes(k))
    );
    if (!category) {
      category = { name: "🗂️ Lainnya", keywords: [] };
      categories.push(category);
    }

    for (const kw of keywords) {
      if (kw.length > 2 && !existingKeywords.has(kw)) {
        category.keywords.push(kw);
        existingKeywords.add(kw);
      }
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  // Sort keywords tiap kategori
  for (const cat of categories) {
    cat.keywords = Array.from(new Set(cat.keywords)).sort();
  }

  // Tulis ulang file persis format Anda
  const newFile = `// titleToCategory.js
export const categories = ${JSON.stringify(categories, null, 2)};

export function titleToCategory(title) {
  const t = title.toLowerCase();
  const found = categories.find(cat =>
    cat.keywords.some(k => t.includes(k))
  );
  return found ? found.name : "🗂️ Lainnya";
}
`;

  await fs.writeFile(CATEGORY_FILE_PATH, newFile, "utf8");
  console.log(`✨ File ${CATEGORY_FILE_PATH} berhasil diperbarui.`);
}

main();
