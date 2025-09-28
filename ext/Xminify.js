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
    console.log(`⚠️ Folder ${dir} tidak di temukan`);
    return;
  }

  extensions.forEach(ext => {
    const files = execSync(`find ${dir} -type f -name "*.${ext}"`)
      .toString()
      .trim()
      .split("\n")
      .filter(Boolean);

    files.forEach(file => {
      try {
        if (ext === "html") {
          run(`npx html-minifier --collapse-whitespace --remove-comments --minify-css true --minify-js true "${file}" -o "${file}"`);
        } else if (ext === "js") {
          run(`npx terser "${file}" -c -m -o "${file}"`);
        } else if (ext === "css") {
          run(`npx cleancss -o "${file}" "${file}"`);
        }
        console.log(`✅ Minify sukses: ${file}`);
      } catch (e) {
        console.log(`⚠️ Gagal minify: ${file}`);
      }
    });
  });
});
