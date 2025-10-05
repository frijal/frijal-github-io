// --- Ikon SVG Inline ---
const browserIcons = {
  "Firefox": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="#FF7139" d="M12.9 6.2c0-1.8-1-3.2-2.5-4.2C9.4 1.2 8.3.9 7.2 1.3c-1.1.4-2 .8-2.9 1.4-.8.6-1.6 1.3-2.2 2-.5.8-.8 1.6-.8 2.5 0 2 1.2 3.5 3 4.6 1.8 1.1 4 1.7 6.4 1.7.3-.2.6-.5.9-.9.4-.4.8-1 1-1.7.3-.8.4-1.6.4-2.5 0-.4-.1-.8-.2-1.2z"/></svg>',
  "Chrome": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#EA4335"/><circle cx="8" cy="8" r="5.5" fill="#FBBC05"/><circle cx="8" cy="8" r="4" fill="#4285F4"/></svg>',
  "Edge": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#0078D7"/></svg>',
  "Safari": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#00ADEF"/><path fill="#fff" d="M8 4l1 4-4-1z"/></svg>',
  "Unknown": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#999"/><text x="8" y="11" font-size="8" text-anchor="middle" fill="#fff">?</text></svg>'
};

const osIcons = {
  "Windows": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="#00A4EF" d="M8.5 2.1L2.4 3.1 2 7.7l6.5-.8zM2.4 8l-.4 4.6 6.5-.8-.1-4.7zM9.1 7.1v6.8L14 13.1V8zM9.1 2.3v4.7L14 7V3.1z"/></svg>',
  "macOS": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#000"/></svg>',
  "Linux": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#000"/><circle cx="6" cy="6" r="1" fill="#fff"/><circle cx="10" cy="6" r="1" fill="#fff"/></svg>',
  "Unknown": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#999"/><text x="8" y="11" font-size="8" text-anchor="middle" fill="#fff">?</text></svg>'
};

const globeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#4CAF50"/><path fill="#fff" d="M8 3a5 5 0 010 10 5 5 0 010-10z"/></svg>';

// --- Deteksi Browser ---
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let name = "Unknown", version = "N/A";
  if (ua.includes("Firefox")) { name = "Firefox"; version = ua.match(/Firefox\/([\d.]+)/)[1]; }
  else if (ua.includes("Chrome") && !ua.includes("Edg")) { name = "Chrome"; version = ua.match(/Chrome\/([\d.]+)/)[1]; }
  else if (ua.includes("Edg")) { name = "Edge"; version = ua.match(/Edg\/([\d.]+)/)[1]; }
  else if (ua.includes("Safari")) { name = "Safari"; version = ua.match(/Version\/([\d.]+)/)[1]; }
  return { name, version, icon: browserIcons[name] || browserIcons["Unknown"] };
}

// --- Deteksi OS ---
function getOSInfo() {
  const platform = navigator.platform.toLowerCase();
  let name = "Unknown";
  if (platform.includes("win")) name = "Windows";
  else if (platform.includes("mac")) name = "macOS";
  else if (platform.includes("linux")) name = "Linux";
  return { name, icon: osIcons[name] || osIcons["Unknown"] };
}

// --- Render ke footer ---
function renderClientInfo() {
  const footer = document.getElementById("footerInfo");
  if (!footer) return;

  const browser = getBrowserInfo();
  const os = getOSInfo();

  fetch("https://api.ipify.org?format=json&ipv4")  
    .then(res => res.json())
    .then(data => {
      const countryCode = data.country_code.toUpperCase();
      const flagEmoji = countryCode.split("")
        .map(c => String.fromCodePoint(c.charCodeAt(0) + 127397))
        .join("");

      footer.innerHTML = `
        <div class="info-item">
          <span style="width:16px;height:16px;display:inline-block;">${browser.icon}</span> 
          <span>${browser.name} ${browser.version}</span>
        </div>
        <div class="info-item">
          <span style="width:16px;height:16px;display:inline-block;">${os.icon}</span> 
          <span>${os.name}</span>
        </div>
        <div class="info-item">
          <span style="width:16px;height:16px;display:inline-block;">${globeIcon}</span> 
          <span>${data.ip} (${data.city}, ${data.region}, ${data.country_name})</span> ${flagEmoji}
        </div>
      `;

      document.querySelectorAll(".info-item").forEach(el => {
        el.addEventListener("mouseenter", () => {
          el.style.transform = "scale(1.05)";
          el.style.color = "#007BFF";
        });
        el.addEventListener("mouseleave", () => {
          el.style.transform = "scale(1)";
          el.style.color = "inherit";
        });
      });
    })
    .catch(err => {
      footer.textContent = "Gagal memuat info IP.";
      console.error("IP fetch error:", err);
    });
}

document.addEventListener("DOMContentLoaded", renderClientInfo);
