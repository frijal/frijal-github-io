const fs = require('fs').promises;
const path = require('path');
const Parser = require('rss-parser');

// Menentukan path absolut agar skrip bisa dijalankan dari mana saja di dalam proyek
const projectRoot = path.resolve(__dirname, '..'); 
const rssPath = path.join(projectRoot, 'rss.xml');
const templatePath = path.join(projectRoot, 'ext', 'template.html');
const outputPath = path.join(projectRoot, 'artikel', 'artikel-terbaru.html');


async function buildPage() {
    console.log('Mulai membuat halaman artikel terbaru...');

    const parser = new Parser();

    console.log(`Membaca feed dari: ${rssPath}`);
    const feedXml = await fs.readFile(rssPath, 'utf-8');
    const feed = await parser.parseString(feedXml);

    let articlesHtml = '';

    feed.items.forEach(item => {
        const pubDate = new Date(item.pubDate);
        const formattedDate = pubDate.toLocaleDateString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        let imageHtml = '';
        if (item.enclosure && item.enclosure.url) {
            imageHtml = `<img src="${item.enclosure.url}" alt="Gambar Sampul untuk ${item.title}" class="card-image" loading="lazy">`;
        }

        articlesHtml += `
<div class="article-card">
    ${imageHtml} 
    <div class="card-content">
        <h3><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a></h3>
        <p class="snippet">${item.contentSnippet || 'Tidak ada ringkasan.'}</p>
        <div class="meta">
            <span class="date">${formattedDate}</span>
            <a href="${item.link}" class="read-more" target="_blank" rel="noopener noreferrer">Baca Selengkapnya &rarr;</a>
        </div>
    </div>
</div>`;
    });

    console.log(`Membaca template dari: ${templatePath}`);
    const template = await fs.readFile(templatePath, 'utf-8');
    const finalHtml = template.replace('', articlesHtml);

    await fs.writeFile(outputPath, finalHtml);

    console.log(`✅ Halaman berhasil dibuat di: ${outputPath}`);
}

buildPage().catch(error => {
    console.error('❌ Terjadi kesalahan:', error);
});
