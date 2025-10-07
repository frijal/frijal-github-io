// ============================================================
// IPOSBROWSER.JS — VERSI DISESUAIKAN
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
            console.log("deteksi berhasil menggunakan IPv4:", ipAddress);
        } catch (ipv4Error) {
            console.warn("gagal mendapatkan IPv4, mencoba fallback ke IPv6...", ipv4Error);
            
            // Langkah 2: Jika IPv4 gagal, coba dapatkan IPv6
            const ip6Res = await fetch('https://api64.ipify.org?format=json');
            if (!ip6Res.ok) throw new Error('API IPv6 juga tidak merespons');
            const ip6Data = await ip6Res.json();
            ipAddress = ip6Data.ip;
            console.log("deteksi berhasil menggunakan IPv6:", ipAddress);
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
    const target = document.getElementById("footerInfo");
    if (!target) return;
    target.textContent = 'memuat info...';

    const browser = detectBrowser();
    const os = detectOS();
    const geo = await fetchGeoIP();

    const browserHTML = `<div class="info-item">${browserIcons[browser] || browserIcons['Unknown']}<span>${browser}</span></div>`;
    const osHTML = `<div class="info-item">${osIcons[os] || osIcons['Unknown']}<span>${os}</span></div>`;
    
    let geoHTML = '<div class="info-item"><span>Lokasi tidak terdeteksi</span></div>';
    if (geo) {
        const flagEmoji = geo.code ? geo.code.toUpperCase().split("").map(c => String.fromCodePoint(c.charCodeAt(0) + 127397)).join("") : "";
        geoHTML = `<div class="info-item"><span>${geo.city || ''}, ${geo.country || ''} ${flagEmoji}</span></div>`;
    }

    target.innerHTML = browserHTML + osHTML + geoHTML;
});

const style = document.createElement("style");
style.textContent = `
    #footerInfo {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1rem;
        font-size: 0.8rem;
        color: var(--text-muted-light);
    }
    body.dark-mode #footerInfo {
        color: var(--text-muted-dark);
    }
    .info-item {
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }
    .info-item svg {
        width: 16px;
        height: 16px;
        fill: currentColor;
    }
`;
document.head.appendChild(style);

// ===== Definisi Ikon (Dipindahkan ke Bawah) =====
const browserIcons = {
    "Firefox": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.49 5.85c.18.81-.31 1.83-1.12 2.37-1.16.78-2.61.94-3.59.62-.23-.07-.37-.11-.37-.11s.14.04.37.11c1.86.53 3.32-.73 3.79-1.92.51-1.28.1-2.62-.87-3.41-.9-.73-2.2-1.04-3.32-1.02-.3 0-.5.17-.43.44.11.41.29.83.47 1.23.29.64.66 1.25 1.1 1.83.82 1.1 2.02 1.63 3.58 1.86zM12 14.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>',
    "Chrome": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10,10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8 s8,3.59,8,8S16.41,20,12,20z M12,6c-3.31,0-6,2.69-6,6s2.69,6,6,6s6-2.69,6-6S15.31,6,12,6z M12,16c-2.21,0-4-1.79-4-4 s1.79-4,4-4s4,1.79,4,4S14.21,16,12,16z"/></svg>',
    "Edge": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M208,28H48A20,20,0,0,0,28,48V208a20,20,0,0,0,20,20H208a20,20,0,0,0,20-20V48A20,20,0,0,0,208,28Zm-22.6,83.71a12,12,0,0,1-17.2,1.31L139,94.34v54.87a12,12,0,0,1-24,0V94.34l-29.2,18.68a12,12,0,1,1-18.51-17.31L128,51,186.71,95A12,12,0,0,1,185.4,111.71Z"/></svg>',
    "Safari": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm4.2-11.4L10.5 13 14 16.5 16.2 8.6zM9.5 11l-4 1.5 5.9 1.9z"/></svg>',
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
