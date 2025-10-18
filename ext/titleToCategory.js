// titleToCategory.js
export const categories = [
  {
    "name": "📽️ Multimedia & Editing",
    "keywords": [
      "access",
      "zsync"
    ]
  },
  {
    "name": "📚 Islam & Kehidupan",
    "keywords": [
      "aamul",
      "zulkifli"
    ]
  },
  {
    "name": "🏞️ Budaya, Kuliner & Lifestyle",
    "keywords": [
      "1900dari",
      "yogyakarta"
    ]
  },
  {
    "name": "📰 Catatan & Sosial",
    "keywords": [
      "abbasiyah",
      "yogyakarta"
    ]
  },
  {
    "name": "💻 Windows & Teknologi Umum",
    "keywords": [
      "abadi",
      "yuan"
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
