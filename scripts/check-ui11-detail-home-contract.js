const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const detail = read('pages/goods/goods_details/index.vue');
for (const marker of [
  'ui11-detail-summary',
  'ui11-detail-guarantees',
  'ui11-detail-spec',
  'ui11-detail-page .product-con .footer'
]) {
  if (!detail.includes(marker)) throw new Error(`missing detail visual section: ${marker}`);
}

const reminder = read('components/homeIndex/news.vue');
for (const marker of ['ui11-reminder', 'ui11-reminder__message', 'ui11-reminder__arrow']) {
  if (!reminder.includes(marker)) throw new Error(`missing health reminder section: ${marker}`);
}

console.log('ui11 detail and health reminder contract passed');
