#!/bin/bash

# ===================================================================
# pratinjau.sh (Versi Perl)
#
# Skrip ini membuat pratinjau untuk menghapus blok HTML spesifik
# yang dimulai dengan ""
# dan diakhiri dengan tag </a> terakhir di dalam blok tersebut.
# ===================================================================

OUTPUT_FILE="pratinjau_perubahan.diff"

# Hapus file pratinjau lama jika ada
rm -f "$OUTPUT_FILE"

echo "🔎 Memulai pemindaian file dengan Perl..."
echo "--------------------------------------------------------"

# Loop melalui setiap file yang berakhiran .html
for file in *.html; do
  # Periksa apakah file tersebut ada
  if [ -f "$file" ]; then
    echo "Menganalisis file: $file"
    
    # Kelompokkan output dan tambahkan ke file pratinjau
    {
      echo "==== Perubahan untuk: $file ===="
      
      # Perintah Perl:
      # -0777       : Membaca seluruh file sebagai satu baris.
      # -pe         : Menjalankan ekspresi dan mencetak hasilnya.
      # s/.../.../s : Mencari dan mengganti (substitute).
      #
      #   Pola Pencarian:
      #   [cite_start]: Teks awal blok [cite: 1]
      #   .*?                            : Cocokkan karakter apa pun (termasuk baris baru)
      #   [cite_start]<\/a>                          : Teks akhir blok [cite: 1]
      #
      #   Flag 's' : Membuat '.' cocok dengan karakter baris baru.
      
      perl -0777 -pe 's/.*?<\/a>//s' "$file" | diff --color=always "$file" -
      
      echo "" # Tambahkan baris kosong untuk keterbacaan
      
    } >> "$OUTPUT_FILE"
  fi
done

echo "--------------------------------------------------------"
echo "✅ Selesai! Pratinjau perubahan telah disimpan di file:"
echo "   $OUTPUT_FILE"
echo ""
echo "Anda sekarang bisa membukanya dengan perintah:"
echo "   less -R $OUTPUT_FILE"
