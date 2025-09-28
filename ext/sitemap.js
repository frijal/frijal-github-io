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
  (categories || []).forEach(cat => {
    map[cat] = gradients[hashString(cat) % gradients.length];
  });
  return map;
}

function isDarkModeActive() {
  const saved = localStorage.getItem('darkMode');
  if (saved === 'true') return true;
  if (saved === 'false') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyGradients(categories) {
  const gradientMap = generateGradientMap(categories || []);
  const headers = document.querySelectorAll('.category-header');
  headers.forEach(el => {
    const name = getHeaderName(el);
    // try exact match first
    let key = Object.keys(gradientMap).find(k => k.trim() === name);
    // try fuzzy: key contains name or name contains key
    if (!key) {
      key = Object.keys(gradientMap).find(k => k.includes(name) || name.includes(k));
    }
    const gradient = key ? gradientMap[key] : null;

    // respect manual dark-mode and prefered dark
    if (isDarkModeActive()) {
      // keep dark fallback (avoid bright gradients in dark mode)
      el.style.background = el.dataset._origBg || "#222";
    } else {
      if (gradient) {
        el.style.background = gradient;
      } else {
        // fallback: generate random inline gradient (keadaan langka)
        const a = '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
        const b = '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
        el.style.background = `linear-gradient(90deg, ${a}, ${b})`;
      }
    }
    // mark applied so observer can skip or check later
    el.dataset._grad_applied = "1";
  });
}

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
