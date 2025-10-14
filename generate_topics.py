import os
import re
import json # Diperlukan untuk parsing
from bs4 import BeautifulSoup
import nltk
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF

# --- KONFIGURASI ---
ARTICLES_DIR = 'artikel'
OUTPUT_FILE = 'mini/kategori-otomatis.txt'
# Path ke file JavaScript yang berisi kategori existing
EXISTING_CATEGORIES_JS = 'ext/titleToCategory.js'

NUM_TOPICS = 5
NUM_KEYWORDS_PER_TOPIC = 15
# Minimal jumlah kata kunci yang harus cocok untuk menggunakan nama kategori existing
MATCH_THRESHOLD = 2 
# --------------------

def download_nltk_data():
    """Mengunduh data NLTK yang diperlukan jika belum ada."""
    try:
        nltk.data.find('tokenizers/punkt')
        nltk.data.find('corpora/stopwords')
    except LookupError:
        print("📥 Mengunduh data NLTK (punkt, stopwords)...")
        nltk.downloader.download('punkt', quiet=True)
        nltk.downloader.download('stopwords', quiet=True)
        print("✅ Data NLTK siap.")

# ==> FUNGSI BARU: Membaca dan mem-parsing file JavaScript <==
def load_existing_categories(js_file_path):
    """
    Membaca file titleToCategory.js dan mengekstrak struktur kategorinya
    menjadi dictionary Python.
    """
    print(f"📖 Membaca kategori existing dari '{js_file_path}'...")
    try:
        with open(js_file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Gunakan regex untuk mengekstrak array 'categories' secara aman
        match = re.search(r'const categories\s*=\s*(\[[\s\S]*?\]);', content)
        if not match:
            print("❌ Tidak dapat menemukan 'const categories = [...]' di dalam file.")
            return {}

        js_array_string = match.group(1)
        
        # Konversi string array JavaScript menjadi string JSON yang valid
        # 1. Tambahkan kutip ganda pada keys (name, priority, keywords)
        json_string = re.sub(r'(\w+):', r'"\1":', js_array_string)
        # 2. Ganti kutip tunggal dengan kutip ganda untuk string
        json_string = json_string.replace("'", '"')
        # 3. Hapus trailing comma (,) sebelum '}' atau ']'
        json_string = re.sub(r',\s*([}\]])', r'\1', json_string)
        
        # Parse string JSON menjadi objek Python
        parsed_data = json.loads(json_string)

        # Ubah formatnya menjadi { 'Nama Kategori': ['keyword1', 'keyword2'] }
        category_map = {item['name']: item['keywords'] for item in parsed_data}
        print(f"✅ Berhasil memuat {len(category_map)} kategori existing.")
        return category_map

    except Exception as e:
        print(f"❌ Gagal membaca atau mem-parsing '{js_file_path}': {e}")
        return {}

def extract_text_from_html(html_content):
    soup = BeautifulSoup(html_content, 'lxml')
    for element in soup(['script', 'style', 'nav', 'footer', 'header', 'aside', 'form']):
        element.decompose()
    return ' '.join(soup.stripped_strings)

def preprocess_text(text, stop_words):
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text)
    tokens = nltk.word_tokenize(text)
    filtered_tokens = [word for word in tokens if word not in stop_words and len(word) > 2]
    return " ".join(filtered_tokens)

# ==> FUNGSI DIMODIFIKASI: Menerima category_map sebagai argumen <==
def get_smart_topic_name(top_keywords, category_map):
    """Menentukan nama topik berdasarkan kategori existing atau fallback."""
    if not category_map:
        return ' & '.join(kw.capitalize() for kw in top_keywords[:2])

    scores = {}
    for category_name, trigger_words in category_map.items():
        matches = set(trigger_words) & set(top_keywords)
        scores[category_name] = len(matches)

    best_category = max(scores, key=scores.get)
    if scores[best_category] >= MATCH_THRESHOLD:
        return best_category

    return ' & '.join(kw.capitalize() for kw in top_keywords[:2])

def main():
    print("🚀 Memulai proses penemuan topik otomatis...")
    download_nltk_data()
    
    # ==> LANGKAH BARU: Muat kategori dari file JS di awal <==
    existing_category_map = load_existing_categories(EXISTING_CATEGORIES_JS)

    if not os.path.isdir(ARTICLES_DIR):
        print(f"❌ Error: Folder '{ARTICLES_DIR}' tidak ditemukan.")
        return

    corpus = []
    print("📖 Membaca dan membersihkan semua artikel...")
    # ... (sisa kode pembacaan corpus tetap sama)
    for filename in os.listdir(ARTICLES_DIR):
        if filename.endswith('.html'):
            file_path = os.path.join(ARTICLES_DIR, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            raw_text = extract_text_from_html(html_content)
            corpus.append(raw_text)

    stop_words = set(stopwords.words('indonesian'))
    processed_corpus = [preprocess_text(doc, stop_words) for doc in corpus]

    print("🔢 Mengubah teks menjadi data numerik (TF-IDF)...")
    vectorizer = TfidfVectorizer(max_df=0.95, min_df=2, stop_words=list(stop_words))
    tfidf_matrix = vectorizer.fit_transform(processed_corpus)

    print(f"🧠 Menganalisis dan menemukan {NUM_TOPICS} topik (NMF)...")
    nmf_model = NMF(n_components=NUM_TOPICS, random_state=1, max_iter=1000)
    nmf_model.fit(tfidf_matrix)

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f_out:
        f_out.write(f"Hasil Analisis Topik Otomatis ({NUM_TOPICS} Topik Ditemukan)\n")
        f_out.write("========================================================\n\n")
        
        feature_names = vectorizer.get_feature_names_out()
        for topic_idx, topic in enumerate(nmf_model.components_):
            top_keywords = [feature_names[i] for i in topic.argsort()[:-NUM_KEYWORDS_PER_TOPIC - 1:-1]]
            
            # ==> PANGGILAN FUNGSI DIMODIFIKASI <==
            topic_name = get_smart_topic_name(top_keywords, existing_category_map)

            f_out.write(f"## Kategori Disarankan: {topic_name}\n")
            f_out.write(f"   Kata Kunci ({len(top_keywords)}): {', '.join(top_keywords)}\n\n")
            
    print(f"✨ Proses selesai! Hasil analisis disimpan di '{OUTPUT_FILE}'.")

if __name__ == "__main__":
    main()
