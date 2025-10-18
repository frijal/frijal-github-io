#!/usr/bin/env bash
# ==============================================
# 🧹 Replace .jpg meta tags with .webp equivalents
# ✅ Jalankan langsung dari dalam folder artikel/
# ==============================================

LOG_FILE="replace-log.txt"

echo "🔍 Memulai pencarian file HTML di folder saat ini: $(pwd)"
echo "🧾 Log hasil: $LOG_FILE"
echo "---------------------------------------------" > "$LOG_FILE"

# Jalankan perl in-place replacement untuk semua file .html di folder ini dan subfoldernya
find . -type f -name "*.html" | while read -r FILE; do
  BEFORE_HASH=$(sha1sum "$FILE" | awk '{print $1}')

  perl -pi -e '
  s|<meta name="twitter:image" content="https://frijal\.pages\.dev/artikel/(.*?)\.jpg">|<meta name="twitter:image" content="https://frijal.pages.dev/img/\1.webp">|g;
  s|<meta name="twitter:image" content="https://frijal\.pages\.dev/artikel/(.*?)\.webp">|<meta name="twitter:image" content="https://frijal.pages.dev/img/\1.webp">|g;
  s|<meta name="twitter:image" content="https://frijal\.pages\.dev/assets/og/(.*?)\.jpg">|<meta name="twitter:image" content="https://frijal.pages.dev/img/\1.webp">|g;

  s|<meta itemprop="image" content="https://frijal\.pages\.dev/artikel/(.*?)\.jpg">|<meta itemprop="image" content="https://frijal.pages.dev/img/\1.webp">|g;
  s|<meta itemprop="image" content="https://frijal\.pages\.dev/artikel/(.*?)\.webp">|<meta itemprop="image" content="https://frijal.pages.dev/img/\1.webp">|g;
  s|<meta itemprop="image" content="https://frijal\.pages\.dev/assets/og/(.*?)\.jpg">|<meta itemprop="image" content="https://frijal.pages.dev/img/\1.webp">|g;
  
  s|<meta property="og:image" content="https://frijal\.pages\.dev/artikel/(.*?)\.jpg">|<meta property="og:image" content="https://frijal.pages.dev/img/\1.webp">|g;  
  s|<meta property="og:image" content="https://frijal\.pages\.dev/artikel/(.*?)\.webp">|<meta property="og:image" content="https://frijal.pages.dev/img/\1.webp">|g;
  s|<meta property="og:image" content="https://frijal\.pages\.dev/assets/og/(.*?)\.jpg">|<meta property="og:image" content="https://frijal.pages.dev/img/\1.webp">|g;  

  ' "$FILE"

  AFTER_HASH=$(sha1sum "$FILE" | awk '{print $1}')

  if [ "$BEFORE_HASH" != "$AFTER_HASH" ]; then
    echo "✅ Updated: $FILE" | tee -a "$LOG_FILE"
  else
    echo "— No changes: $FILE" >> "$LOG_FILE"
  fi
done

echo ""
echo "✨ Selesai! Lihat hasil di $LOG_FILE"
