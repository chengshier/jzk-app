const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../pages/jk/identity/applyList.vue');
const source = fs.readFileSync(file, 'utf8');

if (/:class="[^\"]*\w+\([^\"]*\)"/.test(source)) {
  throw new Error('uni-app template :class bindings must not call methods');
}

console.log('applyList :class bindings are compatible with uni-app templates');
