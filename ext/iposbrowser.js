// ============================================================
// IPOSBROWSER.JS — Deteksi Browser & OS + Ikon Adaptif Modern
// ============================================================

// ---------------------------
// 1️⃣ IKON RESMI BERWARNA
// ---------------------------
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
</svg>`,
  "Chrome": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="22" fill="#DB4437"/>
  <path fill="#0F9D58" d="M24 24h22A22 22 0 0 1 2 24h22z"/>
  <path fill="#F4B400" d="M24 24L13 4a22 22 0 0 1 35 20H24z"/>
  <circle cx="24" cy="24" r="7" fill="#4285F4"/>
</svg>`,
  "Edge": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <path fill="#0A84FF" d="M24 2a22 22 0 1 1 0 44 22 22 0 0 1 0-44z"/>
  <path fill="#00C6FF" d="M14 24c0 6 4 10 10 10 3 0 5-2 5-4 0-3-4-3-7-3-3 0-6-1-8-3z"/>
</svg>`,
  "Safari": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="22" fill="#0A84FF"/>
  <polygon points="24,10 28,24 24,38 20,24" fill="#fff"/>
</svg>`,
  "Unknown": `
<svg class="icon-hover responsive-icon" viewBox="0 0 24 24" fill="gray" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
           10-4.48 10-10S17.52 2 12 2zm-1 13h2v2h-2zm0-8h2v6h-2z"/>
</svg>`
};

const osIcons = {
  "Windows": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="6" width="20" height="16" fill="#0078D7"/>
  <rect x="2" y="26" width="20" height="16" fill="#0078D7"/>
  <rect x="26" y="6" width="20" height="16" fill="#00A4EF"/>
  <rect x="26" y="26" width="20" height="16" fill="#00A4EF"/>
</svg>`,
  "macOS": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="22" fill="#000"/>
  <path fill="#fff" d="M30 10c-2 0-4 1-5 3-1 2-1 4 1 6 1 1 3 2 5 2 2 0 4-1 5-2 1-2 1-4-1-6-1-2-3-3-5-3z"/>
</svg>`,
  "Linux": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="22" fill="#FCC624"/>
  <path fill="#000" d="M17 14h14v20H17z"/>
  <circle cx="20" cy="18" r="2" fill="#fff"/>
  <circle cx="28" cy="18" r="2" fill="#fff"/>
</svg>`,
  "Android": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="28" height="28" rx="6" fill="#3DDC84"/>
  <circle cx="18" cy="20" r="2" fill="#fff"/>
  <circle cx="30" cy="20" r="2" fill="#fff"/>
</svg>`,
  "iOS": `
<svg class="icon-hover responsive-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <path fill="#000" d="M24 2C12 2 4 10 4 22c0 8 4 14 9 18s8 4 11 4c5 0 9-2 12-5 3-3 4-7 4-11 0-8-5-14-10-16-3-2-6-2-6-2z"/>
</svg>`,
  "Unknown": `
<svg class="icon-hover responsive-icon" viewBox="0 0 24 24" fill="gray" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
           10-4.48 10-10S17.52 2 12 2zm-1 13h2v2h-2zm0-8h2v6h-2z"/>
</svg>`
};

// ---------------------------
// 2️⃣ DETEKSI BROWSER & OS
// ---------------------------
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

// ---------------------------
// 3️⃣ TAMBAHKAN KE HALAMAN
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  const browser = detectBrowser();
  const os = detectOS();

  const infoBox = document.createElement("div");
  infoBox.id = "ipos-browser-info";
  infoBox.innerHTML = `
    <span class="icon browser">${browserIcons[browser]}</span>
    <span class="icon os">${osIcons[os]}</span>
    <span class="info-text">${browser} di ${os}</span>
  `;

  // sisipkan di header sticky sitemap
  const header = document.querySelector(".sticky-controls-content");
  if (header) header.appendChild(infoBox);
});

// ---------------------------
// 4️⃣ CSS TAMBAHAN
// ---------------------------
const style = document.createElement("style");
style.textContent = `
#ipos-browser-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 0.9rem;
  color: var(--text-color, #555);
}
.icon-hover {
  transition: transform 0.4s ease, filter 0.4s ease, box-shadow 0.4s ease;
  cursor: pointer;
  border-radius: 8px;
}
.icon-hover:hover {
  transform: scale(1.15) rotate(3deg);
  filter: drop-shadow(0 0 6px rgba(255,255,255,0.4));
}
@media (prefers-color-scheme: dark) {
  .icon-hover {
    filter: brightness(1.1) contrast(1.05);
  }
  .icon-hover:hover {
    filter: drop-shadow(0 0 8px rgba(0,255,255,0.4));
  }
}
.responsive-icon { width: 24px; height: 24px; }
@media (max-width: 600px) {
  .responsive-icon { width: 16px; height: 16px; }
  #ipos-browser-info { font-size: 0.8rem; }
}
`;
document.head.appendChild(style);

