import fs from "fs";
import path from "path";

const folder = "artikelx";

for (const f of fs.readdirSync(folder)) {
if (!f.endsWith(".html")) continue;
const file = path.join(folder, f);
let html = fs.readFileSync(file, "utf8");

const base = path.basename(f, ".html");
const img = `https://frijal.github.io/artikel/${base}.jpg`;

// ambil <title> untuk alt text fallback
const titleMatch = html.match(/<title>(.*?)</title>/i);
const altText = titleMatch ? titleMatch[1].trim() : base;

// --- Perbaiki JSON-LD ---
html = html.replace(
/<script type="application\/ld\+json">([\s\S]*?)</script>/gi,
(m, j) => {
try {
const d = JSON.parse(j);
const fix = (o) => {
if (!o || typeof o !== "object") return;
if (
!o.image ||
o.image === "" ||
(Array.isArray(o.image) && o.image.length === 0)
) {
o.image = img;
}
Object.values(o).forEach(fix);
};
Array.isArray(d) ? d.forEach(fix) : fix(d);
return `<script type="application/ld+json">${JSON.stringify(d)}</script>`;
} catch {
return m;
}
}
);

// --- Open Graph og:image ---
if (!/<meta[^>]+property=["']og:image/i.test(html)) {
html = html.replace(
/</head>/i,
`  <meta property="og:image" content="${img}">\n</head>`
);
}

// --- og:image:alt ---
if (!/<meta[^>]+property=["']og:image:alt/i.test(html)) {
html = html.replace(
/</head>/i,
`  <meta property="og:image:alt" content="${altText}">\n</head>`
);
}

// --- Twitter Card ---
if (!/<meta[^>]+name=["']twitter:card/i.test(html)) {
html = html.replace(
/</head>/i,
`  <meta name="twitter:card" content="summary_large_image">\n</head>`
);
}

// --- Twitter Image ---
if (!/<meta[^>]+name=["']twitter:image/i.test(html)) {
html = html.replace(
/</head>/i,
`  <meta name="twitter:image" content="${img}">\n</head>`
);
}

// --- Schema.org Microdata itemprop="image" ---
if (!/<meta[^>]+itemprop=["']image["']/i.test(html)) {
html = html.replace(
/</head>/i,
`  <meta itemprop="image" content="${img}">\n</head>`
);
}

fs.writeFileSync(file, html);
console.log("✔ Diproses:", f);
}
