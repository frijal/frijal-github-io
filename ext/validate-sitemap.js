const fs = require("fs");
const path = require("path");
const { XMLParser } = require("fast-xml-parser");

const sitemapPath = path.join(__dirname, "../sitemap.xml");

if (!fs.existsSync(sitemapPath)) {
  console.error("❌ sitemap.xml tidak ditemukan!");
  process.exit(1);
}

const xmlData = fs.readFileSync(sitemapPath, "utf8");

// parser dengan strict mode
const parser = new XMLParser({
  ignoreAttributes: false,
  allowBooleanAttributes: true,
  parseTagValue: true,
});

try {
  const parsed = parser.parse(xmlData);

  if (!parsed.urlset || !parsed.urlset.url) {
    console.error("❌ sitemap.xml tidak memiliki <urlset> atau <url>");
    process.exit(1);
  }

  const urls = Array.isArray(parsed.urlset.url)
    ? parsed.urlset.url
    : [parsed.urlset.url];

  urls.forEach((u, i) => {
    if (!u.loc) {
      console.error(`❌ Entry ke-${i + 1} tidak punya <loc>`);
      process.exit(1);
    }
    if (!u.lastmod) {
      console.error(`❌ Entry ${u.loc} tidak punya <lastmod>`);
      process.exit(1);
    }
    // cek format ISO 8601
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(u.lastmod)) {
      console.error(`❌ lastmod di ${u.loc} bukan format ISO 8601 penuh: ${u.lastmod}`);
      process.exit(1);
    }
  });

  console.log("✅ sitemap.xml valid dan sesuai format ISO 8601 penuh");
} catch (err) {
  console.error("❌ Error parsing sitemap.xml:", err.message);
  process.exit(1);
}
