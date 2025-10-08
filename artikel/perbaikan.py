"""
Script Python untuk membersihkan dan memperbaiki file HTML secara otomatis.
Script ini akan melakukan beberapa tindakan:
- Menimpa (overwrite) file asli jika ada perubahan.
- Mengganti entitas HTML tertentu.
- Memindahkan konten yang berada setelah tag </html> ke dalam body.
- Membersihkan tag HTML yang tidak valid dari dalam skrip JSON-LD.
- Menghapus tag <div> yang benar-benar kosong (tidak berisi tag lain, teks, atau komentar).
- Menghapus spasi berlebih di dalam konten tag.
- Menganalisis dan melaporkan kurung kurawal yang tidak seimbang di dalam tag <script>.
- Membuat file log 'perbaikan_log.txt' yang merangkum semua tindakan.

Pastikan Anda memiliki backup atau menggunakan sistem kontrol versi (seperti Git)
sebelum menjalankan skrip ini, karena perubahannya bersifat permanen.
"""
import os
import re
from bs4 import BeautifulSoup, Comment, NavigableString
from typing import List, Dict

# Konstanta untuk nama file log
LOG_FILE = "perbaikan_log.txt"

def strip_whitespace_in_tags(soup: BeautifulSoup) -> bool:
    """
    Menghapus spasi berlebih dari konten teks di dalam tag.
    Fungsi ini tidak mengubah tag yang formatnya penting, seperti <pre> atau <code>.
    Mengembalikan True jika ada perubahan yang dibuat.
    """
    has_changes = False
    # Tag yang format whitespace-nya harus dijaga
    tags_to_exclude = {'pre', 'code', 'style', 'script'}
    
    for tag in soup.find_all(lambda t: t.name not in tags_to_exclude):
        for content in list(tag.contents):
            if isinstance(content, NavigableString):
                # Ganti non-breaking space dan hapus spasi di awal/akhir
                cleaned_string = str(content).replace('\xa0', ' ').strip()
                
                if cleaned_string != str(content):
                    has_changes = True
                    if cleaned_string:
                        content.replace_with(cleaned_string)
                    else:
                        content.extract()
    return has_changes

