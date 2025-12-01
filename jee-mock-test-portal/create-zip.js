const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const output = fs.createWriteStream('jee-mock-test-portal.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  const size = (archive.pointer() / 1024).toFixed(1);
  console.log(`✓ Zip file created: ${size} KB`);
});

archive.on('error', err => { throw err; });
archive.pipe(output);

const excludes = ['node_modules', '.git', 'dist', '.vite', '.cache', '.local', '.upm', '.DS_Store'];

function walk(dir, base) {
  fs.readdirSync(dir).forEach(file => {
    if (excludes.includes(file)) return;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const arcPath = path.join(base, file);
    if (stat.isDirectory()) {
      walk(filePath, arcPath);
    } else {
      archive.file(filePath, { name: arcPath });
    }
  });
}

walk('.', '.');
archive.finalize();
