const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const targetDirs = (process.env.TARGET_DIRS || "artikel").split(",");
const extensions = (process.env.EXTENSIONS || "html,js,css").split(",");

function run(cmd) {
  console.log(`▶ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

targetDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️ Folder ${dir} tidak ditemukan`);
    return;
  }

  extensions.forEach(ext => {
    try {
      run(`npx prettier --write "${dir}/**/*.${ext}"`);
      console.log(`✅ Prettier sukses untuk .${ext} di ${dir}`);
    } catch (e) {
      console.log(`⚠️ Gagal Prettier untuk .${ext} di ${dir}`);
    }
  });
});

