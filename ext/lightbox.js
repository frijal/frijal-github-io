// lightbox.js

document.addEventListener("DOMContentLoaded", () => {
  // Buat overlay lightbox
  const overlay = document.createElement("div");
  overlay.classList.add("lightbox-overlay");

  const content = document.createElement("div");
  content.classList.add("lightbox-content");
  overlay.appendChild(content);

  const closeBtn = document.createElement("span");
  closeBtn.classList.add("lightbox-close");
  closeBtn.innerHTML = "&times;";
  content.appendChild(closeBtn);

  // Navigasi (optional)
  const prevBtn = document.createElement("span");
  prevBtn.classList.add("lightbox-nav", "lightbox-prev");
  prevBtn.innerHTML = "&#10094;";
  content.appendChild(prevBtn);

  const nextBtn = document.createElement("span");
  nextBtn.classList.add("lightbox-nav", "lightbox-next");
  nextBtn.innerHTML = "&#10095;";
  content.appendChild(nextBtn);

  document.body.appendChild(overlay);

  // Kumpulkan semua elemen lightboxable (img atau iframe)
  const items = document.querySelectorAll(".lightbox");
  let currentIndex = 0;

  function showLightbox(index) {
    currentIndex = index;
    const node = items[index].cloneNode(true);
    // Hapus tombol copy atau class tambahan
    node.classList.remove("lightbox");
    // Bersihkan konten lama kecuali tombol navigasi & close
    Array.from(content.children).forEach(c => {
      if (!c.classList.contains("lightbox-close") && !c.classList.contains("lightbox-nav")) {
        c.remove();
      }
    });
    content.insertBefore(node, closeBtn);
    overlay.classList.add("active");
  }

  function hideLightbox() {
    overlay.classList.remove("active");
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    showLightbox(currentIndex);
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % items.length;
    showLightbox(currentIndex);
  }

  // Event klik untuk setiap item
  items.forEach((item, i) => {
    item.style.cursor = "zoom-in";
    item.addEventListener("click", () => showLightbox(i));
  });

  // Event tombol close & overlay klik
  closeBtn.addEventListener("click", hideLightbox);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) hideLightbox();
  });

  // Navigasi panah
  prevBtn.addEventListener("click", (e) => { e.stopPropagation(); showPrev(); });
  nextBtn.addEventListener("click", (e) => { e.stopPropagation(); showNext(); });

  // Keyboard support
  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("active")) return;
    if (e.key === "Escape") hideLightbox();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "ArrowRight") showNext();
  });
});
