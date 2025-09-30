(function (global, factory) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    factory(exports);
  } else if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else {
    global = global || self;
    factory(global.MarqueeDynamic = {});
  }
})(this, function (exports) {
  "use strict";

  async function initMarqueeDynamic(containerId, speed = 0.2, refreshInterval = 60000) {
    const container = document.getElementById(containerId);
    const inner = document.getElementById("marquee-inner");
    const slider = document.getElementById("speedRange");
    if (!container || !inner) return;

    let left = 0;
    let totalWidth = 0;
    let currentSpeed = speed;
    let animationId;

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

        return data[category].map(arr => ({
          title: arr[0],
          file: arr[1],
          img: arr[2],
          date: arr[3],
          desc: arr[4],
        })).sort(() => Math.random() - 0.5);

      } catch (e) {
        console.error("Gagal load artikel.json:", e);
        inner.textContent = "Gagal memuat artikel.";
        return [];
      }
    }

    function buildMarquee(articles) {
      const content = articles
        .map(a => `
          <span class="tooltip">
            <a href="artikel/${a.file}">${a.title}</a>
            <span class="tooltip-text">${a.desc}</span>
          </span>
        `)
        .join(" • ");
      inner.innerHTML = content + " • " + content;
      totalWidth = inner.scrollWidth / 2;
      left = 0;
      inner.style.transform = `translateX(${left}px)`;
    }

    async function updateMarquee() {
      const articles = await fetchArticles();
      if (articles.length > 0) buildMarquee(articles);
    }

    function step() {
      left -= currentSpeed;
      if (left <= -totalWidth) left = 0;
      inner.style.transform = `translateX(${left}px)`;
      animationId = requestAnimationFrame(step);
    }

    container.addEventListener("mouseenter", () => cancelAnimationFrame(animationId));
    container.addEventListener("mouseleave", () => animationId = requestAnimationFrame(step));

    if (slider) {
      slider.addEventListener("input", e => {
        currentSpeed = parseFloat(e.target.value);
      });
    }

    await updateMarquee();
    animationId = requestAnimationFrame(step);
    setInterval(updateMarquee, refreshInterval);
  }

  exports.initMarqueeDynamic = initMarqueeDynamic;
  Object.defineProperty(exports, "__esModule", { value: true });
});
