const fs = require('fs');
const path = require('path');

const app = path.resolve(__dirname, '..');
const userPage = fs.readFileSync(path.join(app, 'pages/user/index.vue'), 'utf8');

for (const marker of [
  'profile-hero',
  'business-guide',
  'order-wrapper',
  'slider-wrapper',
  'jk-business-entry'
]) {
  if (!userPage.includes(marker)) throw new Error(`missing my page visual marker: ${marker}`);
}

for (const source of [
  '我的服务',
  'MyMenus',
  'getMenuList()',
  'routine_my_banner',
  'routine_my_menus',
  'onClickService',
  'orderData()',
  'getJkPermissionContext'
]) {
  if (!userPage.includes(source)) throw new Error(`missing my page data source: ${source}`);
}

for (const layoutRule of [
  '.page-section .order-wrapper .order-bd { display: flex;',
  '.page-section .order-wrapper .order-item { display: flex;',
  '.new-users .slider-wrapper { height: 202rpx;',
  '.jk-business-entry { display: flex;'
]) {
  if (!userPage.includes(layoutRule)) throw new Error(`missing my page layout rule: ${layoutRule}`);
}

console.log('my-page fusion contract passed');
