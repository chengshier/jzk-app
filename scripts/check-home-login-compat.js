const fs = require('fs');
const path = require('path');

const app = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(app, file), 'utf8');

const healthCard = read('components/homeIndex/healthDataCard.vue');
const wechatLogin = read('pages/users/wechat_login/index.vue');

for (const badToken of ['♥', '›']) {
  if (healthCard.includes(badToken)) {
    throw new Error(`healthDataCard still contains platform-sensitive character: ${badToken}`);
  }
}

for (const marker of ['health-data-card__head-main', 'health-data-card__more-arrow', 'health-data-card__advice-icon']) {
  if (!healthCard.includes(marker)) {
    throw new Error(`healthDataCard missing compatibility marker: ${marker}`);
  }
}

for (const marker of ['loginMode', 'submitAccountLogin', '账号登录', '微信登录', 'wechat-login__account-form', "^[\\w\\d]{5,16}$", 'loginH5']) {
  if (!wechatLogin.includes(marker)) {
    throw new Error(`wechat login page missing account-login marker: ${marker}`);
  }
}

const titleSource = read('components/homeIndex/title.vue');
for (const marker of ['title-box__main', 'title-box__left', 'title-box__title', 'title-box__suffix', 'title-box__right']) {
  if (!titleSource.includes(marker)) {
    throw new Error('title component missing layout marker: ' + marker);
  }
}

console.log('home/login compatibility contract passed');
