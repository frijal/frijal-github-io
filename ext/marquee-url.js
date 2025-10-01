/**
 * Mendeteksi apakah perangkat yang digunakan adalah Mobile (layar kecil/layar sentuh).
 * @returns {boolean} True jika mobile, False jika desktop.
 */
function isMobileDevice() {
    // Kriteria deteksi: Maksimal lebar layar 768px ATAU adanya kemampuan layar sentuh
    return (
        window.innerWidth <= 768 || 
        ('ontouchstart' in window) || 
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0)
    );
}

/**
 * Fungsi untuk menyimpan ID artikel yang diklik ke Local Storage.
 */
function registerReadTracker() {
    const marqueeContainer = document.getElementById('related-marquee-container');
    if (!marqueeContainer) return;
    
    // Mendaftarkan event listener pada kontainer marquee
    marqueeContainer.addEventListener('click', function(event) {
        const clickedLink = event.target.closest('a');
        if (clickedLink) {
            const articleId = clickedLink.getAttribute('data-article-id');
            if (articleId) {
                const readArticles = JSON.parse(localStorage.getItem('read_marquee_articles') || '[]');
                
                if (!readArticles.includes(articleId)) {
                    readArticles.push(articleId);
                    localStorage.setItem('read_marquee_articles', JSON.stringify(readArticles));
                }
            }
        }
    });
}


/**
 * Inisialisasi Marquee Dinamis dengan memfilter hanya artikel yang belum dibaca.
 * @param {string} targetCategoryId ID elemen div Marquee
 * @param {string} currentFilename Nama file artikel yang sedang dibuka
 * @param {string} jsonPath Jalur file artikel.json
 */
async function initCategoryMarquee(targetCategoryId, currentFilename, jsonPath) {
    const marqueeContainer = document.getElementById(targetCategoryId);
    
    if (!marqueeContainer) {
        console.error(`Marquee Error: Elemen dengan ID: ${targetCategoryId} tidak ditemukan.`);
        return;
    }
    
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

        const filteredArticles = allArticles.filter(item => item[1] !== currentFilename);

        // --- LOGIKA FILTER LOCAL STORAGE ---
        const readArticles = JSON.parse(localStorage.getItem('read_marquee_articles') || '[]');
        
        const unreadArticles = filteredArticles.filter(item => {
            const articleId = item[1]; 
            return !readArticles.includes(articleId);
        });
        
        if (unreadArticles.length === 0) {
            marqueeContainer.innerHTML = '<p style="margin:0; text-align:center; color: #aaa; font-style: italic;">Semua artikel terkait sudah dibaca. 😊</p>';
            return; 
        }
        
        unreadArticles.sort(() => 0.5 - Math.random());
        
        let contentHTML = '';
        const separator = ' • ';
        
        // Cek status mobile sekali
        const isMobile = isMobileDevice(); 

        // Membuat string HTML dari artikel
        unreadArticles.forEach(post => {
            const title = post[0];
            const articleId = post[1]; 
            const url = `/artikel/${articleId}`;
            
            // Logika Tooltip Bersyarat
            let tooltipText;
            if (isMobile) {
                // Mobile: Gunakan hanya Judul (arr[0])
                tooltipText = title;
            } else {
                // Desktop: Gunakan Deskripsi (arr[4]) jika ada, atau fallback ke Judul
                tooltipText = post[4] || title; 
            }
            
            // Tambahkan atribut data-article-id untuk pelacakan klik
            contentHTML += `<a href="${url}" data-article-id="${articleId}" title="${tooltipText}">${title}</a>${separator}`;
        });

        // Ulangi konten 30 kali
        const repeatedContent = contentHTML.repeat(30);
        
        // Suntikkan konten
        marqueeContainer.innerHTML = `<div class="marquee-content">${repeatedContent}</div>`;
        
        // Daftarkan event listener pelacakan klik
        registerReadTracker(); 

    } catch (error) {
        console.error(`Marquee Error: Terjadi kesalahan saat memproses data:`, error);
        marqueeContainer.innerHTML = ''; 
    }
}

/**
 * Fungsi utama untuk mendapatkan nama file saat ini dan memicu inisialisasi Marquee.
 * Dipicu secara otomatis saat DOMContentLoaded.
 */
function initializeMarquee() {
    const currentURL = window.location.pathname;
    const currentFilename = currentURL.substring(currentURL.lastIndexOf('/') + 1);

    initCategoryMarquee(
        'related-marquee-container', 
        currentFilename,             
        '/artikel.json'              
    );
}

// Pemicu: Jalankan fungsi inisialisasi setelah seluruh konten HTML (DOM) selesai dimuat.
document.addEventListener('DOMContentLoaded', initializeMarquee);
