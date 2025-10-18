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
  s|"https://frijal\.pages\.dev/artikel/(.*?)\.jpg"|"https://frijal.pages.dev/img/\1.webp"|g;
  s|"https://frijal\.pages\.dev/artikel/(.*?)\.webp"|"https://frijal.pages.dev/img/\1.webp"|g;
  s|"https://frijal\.pages\.dev/img/(.*?)\.jpg"|"https://frijal.pages.dev/img/\1.webp"|g;
  s|"https://frijal\.pages\.dev/assets/og/(.*?)\.jpg"|"https://frijal.pages.dev/img/\1.webp"|g; 
  s|"https://frijal\.pages\.dev/assets/(.*?)\.png"|"https://frijal.pages.dev/img/\1.webp"|g;  
  s|"https://frijal\.pages\.dev/assets/(.*?)\.jpg"|"https://frijal.pages.dev/img/\1.webp"|g; 
   
  s|https://i.ibb.co/L5hY6bX/xfce-infographic-image.jpg|https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgEwXRdmiz34VXRa3Xc5MpggCjskgA78kpzCI1aVgn6anxe6k9-9qIZnYJLJr6Afqs2H9EUb4Y33zw2M0rhe0UDChnUZ229867ZjBKO55RDcQQB-MApYsE0FUckvPRmFVZqaK43-N1s64aY4navaGE1oPeQU2e3m1v3Zy8TJ4r4-axyv4nNo5VPRo3cVDY/s1600/317-wallpaper.png|g;    
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
