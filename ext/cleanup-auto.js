#!/usr/bin/env node
/**
 * ===============================================================
 *  CLEANUP SCRIPT v3 (Non-Interactive) – frijal.pages.dev
 *  Versi otomatis penuh untuk GitHub Actions / CI workflow
 * ===============================================================
 *
 * Jalankan dengan:
 *   node ext/cleanup-auto.js
 *
 * Fitur:
 *   ✅ Scan otomatis paket tidak terpakai (depcheck)
 *   ✅ Hapus otomatis dari dependencies & devDependencies
 *   ✅ Bersihkan node_modules dan package-lock.json
 *   ✅ Instal ulang dependensi bersih
 */

import { execSync } from "child_process";
import depcheck from "depcheck";
import fs from "fs";

console.log("🔍 Menjalankan pembersihan otomatis dependensi...\n");

// Baca package.json
const pkgPath = new URL("../package.json", import.meta.url);
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

// Jalankan depcheck
const result = await depcheck(process.cwd(), {});
const unusedDeps = result.dependencies || [];
const unusedDevDeps = result.devDependencies || [];

if (unusedDeps.length === 0 && unusedDevDeps.length === 0) {
  console.log("✅ Tidak ada paket yang tidak digunakan. Semua bersih!");
  process.exit(0);
}

console.log("📦 Paket tidak digunakan terdeteksi:\n");
if (unusedDeps.length > 0) {
  console.log("Dependencies:");
  unusedDeps.forEach((dep) => console.log("  - " + dep));
}
if (unusedDevDeps.length > 0) {
  console.log("\nDevDependencies:");
  unusedDevDeps.forEach((dep) => console.log("  - " + dep));
}

// Gabungkan semua paket
const allUnused = [
  ...unusedDeps.map((d) => ({ name: d, dev: false })),
  ...unusedDevDeps.map((d) => ({ name: d, dev: true })),
];

// Uninstall otomatis semua paket tidak digunakan
for (const dep of allUnused) {
  const cmd = dep.dev
    ? `npm uninstall --save-dev ${dep.name}`
    : `npm uninstall ${dep.name}`;
  console.log(`\n🚮 Menghapus ${dep.name}...`);
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    console.error(`⚠️ Gagal menghapus ${dep.name}:`, err.message);
  }
}

// Hapus node_modules & package-lock.json
console.log("\n🧹 Menghapus folder node_modules & file lock...");
try {
  fs.rmSync("node_modules", { recursive: true, force: true });
  fs.rmSync("package-lock.json", { force: true });
} catch (err) {
  console.error("⚠️ Gagal menghapus beberapa file:", err.message);
}

// Instal ulang
console.log("\n📦 Menginstal ulang dependensi bersih...");
try {
  execSync("npm install", { stdio: "inherit" });
} catch (err) {
  console.error("⚠️ Gagal menginstal ulang:", err.message);
}

console.log("\n✨ Pembersihan otomatis selesai!");
