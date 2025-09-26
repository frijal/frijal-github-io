const fs = require("fs");
const path = require("path");
const { titleToCategory } = require("./titleToCategory"); // kategori mapping

// folder artikel ada di root
const artikelDir = path.join(__dirname, "../artikel");
const jsonOut = path.join(__dirname, "../artikel.json");

// Ambil judul dari <title>
function extractTitle(content) {
  const match = content.match(/<title>(.*?)<\/title>/i);
  return match ? match[1].trim() : "Tanpa Judul";
}

// Ambil semua file HTML
const files = fs.readdirSync(artikelDir).filter(f => f.endsWith(".html"));

let grouped = {};

files.forEach(file => {
  const fullPath = path.join(artikelDir, file);
  const content = fs.readFileSync(fullPath, "utf8");

  const title = extractTitle(content);
  const category = titleToCategory(title);

  if (!grouped[category]) grouped[category] = [];
  grouped[category].push([title,file]); // format [judul, file]
});

// Simpan ke artikel.json
fs.writeFileSync(jsonOut, JSON.stringify(grouped, null, 2), "utf8");

console.log("✅ artikel.json berhasil dibuat dengan grouping per kategori");
