document.addEventListener('DOMContentLoaded', () => {
    const jsonUrl = '/artikel.json';
    const relatedPostsList = document.getElementById('related-posts-list');
    const numToDisplay = 4;
    const viewedPostsKey = 'viewedPosts';
    const viewedPostsCap = 50; // Batasan jumlah URL yang disimpan

    // Mendapatkan nama file (slug) dari URL saat ini
    const fullPathname = window.location.pathname;
    const currentUrlSlug = fullPathname.split('/').pop();

    // Dapatkan riwayat URL yang sudah dilihat dari localStorage
    const viewedPosts = JSON.parse(localStorage.getItem(viewedPostsKey)) || [];

    fetch(jsonUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('seluruh artikel sudah dibaca.' + response.statusText);
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
                relatedPostsList.innerHTML = '<li>seluruh artikel sudah dibaca.</li>';
                return;
            }

            const allPostsInCategory = data[currentPostCategory];
            
            // Filter posts that haven't been viewed yet and are not the current post
            const unseenPosts = allPostsInCategory.filter(post => 
                post[1] !== currentUrlSlug && !viewedPosts.includes(post[1])
            );

            let displayPosts;
            const shuffleArray = array => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
            };
            
            if (unseenPosts.length >= numToDisplay) {
                // Tahap 1: Cukup postingan baru, acak dan ambil
                shuffleArray(unseenPosts);
                displayPosts = unseenPosts.slice(0, numToDisplay);
            } else {
                // Tahap 2: Posting baru tidak cukup, ambil dari semua artikel
                const fallbackPosts = allPostsInCategory.filter(post => post[1] !== currentUrlSlug);
                shuffleArray(fallbackPosts);
                displayPosts = fallbackPosts.slice(0, numToDisplay);
            }

            // Perbarui riwayat dengan URL yang baru dilihat
            const newViewedPosts = [...viewedPosts, ...displayPosts.map(post => post[1])];
            
            // Jaga agar riwayat tidak terlalu besar dengan memotongnya
            localStorage.setItem(viewedPostsKey, JSON.stringify(newViewedPosts.slice(-viewedPostsCap)));

            if (displayPosts.length === 0) {
                 relatedPostsList.innerHTML = '<li>seluruh artikel sudah dibaca.</li>';
                return;
            }

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
            console.error('seluruh artikel sudah dibaca.', error);
            relatedPostsList.innerHTML = '<li>seluruh artikel sudah dibaca.</li>';
        });
});
