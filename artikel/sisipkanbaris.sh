#!/bin/bash
# Jalankan script ini dari dalam folder artikel/

for file in *.html; do
  echo "🔍 Memproses $file ..."

  # Tambah div iposbrowser setelah </h1>
  if grep -qi 'iposbrowser' "$file"; then
    echo "ℹ️ Sudah ada iposbrowser di $file"
  else
    sed -i '/<\/h1>/a <div id="iposbrowser"></div>' "$file"
    echo "✅ Ditambahkan iposbrowser di $file"
  fi

  # Tambah related marquee + script sebelum </body>
  if grep -qi 'defer src="/ext/ipos' "$file"; then
    echo "ℹ️ Sudah ada skrip related di $file"
  else
    sed -i '/<\/body>/i <script defer src="/ext/iposbrowser.js"></script>' "$file"
    echo "✅ Ditambahkan skrip iposbrowser di $file"
  fi

done
