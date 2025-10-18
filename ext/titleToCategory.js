// titleToCategory.js
const categories = [
  { name: "📽️ Multimedia & Editing", keywords: ["ffmpeg", "video", "film", "audio", "mp3", "ogg", "rekam", "convert", "split", "cut", "durasi", "imagemagick", "resize", "format", "potong", "watermark", "foto", "gambar", "pdf", "gabung", "kompres", "scan", "ghostscript", "pdftk", "vlc", "multimedia", "codec"] },
  { name: "🐧 Linux & Open Source", keywords: ["linux", "libreoffice", "openoffice", "perl", "ubuntu", "distro", "lts", "live usb", "conky", "fedora", "debian", "arch", "slackware", "nixos", "opensuse", "blankon", "mirror", "repo", "apt", "yum", "rsync", "grub", "chroot", "dpkg", "open source", "oss", "foss", "komunitas", "kpli", "gnome", "kde", "compiz", "desktop", "ubuntu party"] },
  { name: "📚 Islam & Kehidupan", keywords: ["islam", "shalat", "akidah", "aqidah", "qunut", "istigfar", "istighfar", "mukjizat", "masjid", "madinah", "imam", "risalah", "nabi", "quran", "hadis", "hijriyah", "muslim", "doa", "hukum", "halal", "haram", "syariat", "fiqh", "hijab", "ramadhan", "maulid", "piagam madinah", "mushaf utsman", "tabut", "iman", "sabar", "ghibah", "fitnah", "sombong", "salam", "janji"] },
  { name: "🏞️ Budaya, Kuliner & Lifestyle", keywords: ["kuliner", "obat", "sakit", "pecel", "minuman", "jagung", "kerupuk", "angkringan", "kurma", "kopi", "camilan", "wisata", "jogja", "bali", "bekapai", "hotel", "bandara", "respiro", "tidur", "kesehatan", "psikotes", "wanita", "bahagia"] },
  { name: "📰 Catatan & Sosial", keywords: ["catatan", "pt", "kopdar", "sejarah", "indonesia", "peradaban", "sahabat", "kota", "rencana", "kreativitas", "ibu", "perjalanan", "bisnis", "perusahaan", "ekspedisi", "aturan", "harian", "cuti", "nostalgia", "renungan", "golput", "duit", "pekerjaan", "kerja halal", "perencanaan", "produktifitas", "fenomena", "sktm", "ppdb"] },
  { name: "💻 Windows & Teknologi Umum", keywords: ["windows", "learning", "cpu", "samba", "jaringan", "software", "terminal", "github", "shutdown", "hdd", "ssd", "refresh", "optimasi", "bootloader", "virtualbox", "keyring", "laptop", "osborne1", "baterai", "mic", "wifi", "amd", "cooling", "phishing", "eula", "lisensi", "piracy"] }
];

// Langsung ekspor fungsi dengan kata kunci 'export'
export function titleToCategory(title) {
  const t = title.toLowerCase();
  const found = categories.find(cat =>
    cat.keywords.some(k => t.includes(k))
  );
  return found ? found.name : "🗂️ Lainnya";
}
