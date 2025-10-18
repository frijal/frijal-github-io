import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const BASE_URL = "https://frijal.pages.dev/artikel/";
const ARTIKEL_DIR = "artikel";
const IMG_DIR = "img";
const EXT = "webp"; // bisa ganti ke 'jpeg' jika mau

// Dimensi target untuk screenshot
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 675;

async function takeScreenshot(url, outputPath) {
  const browser = await puppeteer.launch({
    headless: "new",
    // Mengatur defaultViewport sesuai dimensi target
    defaultViewport: { width: TARGET_WIDTH, height: TARGET_HEIGHT },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  try {
    const response = await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    if (!response || response.status() !== 200) {
      console.error(`[❌] Gagal memuat ${url} (status ${response?.status()})`);
      return;
    }

    await page.screenshot({
      path: outputPath,
      type: EXT === "webp" ? "webp" : "jpeg",
      quality: 90,
      // Karena kita sudah mengatur defaultViewport, tidak perlu lagi mengaturnya di sini
      // fullPage: false, // Pastikan fullPage false agar menggunakan viewport yang kita set
    });
    console.log(`[✅] Screenshot (${TARGET_WIDTH}x${TARGET_HEIGHT}) disimpan: ${outputPath}`);
  } catch (err) {
    console.error(`[⚠️] Gagal screenshot ${url}: ${err.message}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  if (!fs.existsSync(ARTIKEL_DIR)) {
    console.error(`[FATAL] Folder '${ARTIKEL_DIR}/' tidak ditemukan.`);
    process.exit(1);
  }

  // Membuat folder img jika belum ada (recursive aman)
  if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

  const files = fs.readdirSync(ARTIKEL_DIR).filter(f => f.endsWith(".html"));
  console.log(`🧭 Menemukan ${files.length} artikel...`);

  for (const file of files) {
    const base = path.basename(file, ".html");
    const output = path.join(IMG_DIR, `${base}.${EXT}`);

    if (fs.existsSync(output)) {
      console.log(`[⏭️] Lewati ${output} (sudah ada)`);
      continue;
    }

    const url = `${BASE_URL}${base}.html`;
    await takeScreenshot(url, output);

    // Delay 1 detik antar screenshot untuk mengurangi beban
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log("🎉 Semua screenshot selesai diproses!");
}

main().catch(err => {
  console.error(`[FATAL] ${err.message}`);
  process.exit(1);
});
