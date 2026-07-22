const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const raw = fs.readFileSync(path.join(root, 'pages.json'), 'utf8');
let config;
try { config = Function(`"use strict"; return (${raw});`)(); } catch (error) { throw new Error(`pages.json JSONC parse failed: ${error.message}`); }
const pkg = config.subPackages.find(item => item.root === 'pages/jk');
if (!pkg) throw new Error('pages/jk subpackage missing');
for (const page of pkg.pages) {
  const file = path.join(root, pkg.root, `${page.path}.vue`);
  if (!fs.existsSync(file)) throw new Error(`route file missing: ${file}`);
}
console.log(`pages.json route contract passed (${pkg.pages.length} health pages)`);
