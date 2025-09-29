const playwright = require('playwright');

async function takeScreenshot(url, outputPath) {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  // Mengatur ukuran viewport yang konsisten
  await page.setViewportSize({ width: 1280, height: 800 }); 
  
  try {
    // Menunggu halaman dimuat sepenuhnya
    const response = await page.goto(url, { waitUntil: 'load' });
    
    // Cek status HTTP
    if (response && response.status() !== 200) {
       console.error(`[ERROR] Gagal memuat ${url}. Status: ${response.status()}`);
       await browser.close();
       return 1;
    }

    // Ambil screenshot hanya dari viewport
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

// Memanggil fungsi utama dengan argumen yang dilewatkan dari Docker
takeScreenshot(process.argv[2], process.argv[3]).then(process.exit);
