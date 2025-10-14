import os
import re
from bs4 import BeautifulSoup
import nltk
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF

# --- KONFIGURASI ---
ARTICLES_DIR = 'artikel'
OUTPUT_FILE = 'mini/kategori-otomatis.txt'
EXISTING_CATEGORIES_FILE = 'mini/kategori-exist.txt'

NUM_TOPICS = 6
NUM_KEYWORDS_PER_TOPIC = 30
MATCH_THRESHOLD = 2 
# --------------------

def download_nltk_data():
    """Mengunduh data NLTK yang diperlukan jika belum ada."""
    try:
        nltk.data.find('tokenizers/punkt')
        nltk.data.find('corpora/stopwords')
    except LookupError:
        print("📥 Mengunduh data NLTK (punkt, stopwords, punkt_tab)...")
        nltk.downloader.download('punkt', quiet=True)
        nltk.downloader.download('stopwords', quiet=True)
        # Menambahkan unduhan untuk paket yang diminta di log error
        nltk.downloader.download('punkt_tab', quiet=True)
        print("✅ Data NLTK siap.")

def load_existing_categories_from_txt(txt_file_path):
    """Membaca file kategori dari format .txt yang sederhana."""
    print(f"📖 Membaca kategori yang ada dari '{txt_file_path}'...")
    category_map = {}
    current_category = None
    try:
        with open(txt_file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    current_category = None
                    continue
                
                if line.startswith('## '):
                    current_category = line[3:]
                    category_map[current_category] = []
                elif current_category:
                    category_map[current_category].append(line.lower())
        
        print(f"✅ Berhasil memuat {len(category_map)} kategori yang sudah ada.")
        return category_map
    except FileNotFoundError:
        print(f"⚠️ Peringatan: File '{txt_file_path}' tidak ditemukan. Penamaan topik akan menggunakan fallback.")
        return {}
    except Exception as e:
        print(f"❌ Gagal membaca atau mem-parsing '{txt_file_path}': {e}")
        return {}

def extract_text_from_html(html_content):
    """Mengambil teks bersih dari konten HTML."""
    soup = BeautifulSoup(html_content, 'lxml')
    for element in soup(['script', 'style', 'nav', 'footer', 'header', 'aside', 'form']):
        element.decompose()
    return ' '.join(soup.stripped_strings)

def preprocess_text(text, stop_words):
    """Membersihkan teks: lowercase, hapus non-alfabet, hapus stopwords."""
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text)
    tokens = nltk.word_tokenize(text)
    filtered_tokens = [word for word in tokens if word not in stop_words and len(word) > 2]
    return " ".join(filtered_tokens)

def get_smart_topic_name(top_keywords, category_map):
    """Menentukan nama topik yang bagus berdasarkan pemetaan atau fallback."""
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
    """Fungsi utama untuk menjalankan seluruh proses."""
    print("🚀 Memulai proses penemuan topik otomatis...")
    download_nltk_data()
    
    existing_category_map = load_existing_categories_from_txt(EXISTING_CATEGORIES_FILE)

    if not os.path.isdir(ARTICLES_DIR):
        print(f"❌ Error: Folder '{ARTICLES_DIR}' tidak ditemukan.")
        return

    corpus = []
    filenames = []
    print("📖 Membaca dan membersihkan semua artikel...")
    for filename in sorted(os.listdir(ARTICLES_DIR)):
        if filename.endswith('.html'):
            file_path = os.path.join(ARTICLES_DIR, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            raw_text = extract_text_from_html(html_content)
            
            if len(raw_text.split()) > 20:
                corpus.append(raw_text)
                filenames.append(filename)

    stop_words = set(stopwords.words('indonesian'))
    processed_corpus = [preprocess_text(doc, stop_words) for doc in corpus]

    print("🔢 Mengubah teks menjadi data numerik (TF-IDF)...")
    vectorizer = TfidfVectorizer(max_df=0.95, min_df=2, stop_words=list(stop_words))
    tfidf_matrix = vectorizer.fit_transform(processed_corpus)

    print(f"🧠 Menganalisis dan menemukan {NUM_TOPICS} topik (NMF)...")
    nmf_model = NMF(n_components=NUM_TOPICS, random_state=1, max_iter=1000, init='nndsvda')
    W = nmf_model.fit_transform(tfidf_matrix)
    
    topic_for_each_file = [row.argmax() for row in W]

    files_by_topic = {i: [] for i in range(NUM_TOPICS)}
    for file_index, topic_index in enumerate(topic_for_each_file):
        files_by_topic[topic_index].append(filenames[file_index])
    
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f_out:
        f_out.write(f"Hasil Analisis Topik Otomatis ({NUM_TOPICS} Topik Ditemukan)\n")
        f_out.write("========================================================\n\n")
        
        feature_names = vectorizer.get_feature_names_out()
        for topic_idx, topic in enumerate(nmf_model.components_):
            top_keywords = [feature_names[i] for i in topic.argsort()[:-NUM_KEYWORDS_PER_TOPIC - 1:-1]]
            topic_name = get_smart_topic_name(top_keywords, existing_category_map)

            f_out.write(f"## Kategori Disarankan: {topic_name}\n")
            f_out.write(f"   Kata Kunci ({len(top_keywords)}): {', '.join(top_keywords)}\n")
            
            assigned_files = files_by_topic.get(topic_idx, [])
            f_out.write(f"   Artikel Terkait ({len(assigned_files)} file):\n")
            if assigned_files:
                for file_name in sorted(assigned_files):
                    f_out.write(f"     - {file_name}\n")
            else:
                f_out.write("     - (Tidak ada artikel yang dominan untuk topik ini)\n")
            f_out.write("\n")
            
    print(f"✨ Proses selesai! Hasil analisis disimpan di '{OUTPUT_FILE}'.")

if __name__ == "__main__":
    main()
