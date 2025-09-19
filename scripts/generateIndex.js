const fs = require('fs');
const path = require('path');

const folder = path.join(__dirname,'../artikel'); // folder artikel
const outputFile = path.join(folder,'index.json');

fs.readdir(folder, (err, files) => {
  if (err) return console.error(err);
  // hanya ambil file .html, kecuali index.json
  const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'index.json');
  fs.writeFile(outputFile, JSON.stringify(htmlFiles, null, 2), err => {
    if (err) console.error(err);
    else console.log(`index.json berhasil dibuat di ${outputFile}`);
  });
});
