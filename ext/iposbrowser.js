// ============================================================
// IPOSBROWSER.JS — Versi Final dengan GeoIP (ipapi.co) & Mode Mobile
// ============================================================

// 1️⃣ Ikon Browser & OS
// ============================================================
// IKON BROWSER & OS — Versi Estetis (Glass Gradient + Smooth Shape)
// ============================================================

const browserIcons = {
  "Firefox": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48">
  <defs>
    <radialGradient id="ffGradient" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffb300"/>
      <stop offset="50%" stop-color="#ff5a00"/>
      <stop offset="100%" stop-color="#d500f9"/>
    </radialGradient>
  </defs>
  <circle cx="24" cy="24" r="22" fill="url(#ffGradient)" />
  <path fill="#fff" opacity="0.8" d="M34 14c-2-1-4-1-6 0-3 1-5 4-5 7 0 4 3 7 7 7 2 0 4-1 5-3 1-1 2-3 1-5-1-2-2-4-4-6z"/>
</svg>`,

  "Chrome": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48">
  <defs>
    <radialGradient id="chromeBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.1"/>
    </radialGradient>
  </defs>
  <circle cx="24" cy="24" r="22" fill="#4285F4"/>
  <path fill="#EA4335" d="M24 24L6 12A22 22 0 0 1 42 10L24 24z"/>
  <path fill="#FBBC05" d="M24 24l18-14a22 22 0 0 1 2 12H24z"/>
  <path fill="#34A853" d="M24 24H2a22 22 0 0 0 22 22V24z"/>
  <circle cx="24" cy="24" r="7" fill="#fff"/>
  <circle cx="24" cy="24" r="7" fill="url(#chromeBg)"/>
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
  <path fill="#fff" opacity="0.85" d="M14 24c0 6 4 10 10 10 3 0 5-2 5-4 0-3-4-3-7-3-3 0-6-1-8-3z"/>
</svg>`,

  "Safari": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48">
  <defs>
    <radialGradient id="safariGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1e90ff"/>
      <stop offset="100%" stop-color="#0077b6"/>
    </radialGradient>
  </defs>
  <circle cx="24" cy="24" r="22" fill="url(#safariGrad)" />
  <polygon points="24,8 28,24 24,40 20,24" fill="#fff" opacity="0.8"/>
  <circle cx="24" cy="24" r="5" fill="#ff595e" opacity="0.7"/>
</svg>`,

  "Unknown": `
<svg class="icon-hover responsive-icon" viewBox="0 0 24 24">
  <defs>
    <linearGradient id="unkGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#bbb"/>
      <stop offset="100%" stop-color="#666"/>
    </linearGradient>
  </defs>
  <circle cx="12" cy="12" r="10" fill="url(#unkGrad)" />
  <text x="12" y="16" font-size="12" text-anchor="middle" fill="#fff" font-family="monospace">?</text>
</svg>`
};

const osIcons = {
  "Windows": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="winGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0078D7"/>
      <stop offset="100%" stop-color="#00A4EF"/>
    </linearGradient>
  </defs>
  <rect x="2" y="6" width="20" height="16" rx="2" fill="url(#winGrad)" />
  <rect x="2" y="26" width="20" height="16" rx="2" fill="url(#winGrad)" />
  <rect x="26" y="6" width="20" height="16" rx="2" fill="#00A4EF" />
  <rect x="26" y="26" width="20" height="16" rx="2" fill="#00A4EF" />
</svg>`,

  "macOS": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48">
  <defs>
    <radialGradient id="macGrad" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#333"/>
      <stop offset="100%" stop-color="#000"/>
    </radialGradient>
  </defs>
  <circle cx="24" cy="24" r="22" fill="url(#macGrad)" />
  <path fill="#fff" d="M30 10c-2 0-4 1-5 3-1 2-1 4 1 6 1 1 3 2 5 2 2 0 4-1 5-2 1-2 1-4-1-6-1-2-3-3-5-3z"/>
</svg>`,

  "Linux": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="linuxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFD600"/>
      <stop offset="100%" stop-color="#FDD835"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="22" fill="url(#linuxGrad)" />
  <circle cx="20" cy="18" r="3" fill="#fff"/>
  <circle cx="28" cy="18" r="3" fill="#fff"/>
  <path d="M18 22h12v10c-4 2-8 2-12 0z" fill="#000"/>
</svg>`,

  "Android": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="androidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3DDC84"/>
      <stop offset="100%" stop-color="#00BFA5"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="28" height="28" rx="8" fill="url(#androidGrad)" />
  <circle cx="18" cy="20" r="2" fill="#fff"/>
  <circle cx="30" cy="20" r="2" fill="#fff"/>
</svg>`,

  "iOS": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="iosGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#111"/>
      <stop offset="100%" stop-color="#444"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="22" fill="url(#iosGrad)" />
  <path fill="#fff" d="M24 14c-4 0-7 3-7 7 0 3 2 6 5 6 2 0 3-1 4-2 1 1 2 2 4 2 3 0 5-3 5-6 0-4-3-7-7-7z"/>
</svg>`,

  "Unknown": `
<svg class="icon-hover responsive-icon" viewBox="0 0 24 24">
  <defs>
    <linearGradient id="unkOsGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#999"/>
      <stop offset="100%" stop-color="#666"/>
    </linearGradient>
  </defs>
  <circle cx="12" cy="12" r="10" fill="url(#unkOsGrad)" />
  <text x="12" y="16" font-size="12" text-anchor="middle" fill="#fff" font-family="monospace">?</text>
</svg>`
};


