import fs from "fs";
import path from "path";

const folder = "artikelx";

for (const f of fs.readdirSync(folder)) {
  if (!f.endsWith(".html")) continue;
  const file = path.join(folder, f);
  let html = fs.readFileSync(file, "utf8");
  const base = path.basename(f, ".html");
  const img = `https://frijal.github.io/artikel/${base}.jpg`;

  html = html.replace(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i,
    (m, j) => {
      try {
        const d = JSON.parse(j);
        const fix = (o) => {
          if (!o || typeof o !== "object") return;
          if (!o.image || (Array.isArray(o.image) && !o.image.length) || o.image === "")
            o.image = img;
          Object.values(o).forEach(fix);
        };
        Array.isArray(d) ? d.forEach(fix) : fix(d);
        return `<script type="application/ld+json">${JSON.stringify(d)}</script>`;
      } catch {
        return m;
      }
    }
  );

  if (!/<meta[^>]+property=["']og:image["']/i.test(html)) {
    html = html.replace("</head>", `<meta property="og:image" content="${img}">\n</head>`);
  }

  fs.writeFileSync(file, html);
  console.log("✔", f);
}
