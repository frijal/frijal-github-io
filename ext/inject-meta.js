// inject-meta.js
// Jalankan: node inject-meta.js
// - Tambah <meta property="og:image"> kalau belum ada
// - JSON-LD: isi/rapikan "image"
//   * kosong → fallback
//   * []/[""] → [fallback]
//   * relatif → ubah ke absolut
// - Output JSON-LD rapi dengan sorted keys

import fs from "fs";
import path from "path";

const folder = "./artikelX";
const baseUrl = "https://frijal.github.io/artikel/";

function toAbsolute(url, fallback) {
  if (!url || url.trim() === "") return fallback;
  if (/^https?:\/\//i.test(url)) return url; // sudah absolut
  return baseUrl + url.replace(/^\.?\//, ""); // buang ./ kalau ada
}

// Rekursif sort object keys
function sortKeys(obj) {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortKeys(obj[key]);
        return acc;
      }, {});
  }
  return obj;
}

function injectMeta(filePath) {
  let html = fs.readFileSync(filePath, "utf8");
  const fileName = path.basename(filePath, ".html");
  const fallbackImg = `${baseUrl}${fileName}.jpg`;

  // og:image → hanya tambahkan kalau belum ada
  if (!/<meta[^>]+property=["']og:image["']/i.test(html)) {
    html = html.replace(
      /<\/head>/i,
      `  <meta property="og:image" content="${fallbackImg}">\n</head>`
    );
  }

  // JSON-LD → isi/rapikan "image"
  html = html.replace(
    /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/i,
    (m, open, json, close) => {
      try {
        const data = JSON.parse(json);
        let img = data.image;

        if (!img || (typeof img === "string" && img.trim() === "")) {
          data.image = fallbackImg;
        } else if (Array.isArray(img)) {
          if (img.length === 0 || img.every((el) => typeof el === "string" && el.trim() === "")) {
            data.image = [fallbackImg];
          } else {
            data.image = img.map((el) => toAbsolute(el, fallbackImg));
          }
        } else if (typeof img === "string") {
          data.image = toAbsolute(img, fallbackImg);
        }

        const sorted = sortKeys(data);
        return `${open}${JSON.stringify(sorted, null, 2)}${close}`;
      } catch {
        return m; // skip kalau gagal parse
      }
    }
  );

  fs.writeFileSync(filePath, html, "utf8");
  console.log(`✔ Updated: ${fileName}.html`);
}

fs.readdirSync(folder)
  .filter((f) => f.endsWith(".html"))
  .forEach((f) => injectMeta(path.join(folder, f)));
