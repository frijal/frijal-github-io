#!/usr/bin/env bash
set -euo pipefail

# 🧭 Deskripsi:
# Jalankan skrip ini di dalam folder 'artikel/'
# untuk mengganti string penting dan menambahkan elemen CSS/JS baru,
# serta mencatat laporan ke log-ganti.txt jika ada perubahan.

FILE_PATTERN="*.html"
LOG_FILE="./log-ganti.txt"
TMP_DIR="./.tmp-ganti"
mkdir -p "$TMP_DIR"

START_TIME=$(date +%s)
DATE_NOW=$(date '+%Y-%m-%d %H:%M:%S')
CHANGED_COUNT=0

echo "🔧 Memulai proses penggantian string dan penambahan elemen..."
echo "🕒 $DATE_NOW - Mulai proses"

# Bersihkan log lama sementara
TMP_LOG="$TMP_DIR/log.tmp"
> "$TMP_LOG"

find . -type f -name "$FILE_PATTERN" | while read -r file; do
  cp "$file" "$TMP_DIR/original.tmp"

  # 🔁 Ganti teks menggunakan Perl
  perl -pi -w -e 's#frijal.github.io/#frijal.pages.dev/#g' "$file"
  perl -pi -w -e 's#bak.xo.je/#frijal.pages.dev/#g' "$file"
  perl -pi -w -e 's#https://frijal.pages.dev/assets/apple-touch-icon.png#https://frijal.pages.dev/ext/icons/apple-touch-icon.png#g' "$file"
  perl -pi -w -e 's#YOUR_APP_ID#1471267430691023#g' "$file"
  perl -pi -w -e 's#YOUR_FACEBOOK_APP_ID#1471267430691023#g' "$file"
  perl -pi -w -e 's#nama_twitter_anda#frijal#g' "$file"
  perl -pi -w -e 's/©/🄯/g' "$file"
  perl -pi -w -e 's#Komentar#Jaga Data Pribadi Tetap Aman.#g' "$file"
  perl -pi -w -e 's#Bak Xo Je#Jaga Data Pribadi Tetap Aman.#g' "$file"

  # 🎨 Tambahkan CSS & elemen baru
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

  # 🧩 Deteksi perubahan
  if ! diff -q "$TMP_DIR/original.tmp" "$file" > /dev/null; then
    ((CHANGED_COUNT++))
    echo "[$(date '+%H:%M:%S')] ✅ Berubah: $file" >> "$TMP_LOG"
  fi
done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

if (( CHANGED_COUNT > 0 )); then
  {
    echo "🕒 $DATE_NOW - Mulai proses"
    echo "------------------------------------------------------------"
    cat "$TMP_LOG"
    echo "------------------------------------------------------------"
    echo "📊 Total file diubah : $CHANGED_COUNT"
    echo "⏱️  Durasi proses     : ${DURATION}s"
    echo "🕒 Selesai pada       : $(date '+%Y-%m-%d %H:%M:%S')"
  } > "$LOG_FILE"

  echo "✅ Selesai! $CHANGED_COUNT file berubah."
  echo "📄 Log tersimpan di: $LOG_FILE"
else
  echo "ℹ️ Tidak ada perubahan. log-ganti.txt tidak diperbarui."
fi

rm -rf "$TMP_DIR"
