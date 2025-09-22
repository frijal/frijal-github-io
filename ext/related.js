document.addEventListener('DOMContentLoaded', () => {
    const jsonUrl = '/artikel.json';
    const relatedPostsList = document.getElementById('related-posts-list');
    
    // Mendapatkan nama file (slug) dari URL saat ini secara otomatis
    const fullPathname = window.location.pathname;
    const currentUrlSlug = fullPathname.split('/').pop();

    fetch(jsonUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Gagal mengambil data: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            let currentPostCategory = null;

            // Loop melalui setiap kategori di data JSON
            for (const category in data) {
                if (data.hasOwnProperty(category)) {
                    // Cari artikel yang URL-nya cocok dengan halaman saat ini
                    const foundPost = data[category].find(post => post[1] === currentUrlSlug);
                    if (foundPost) {
                        currentPostCategory = category;
                        break; // Keluar dari loop setelah kategori ditemukan
                    }
                }
            }

            // Jika kategori tidak ditemukan, tampilkan pesan dan keluar
            if (!currentPostCategory) {
                relatedPostsList.innerHTML = '<li>Kategori artikel tidak dapat ditemukan.</li>';
                return;
            }

            // Dapatkan semua artikel dari kategori yang ditemukan
            const allPostsInCategory = data[currentPostCategory];

            // Saring artikel yang bukan artikel saat ini
            const filteredPosts = allPostsInCategory.filter(post => post[1] !== currentUrlSlug);

            if (filteredPosts.length === 0) {
                relatedPostsList.innerHTML = '<li>Tidak ada artikel terkait di kategori ini.</li>';
                return;
            }

            // Fungsi untuk mengacak array
            const shuffleArray = array => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
            };

            // Acak daftar artikel yang sudah disaring
            shuffleArray(filteredPosts);

            // Ambil 5 artikel pertama dari daftar yang sudah diacak
            const displayPosts = filteredPosts.slice(0, 5);

            // Tampilkan artikel di HTML
            displayPosts.forEach(post => {
                const title = post[0];
                const urlSlug = post[1];
                const baseUrl = 'https://frijal.github.io/artikel/';

                const listItem = document.createElement('li');
                const link = document.createElement('a');
                link.href = baseUrl + urlSlug;
                link.textContent = title;
                
                listItem.appendChild(link);
                relatedPostsList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Ada masalah dengan operasi fetch:', error);
            relatedPostsList.innerHTML = '<li>Gagal memuat artikel terkait.</li>';
        });
});
