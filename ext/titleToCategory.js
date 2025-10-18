// titleToCategory.js
const categories = [
  {
    name: "🐧 Linux, Open Source & Multimedia",
    keywords: [
      "apt", "arch", "audio", "aur", "blankon", "bootable", "bsd", "cachyos", "chroot", "codec", "compiz", "conky", "convert", "cooling", "debian", "desktop", "distro", "dpkg", "ffmpeg", "fedora", "film", "flatpak", "foss", "garuda", "ghostscript", "gimp", "gnome", "grub", "handbrake", "imagemagick", "iptv", "kde", "kernel", "komunitas", "kompres", "kpli", "libreoffice", "linux", "lts", "mageia", "mirror", "multimedia", "mx-linux", "nixos", "ogg", "open source", "openoffice", "opensuse", "oss", "pacman", "paru", "pdf", "pdftk", "perl", "potong", "preset", "rekam", "repo", "rescuezilla", "resize", "rsync", "scan", "sebarubuntu", "slackware", "solaris", "split", "tar", "ubuntu", "usb", "ventoy", "video", "vlc", "watermark", "webp", "wine", "xfce", "yum", "zorin", "zsync"
    ]
  },
  {
    name: "📚 Sejarah & Religi",
    keywords: [
      "adab", "akidah", "andalusia", "aqidah", "baghdad", "bahtera", "barqa", "bilal", "doa", "fatih", "fiqh", "fitnah", "ghibah", "hadis", "haki", "halal", "haram", "hijab", "hijrah", "hijriyah", "hittin", "hukum", "ibnu batutah", "iman", "imam", "islam", "istighfar", "janji", "jumat", "khwarizmi", "madinah", "masjid", "masyitoh", "maulid", "mesir", "muhammadiyah", "mukjizat", "murad", "musa", "muslim", "mushaf", "nabi", "nuh", "pahlawan", "penaklukan", "perjanjian", "pertempuran", "persia", "piagam", "quran", "qunut", "ramadhan", "risalah", "sabar", "saf", "sahabat", "salam", "salman", "sejarah", "seljuk", "shalat", "shalahuddin", "syariat", "sombong", "sunnah", "surga", "tabut", "tabayun", "tauhid", "uhud", "umar", "utsman", "utsmaniyah", "yarmuk", "yerusalem", "zaid"
    ]
  },
  {
    name: "🍜 Kuliner, Gaya Hidup & Kesehatan",
    keywords: [
      "angkringan", "bahagia", "bali", "bandara", "bekapai", "berkendara", "boker", "camilan", "gaya hidup", "gerimis", "hotel", "jagung", "jogja", "kesehatan", "kopi", "kerupuk", "kuliner", "kurma", "laundry", "metode", "minuman", "motor", "niat", "ngopi", "obat", "ojol", "pecel", "pencernaan", "pijat", "psikotes", "respiro", "sakit", "sembelit", "sikat", "susu", "tidur", "touring", "unboxing", "wanita", "wisata"
    ]
  },
  {
    name: "🏞️ Catatan & Opini Sosial",
    keywords: [
      "aci", "adaro", "artikel", "bisnis", "bukalapak", "catatan", "cpns", "cuti", "duit", "ekspedisi", "fenomena", "foss kaltim", "golput", "grobogan", "harian", "ibu", "indonesia", "iwan fals", "jatos", "jne", "kasih", "kejujuran", "kerja", "kota", "kopdar", "kreativitas", "nostalgia", "opini", "organisasi", "peradaban", "perencanaan", "perusahaan", "perjalanan", "poac", "ppdb", "produktifitas", "pt", "rencana", "renungan", "sktm", "sosial", "uang", "ujian nasional"
    ]
  },
  {
    name: "💻 Teknologi Web, AI & Umum",
    keywords: [
      "ai", "amd", "baterai", "bootloader", "branch", "browser", "build", "canva", "chatgpt", "claude", "cleanup", "cli", "codespaces", "cpu", "curl", "eula", "excel", "gemini", "git", "github", "gorilla glass", "grammarly", "hdd", "head", "header", "html", "jasper", "jaringan", "javascript", "js", "keyring", "laptop", "learning", "lisensi", "meta", "mic", "notion", "npm", "optimasi", "osborne1", "phishing", "piracy", "push", "quickbooks", "refresh", "robots.txt", "samba", "shutdown", "software", "spreadsheet", "ssh", "ssd", "terminal", "tidio", "tools", "virtualbox", "web", "wifi", "windows", "winget", "workflow", "yml", "yaml"]
  }
];

export function titleToCategory(title) {
  const t = title.toLowerCase();
  const found = categories.find(cat =>
    cat.keywords.some(k => t.includes(k))
  );
  return found ? found.name : "🗂️ Lainnya";
}
