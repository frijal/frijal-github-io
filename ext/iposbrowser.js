// ============================================================
// IPOSBROWSER.JS — VERSI DIPERIKSA ULANG DAN DIPERBAIKI
// ============================================================

function detectBrowser() {
    const ua = navigator.userAgent;
    if (/(firefox|fxios)/i.test(ua)) return "Firefox";
    if (/edg/i.test(ua)) return "Edge";
    if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) return "Chrome";
    if (/safari/i.test(ua) && !/chrome|crios|fxios|edg/i.test(ua)) return "Safari";
    return "Unknown";
}

function detectOS() {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return "Android";
    if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    return "Unknown";
}


async function fetchGeoIP() {
    let ipAddress = null;

    try {
        // Langkah 1: Coba dapatkan IPv4
        try {
            const ip4Res = await fetch('https://api.ipify.org?format=json');
            if (!ip4Res.ok) throw new Error('API IPv4 tidak merespons');
            const ip4Data = await ip4Res.json();
            ipAddress = ip4Data.ip;
            console.log("Deteksi berhasil menggunakan IPv4:", ipAddress);
        } catch (ipv4Error) {
            console.warn("gagal mendapatkan IPv4, mencoba fallback ke IPv6...", ipv4Error);
            
            // Langkah 2: Jika IPv4 gagal, coba dapatkan IPv6
            const ip6Res = await fetch('https://api64.ipify.org?format=json');
            if (!ip6Res.ok) throw new Error('API IPv6 juga tidak merespons');
            const ip6Data = await ip6Res.json();
            ipAddress = ip6Data.ip;
            console.log("Deteksi berhasil menggunakan IPv6:", ipAddress);
        }

        // Langkah 3: Jika salah satu IP berhasil didapat, cari lokasinya
        const locRes = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        if (!locRes.ok) throw new Error('gagal mengambil data lokasi');
        const locData = await locRes.json();
        
        return {
            ip: ipAddress,
            city: locData.city,
            country: locData.country_name,
            code: locData.country_code
        };

    } catch (err) {
        console.error("GeoIP Error Final:", err);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
  const target = document.getElementById("iposbrowser");
  if (!target) return;

  const browser = detectBrowser();
  const os = detectOS();
  const geo = await fetchGeoIP();

  const browserHTML = `<div class="info-item">${browserIcons[browser]}</span></div>`;
  const osHTML = `<div class="info-item">${osIcons[os]}</span></div>`;
  
  let geoHTML = '<div class="info-item"><span>Lokasi tidak diketahui</span></div>';
  if (geo) {
    const flag = geo.code ? `<img class="geo-flag" src="https://flagcdn.com/24x18/${geo.code.toLowerCase()}.png" alt="${geo.country}" />` : "";
    geoHTML = `<div class="geo-block">${flag}${geo.city ? geo.city + ' - ' : ''}${geo.country} • ${geo.ip}</span></div>`;
  }

  target.innerHTML = `
    <div id="ipos-browser-info">
      <div class="browser-block"><span class="icon browser">${browserIcons[browser]}</span><span class="text">${browser}</span></div>
      <div class="os-block"><span class="icon os">${osIcons[os]}</span><span class="text">${os}</span></div>
      ${geoHTML}
    </div>
  `;
});

const style = document.createElement("style");
style.textContent = `
/* ================================
   Container Info
================================ */
#ipos-browser-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  font-size: 0.9rem;
  color: var(--ipos-text, #222);
  padding: 4px 8px;
  margin: 0 auto;
  transition: color 0.3s ease-in-out;
}

@media (prefers-color-scheme: dark) {
  #ipos-browser-info {
    color: var(--ipos-text-dark, #eee);
  }
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

/* ================================
   Ikon + Animasi Hover
================================ */
#ipos-browser-info .icon svg {
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: transform 0.3s ease, filter 0.3s ease;
}

/* Hover: kombinasi scale + rotate + glow + pulse */
#ipos-browser-info .icon svg:hover {
  transform: scale(1.15) rotate(8deg);
  filter: drop-shadow(0 0 6px rgba(88,166,255,0.45));
  animation: pulse 0.6s ease-in-out;
}

/* Teks lokasi dan deskripsi */
#ipos-browser-info .info-text {
  font-weight: 500;
  font-size: 0.9rem;
  line-height: 1.2;
}

/* Flex per ikon + teks */
#ipos-browser-info .browser,
#ipos-browser-info .os {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Pulse keyframes */
@keyframes pulse {
  0%   { transform: scale(1) rotate(0deg); }
  50%  { transform: scale(1.2) rotate(8deg); }
  100% { transform: scale(1.15) rotate(8deg); }
}

/* Light mode: shadow lebih gelap */
body:not(.dark-mode) #ipos-browser-info .icon svg {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

/* Dark mode: shadow lebih terang */
body.dark-mode #ipos-browser-info .icon svg {
  filter: drop-shadow(0 2px 4px rgba(255,255,255,0.2));
}

@media (max-width: 600px) {
  #ipos-browser-info { display: none !important; }
}
`;
document.head.appendChild(style);

