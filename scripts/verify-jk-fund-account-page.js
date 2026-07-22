const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'pages', 'jk', 'fund', 'account.vue');
const content = fs.readFileSync(file, 'utf8');

const requiredLabels = ['提现中', '已提现', '冻结资金', '驳回退回'];
const missing = requiredLabels.filter((label) => !content.includes(label));

if (missing.length) {
  console.error('jk fund account page missing labels:', missing.join(', '));
  process.exit(1);
}

console.log('jk fund account page contains expected Chinese labels');
