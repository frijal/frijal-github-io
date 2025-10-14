import os
from bs4 import BeautifulSoup
from rake_nltk import Rake
import nltk

# --- KONFIGURASI ---
# Direktori tempat artikel HTML Anda disimpan.
ARTICLES_DIR = 'artikel'
# File output untuk menyimpan hasil.
OUTPUT_FILE = 'mini/kategori-baru.txt'
# Jumlah kata kunci teratas yang ingin dihasilkan per artikel.
KEYWORD_COUNT = 7

# Definisikan kategori Anda dan kata kunci yang relevan.
# Skrip akan memilih kategori dengan jumlah kata kunci cocok terbanyak.
CATEGORIES = {
    'Teknologi': ['teknologi', 'komputer', 'internet', 'software', 'AI', 'gadget', 'python', 'javascript', 'kode', 'aplikasi'],
    'Berita': ['berita', 'pemerintah', 'politik', 'peristiwa', 'dunia', 'nasional', 'internasional'],
    'Gaya Hidup': ['kesehatan', 'makanan', 'perjalanan', 'hobi', 'keluarga', 'fashion', 'tips'],
    'Tutorial': ['cara', 'panduan', 'langkah', 'tutorial', 'belajar', 'membuat', 'panduan']
}
# --------------------

def extract_text_from_html(html_content):
    """Mengambil teks bersih dari konten HTML, mengabaikan tag yang tidak relevan."""
    soup = BeautifulSoup(html_content, 'lxml')
    for element in soup(['script', 'style', 'nav', 'footer', 'header', 'aside', 'form']):
        element.decompose()
    return ' '.join(soup.stripped_strings)

def extract_keywords(text, count):
    """Mengekstrak frasa kunci dari teks."""
    # 'id' untuk bahasa Indonesia
    rake = Rake(language='indonesian') 
    rake.extract_keywords_from_text(text)
    return rake.get_ranked_phrases()[:count]

def categorize_text(text):
    """Mengelompokkan teks ke dalam kategori berdasarkan kata kunci."""
    text_lower = text.lower()
    scores = {category: 0 for category in CATEGORIES}

    for category, keywords in CATEGORIES.items():
        for keyword in keywords:
            scores[category] += text_lower.count(keyword.lower())

    # Jika tidak ada kata kunci yang cocok, kembalikan 'Umum'.
    if not any(scores.values()):
        return "Umum"
        
    # Kembalikan kategori dengan skor tertinggi.
    return max(scores, key=scores.get)

def main():
    """Fungsi utama untuk menjalankan seluruh proses."""
    print("🚀 Memulai proses pembuatan kata kunci dan kategori...")
    
    # Download data NLTK yang diperlukan jika belum ada.
    try:
        nltk.data.find('tokenizers/punkt')
        nltk.data.find('corpora/stopwords')
    except nltk.downloader.DownloadError:
        print("📥 Mengunduh data NLTK (punkt, stopwords)...")
        nltk.downloader.download('punkt')
        nltk.downloader.download('stopwords')
        print("✅ Data NLTK siap.")

    if not os.path.isdir(ARTICLES_DIR):
        print(f"❌ Error: Folder '{ARTICLES_DIR}' tidak ditemukan.")
        return

    # Pastikan direktori output ada.
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    # Membuka file output untuk ditulis.
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f_out:
        f_out.write("Laporan Kata Kunci & Kategori Baru\n")
        f_out.write("=======================================\n\n")

        files_to_process = [f for f in os.listdir(ARTICLES_DIR) if f.endswith('.html')]

        for filename in files_to_process:
            file_path = os.path.join(ARTICLES_DIR, filename)
            try:
                with open(file_path, 'r', encoding='utf-8') as f_in:
                    html_content = f_in.read()

                article_text = extract_text_from_html(html_content)
                if not article_text or len(article_text.split()) < 20:
                    print(f"⚠️ Melewati file '{filename}' (konten terlalu singkat).")
                    continue

                keywords = extract_keywords(article_text, KEYWORD_COUNT)
                category = categorize_text(article_text)
                
                # Tulis hasil ke file.
                f_out.write(f"File: {filename}\n")
                f_out.write(f"Saran Kategori: {category}\n")
                f_out.write("Saran Kata Kunci:\n")
                for i, keyword in enumerate(keywords, 1):
                    f_out.write(f"  {i}. {keyword}\n")
                f_out.write("\n---\n\n")
                
                print(f"✅ Diproses: {filename}")

            except Exception as e:
                print(f"❌ Gagal memproses {filename}: {e}")

    print(f"✨ Proses selesai. Hasil disimpan di '{OUTPUT_FILE}'.")

if __name__ == "__main__":
    main()
