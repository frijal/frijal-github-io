/**
 * Inisialisasi Marquee Dinamis dengan mendeteksi kategori berdasarkan nama file artikel.
 * Fungsi ini mengambil data, mencari kategori yang cocok, dan menyuntikkan konten marquee.
 * * @param {string} targetCategoryId ID elemen div Marquee
 * @param {string} currentFilename Nama file artikel yang sedang dibuka (e.g., '1011nabi-yaakub-yusuf.html')
 * @param {string} jsonPath Jalur file artikel.json (e.g., '/artikel.json')
 */
async function initCategoryMarquee(targetCategoryId, currentFilename, jsonPath) {
    const marqueeContainer = document.getElementById(targetCategoryId);
    
    if (!marqueeContainer) {
        console.error(`Marquee Error: Elemen dengan ID: ${targetCategoryId} tidak ditemukan.`);
        return;
    }
    // Tampilan loading awal
    marqueeContainer.innerHTML = `<p style="margin:0; text-align:center; color: #aaa; font-style: italic;">Memuat artikel terkait...</p>`;
    
    try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error(`Gagal memuat ${jsonPath}`);
        const data = await response.json();
        let targetCategory = null;
        let allArticles = [];

        // Logika Mendeteksi Kategori
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

        // Filter artikel yang sedang dibuka dan acak urutan
        const filteredArticles = allArticles.filter(item => item[1] !== currentFilename);
        if (filteredArticles.length === 0) { 
            marqueeContainer.innerHTML = ''; 
            return; 
        }

        filteredArticles.sort(() => 0.5 - Math.random());
        
        let contentHTML = '';
        const separator = ' • ';

        // Membuat string HTML dari artikel
        filteredArticles.forEach(post => {
            const title = post[0];
            const url = `/artikel/${post[1]}`;
            contentHTML += `<a href="${url}" rel="noopener" title="${title}">${title}</a>${separator}`;
        });

        // Diperbaiki: Ulangi konten 30 kali agar selalu mengisi lebar layar penuh dari awal
        const repeatedContent = contentHTML.repeat(30);
        
        // Suntikkan konten ke kontainer
        marqueeContainer.innerHTML = `<div class="marquee-content">${repeatedContent}</div>`;

    } catch (error) {
        console.error(`Marquee Error: Terjadi kesalahan saat memproses data:`, error);
        marqueeContainer.innerHTML = '<p style="margin:0; text-align:center; color: red;">Gagal memuat artikel terkait.</p>';
    }
}

/**
 * Fungsi utama untuk mendapatkan nama file saat ini dan memicu inisialisasi Marquee.
 */
function initializeMarquee() {
    // 1. Dapatkan Nama File Saat Ini
    // Ini adalah cara sederhana untuk mendapatkan 'nama-file.html' dari URL
    const currentURL = window.location.pathname;
    const currentFilename = currentURL.substring(currentURL.lastIndexOf('/') + 1);

    // 2. Inisialisasi Marquee Dinamis
    initCategoryMarquee(
        'related-marquee-container', // ID target div (Pastikan ini sesuai dengan HTML Anda)
        currentFilename,             // Nama file artikel yang sedang dibuka
        '/artikel.json'              // Path ke data JSON Anda (Pastikan ini benar)
    );
}

// Pemicu: Jalankan fungsi inisialisasi setelah seluruh konten HTML (DOM) selesai dimuat.
document.addEventListener('DOMContentLoaded', initializeMarquee);
