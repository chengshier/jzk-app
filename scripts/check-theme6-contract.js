const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const checks = [
  ['../admin/src/views/design/theme/index.vue', ['九州康绿', 'bg6', 'theme6', '#19bf9b', '6: this.theme6']],
  ['static/css/theme_color.scss', ['$main-color-theme6', '$second-color-theme6', '$price-color-theme6', '$left-button-color6', '$index-gradient-color6', '$miaosha-grradient-color6', '$main-gradient-color6', '$second-gradient-color6', '$coupons-gradient-color6', '$bargain-btn-color6', '$nav-two-btn6', '$coupons-border6', '$coupons-light-color6', '$tab-border-bottom6', '$bragin-border-rate6', '$logn-gradient-color6', '$second-color-theme5:#FEAC41;']],
  ['static/css/theme.scss', ['[data-theme = "theme6"] & {color: $main-color-theme6', '[data-theme = "theme6"] & {color: $second-color-theme6', '[data-theme = "theme6"] & {color: $price-color-theme6', '[data-theme = "theme6"] & {background-color: $left-button-color6', '[data-theme = "theme6"] & {border: $coupons-border6', '[data-theme = "theme6"] & {background-color: $nav-two-btn6', '[data-theme = "theme6"] & {border-bottom: $tab-border-bottom6', '[data-theme = "theme6"] & {background-color: $coupons-light-color6', '[data-theme = "theme6"] & {background-color: $main-color-theme6', '[data-theme = "theme6"] & {background: linear-gradient($main-gradient-color6', '[data-theme = "theme6"] & {background: linear-gradient($second-gradient-color6', '[data-theme = "theme6"] & {background: -webkit-linear-gradient($index-gradient-color6', '[data-theme = "theme6"] & {background: -webkit-linear-gradient($miaosha-grradient-color6', '[data-theme = "theme6"] & {background-image: -webkit-linear-gradient($coupons-gradient-color6', '[data-theme = "theme6"] & {background-image: -webkit-linear-gradient($bargain-btn-color6', '[data-theme = "theme6"] & {border-color: $bragin-border-rate6', '[data-theme = "theme6"] & {background: -webkit-linear-gradient($logn-gradient-color6']],
  ['utils/setTheme.js', ["case 'theme6':", '#19BF9B']],
  ['filters/index.js', ["'theme6': '#19bf9b'"]],
  ['pages/users/wechat_login/index.vue', ["case 'theme6':", 'wxbj3.png']],
];
const missing = [];
for (const [rel, needles] of checks) {
  const file = path.resolve(root, rel);
  const text = fs.readFileSync(file, 'utf8');
  for (const needle of needles) {
    if (!text.includes(needle)) missing.push(`${rel}: missing ${needle}`);
  }
}
if (missing.length) {
  console.error(missing.join('\n'));
  process.exit(1);
}
console.log('theme6 contract guards passed');
