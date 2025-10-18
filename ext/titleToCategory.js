// titleToCategory.js
const categories = [
  {
    name: "📽️ Multimedia & Editing",
    keywords: ["audio", "codec", "convert", "cut", "deoldify", "durasi", "ffmpeg", "film", "format", "foto", "gabung", "gambar", "ghostscript", "handbrake", "imagemagick", "kompres", "mewarnai", "mp3", "multimedia", "ogg", "pdf", "pdftk", "potong", "preset", "rekam", "resize", "scan", "split", "video", "vlc", "watermark"]
  },
  {
    name: "🐧 Linux & Open Source",
    keywords: ["apt", "arch", "aur", "blankon", "bootable", "bsd", "cachyos", "chroot", "compiz", "conky", "debian", "desktop", "distro", "dpkg", "fedora", "foss", "garuda", "gnome", "grub", "kde", "kernel", "komunitas", "kpli", "libreoffice", "linux", "live usb", "lts", "mageia", "mirror", "mx-linux", "nixos", "open source", "openoffice", "opensuse", "oss", "pacman", "paru", "perl", "repo", "rescuezilla", "rsync", "slackware", "solaris", "ubuntu", "ubuntu party", "usb", "ventoy", "wine", "xfce", "yum", "zorin"]
  },
  {
    name: "📚 Islam & Kehidupan",
    keywords: ["adab", "akidah", "aqidah", "andalusia", "doa", "fatih", "fiqh", "fitnah", "ghibah", "hadis", "hijab", "hijriyah", "hukum", "halal", "haram", "iman", "imam", "islam", "istigfar", "istighfar", "janji", "khwarizmi", "madinah", "masjid", "maulid", "mukjizat", "muslim", "mushaf utsman", "nabi", "pahlawan", "pertempuran", "piagam madinah", "quran", "qunut", "ramadhan", "risalah", "sabar", "sahabat", "salam", "shalat", "syariat", "sombong", "tabut", "tauhid", "uhud", "umar", "utsman", "yarmuk", "yerusalem", "zaid"]
  },
  {
    name: "🏞️ Budaya, Kuliner & Lifestyle",
    keywords: ["angkringan", "bahagia", "bali", "bandara", "bekapai", "berkendara", "boker", "camilan", "gaya", "hijab", "hotel", "jagung", "jogja", "kesehatan", "kopi", "kerupuk", "kuliner", "kurma", "metode", "minuman", "motor", "obat", "pecel", "pencernaan", "psikotes", "respiro", "sakit", "sembelit", "sikat", "susu", "tidur", "wanita", "wisata"]
  },
  {
    name: "📰 Catatan & Sosial",
    keywords: ["aturan", "baghdad", "balikpapan", "bisnis", "bukalapak", "catatan", "cpns", "cuti", "duit", "ekspedisi", "excel", "fenomena", "golput", "harian", "ibu", "indonesia", "iwan fals", "kasih", "kejujuran", "kerja halal", "kota", "kopdar", "kreativitas", "niat", "nostalgia", "pekerjaan", "peradaban", "perencanaan", "perusahaan", "perjalanan", "poac", "ppdb", "produktifitas", "pt", "rencana", "renungan", "sahabat", "sejarah", "sktm", "spreadsheet", "uang"]
  },
  {
    name: "💻 Windows & Teknologi Umum",
    keywords: ["ai", "amd", "baterai", "bootloader", "browser", "canva", "chatgpt", "claude", "cli", "codespaces", "cooling", "cpu", "eula", "gemini", "git", "github", "gorilla glass", "grammarly", "hdd", "jasper", "jaringan", "keyring", "laptop", "learning", "lisensi", "mic", "notion", "npm", "optimasi", "osborne1", "phishing", "piracy", "refresh", "robots.txt", "samba", "shutdown", "software", "ssh", "ssd", "terminal", "virtualbox", "wifi", "windows", "winget"]
  }
];

// Langsung ekspor fungsi dengan kata kunci 'export'
export function titleToCategory(title) {
  const t = title.toLowerCase();
  const found = categories.find(cat =>
    cat.keywords.some(k => t.includes(k))
  );
  return found ? found.name : "🗂️ Lainnya";
}
