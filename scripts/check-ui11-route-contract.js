const fs = require('fs');
const path = require('path');

const app = path.resolve(__dirname, '..');
const routes = [
  ['pages/health/index.vue', 'pages/health/index', '健康'],
  ['pages/jk/health/glucose.vue', 'health/glucose', '血糖记录'],
  ['pages/jk/health/diet.vue', 'health/diet', '记录饮食'],
  ['pages/jk/health/exercise.vue', 'health/exercise', '记录运动'],
  ['pages/jk/health/medicine.vue', 'health/medicine', '选择药品']
];

const json = fs.readFileSync(path.join(app, 'pages.json'), 'utf8');
for (const [file, route, title] of routes) {
  if (!fs.existsSync(path.join(app, file))) throw new Error(`missing file: ${file}`);
  if (!json.includes(`"path": "${route}"`)) throw new Error(`missing route: ${route}`);
  if (!json.includes(`"navigationBarTitleText": "${title}"`)) throw new Error(`missing title: ${title}`);
}

const assetBase = 'http://jzk.wit.cn/crmebimage/public/product/2026/07/13/';
if (!assetBase.startsWith('http://jzk.wit.cn/')) throw new Error('unexpected UI1.1 asset host');

const menu = fs.readFileSync(path.join(app, 'components/homeIndex/menus.vue'), 'utf8');
if (!menu.includes('/pages/health/index')) throw new Error('missing homepage health fallback');
const required = {
  'pages/goods/goods_list/index.vue': ['godDetail', 'ui11-mall-page', 'mall-banner-glucose-management.png'],
  'pages/goods/goods_details/index.vue': ['joinCart', 'goBuy', 'ui11-detail-page', 'ui11-detail-summary', 'ui11-detail-guarantees'],
  'pages/order_addcart/order_addcart.vue': ['subOrder', 'ui11-cart-page'],
  'pages/order/order_confirm/index.vue': ['SubOrder', 'ui11-confirm-page'],
  'pages/users/login/index.vue': ['loginMobile', 'submit', 'ui11-login-page', 'login-hero-health-kit.png']
};
for (const [file, markers] of Object.entries(required)) {
  const source = fs.readFileSync(path.join(app, file), 'utf8');
  for (const marker of markers) if (!source.includes(marker)) throw new Error(`missing ${marker} in ${file}`);
}
console.log('ui11 route contract passed');
