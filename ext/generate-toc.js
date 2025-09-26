const fs = require('fs');
const { parse } = require('node-html-parser');

function generateTOC(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const root = parse(html);
  const body = root.querySelector('body');
  if (!body) return;

  const headings = body.querySelectorAll('h2, h3');
  if (headings.length === 0) return;

  let tocHtml = '<nav class="toc"><h2>📌 Daftar Isi</h2><ul>';
  headings.forEach(h => {
    const text = h.text.trim();
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '');
    h.setAttribute('id', id);
    const indent = h.tagName === 'H3' ? ' style="margin-left:1rem;"' : '';
    tocHtml += `<li${indent}><a href="#${id}">${text}</a></li>`;
  });
  tocHtml += '</ul></nav>';

  const header = body.querySelector('header');
  if (header) {
    header.insertAdjacentHTML('afterend', tocHtml);
  } else {
    body.insertAdjacentHTML('afterbegin', tocHtml);
  }

  fs.writeFileSync(filePath, root.toString());
  console.log(`✅ TOC generated: ${filePath}`);
}

module.exports = generateTOC;
