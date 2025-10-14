#!/usr/bin/env node
/**
 * ===============================================================
 *  CLEANUP SCRIPT v2 – frijal.pages.dev
 *  Membersihkan dependensi tidak terpakai + reset instalasi npm
 * ===============================================================
 *
 * Cara pakai:
 *   1️⃣  Jalankan: npm install --save-dev depcheck inquirer
 *   2️⃣  Jalankan skrip ini dengan: node ext/cleanup.js
 *
 * Fitur:
 *   ✅ Deteksi paket tidak terpakai (depcheck)
 *   ✅ Pilihan interaktif paket mana yang ingin dihapus
 *   ✅ Hapus otomatis node_modules & package-lock.json (opsional)
 *   ✅ Instal ulang dependensi bersih (npm install)
 */

import { execSync } from "child_process";
import inquirer from "inquirer";
import depcheck from "depcheck";
import fs from "fs";

console.log("🔍 Memindai proyek untuk mendeteksi paket tidak terpakai...\n");

// Baca package.json
const pkgPath = new URL("../package.json", import.meta.url);
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

// Jalankan depcheck
const result = await depcheck(process.cwd(), {});
const unusedDeps = result.dependencies || [];
const unusedDevDeps = result.devDependencies || [];

if (unusedDeps.length === 0 && unusedDevDeps.length === 0) {
  console.log("✅ Tidak ada paket yang tidak digunakan. Semua aman!");
  process.exit(0);
}

console.log("📦 Ditemukan paket tidak digunakan:\n");
if (unusedDeps.length > 0) {
  console.log("Dependencies:");
  unusedDeps.forEach((dep) => console.log("  - " + dep));
}
if (unusedDevDeps.length > 0) {
  console.log("\nDevDependencies:");
  unusedDevDeps.forEach((dep) => console.log("  - " + dep));
}

// Gabungkan semua untuk pilihan interaktif
const allUnused = [
  ...unusedDeps.map((d) => ({ name: d, dev: false })),
  ...unusedDevDeps.map((d) => ({ name: d, dev: true })),
];

// Pilihan paket yang akan dihapus
const { selected } = await inquirer.prompt([
  {
    type: "checkbox",
    name: "selected",
    message: "Pilih paket yang ingin dihapus:",
    choices: allUnused.map((d) => ({
      name: d.dev ? `${d.name} (devDependency)` : d.name,
      value: d,
    })),
  },
]);

if (selected.length === 0) {
  console.log("❎ Tidak ada paket yang dipilih untuk dihapus.");
  process.exit(0);
}

// Jalankan proses uninstall
for (const dep of selected) {
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

// Tanya apakah ingin bersihkan node_modules & reinstall
const { doClean } = await inquirer.prompt([
  {
    type: "confirm",
    name: "doClean",
    message:
      "Apakah ingin menghapus node_modules & package-lock.json lalu reinstall?",
    default: true,
  },
]);

if (doClean) {
  console.log("\n🧹 Menghapus folder node_modules & file lock...");
  try {
    fs.rmSync("node_modules", { recursive: true, force: true });
    fs.rmSync("package-lock.json", { force: true });
  } catch (err) {
    console.error("⚠️ Gagal menghapus beberapa file:", err.message);
  }

  console.log("📦 Menginstal ulang dependensi bersih...");
  try {
    execSync("npm install", { stdio: "inherit" });
  } catch (err) {
    console.error("⚠️ Gagal menginstal ulang:", err.message);
  }
}

console.log("\n✨ Pembersihan selesai! Proyek kamu kini dalam kondisi segar.");
