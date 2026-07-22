const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pagesJson = fs.readFileSync(path.join(root, 'pages.json'), 'utf8');
const healthPages = [
  ['health/index', '健康'],
  ['health/diet', '记录饮食'],
  ['health/glucose', '血糖记录'],
  ['health/medicine', '选择药品'],
  ['health/exercise', '添加运动']
];

for (const [route, title] of healthPages) {
  const file = path.join(root, 'pages', 'jk', `${route}.vue`);
  if (!fs.existsSync(file)) throw new Error(`Missing health page: ${file}`);
  if (!pagesJson.includes(`"path": "${route}"`)) throw new Error(`Missing route: ${route}`);
  if (!pagesJson.includes(`"navigationBarTitleText": "${title}"`)) throw new Error(`Missing title: ${title}`);
}

console.log('ui1.1 health route contract passed');
