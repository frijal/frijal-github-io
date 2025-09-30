function buildMarquee(articles) {
  const content = articles
    .map(a => `
      <span class="tooltip">
        <a href="artikel/${a.file}">${a.title}</a>
        <span class="tooltip-text">${a.desc}</span>
      </span>
    `)
    .join(" • ");

  inner.innerHTML = content + " • " + content; // double untuk loop mulus
  totalWidth = inner.scrollWidth / 2;
  left = 0;
  inner.style.transform = `translateX(${left}px)`;
}

async function fetchArticles() {
  try {
    const res = await fetch("/artikel.json");
    const data = await res.json();

    const currentFile = location.pathname.split("/").pop();
    let category = null;
    for (const cat in data) {
      if (data[cat].some(arr => arr[1] === currentFile)) {
        category = cat;
        break;
      }
    }
    if (!category) return [];

    // Map artikel, tooltip dari arr[4]
    return data[category].map(arr => ({
      title: arr[0],
      file: arr[1],
      img: arr[2],
      date: arr[3],
      desc: arr[4] // <-- tooltip pakai arr[4]
    })).sort(() => Math.random() - 0.5);

  } catch (e) {
    console.error("Gagal load artikel.json:", e);
    inner.textContent = "Gagal memuat artikel.";
    return [];
  }
}
