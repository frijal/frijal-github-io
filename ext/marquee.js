export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function initMarquee(grouped) {
  const m = document.getElementById("marquee-content");
  const allArticles = Object.values(grouped).flat();
  const shuffled = shuffle(allArticles);
  m.innerHTML = shuffled
    .map(d => `<a href="artikel/${d.file}" target="_blank">${d.title}</a>`)
    .join(" • ");
}
export async function initMarqueeDynamic(containerId = 'marquee-bottom', speed = 1, refreshInterval = 60000) {
  const container = document.getElementById(containerId);
  const inner = document.getElementById('marquee-inner');
  let left = 0;
  let totalWidth = 0;
  let animationId;

  async function fetchArticles() {
    try {
      const res = await fetch('/artikel.json');
      const data = await res.json();

      const currentFile = location.pathname.split('/').pop();

      // Temukan kategori halaman
      let category = null;
      for (const cat in data) {
        if (data[cat].some(arr => arr[1] === currentFile)) {
          category = cat;
          break;
        }
      }
      if (!category) return [];

      let articles = data[category].map(arr => ({ title: arr[0], file: arr[1] }));
      // Shuffle
      return articles.sort(() => Math.random() - 0.5);

    } catch (e) {
      console.error('Gagal load artikel.json:', e);
      inner.textContent = 'Gagal memuat artikel.';
      return [];
    }
  }

  function buildMarquee(articles) {
    const content = articles.map(a => `<a href="artikel/${a.file}" target="_blank">${a.title}</a>`).join(' • ');
    inner.innerHTML = content + ' • ' + content; // double untuk seamless
    totalWidth = inner.scrollWidth / 2;
    left = 0;
    inner.style.transform = `translateX(${left}px)`;
  }

  async function updateMarquee() {
    const articles = await fetchArticles();
    if (articles.length > 0) buildMarquee(articles);
  }

  function step() {
    left -= speed;
    if (left <= -totalWidth) left = 0;
    inner.style.transform = `translateX(${left}px)`;
    animationId = requestAnimationFrame(step);
  }

  // Hover pause
  container.addEventListener('mouseenter', () => cancelAnimationFrame(animationId));
  container.addEventListener('mouseleave', () => animationId = requestAnimationFrame(step));

  // Inisialisasi
  await updateMarquee();
  animationId = requestAnimationFrame(step);

  // Refresh otomatis
  setInterval(updateMarquee, refreshInterval); // default: 60 detik
}

///////////////////////

export function initMarqueeDynamic(marqueeId, speed = 1, refreshInterval = 60000) {
  const marquee = document.getElementById(marqueeId);
  if (!marquee) return;

  let scroll = 0;
  let contentWidth = 0;
  let rafId;
  let currentSpeed = speed;

  // Ambil kategori dari URL saat ini (misal: /kategori/tech/)
  const pathParts = window.location.pathname.split('/');
  const currentCategory = pathParts[1] || ''; // ambil folder pertama sebagai kategori

  async function loadMarquee() {
    try {
      const res = await fetch('/artikel/artikel.json');
      const data = await res.json();

      // Filter artikel berdasarkan kategori di filename
      const filtered = data.filter(item => item.filename.includes(currentCategory));

      if (filtered.length === 0) {
        console.warn('Tidak ada artikel sesuai kategori:', currentCategory);
        return;
      }

      // Ambil artikel random dari filtered
      const shuffled = filtered.sort(() => 0.5 - Math.random());

      marquee.innerHTML = '';

      const container = document.createElement('div');
      container.className = 'marquee-content';

      shuffled.forEach(item => {
        let filePath = item.filename;
        if (!filePath.startsWith('artikel/')) filePath = 'artikel/' + filePath;

        const a = document.createElement('a');
        a.href = '/' + filePath;
        a.textContent = item.title;
        a.target = '_blank';
        container.appendChild(a);
      });

      // Duplikasi konten untuk loop mulus
      const containerClone = container.cloneNode(true);
      marquee.appendChild(container);
      marquee.appendChild(containerClone);

      contentWidth = container.scrollWidth;
      scroll = 0;

    } catch (err) {
      console.error('Error loading marquee JSON:', err);
    }
  }

  function animate() {
    scroll += currentSpeed;
    if (scroll >= contentWidth) scroll = 0;
    marquee.scrollLeft = scroll;
    rafId = requestAnimationFrame(animate);
  }

  loadMarquee();
  animate();
  setInterval(loadMarquee, refreshInterval);

  return {
    stop: () => cancelAnimationFrame(rafId),
    setSpeed: (s) => { currentSpeed = s; }
  };
}
