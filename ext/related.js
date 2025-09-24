// related.js - gabungan semua fungsi (toggle, auto-hide, meta tags)
// by ChatGPT

(function () {
  /**
   * Helper: set or update meta tag
   * @param {string} name - meta name or property
   * @param {string} content - value
   * @param {boolean} isProperty - true untuk property (og:, fb:), false untuk name (twitter:, description)
   */
  function setMetaTag(name, content, isProperty = false) {
    if (!content) return;
    let selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let tag = document.head.querySelector(selector);
    if (!tag) {
      tag = document.createElement("meta");
      if (isProperty) tag.setAttribute("property", name);
      else tag.setAttribute("name", name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  function initRelated(opts = {}) {
    const {
      containerSelector = "#related-posts-container",
      toggleSelector = "#toggle-btn",
      autoHideDelay = 3000,
      initialCollapsed = false,
      persistKey = "relatedCollapsed"
    } = opts;

    const container = document.querySelector(containerSelector);
    let toggleBtn = document.querySelector(toggleSelector);

    if (!container) {
      console.warn("related.js: container not found:", containerSelector);
      return null;
    }

    // buat tombol toggle jika belum ada
    if (!toggleBtn) {
      toggleBtn = document.createElement("button");
      toggleBtn.id = toggleSelector.replace("#", "") || "toggle-btn";
      toggleBtn.type = "button";
      document.body.appendChild(toggleBtn);
    }

    toggleBtn.setAttribute("aria-controls", container.id || "related-posts-container");
    toggleBtn.setAttribute("aria-expanded", "true");
    toggleBtn.setAttribute("aria-label", "Tutup artikel terkait");
    toggleBtn.innerText = "▲";
    toggleBtn.classList.remove("btn-hidden");

    const isCollapsed = () => container.classList.contains("collapsed");

    function updateBodyOffset() {
      if (isCollapsed()) {
        document.body.style.marginTop = "0px";
        return;
      }
      const h = Math.ceil(container.getBoundingClientRect().height);
      document.body.style.marginTop = `${h}px`;
    }

    // Resize & Mutation observer
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(updateBodyOffset);
      ro.observe(container);
    }
    const mo = new MutationObserver(updateBodyOffset);
    mo.observe(container, { childList: true, subtree: true, characterData: true });

    // initial collapsed state (cek localStorage)
    let collapsed = !!initialCollapsed;
    try {
      const v = localStorage.getItem(persistKey);
      if (v !== null) collapsed = v === "1";
    } catch (e) {}
    if (collapsed) container.classList.add("collapsed");
    else container.classList.remove("collapsed");

    function syncButton() {
      const open = !isCollapsed();
      toggleBtn.setAttribute("aria-expanded", String(open));
      toggleBtn.setAttribute("aria-label", open ? "Tutup artikel terkait" : "Buka artikel terkait");
      toggleBtn.innerText = open ? "▲" : "▼";
    }
    syncButton();
    updateBodyOffset();

    function setCollapsed(v) {
      if (v) container.classList.add("collapsed");
      else container.classList.remove("collapsed");

      try {
        if (v) localStorage.setItem(persistKey, "1");
        else localStorage.removeItem(persistKey);
      } catch (e) {}

      syncButton();
      updateBodyOffset();
    }

    function toggle() {
      setCollapsed(!isCollapsed());
    }

    toggleBtn.addEventListener("click", toggle);
    toggleBtn.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle();
      }
    });

    // ==== AUTO-HIDE BUTTON ====
    let hideTimer = null;
    function showBtn() {
      toggleBtn.classList.remove("btn-hidden");
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => toggleBtn.classList.add("btn-hidden"), autoHideDelay);
    }
    ["mousemove", "scroll", "keydown", "touchstart", "pointerdown", "focusin"].forEach((ev) => {
      document.addEventListener(ev, showBtn, { passive: true });
    });
    showBtn();

    window.addEventListener("resize", updateBodyOffset);

    // === Skrip untuk mengatur meta tags (Open Graph, Twitter) ===
    const pageTitle = document.title;
    const pageDesc =
      document.querySelector('meta[name="description"]')?.content || "Baca artikel menarik di sini.";
    const pageUrl = window.location.href;
    const pageImg =
      document.querySelector('meta[property="og:image"]')?.content || "/default-og.jpg";

    // Open Graph
    setMetaTag("og:title", pageTitle, true);
    setMetaTag("og:description", pageDesc, true);
    setMetaTag("og:url", pageUrl, true);
    setMetaTag("og:image", pageImg, true);
    setMetaTag("og:type", "article", true);

    // Twitter Card
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", pageTitle);
    setMetaTag("twitter:description", pageDesc);
    setMetaTag("twitter:image", pageImg);

    return {
      toggle,
      open: () => setCollapsed(false),
      close: () => setCollapsed(true),
      showButton: showBtn
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initRelated());
  } else {
    initRelated();
  }
})();
