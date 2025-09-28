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
