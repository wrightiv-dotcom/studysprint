const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
fs.cpSync(path.join(root, 'dist'), path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs', '.nojekyll'), '');
console.log('Website copied from dist/ to docs/ for GitHub Pages.');
