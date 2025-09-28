// ===== Perbaikan gradient + dark-mode =====

// get clean category name from .category-header element (ignore .badge text)
function getHeaderName(el) {
  if (!el) return "";
  const badge = el.querySelector && el.querySelector('.badge');
  if (badge) {
    return el.textContent.replace(badge.textContent, '').trim();
  }
  // fallback: take first non-empty text node
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent.trim();
      if (t) return t;
    }
  }
  return el.textContent.trim();
}

// simple hash function
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const gradients = [
  "linear-gradient(90deg, #FF4500, #FF7F50)",
  "linear-gradient(90deg, #FFA500, #FFD700)",
  "linear-gradient(90deg, #2E8B57, #3CB371)",
  "linear-gradient(90deg, #8A2BE2, #9370DB)",
  "linear-gradient(90deg, #1E90FF, #4682B4)",
  "linear-gradient(90deg, #2F4F4F, #708090)",
  "linear-gradient(90deg, #696969, #A9A9A9)",
  "linear-gradient(90deg, #ff7e5f, #feb47b)",
  "linear-gradient(90deg, #00c6ff, #0072ff)"
];

function generateGradientMap(categories) {
  const map = {};
  const rotation = Date.now() % gradients.length; // offset rotasi
  categories.forEach(cat => {
    const idx = (hashString(cat) + rotation) % gradients.length;
    map[cat] = gradients[idx];
  });
  return map;
}

function applyGradients(categories) {
  const gradientMap = generateGradientMap(categories);
  document.querySelectorAll(".category-header").forEach(el => {
    const name = el.textContent.trim();
    if (gradientMap[name]) {
      if (!document.body.classList.contains("dark-mode")) {
        el.style.background = gradientMap[name];
        el.style.backgroundSize = "200% 200%";   // untuk animasi
        el.style.animation = "gradientMove 10s ease infinite"; 
      } else {
        el.style.background = "#222"; // fallback gelap
        el.style.animation = "none";
      }
    }
  });
}

// CSS animasi (inject sekali saja)
const style = document.createElement("style");
style.textContent = `
@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;
document.head.appendChild(style);

// Init dark-mode and bind switch (but do not BLOCK applying gradients if switch missing)
function initDarkMode(categories) {
  const darkSwitch = document.getElementById('darkSwitch');

  // If user saved a preference, respect it; otherwise use system preference
  const saved = localStorage.getItem('darkMode');
  if (saved === 'true') {
    document.body.classList.add('dark-mode');
    if (darkSwitch) darkSwitch.checked = true;
  } else if (saved === 'false') {
    document.body.classList.remove('dark-mode');
    if (darkSwitch) darkSwitch.checked = false;
  } else {
    // no saved preference → follow system
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark-mode');
      if (darkSwitch) darkSwitch.checked = true;
    } else {
      document.body.classList.remove('dark-mode');
      if (darkSwitch) darkSwitch.checked = false;
    }
  }

  // always apply gradients (even when no switch present)
  applyGradients(categories);

  // wire toggle if exists
  if (darkSwitch) {
    darkSwitch.addEventListener('change', () => {
      if (darkSwitch.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
      }
      applyGradients(categories);
    });
  }

  // Re-apply when TOC changes dynamically
  const target = document.getElementById('toc') || document.body;
  if (target) {
    const mo = new MutationObserver(() => {
      // small debounce
      clearTimeout(window._applyGradTimeout);
      window._applyGradTimeout = setTimeout(() => applyGradients(categories), 50);
    });
    mo.observe(target, { childList: true, subtree: true });
  }
}

// expose functions if needed
window.generateGradientMap = generateGradientMap;
window.applyGradients = applyGradients;
window.initDarkMode = initDarkMode;
