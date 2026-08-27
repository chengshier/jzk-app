const assert = require('assert');
const fs = require('fs');
const path = require('path');

const appRoot = path.join(__dirname, '..');
const readApp = file => fs.readFileSync(path.join(appRoot, file), 'utf8');
const readBackend = file => fs.readFileSync(path.join(appRoot, '..', 'crmeb', file), 'utf8');

const home = readApp('pages/health/index.vue');
const device = readApp('pages/jk/health/device.vue');
const trend = readApp('pages/jk/health/trend.vue');
const homeHealthCard = readApp('components/homeIndex/healthDataCard.vue');
const callbackProcessor = readBackend('crmeb-service/src/main/java/com/zbkj/service/service/impl/jiuzhoukang/health/SinocareCallbackProcessor.java');

for (const page of [home, device]) {
  assert.match(page, /isMonitoring\(\)[\s\S]*?detectionEndTime\s*>\s*Date\.now\(\)/,
    'a future sensor end time must represent active monitoring');
}

assert.match(trend, /v-for="item in tableRows"/,
  'the glucose table must use a presentation-specific ordering');
assert.match(trend, /tableRows\(\)[\s\S]*?\.slice\(\)\.sort\(\(a, b\) => this\.recordTime\(b\) - this\.recordTime\(a\)\)/,
  'the table must show newest glucose records first without reversing chart data');
assert.match(callbackProcessor, /row\.setStatus\(1\)\.setDetectionEndTime\(null\)/,
  'a CGM callback after an old end time must reactivate the session');
assert.match(homeHealthCard, /import\s*\{\s*getHealthDashboard\s*\}\s*from '@\/api\/health\.js'/,
  'the mall homepage health card must load real health data');
assert.match(homeHealthCard, /mounted\(\)\s*\{\s*this\.loadHealthData\(\)/,
  'the mall homepage health card must fetch data when shown');
assert.doesNotMatch(homeHealthCard, /'测试数据'|'5\.8'|'测量时间 07:30'/,
  'the mall homepage health card must not contain fake fallback measurements');

console.log('health monitoring and trend contract test passed');
