// titleToCategory.js
export const categories = [
  {
    "name": "📽️ Multimedia & Editing",
    "keywords": [
    "Video", "Gambar", "Audio", "Editor", "Konversi", "Watermark", "VLC", "ImageMagick", "FFmpeg", "PDFtk", "OpenOffice", "LibreOffice", "Pictory.ai", "Lumen5", "Canva Magic Studio", "Desain Grafis", "Video Marketing", "Kolase Gambar", "Potong Gambar", "Gabung Gambar", "Ekstrak Gambar", "Format Gambar", "Preset Lightroom", "Perbaikan Foto", "Rotasi Video", "Menyatukan Film", "Audio Sistem", "Rekam Layar"      
    ]
  },
  {
    "name": "📚 Islam & Kehidupan",
    "keywords": [
    "Islam", "Sejarah Islam", "Sahabat Nabi", "Khalifah", "Perang Uhud", "Zaid bin Tsabit", "Umar bin Khattab", "Utsman bin Affan", "Uqbah bin Nāfi‘ al-Fihrī", "Qordoba", "Andalusia", "Ilmuwan Muslim", "Al-Khwārizmī", "Al-Qur'an", "Hadits", "Hijrah", "Jihad", "Maulid Nabi", "Pro Kontra Maulid", "Tabayun", "Hoaks", "Hukum Hari Kelahiran", "Bid'ah", "Tasyabbuh"            
    ]
  },
   {
    "name": "🐧 Linux & Open Source",
    "keywords": [
    "inux", "GNU/Linux", "Ubuntu", "Debian", "Fedora", "Arch Linux", "Manjaro", "Xfce", "Zorin OS", "Desktop Environment (DE)", "Terminal", "Command Line Interface (CLI)", "Shell Script", "Kernel", "Driver", "Dual-boot", "Virtualisasi", "Wine", "Ventoy", "rsync", "dpkg-repack", "pip", "chroot", "ImageMagick", "FFmpeg", "PDFtk", "LibreOffice", "OpenOffice", "Repository", "AUR", "Paket", "Instalasi", "Optimasi", "Troubleshooting", "Partisi", "NTFS", "Caja", "WiFi Realtek", "XPenguins", "Solaris", "Open Source Software (OSS)", "GNOME", "KDE", "Wayland", "X11", "Bootable USB", "ISO", "Daily Build", "ZSync", "LTS (Long Term Support)", "Rolling Release", "Software Center", "Update", "Keamanan", "Stabilitas", "Komunitas Linux", "Pengguna Awam", "Migrasi", "Interoperabilitas"      
    ]
  },
  {
    "name": "🏞️ Budaya"", ""Kuliner & Lifestyle",
    "keywords": [
    "Kehidupan", "Kuliner", "Makanan", "Gaya Hidup", "Budaya", "Komunitas", "Blogger", "Open Source", "Pendidikan", "Ujian Nasional", "PPDB", "SKTM", "Hoaks", "Tabayun", "Etika Digital", "Keadilan Akses", "Keuangan", "Uang", "Duit", "Internet", "WiFi Gratis", "Perjalanan", "Lokal", "Balikpapan", "Bontang", "Samarinda", "WiGO", "JNE", "Respiro", "Unboxing", "Kesehatan", "Disiplin Diri", "Produktivitas", "Stres", "Rencana", "Refleksi Sosial", "Geografi", "Sungai"
      
    ]
  },
  {
    "name": "📰 Catatan & Sosial",
    "keywords": [      
    ]
  },
  {
    "name": "💻 Windows & Teknologi Umum",
    "keywords": [
    "Windows", "Windows 11", "Optimasi Sistem", "CPU Lawas", "Startup Program", "Storage Sense", "Winget", "Instalasi Massal", "PowerShell", "Microsoft Store", "Chocolatey", "Refresh Desktop", "Perbandingan OS", "Migrasi", "Kompatibilitas", "Update Windows", "Misteri Update", "Wizard Installer"      
    ]
  }
];

export function titleToCategory(title) {
  const t = title.toLowerCase();
  const found = categories.find(cat =>
    cat.keywords.some(k => t.includes(k))
  );
  return found ? found.name : "🗂️ Lainnya";
}