// 2️⃣ Deteksi browser dan OS
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

// 3️⃣ Ambil info IP & lokasi (tanpa API key)
async function fetchGeoIP() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("Gagal ambil GeoIP");
    const data = await res.json();
    return {
      ip: data.ip,
      city: data.city,
      country: data.country_name,
      countryCode: data.country_code
    };
  } catch (err) {
    console.warn("GeoIP gagal:", err);
    return null;
  }
}

// 4️⃣ Tampilkan di halaman
document.addEventListener("DOMContentLoaded", async () => {
  const browser = detectBrowser();
  const os = detectOS();
  const geo = await fetchGeoIP();

  const infoBox = document.createElement("div");
  infoBox.id = "ipos-browser-info";

  const flag = geo?.countryCode
    ? `<img class="geo-flag" src="https://flagcdn.com/24x18/${geo.countryCode.toLowerCase()}.png" alt="${geo.country}" />`
    : "";

  infoBox.innerHTML = `
    <span class="icon browser">${browserIcons[browser]}</span>
    <span class="icon os">${osIcons[os]}</span>
    <span class="info-text">${browser} di ${os}</span>
    ${geo ? `
      <span class="geo-info">
        ${geo.ip} • ${geo.city}, ${geo.country} ${flag}
      </span>` : ""}
  `;

  const feedLink = document.getElementById("feed-link");
  if (feedLink && feedLink.parentNode) {
    feedLink.parentNode.insertBefore(infoBox, feedLink);
  }
});

// 5️⃣ CSS
const style = document.createElement("style");
style.textContent = `
#ipos-browser-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-color, #555);
}
.geo-info { opacity: 0.85; }
.geo-flag {
  width: 20px;
  height: auto;
  margin-left: 4px;
  border-radius: 2px;
}
.icon-hover {
  transition: transform 0.4s ease, filter 0.4s ease, box-shadow 0.4s ease;
  cursor: pointer;
}
.icon-hover:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 0 5px rgba(255,255,255,0.3));
}
@media (prefers-color-scheme: dark) {
  .icon-hover { filter: brightness(1.1) contrast(1.05); }
  .icon-hover:hover { filter: drop-shadow(0 0 8px rgba(0,255,255,0.4)); }
}
.responsive-icon { width: 24px; height: 24px; }
@media (max-width: 480px) {
  #ipos-browser-info { display: none !important; }
}
`;
document.head.appendChild(style);

