const playwright = require('playwright');
          
async function takeScreenshot(url, outputPath) {
  // Menggunakan browser Chromium
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  // Atur ukuran viewport yang konsisten
  await page.setViewportSize({ width: 1280, height: 800 }); 
  
  try {
    // Tunggu hingga halaman dimuat ('load')
    const response = await page.goto(url, { waitUntil: 'load' });
    
    if (response && response.status() !== 200) {
       console.error(`[ERROR] Gagal memuat ${url}. Status: ${response.status()}`);
       await browser.close();
       return 1; // Kembalikan kode error 
    }

    // Ambil screenshot hanya dari viewport ('page')
    await page.screenshot({ path: outputPath, type: 'jpeg', quality: 90 });
    console.log(`[SUCCESS] Screenshot disimpan sebagai ${outputPath}`);

  } catch (error) {
    console.error(`[FATAL] Gagal mengambil screenshot untuk ${url}: ${error.message}`);
    return 1;
  } finally {
    await browser.close();
  }
  return 0;
}

// Panggil fungsi utama dengan argumen dari Docker
takeScreenshot(process.argv[2], process.argv[3]).then(process.exit);
