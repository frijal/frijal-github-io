const fs = require("fs");
const path = require("path");
const { XMLParser } = require("fast-xml-parser");

const rssPath = path.join(__dirname, "../rss.xml");

if (!fs.existsSync(rssPath)) {
  console.error("❌ rss.xml tidak ditemukan!");
  process.exit(1);
}

const xmlData = fs.readFileSync(rssPath, "utf8");

const parser = new XMLParser({
  ignoreAttributes: false,
  allowBooleanAttributes: true,
  parseTagValue: true,
});

try {
  const parsed = parser.parse(xmlData);

  if (!parsed.rss || !parsed.rss.channel) {
    console.error("❌ rss.xml tidak memiliki <rss><channel>");
    process.exit(1);
  }

  const items = parsed.rss.channel.item;
  if (!items || items.length === 0) {
    console.error("❌ rss.xml tidak memiliki <item>");
    process.exit(1);
  }

  items.forEach((item, i) => {
    if (!item.title) {
      console.error(`❌ Item ke-${i + 1} tidak punya <title>`);
      process.exit(1);
    }
    if (!item.link) {
      console.error(`❌ Item ke-${i + 1} tidak punya <link>`);
      process.exit(1);
    }
    if (!item.pubDate) {
      console.error(`❌ Item ke-${i + 1} tidak punya <pubDate>`);
      process.exit(1);
    }
  });

  console.log("✅ rss.xml valid dan punya item dengan title, link, pubDate");
} catch (err) {
  console.error("❌ Error parsing rss.xml:", err.message);
  process.exit(1);
}
