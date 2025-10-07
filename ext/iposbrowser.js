// Aset Ikon SVG yang lebih baik dan dapat diwarnai dengan CSS
const browserIcons = {
    "Firefox": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.49 5.85c.18.81-.31 1.83-1.12 2.37-1.16.78-2.61.94-3.59.62-.23-.07-.37-.11-.37-.11s.14.04.37.11c1.86.53 3.32-.73 3.79-1.92.51-1.28.1-2.62-.87-3.41-.9-.73-2.2-1.04-3.32-1.02-.3 0-.5.17-.43.44.11.41.29.83.47 1.23.29.64.66 1.25 1.1 1.83.82 1.1 2.02 1.63 3.58 1.86zM12 14.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>',
    "Chrome": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>',
    "Edge": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4.5-9.5c0-2.48 2.02-4.5 4.5-4.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5-4.5-2.02-4.5-4.5z"/></svg>',
    "Safari": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9l10 5-5-10-5 5z"/></svg>',
    "Unknown": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>'
};
const osIcons = {
    "Windows": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2 3h9v9H2zm11 0h9v9h-9zM2 12h9v9H2zm11 0h9v9h-9z"/></svg>',
    "macOS": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
    "Linux": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm4 0h-2v-2h2v2zm-4-4H9V8h2v4zm4 0h-2V8h2v4z"/></svg>',
    "Android": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h12v20H6zM4 4h2v16H4zm16 0h-2v16h2z"/></svg>',
    "iOS": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10v20H7zM5 4h2v16H5zm14 0h-2v16h2z"/></svg>',
    "Unknown": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>'
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
    
    html += `<div class="info-item"><span>${locData.city}, ${locData.country_name} ${flagEmoji}</span></div>`;

  } catch (err) {
    console.error("Gagal memuat info lokasi:", err);
    html += `<div class="info-item"><span>Lokasi tidak terdeteksi</span></div>`;
  }
  
  infoContainer.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", renderClientInfo);
