// Fungsi hash sederhana dari string → angka
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Pilihan kombinasi gradient
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

// Buat map kategori → gradient random stabil (berdasarkan hash)
function generateGradientMap(categories) {
  const map = {};
  categories.forEach(cat => {
    const idx = hashString(cat) % gradients.length;
    map[cat] = gradients[idx];
  });
  return map;
}

// Terapkan gradient ke elemen dengan class .category-header
function applyGradients(categories) {
  const gradientMap = generateGradientMap(categories);
  document.querySelectorAll(".category-header").forEach(el => {
    const name = el.textContent.trim();
    if (gradientMap[name]) {
      // hanya pasang gradient kalau bukan dark mode
      if (!document.body.classList.contains("dark-mode")) {
        el.style.background = gradientMap[name];
      } else {
        el.style.background = "#222"; // fallback gelap
      }
    }
  });
}

// ---------------- DARK MODE TOGGLE ----------------
function initDarkMode(categories) {
  const darkSwitch = document.getElementById("darkSwitch");
  if (!darkSwitch) return;

  const savedMode = localStorage.getItem("darkMode");
  if (savedMode === "true") {
    document.body.classList.add("dark-mode");
    darkSwitch.checked = true;
  }

  // Terapkan gradient sesuai mode saat awal load
  applyGradients(categories);

  darkSwitch.addEventListener("change", () => {
    if (darkSwitch.checked) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
    }
    applyGradients(categories);
  });
}
