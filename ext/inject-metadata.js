const fs = require('fs');
const { parse } = require('node-html-parser');

function injectMetadata(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const root = parse(html);
  const head = root.querySelector('head');
  const body = root.querySelector('body');
  if (!head || !body) return;

  if (!head.querySelector('title')) {
    const h1 = body.querySelector('h1');
    const titleText = h1 ? h1.text.trim() : 'Artikel Linux';
    head.appendChild(parse(`<title>${titleText}</title>`));
  }

  if (!head.querySelector('meta[name="description"]')) {
    const firstPara = body.querySelector('p');
    const descText = firstPara ? firstPara.text.trim().slice(0, 160) : 'Artikel tentang Linux dan teknologi.';
    head.appendChild(parse(`<meta name="description" content="${descText}" />`));
  }

  if (!head.querySelector('meta[name="keywords"]')) {
    const keywords = ['Linux', 'Garuda', 'ISO', 'Mesa', 'Arch', 'Plasma'];
    head.appendChild(parse(`<meta name="keywords" content="${keywords.join(', ')}" />`));
  }

  fs.writeFileSync(filePath, root.toString());
  console.log(`✅ Metadata injected: ${filePath}`);
}

module.exports = injectMetadata;
