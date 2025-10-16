#!/usr/bin/env bash
set -euo pipefail

# 🧭 Jalankan skrip ini dari dalam folder 'artikel/'
# Fungsi: mengganti string penting, menambahkan CSS/JS/elemen HTML baru,
# dan membuat log 'log-ganti.txt' jika ada perubahan.

FILE_PATTERN="*.html"
LOG_FILE="./log-ganti.txt"
TMP_DIR="./.tmp-ganti"
mkdir -p "$TMP_DIR"

START_TIME=$(date +%s)
DATE_NOW=$(date '+%Y-%m-%d %H:%M:%S')
CHANGED_COUNT=0

TMP_LOG="$TMP_DIR/log.tmp"
> "$TMP_LOG"

# 🎨 Warna Terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Hitung total file HTML
TOTAL_FILES=$(find . -type f -name "$FILE_PATTERN" | wc -l | tr -d ' ')
CURRENT_INDEX=0

echo -e "${CYAN}🔧 Memulai proses penggantian string dan elemen HTML...${RESET}"
echo -e "${CYAN}📄 Total file ditemukan:${RESET} $TOTAL_FILES"
echo -e "${CYAN}🕒 $DATE_NOW - Mulai proses${RESET}"

# Fungsi progress bar
show_progress() {
  local current=$1 total=$2
  local width=40
  local progress=$((current * width / total))
  local percent=$((current * 100 / total))
  local filled=$(printf "%-${progress}s" "#" | tr ' ' '#')
  local empty=$(printf "%-$((width - progress))s" " ")
  printf "\r${YELLOW}[%s%s] %3d%% (%d/%d)${RESET}" "$filled" "$empty" "$percent" "$current" "$total"
}

# Loop utama
find . -type f -name "$FILE_PATTERN" -print0 | while IFS= read -r -d '' file; do
  ((CURRENT_INDEX++))
  show_progress "$CURRENT_INDEX" "$TOTAL_FILES"

  cp "$file" "$TMP_DIR/original.tmp"

  # 🔁 Ganti teks dengan Perl
  perl -pi -w -e 's#frijal.github.io#frijal.pages.dev#g' "$file"
  perl -pi -w -e 's#bak.xo.je#frijal.pages.dev#g' "$file"
  perl -pi -w -e 's#https://frijal.pages.dev/assets/apple-touch-icon.png#https://frijal.pages.dev/ext/icons/apple-touch-icon.png#g' "$file"
  perl -pi -w -e 's#YOUR_APP_ID#1471267430691023#g' "$file"
  perl -pi -w -e 's#YOUR_FACEBOOK_APP_ID#1471267430691023#g' "$file"
  perl -pi -w -e 's#nama_twitter_anda#frijal#g' "$file"
  perl -pi -w -e 's/©/🄯/g' "$file"
  perl -pi -w -e 's#Komentar#Jaga Data Pribadi Tetap Aman.#g' "$file"
  perl -pi -w -e 's#Bak Xo Je#Jaga Data Pribadi Tetap Aman.#g' "$file"
  perl -pi -w -e 's#Punya Pengalaman Serupa\? Yuk Diskusi!#Jaga Data Pribadi Tetap Aman.#g' "$file"
  perl -pi -w -e 's#Ada Pertanyaan\? Diskusi di Sini!#Jaga Data Pribadi Tetap Aman.#g' "$file"
  perl -pi -w -e 's#Diskusi di Sini Yuk!#Jaga Data Pribadi Tetap Aman.#g' "$file"

  # 🎨 Tambahkan elemen tambahan
  if ! grep -q '<link rel="stylesheet" href="/ext/marquee-url.css">' "$file"; then
    sed -i '/<\/head>/i <link rel="stylesheet" href="/ext/marquee-url.css">' "$file"
  fi

  if ! grep -q '<div id="iposbrowser"></div>' "$file"; then
    sed -i '/<\/h1>/a <div id="iposbrowser"></div>' "$file"
  fi

  if ! grep -q 'class="search-floating-container"' "$file"; then
    sed -i '/<\/body>/i <div class="search-floating-container"><input type="text" id="floatingSearchInput" placeholder="cari artikel..." autocomplete="off"><span id="floatingSearchClear" class="clear-button">❌</span><div id="floatingSearchResults" class="floating-results-container"></div></div>' "$file"
  fi

  if ! grep -q 'id="related-marquee-section"' "$file"; then
    sed -i '/<\/body>/i <section id="related-marquee-section"><div id="related-marquee-container"></div></section><script defer src="/ext/marquee-url.js"></script>' "$file"
  fi

  if ! grep -q '/ext/iposbrowser.js' "$file"; then
    sed -i '/<\/body>/i <script defer src="/ext/iposbrowser.js"></script>' "$file"
  fi

  # 🧩 Cek perubahan
  if ! diff -q "$TMP_DIR/original.tmp" "$file" > /dev/null; then
    ((CHANGED_COUNT++))
    echo -e "[${GREEN}✔${RESET}] $file" >> "$TMP_LOG"
  else
    echo -e "[${YELLOW}•${RESET}] $file" >> "$TMP_LOG"
  fi
done

echo ""  # newline setelah progress bar

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# 📊 Buat log akhir
if (( CHANGED_COUNT > 0 )); then
  {
    echo "🕒 $DATE_NOW - Mulai proses"
    echo "------------------------------------------------------------"
    cat "$TMP_LOG"
    echo "------------------------------------------------------------"
    echo "📊 Total file diubah : $CHANGED_COUNT dari $TOTAL_FILES"
    echo "⏱️  Durasi proses     : ${DURATION}s"
    echo "🕒 Selesai pada       : $(date '+%Y-%m-%d %H:%M:%S')"
  } > "$LOG_FILE"

  echo -e "\n${GREEN}✅ Proses selesai!${RESET}"
  echo -e "${CYAN}📄 Log tersimpan di:${RESET} $LOG_FILE"
else
  echo -e "\n${YELLOW}ℹ️ Tidak ada perubahan.${RESET}"
fi

rm -rf "$TMP_DIR"