// ============================================================
// Ikon Browser & OS
// ============================================================

const browserIcons = {
  "Firefox": `
<svg class="icon responsive-icon" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="url(#firefoxGradient)"/>
  <defs>
    <radialGradient id="firefoxGradient" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffb300"/>
      <stop offset="50%" stop-color="#ff5a00"/>
      <stop offset="100%" stop-color="#d500f9"/>
    </radialGradient>
  </defs>
  <path d="M44 18c-6-4-14 0-16 7-2 7 3 14 10 15 6 1 12-4 12-10 0-5-2-9-6-12z" fill="#fff" opacity="0.9"/>
</svg>`,
  "Chrome": `
<svg class="icon responsive-icon" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#fff"/>
  <path fill="#EA4335" d="M32 32L12 12a30 30 0 0 1 40-2L32 32z"/>
  <path fill="#FBBC05" d="M32 32h30a30 30 0 0 0-10-22L32 32z"/>
  <path fill="#34A853" d="M32 32L12 52a30 30 0 0 0 40-2L32 32z"/>
  <circle cx="32" cy="32" r="10" fill="#4285F4"/>
</svg>`,
  "Edge": `
<svg class="icon responsive-icon" viewBox="0 0 64 64">
  <defs>
    <radialGradient id="edgeGradient" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#00C6FF"/>
      <stop offset="100%" stop-color="#0078D7"/>
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="30" fill="url(#edgeGradient)"/>
  <path d="M20 34c2 8 10 12 18 10 6-2 8-8 4-12-3-3-8-3-12-2-4 1-7 2-10 4z" fill="#fff" opacity="0.9"/>
</svg>`,
  "Safari": `
<svg class="icon responsive-icon" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="url(#safariGradient)"/>
  <defs>
    <radialGradient id="safariGradient" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#40a9ff"/>
      <stop offset="100%" stop-color="#0077b6"/>
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="20" fill="none" stroke="#fff" stroke-width="2"/>
  <polygon points="32,14 38,32 32,50 26,32" fill="#fff"/>
</svg>`,
  "Unknown": `
<svg class="icon responsive-icon" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="20" fill="#bbb"/>
  <text x="24" y="29" font-size="16" text-anchor="middle" fill="#fff" font-family="monospace">?</text>
</svg>`
};

const browserIcons = {
  "Firefox": `
<svg class="icon responsive-icon" viewBox="0 0 100 24">
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-size="14" font-family="monospace" fill="currentColor">
    firefox
  </text>
</svg>`,
  "Chrome": `
<svg class="icon responsive-icon" viewBox="0 0 100 24">
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-size="14" font-family="monospace" fill="currentColor">
    chrome
  </text>
</svg>`,
  "Edge": `
<svg class="icon responsive-icon" viewBox="0 0 100 24">
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-size="14" font-family="monospace" fill="currentColor">
    edge
  </text>
</svg>`,
  "Safari": `
<svg class="icon responsive-icon" viewBox="0 0 100 24">
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-size="14" font-family="monospace" fill="currentColor">
    safari
  </text>
</svg>`,
  "Unknown": `
<svg class="icon responsive-icon" viewBox="0 0 100 24">
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-size="14" font-family="monospace" fill="currentColor">
    unknown
  </text>
</svg>`
};

const osIcons = {
  "Windows": `
<svg class="icon responsive-icon" viewBox="0 0 100 24">
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-size="14" font-family="monospace" fill="currentColor">
    windows
  </text>
</svg>`,
  "macOS": `
<svg class="icon responsive-icon" viewBox="0 0 100 24">
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-size="14" font-family="monospace" fill="currentColor">
    macos
  </text>
</svg>`,
  "Linux": `
<svg class="icon responsive-icon" viewBox="0 0 100 24">
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-size="14" font-family="monospace" fill="currentColor">
    linux
  </text>
</svg>`,
  "Android": `
<svg class="icon responsive-icon" viewBox="0 0 100 24">
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-size="14" font-family="monospace" fill="currentColor">
    android
  </text>
</svg>`,
  "iOS": `
<svg class="icon responsive-icon" viewBox="0 0 100 24">
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-size="14" font-family="monospace" fill="currentColor">
    ios
  </text>
</svg>`,
  "Unknown": `
<svg class="icon responsive-icon" viewBox="0 0 100 24">
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-size="14" font-family="monospace" fill="currentColor">
    unknown
  </text>
</svg>`
};