def fix_html_file(file_path: str) -> List[str]:
    """
    Membaca satu file HTML, melakukan perbaikan dan analisis,
    lalu menimpa file asli jika ada perubahan yang terdeteksi.
    Mengembalikan daftar pesan log untuk file ini.
    """
    log_messages = []
    has_changes = False
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        # --- TAHAP 1: Perbaikan Berbasis Teks (Sebelum Parsing) ---
        original_content = content
        
        # Ganti entitas 'times;' menjadi karakter '×'
        if "times;" in content:
            content = content.replace("times;", "×")
            log_messages.append("  - Mengganti entitas 'times;' menjadi karakter '×'.")
        
        # Jika ada perubahan teks, set flag
        if content != original_content:
            has_changes = True

        # --- TAHAP 2: Perbaikan Berbasis Struktur dengan BeautifulSoup ---
        soup = BeautifulSoup(content, 'lxml')
        
        # Jika file tidak memiliki body, anggap bukan HTML valid dan lewati
        if not soup.body:
            return []

        # Pindahkan konten setelah </html> (jika ada)
        # BeautifulSoup melakukan ini secara otomatis saat parsing, jadi kita hanya perlu mendeteksi dan mencatatnya.
        end_marker = '</html>'
        if end_marker in content:
            last_pos = content.rfind(end_marker) + len(end_marker)
            if content[last_pos:].strip():
                log_messages.append("  - Mendeteksi dan memindahkan konten setelah </html> ke dalam body.")
                has_changes = True

        # Bersihkan tag HTML dari dalam skrip JSON-LD
        json_cleaned_count = 0
        for script in soup.find_all('script', type='application/ld+json'):
            if script.string and re.search(r'<[^>]+>', script.string):
                script.string = re.sub(r'<[^>]+>', '', script.string, flags=re.DOTALL).strip()
                json_cleaned_count += 1
        if json_cleaned_count > 0:
            log_messages.append(f"  - Membersihkan {json_cleaned_count} blok skrip JSON-LD dari tag HTML.")
            has_changes = True

        # Hapus tag <div> yang benar-benar kosong
        empty_divs_removed = 0
        for div in soup.find_all('div'):
            # Sebuah div dianggap kosong jika tidak berisi: tag lain, teks, atau komentar.
            is_truly_empty = not any(
                hasattr(c, 'name') or isinstance(c, Comment) or (isinstance(c, str) and c.strip())
                for c in div.contents
            )
            if is_truly_empty:
                div.decompose()
                empty_divs_removed += 1
        if empty_divs_removed > 0:
            log_messages.append(f"  - Menghapus {empty_divs_removed} tag <div> yang benar-benar kosong.")
            has_changes = True
        
        # Bersihkan spasi berlebih di dalam tag
        if strip_whitespace_in_tags(soup):
            log_messages.append("  - Membersihkan spasi berlebih di dalam konten tag.")
            has_changes = True

        # --- TAHAP 3: Analisis (Tidak Mengubah File) ---
        # Periksa keseimbangan kurung kurawal di dalam tag <script>
        script_filter = lambda tag: tag and (not tag.has_attr('type') or tag.get('type') not in ['application/ld+json'])
        for i, script in enumerate(soup.find_all('script', script_filter)):
            if script.string:
                open_braces = script.string.count('{')
                close_braces = script.string.count('}')
                if open_braces != close_braces:
                    log_messages.append(f"  - PERINGATAN: Skrip ke-{i+1} memiliki kurung kurawal tidak seimbang (Buka: {open_braces}, Tutup: {close_braces}).")

        # --- TAHAP 4: Simpan Hasil ---
        if has_changes:
            final_html = soup.prettify(formatter="html5")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(final_html)
            print(f"  [✓] Perbaikan diterapkan. File asli telah ditimpa: {os.path.basename(file_path)}")
        else:
            print("  [-] Tidak ada perbaikan yang diperlukan.")
        
        return log_messages

    except Exception as e:
        print(f"  [✗] Gagal memproses {file_path}: {e}")
        return [f"  - ERROR: {e}"]

def main():
    """
    Fungsi utama untuk menemukan semua file HTML di direktori saat ini,
    memprosesnya, dan membuat file log ringkasan.
    """
    all_logs: Dict[str, List[str]] = {}
    if os.path.exists(LOG_FILE):
        os.remove(LOG_FILE)
    
    html_files_to_process = sorted([f for f in os.listdir('.') if f.endswith('.html')])
    
    if not html_files_to_process:
        print("🤷‍♂️ Tidak ada file .html yang ditemukan untuk diproses.")
        return

    print(f"Ditemukan {len(html_files_to_process)} file untuk diproses...\n")
    for filename in html_files_to_process:
        print(f"[*] Memproses file: {filename}...")
        log_messages = fix_html_file(os.path.join('.', filename))
        if log_messages:
            all_logs[filename] = log_messages

    print("\n🎉 Proses selesai.")
    if all_logs:
        with open(LOG_FILE, 'w', encoding='utf-8') as log_file:
            log_file.write("================ SUMMARY ================\n")
            log_file.write(f"Total file yang dimodifikasi/dianalisis: {len(all_logs)}\n")
            log_file.write("=======================================\n\n")
            for filename in sorted(all_logs.keys()):
                log_file.write(f"Log untuk file: {filename}\n")
                for msg in all_logs[filename]:
                    log_file.write(f"{msg}\n")
                log_file.write("-" * 40 + "\n")
        print(f"📝 Catatan log dengan ringkasan telah dibuat di: {LOG_FILE}")

if __name__ == "__main__":
    main()


