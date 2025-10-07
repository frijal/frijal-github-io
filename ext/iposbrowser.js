// ============================================================
// IPOSBROWSER.JS — UNIVERSAL VERSION
// Bisa digunakan di mana saja dengan <div id="iposbrowser"></div>
// ============================================================

// ========== 1️⃣ Ikon Browser ==========
const browserIcons = {
  "Firefox": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48">
  <defs>
    <radialGradient id="ffGrad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffb300"/>
      <stop offset="50%" stop-color="#ff5a00"/>
      <stop offset="100%" stop-color="#d500f9"/>
    </radialGradient>
  </defs>
  <circle cx="24" cy="24" r="22" fill="url(#ffGrad)" />
  <path fill="#fff" opacity="0.85" d="M33 14c-2-1-4-1-6 0-3 1-5 4-5 7 0 4 3 7 7 7 2 0 4-1 5-3 1-1 2-3 1-5-1-2-2-4-4-6z"/>
</svg>`,

  "Chrome": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="22" fill="#4285F4"/>
  <path fill="#EA4335" d="M24 24L6 12A22 22 0 0 1 42 10L24 24z"/>
  <path fill="#FBBC05" d="M24 24l18-14a22 22 0 0 1 2 12H24z"/>
  <path fill="#34A853" d="M24 24H2a22 22 0 0 0 22 22V24z"/>
  <circle cx="24" cy="24" r="7" fill="#fff" opacity="0.9"/>
</svg>`,

  "Edge": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00C6FF"/>
      <stop offset="100%" stop-color="#0072FF"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="22" fill="url(#edgeGrad)" />
  <path fill="#fff" opacity="0.9" d="M14 24c0 6 4 10 10 10 3 0 5-2 5-4 0-3-4-3-7-3-3 0-6-1-8-3z"/>
</svg>`,

  "Safari": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="safariGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e90ff"/>
      <stop offset="100%" stop-color="#0077b6"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="22" fill="url(#safariGrad)" />
  <polygon points="24,8 28,24 24,40 20,24" fill="#fff" opacity="0.85"/>
</svg>`,

  "Unknown": `
<svg class="icon-hover responsive-icon" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" fill="#888" />
  <text x="12" y="16" font-size="12" text-anchor="middle" fill="#fff" font-family="monospace">?</text>
</svg>`
};

// ========== 2️⃣ Ikon OS ==========
const osIcons = {
  "Windows": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48">
  <rect x="2" y="6" width="20" height="16" fill="#0078D7"/>
  <rect x="2" y="26" width="20" height="16" fill="#0078D7"/>
  <rect x="26" y="6" width="20" height="16" fill="#00A4EF"/>
  <rect x="26" y="26" width="20" height="16" fill="#00A4EF"/>
</svg>`,

  "macOS": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="22" fill="#000"/>
  <path fill="#fff" d="M30 10c-2 0-4 1-5 3-1 2-1 4 1 6 1 1 3 2 5 2 2 0 4-1 5-2 1-2 1-4-1-6-1-2-3-3-5-3z"/>
</svg>`,

  "Linux": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="22" fill="#FFD600"/>
  <circle cx="20" cy="18" r="3" fill="#fff"/>
  <circle cx="28" cy="18" r="3" fill="#fff"/>
  <path d="M18 22h12v10c-4 2-8 2-12 0z" fill="#000"/>
</svg>`,

  "Android": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48">
  <rect x="10" y="10" width="28" height="28" rx="8" fill="#3DDC84" />
  <circle cx="18" cy="20" r="2" fill="#fff"/>
  <circle cx="30" cy="20" r="2" fill="#fff"/>
</svg>`,

  "iOS": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="22" fill="#111"/>
  <path fill="#fff" d="M24 14c-4 0-7 3-7 7 0 3 2 6 5 6 2 0 3-1 4-2 1 1 2 2 4 2 3 0 5-3 5-6 0-4-3-7-7-7z"/>
</svg>`,

  "Unknown": `
<svg class="icon-hover responsive-icon" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" fill="#777" />
  <text x="12" y="16" font-size="12" text-anchor="middle" fill="#fff" font-family="monospace">?</text>
</svg>`
};

// ========== 3️⃣ Deteksi Browser & OS ==========
function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown";
}
function detectOS() {
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  return "Unknown";
}

// ========== 4️⃣ Fetch GeoIP ==========
async function fetchGeoIP() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return {
      ip: data.ip,
      city: data.city,
      country: data.country_name,
      code: data.country_code
    };
  } catch {
    return null;
  }
}

// ========== 5️⃣ Render ke target div ==========
document.addEventListener("DOMContentLoaded", async () => {
  const target = document.getElementById("iposbrowser");
  if (!target) return; // hanya tampil jika ada div-nya

  const browser = detectBrowser();
  const os = detectOS();
  const geo = await fetchGeoIP();

  const flag = geo?.code
    ? `<img class="geo-flag" src="https://flagcdn.com/24x18/${geo.code.toLowerCase()}.png" alt="${geo.country}" />`
    : "";

  target.innerHTML = `
    <div id="ipos-browser-info">
      <div class="browser-block">
        <span class="icon browser">${browserIcons[browser]}</span>
        <span class="text">${browser}</span>
      </div>
      <div class="os-block">
        <span class="icon os">${osIcons[os]}</span>
        <span class="text">${os}</span>
      </div>
      <div class="geo-block">
        ${flag}
        ${geo ? `<span class="text">${geo.city ? geo.city + ' - ' : ''}${geo.country} • ${geo.ip}</span>` : ""}
      </div>
    </div>
  `;
});

// ========== 6️⃣ Style Adaptif ==========
const style = document.createElement("style");
style.textContent = `
#ipos-browser-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-color, currentColor);
  background: none;
  border: none;
  border-radius: 0;
  padding: 4px 8px;
  margin: 0 auto;
  transition: color 0.3s ease-in-out;
}

body.dark-mode #ipos-browser-info { color: #ddd; }
body:not(.dark-mode) #ipos-browser-info { color: #222; }

#ipos-browser-info .browser-block,
#ipos-browser-info .os-block,
#ipos-browser-info .geo-block {
  display: flex;
  align-items: center;
  gap: 6px;
}

#ipos-browser-info .geo-flag {
  width: 20px;
  height: auto;
  margin-left: 4px;
  border-radius: 2px;
  vertical-align: middle;
}

#ipos-browser-info .icon svg {
  width: 22px;
  height: 22px;
  transition: transform 0.3s ease, filter 0.3s ease;
}
#ipos-browser-info .icon svg:hover {
  transform: scale(1.15) rotate(3deg);
  filter: drop-shadow(0 0 5px rgba(88,166,255,0.35));
}

@media (max-width: 600px) {
  #ipos-browser-info { display: none !important; }
}
`;
document.head.appendChild(style);

