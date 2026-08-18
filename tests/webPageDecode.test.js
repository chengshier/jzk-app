const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '../pages/users/web_page/index.vue'), 'utf8');

assert.match(source, /this\.url\s*=\s*decodeURIComponent\(option\.webUel\)/,
  'web-view must decode the encoded target URL passed by navigateTo');
assert.ok(source.includes('decodeURIComponent(option.title)'),
  'the encoded page title should also be decoded');

console.log('web page decode test passed');
