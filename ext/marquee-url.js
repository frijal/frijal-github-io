/**
 * Inisialisasi Marquee Dinamis dengan Artikel dari Kategori yang Sama.
 * Fungsi ini mengambil data dari JSON yang terletak di root ('/artikel.json'), 
 * memfilter, mengacak, dan menampilkannya dalam elemen Marquee.
 * * @param {string} targetCategoryId ID elemen div Marquee (e.g., 'related-marquee-container')
 * @param {string} categoryName Nama kategori yang ingin diambil (e.g., 'Religi dan Islam')
 * @param {string} jsonPath Jalur relatif/absolut file artikel.json (HARUS: '/artikel.json' atau 'artikel.json')
 */
async function initCategoryMarquee(targetCategoryId, categoryName, jsonPath) {
    const marqueeContainer = document.getElementById(targetCategoryId);
    
    // 1. Validasi Wadah Marquee
    if (!marqueeContainer) {
        console.error(`Marquee Error: Elemen dengan ID: ${targetCategoryId} tidak ditemukan.`);
        return;
    }
    
    // Tampilkan pesan loading sementara
    marqueeContainer.innerHTML = `<p style="margin:0; text-align:center; color: #aaa; font-style: italic;">Memuat artikel terkait dari kategori "${categoryName}"...</p>`;

    try {
        // 2. Ambil Data JSON menggunakan path yang disediakan (diasumsikan root: /artikel.json)
        const response = await fetch(jsonPath);
        if (!response.ok) {
            throw new Error(`Gagal memuat ${jsonPath} (Status: ${response.status})`);
        }
        const data = await response.json();
        
        let allArticles = [];

        // 3. Filter Artikel berdasarkan Kategori
        if (data[categoryName] && Array.isArray(data[categoryName])) {
            // Mengubah format array JSON: [title, file, image, _, desc] menjadi objek URL/Title
            allArticles = data[categoryName].map(item => ({
                title: item[0],
                // URL artikel dibuat relatif terhadap root situs (e.g., /artikel/file.html)
                // Diasumsikan artikel selalu ada di subfolder 'artikel/'
                url: `/artikel/${item[1]}` 
            }));
        }

        if (allArticles.length === 0) {
            marqueeContainer.innerHTML = ''; // Sembunyikan Marquee jika tidak ada artikel
            return;
        }

        // 4. Acak Urutan Artikel
        allArticles.sort(() => 0.5 - Math.random()); 
        
        // 5. Bangun Konten HTML
        let contentHTML = '';
        const separator = ' • ';

        allArticles.forEach(post => {
            contentHTML += `<a href="${post.url}" target="_blank" rel="noopener" title="${post.title}">${post.title}</a>${separator}`;
        });

        // 6. Ulangi Konten untuk Efek Gulir Berkelanjutan
        const repeatedContent = contentHTML.repeat(5); // Ulangi 5 kali
        
        // 7. Suntikkan Konten
        marqueeContainer.innerHTML = `<div class="marquee-content">${repeatedContent}</div>`;

    } catch (error) {
        console.error(`Marquee Error: Gagal memuat/memproses artikel kategori "${categoryName}":`, error);
        marqueeContainer.innerHTML = '<p style="margin:0; text-align:center; color: red;">Gagal memuat artikel terkait.</p>';
    }
}
