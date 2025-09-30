// ISI DARI /ext/marquee-url.js (Pastikan ini sudah benar)

// ... (Kode initCategoryMarquee - Fungsi deteksi kategori dari filename di JSON)
// ... (Kode initMarqueeSpeedControl - Fungsi kontrol slider kecepatan)

/**
 * Inisialisasi Marquee Dinamis dengan mendeteksi kategori berdasarkan nama file artikel.
 * @param {string} targetCategoryId ID elemen div Marquee
 * @param {string} currentFilename Nama file artikel yang sedang dibuka (e.g., '1011nabi-yaakub-yusuf.html')
 * @param {string} jsonPath Jalur file artikel.json (e.g., '/artikel.json')
 */
async function initCategoryMarquee(targetCategoryId, currentFilename, jsonPath) {
    const marqueeContainer = document.getElementById(targetCategoryId);
    // ... (Logika fetch, iterasi, deteksi targetCategory, filter, shuffle, dan inject HTML)
    // *Gunakan kode dari langkah terakhir untuk fungsi ini*
    
    // START KODE initCategoryMarquee (Hanya untuk referensi logika):
    if (!marqueeContainer) {
        console.error(`Marquee Error: Elemen dengan ID: ${targetCategoryId} tidak ditemukan.`);
        return;
    }
    marqueeContainer.innerHTML = `<p style="margin:0; text-align:center; color: #aaa; font-style: italic;">Memuat artikel terkait...</p>`;
    try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error(`Gagal memuat ${jsonPath}`);
        const data = await response.json();
        let targetCategory = null;
        let allArticles = [];

        for (const categoryName in data) {
            if (data.hasOwnProperty(categoryName)) {
                const articleMatch = data[categoryName].find(item => item[1] === currentFilename);
                if (articleMatch) {
                    targetCategory = categoryName;
                    allArticles = data[categoryName]; 
                    break;
                }
            }
        }
        
        if (!targetCategory || allArticles.length === 0) {
            marqueeContainer.innerHTML = '';
            console.warn(`Marquee: Kategori untuk file ${currentFilename} tidak ditemukan di JSON.`);
            return;
        }

        const filteredArticles = allArticles.filter(item => item[1] !== currentFilename);
        if (filteredArticles.length === 0) { marqueeContainer.innerHTML = ''; return; }

        filteredArticles.sort(() => 0.5 - Math.random()); 
        
        let contentHTML = '';
        const separator = ' • ';

        filteredArticles.forEach(post => {
            const title = post[0];
            const url = `/artikel/${post[1]}`;
            contentHTML += `<a href="${url}" target="_blank" rel="noopener" title="${title}">${title}</a>${separator}`;
        });

        const repeatedContent = contentHTML.repeat(5); 
        marqueeContainer.innerHTML = `<div class="marquee-content">${repeatedContent}</div>`;

    } catch (error) {
        console.error(`Marquee Error: Terjadi kesalahan saat memproses data:`, error);
        marqueeContainer.innerHTML = '<p style="margin:0; text-align:center; color: red;">Gagal memuat artikel terkait.</p>';
    }
    // END KODE initCategoryMarquee
}

/**
 * Inisialisasi kontrol slider untuk mengubah kecepatan Marquee.
 */
function initMarqueeSpeedControl(sliderId, contentClass) {
    const slider = document.getElementById(sliderId);
    const content = document.querySelector(`.${contentClass}`);

    if (!slider || !content) {
        return;
    }

    const applySpeed = (value) => {
        const duration = value;
        content.style.animationDuration = `${duration}s`;
    };

    applySpeed(slider.value);

    slider.addEventListener('input', (e) => {
        applySpeed(e.target.value);
    });
}
