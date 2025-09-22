document.addEventListener('DOMContentLoaded', () => {
    const jsonUrl = '/artikel.json';
    const relatedPostsList = document.getElementById('related-posts-list');
    
    // Mendapatkan nama file (slug) dari URL saat ini
    const fullPathname = window.location.pathname;
    const currentUrlSlug = fullPathname.split('/').pop();

    // Dapatkan riwayat URL yang sudah dilihat dari localStorage
    const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts')) || [];

    fetch(jsonUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Gagal mengambil data: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            let currentPostCategory = null;

            // Cari kategori artikel saat ini
            for (const category in data) {
                if (data.hasOwnProperty(category)) {
                    const foundPost = data[category].find(post => post[1] === currentUrlSlug);
                    if (foundPost) {
                        currentPostCategory = category;
                        break; 
                    }
                }
            }

            if (!currentPostCategory) {
                relatedPostsList.innerHTML = '<li>Kategori artikel tidak dapat ditemukan.</li>';
                return;
            }

            const allPostsInCategory = data[currentPostCategory];
            
            // Saring artikel yang bukan artikel saat ini DAN belum pernah dilihat
            const filteredPosts = allPostsInCategory.filter(post => 
                post[1] !== currentUrlSlug && !viewedPosts.includes(post[1])
            );

            if (filteredPosts.length === 0) {
                relatedPostsList.innerHTML = '<li>Tidak ada artikel terkait baru.</li>';
                return;
            }

            const shuffleArray = array => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
            };

            shuffleArray(filteredPosts);

            const displayPosts = filteredPosts.slice(0, 4);
            
            // Perbarui riwayat dengan artikel yang akan ditampilkan
            const newViewedPosts = [...viewedPosts, ...displayPosts.map(post => post[1])];
            
            // Simpan riwayat yang diperbarui ke localStorage
            localStorage.setItem('viewedPosts', JSON.stringify(newViewedPosts));

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
