const fs = require("fs");
const path = require("path");
const { titleToCategory } = require("./titleToCategory"); // kategori mapping

// folder artikel ada di root
const artikelDir = path.join(__dirname, "../artikel");
const jsonOut = path.join(__dirname, "../artikel.json");

// Fungsi untuk ambil judul dari <title>
function extractTitle(content) {
  const match = content.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : "Tanpa Judul";
}

// Fungsi untuk memperbaiki <title> agar selalu satu baris
function fixTitleOneLine(content) {
  return content.replace(/<title>([\s\S]*?)<\/title>/gi, (m, p1) => {
    return `<title>${p1.trim()}</title>`;
  });
}

// Ambil semua file HTML
const files = fs.readdirSync(artikelDir).filter(f => f.endsWith(".html"));

let grouped = {};

files.forEach(file => {
  const fullPath = path.join(artikelDir, file);
  let content = fs.readFileSync(fullPath, "utf8");

  // Perbaiki <title> jadi satu baris
  const fixedContent = fixTitleOneLine(content);

  // Kalau ada perubahan, tulis balik ke file
  if (fixedContent !== content) {
    fs.writeFileSync(fullPath, fixedContent, "utf8");
    console.log(`🔧 Fixed <title> di ${file}`);
  }

  // Ambil judul setelah diperbaiki
  const title = extractTitle(fixedContent);
  const category = titleToCategory(title);

  if (!grouped[category]) grouped[category] = [];
  grouped[category].push([title, file]); // format [judul, file]
});

// Simpan ke artikel.json
fs.writeFileSync(jsonOut, JSON.stringify(grouped, null, 2), "utf8");

console.log("✅ artikel.json berhasil dibuat dengan grouping per kategori & <title> sudah difix satu baris");
