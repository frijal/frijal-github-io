/**
 * Fungsi untuk menyimpan ID artikel yang diklik ke Local Storage.
 */
function registerReadTracker() {
    const marqueeContainer = document.getElementById('related-marquee-container');
    if (!marqueeContainer) return;
    
    // Mendaftarkan event listener pada kontainer marquee
    marqueeContainer.addEventListener('click', function(event) {
        // Cek apakah yang diklik adalah link (<a>)
        const clickedLink = event.target.closest('a');
        if (clickedLink) {
            const articleId = clickedLink.getAttribute('data-article-id');
            if (articleId) {
                // 1. Ambil data saat ini dari Local Storage
                const readArticles = JSON.parse(localStorage.getItem('read_marquee_articles') || '[]');
                
                // 2. Tambahkan ID baru jika belum ada
                if (!readArticles.includes(articleId)) {
                    readArticles.push(articleId);
                    
                    // 3. Simpan kembali data yang sudah diperbarui ke Local Storage
                    localStorage.setItem('read_marquee_articles', JSON.stringify(readArticles));
                }
            }
        }
    });
}


/**
 * Inisialisasi Marquee Dinamis dengan memfilter hanya artikel yang belum dibaca.
 * @param {string} targetCategoryId ID elemen div Marquee
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

        // Filter artikel yang sedang dibuka
        const filteredArticles = allArticles.filter(item => item[1] !== currentFilename);

        // --- LOGIKA FILTER LOCAL STORAGE (BARU) ---
        // Ambil ID artikel yang sudah dibaca dari Local Storage
        const readArticles = JSON.parse(localStorage.getItem('read_marquee_articles') || '[]');
        
        // Filter: Hanya sisakan artikel yang ID-nya BELUM ada di Local Storage
        const unreadArticles = filteredArticles.filter(item => {
            const articleId = item[1]; // Nama file unik (ID Artikel)
            return !readArticles.includes(articleId);
        });
        
        if (unreadArticles.length === 0) {
            marqueeContainer.innerHTML = '<p style="margin:0; text-align:center; color: #aaa; font-style: italic;">Semua artikel terkait sudah dibaca. 😊</p>';
            return; 
        }
        
        // Gunakan unreadArticles untuk proses selanjutnya
        unreadArticles.sort(() => 0.5 - Math.random());
        
        let contentHTML = '';
        const separator = ' • ';

        // Membuat string HTML dari artikel
        unreadArticles.forEach(post => {
            const title = post[0];
            const articleId = post[1]; 
            const url = `/artikel/${articleId}`;
            const description = post[4] || title; // arr[4] untuk Tooltip
            
            // Tambahkan atribut data-article-id untuk pelacakan klik
            contentHTML += `<a href="${url}" data-article-id="${articleId}" target="_blank" rel="noopener" title="${description}">${title}</a>${separator}`;
        });

        // Diperbaiki: Ulangi konten 30 kali agar selalu mengisi lebar layar penuh dari awal
        const repeatedContent = contentHTML.repeat(30);
        
        // Suntikkan konten ke kontainer
        marqueeContainer.innerHTML = `<div class="marquee-content">${repeatedContent}</div>`;
        
        // Daftarkan event listener pelacakan klik setelah konten marquee disuntikkan
        registerReadTracker(); 

    } catch (error) {
        console.error(`Marquee Error: Terjadi kesalahan saat memproses data:`, error);
        marqueeContainer.innerHTML = '<p style="margin:0; text-align:center; color: red;">Gagal memuat artikel terkait.</p>';
    }
}

/**
 * Fungsi utama untuk mendapatkan nama file saat ini dan memicu inisialisasi Marquee.
 * Dipicu secara otomatis saat DOMContentLoaded.
 */
function initializeMarquee() {
    // 1. Dapatkan Nama File Saat Ini
    const currentURL = window.location.pathname;
    const currentFilename = currentURL.substring(currentURL.lastIndexOf('/') + 1);

    // 2. Inisialisasi Marquee Dinamis
    initCategoryMarquee(
        'related-marquee-container', // ID target div
        currentFilename,             // Nama file artikel yang sedang dibuka
        '/artikel.json'              // Path ke data JSON Anda
    );
}

// Pemicu: Jalankan fungsi inisialisasi setelah seluruh konten HTML (DOM) selesai dimuat.
document.addEventListener('DOMContentLoaded', initializeMarquee);
