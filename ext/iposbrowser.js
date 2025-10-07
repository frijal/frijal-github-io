// ============================================================
// ICON RESMI BERWARNA + DARK/LIGHT MODE + HOVER + SKALA RESPONSIF
// ============================================================

const browserIcons = {
  "Firefox": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="firefoxGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF9500"/>
      <stop offset="100%" stop-color="#FF2D55"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="22" fill="url(#firefoxGradient)" />
  <path fill="#fff" d="M33 14c-2-1-4-1-6 0-3 1-5 4-5 7 0 4 3 7 7 7 2 0 4-1 5-3 1-1 2-3 1-5-1-2-2-4-4-6z"/>
</svg>
  `,
  "Chrome": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="22" fill="#DB4437"/>
  <path fill="#0F9D58" d="M24 24h22A22 22 0 0 1 2 24h22z"/>
  <path fill="#F4B400" d="M24 24L13 4a22 22 0 0 1 35 20H24z"/>
  <circle cx="24" cy="24" r="7" fill="#4285F4"/>
</svg>
  `,
  "Edge": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <path fill="#0A84FF" d="M24 2a22 22 0 1 1 0 44 22 22 0 0 1 0-44z"/>
  <path fill="#00C6FF" d="M14 24c0 6 4 10 10 10 3 0 5-2 5-4 0-3-4-3-7-3-3 0-6-1-8-3z"/>
</svg>
  `,
  "Safari": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="22" fill="#0A84FF"/>
  <polygon points="24,10 28,24 24,38 20,24" fill="#fff"/>
</svg>
  `,
  "Unknown": `
<svg class="icon-hover responsive-icon" viewBox="0 0 24 24" fill="gray" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
           10-4.48 10-10S17.52 2 12 2zm-1 13h2v2h-2zm0-8h2v6h-2z"/>
</svg>
  `
};

const osIcons = {
  "Windows": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="6" width="20" height="16" fill="#0078D7"/>
  <rect x="2" y="26" width="20" height="16" fill="#0078D7"/>
  <rect x="26" y="6" width="20" height="16" fill="#00A4EF"/>
  <rect x="26" y="26" width="20" height="16" fill="#00A4EF"/>
</svg>
  `,
  "macOS": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="22" fill="#000"/>
  <path fill="#fff" d="M30 10c-2 0-4 1-5 3-1 2-1 4 1 6 1 1 3 2 5 2 2 0 4-1 5-2 1-2 1-4-1-6-1-2-3-3-5-3z"/>
</svg>
  `,
  "Linux": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="22" fill="#FCC624"/>
  <path fill="#000" d="M17 14h14v20H17z"/>
  <circle cx="20" cy="18" r="2" fill="#fff"/>
  <circle cx="28" cy="18" r="2" fill="#fff"/>
</svg>
  `,
  "Android": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="28" height="28" rx="6" fill="#3DDC84"/>
  <circle cx="18" cy="20" r="2" fill="#fff"/>
  <circle cx="30" cy="20" r="2" fill="#fff"/>
</svg>
  `,
  "iOS": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <path fill="#000" d="M24 2C12 2 4 10 4 22c0 8 4 14 9 18s8 4 11 4c5 0 9-2 12-5 3-3 4-7 4-11 0-8-5-14-10-16-3-2-6-2-6-2z"/>
</svg>
  `,
  "Unknown": `
<svg class="icon-hover responsive-icon" viewBox="0 0 24 24" fill="gray" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
           10-4.48 10-10S17.52 2 12 2zm-1 13h2v2h-2zm0-8h2v6h-2z"/>
</svg>
  `
};



// --- Deteksi Browser ---
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let name = "Unknown";
  if (/(firefox|fxios)/i.test(ua)) name = "Firefox";
  else if (/edg/i.test(ua)) name = "Edge";
  else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) name = "Chrome";
  else if (/safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua)) name = "Safari";
  return { name, icon: browserIcons[name] || browserIcons["Unknown"] };
}

// --- Deteksi OS ---
function getOSInfo() {
  const ua = navigator.userAgent.toLowerCase();
  let name = "Unknown";
  if (/android/.test(ua)) name = "Android";
  else if (/iphone|ipad|ipod/.test(ua)) name = "iOS";
  else if (/win/.test(ua)) name = "Windows";
  else if (/mac/.test(ua)) name = "macOS";
  else if (/linux/.test(ua)) name = "Linux";
  return { name, icon: osIcons[name] || osIcons["Unknown"] };
}

// --- Render Info ke Halaman ---
async function renderClientInfo() {
  const infoContainer = document.getElementById("footerInfo");
  if (!infoContainer) return; // Keluar jika elemen tidak ditemukan

  const browser = getBrowserInfo();
  const os = getOSInfo();

  let html = `
    <div class="info-item">${browser.icon}<span>${browser.name}</span></div>
    <div class="info-item">${os.icon}<span>${os.name}</span></div>
  `;

  try {
    // 1. Ambil alamat IPv4 terlebih dahulu
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipRes.json();
    const ipv4 = ipData.ip;

    // 2. Gunakan IPv4 untuk mencari info lokasi
    const locRes = await fetch(`https://ipapi.co/${ipv4}/json/`);
    const locData = await locRes.json();

    const countryCode = (locData.country_code || "??").toUpperCase();
    const flagEmoji = countryCode.split("").map(c => String.fromCodePoint(c.charCodeAt(0) + 127397)).join("");
    
    html += `<div class="info-item"><span>${flagEmoji} ${locData.city}, ${locData.country_name}</span></div>`;

  } catch (err) {
    console.error("Gagal memuat info lokasi:", err);
    html += `<div class="info-item"><span>Lokasi tidak terdeteksi</span></div>`;
  }
  
  infoContainer.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", renderClientInfo);
