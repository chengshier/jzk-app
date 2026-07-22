const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const required = {
  'App.vue': ["@import 'static/css/ui11.scss';"],
  'pages/index/index.vue': ['ui1.1 visual override', 'goDetail', 'ui11-home', '/pages/health/index'],
  'pages/goods/goods_list/index.vue': ['ui1.1 visual override', 'set_where', 'godDetail'],
  'pages/goods/goods_details/index.vue': ['ui1.1 visual override', 'joinCart', 'goBuy'],
  'pages/order_addcart/order_addcart.vue': ['ui1.1 visual override', 'subOrder'],
  'pages/order/order_confirm/index.vue': ['ui1.1 visual override', 'SubOrder'],
  'pages/users/login/index.vue': ['ui1.1 visual override', 'loginMobile', 'submit', 'ui11-login-hero'],
  'components/pageFooter/index.vue': ['ui1.1 visual override', 'goRouter', 'ui11-health-entry']
};
for (const [file, markers] of Object.entries(required)) {
  const source = read(file);
  for (const marker of markers) {
    if (!source.includes(marker)) throw new Error(`Missing ${marker} in ${file}`);
  }
}
for (const asset of ['home-spring-banner.png', 'home-doctor-banner.png', 'login-hero.png']) {
  if (!fs.existsSync(path.join(root, 'static', 'ui11', asset))) {
    throw new Error('Missing UI asset: ' + asset);
  }
}
console.log('ui1.1 visual contract passed');
