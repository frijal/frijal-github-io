const assert = require("assert");
const fs = require("fs");
const path = require("path");

// Import fungsi yang mau dites
// Supaya bisa di-test, sebaiknya kamu export fungsi dari rss.js
// Misalnya di akhir rss.js tambahkan:
// module.exports = { extractDescription, extractDate, sanitizeTitle };

const { extractDescription, extractDate, sanitizeTitle } = require("../ext/rss.js");

// Buat folder sementara untuk test
const tmpDir = path.join(__dirname, "tmp");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

// Helper untuk bikin file HTML sementara
function writeTmpFile(name, content) {
  const filePath = path.join(tmpDir, name);
  fs.writeFileSync(filePath, content, "utf8");
  return filePath;
}

// ==== TESTS ====

// Test sanitizeTitle
assert.strictEqual(sanitizeTitle("hello-world.html"), "Hello World");
assert.strictEqual(sanitizeTitle("my_article.html"), "My Article");

// Test extractDescription dengan meta description
const fileMeta = writeTmpFile(
  "meta.html",
  `<html><head><meta name="description" content="Deskripsi meta"></head><body></body></html>`
);
assert.strictEqual(extractDescription(fileMeta), "Deskripsi meta");

// Test extractDescription fallback ke <p>
const fileP = writeTmpFile(
  "p.html",
  `<html><body><p>Paragraf pertama untuk deskripsi.</p><p>Lainnya</p></body></html>`
);
assert.ok(extractDescription(fileP).startsWith("Paragraf pertama"));

// Test extractDate dengan meta date
const fileDate = writeTmpFile(
  "date.html",
  `<html><head><meta name="date" content="2025-09-27"></head><body></body></html>`
);
const dateObj = extractDate(fileDate);
assert.ok(dateObj instanceof Date);
assert.strictEqual(dateObj.getUTCFullYear(), 2025);

// Test extractDate tanpa meta date
const fileNoDate = writeTmpFile("nodate.html", `<html><body>No date</body></html>`);
assert.strictEqual(extractDate(fileNoDate), null);

console.log("✅ Semua unit test lolos!");
