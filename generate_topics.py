import os
import re
from bs4 import BeautifulSoup
import nltk
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import Nmf

# --- KONFIGURASI ---
# Direktori tempat artikel HTML Anda disimpan.
ARTICLES_DIR = 'artikel'
# File output untuk menyimpan hasil.
OUTPUT_FILE = 'mini/kategori-otomatis.txt'

# ==> PENTING: Tentukan berapa banyak kategori/topik yang ingin Anda temukan.
#     Mulailah dengan angka antara 5-10, lalu sesuaikan berdasarkan hasilnya.
NUM_TOPICS = 5 

# Jumlah kata kunci teratas yang akan ditampilkan untuk setiap topik.
NUM_KEYWORDS_PER_TOPIC = 10
# --------------------

def download_nltk_data():
    """Mengunduh data NLTK yang diperlukan jika belum ada."""
    try:
        nltk.data.find('tokenizers/punkt')
        nltk.data.find('corpora/stopwords')
    except nltk.downloader.DownloadError:
        print("📥 Mengunduh data NLTK (punkt, stopwords) untuk bahasa Indonesia...")
        nltk.downloader.download('punkt', quiet=True)
        nltk.downloader.download('stopwords', quiet=True)
        print("✅ Data NLTK siap.")

def extract_text_from_html(html_content):
    """Mengambil teks bersih dari konten HTML."""
    soup = BeautifulSoup(html_content, 'lxml')
    for element in soup(['script', 'style', 'nav', 'footer', 'header', 'aside', 'form']):
        element.decompose()
    return ' '.join(soup.stripped_strings)

def preprocess_text(text, stop_words):
    """Membersihkan teks: lowercase, hapus non-alfabet, hapus stopwords."""
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text) # Hapus semua selain huruf dan spasi
    tokens = nltk.word_tokenize(text)
    # Hapus kata-kata umum (stopwords) dan kata yang terlalu pendek
    filtered_tokens = [word for word in tokens if word not in stop_words and len(word) > 2]
    return " ".join(filtered_tokens)

def main():
    """Fungsi utama untuk menjalankan seluruh proses."""
    print("🚀 Memulai proses penemuan topik otomatis...")
    download_nltk_data()

    if not os.path.isdir(ARTICLES_DIR):
        print(f"❌ Error: Folder '{ARTICLES_DIR}' tidak ditemukan.")
        return

    # Kumpulkan semua teks dari artikel
    corpus = []
    print("📖 Membaca dan membersihkan artikel...")
    for filename in os.listdir(ARTICLES_DIR):
        if filename.endswith('.html'):
            file_path = os.path.join(ARTICLES_DIR, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            raw_text = extract_text_from_html(html_content)
            corpus.append(raw_text)

    # Pra-pemrosesan teks
    stop_words = set(stopwords.words('indonesian'))
    processed_corpus = [preprocess_text(doc, stop_words) for doc in corpus]

    # Membuat matriks TF-IDF: mengubah teks menjadi angka berdasarkan pentingnya kata
    print("🔢 Mengubah teks menjadi data numerik (TF-IDF Vectorization)...")
    vectorizer = TfidfVectorizer(max_df=0.95, min_df=2, stop_words=list(stop_words))
    tfidf_matrix = vectorizer.fit_transform(processed_corpus)

    # Menjalankan model NMF untuk menemukan topik
    print(f"🧠 Menganalisis dan menemukan {NUM_TOPICS} topik (NMF)...")
    nmf_model = Nmf(n_components=NUM_TOPICS, random_state=1, max_iter=1000)
    nmf_model.fit(tfidf_matrix)

    # Menyiapkan dan menyimpan hasil
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f_out:
        f_out.write(f"Hasil Analisis Topik Otomatis ({NUM_TOPICS} Topik Ditemukan)\n")
        f_out.write("========================================================\n\n")
        
        feature_names = vectorizer.get_feature_names_out()
        for topic_idx, topic in enumerate(nmf_model.components_):
            top_keywords = [feature_names[i] for i in topic.argsort()[:-NUM_KEYWORDS_PER_TOPIC - 1:-1]]
            
            f_out.write(f"## Topik Otomatis #{topic_idx + 1}\n")
            f_out.write("   (Anda bisa menamai topik ini berdasarkan kata kunci berikut)\n")
            f_out.write(f"   Kata Kunci Utama: {', '.join(top_keywords)}\n\n")
            
    print(f"✨ Proses selesai! Hasil analisis disimpan di '{OUTPUT_FILE}'.")
    print("CATATAN: Buka file tersebut untuk melihat topik yang ditemukan dan beri nama yang sesuai.")

if __name__ == "__main__":
    main()
