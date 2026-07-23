const fs = require('fs');
const path = require('path');

const appRoot = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(appRoot, relPath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const applyList = read('pages/jk/identity/applyList.vue');
assert(
  !applyList.includes(':class="statusClass(item)"'),
  'applyList still uses unsupported function-call syntax in :class'
);

const healthIndex = read('pages/health/index.vue');
assert(
  healthIndex.includes('<template>\n') || healthIndex.includes('<template>\r\n'),
  'health/index should be normalized into a readable multiline SFC'
);
assert(
  /<template>[\s\S]*<view class="page">[\s\S]*<\/view>[\s\S]*<\/template>/.test(healthIndex),
  'health/index template root is missing or malformed'
);

const identityStatus = read('pages/jk/identity/status.vue');
assert(
  !identityStatus.includes("\\'income-entry\\'"),
  'identity/status still contains escaped quotes inside template bindings'
);
assert(
  !identityStatus.includes('},    goList()'),
  'identity/status methods block still has compressed inline declarations'
);

console.log('template compile guards passed');
