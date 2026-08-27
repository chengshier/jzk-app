const assert = require('assert');
const fs = require('fs');
const path = require('path');

const appRoot = path.join(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(appRoot, relativePath), 'utf8');

function testAllHealthEntrancesUseTheHealthTab() {
  const menu = read('components/homeIndex/menus.vue');
  const card = read('components/homeIndex/healthDataCard.vue');

  assert.match(menu, /title === '健康档案'[\s\S]*uni\.switchTab\(\{\s*url\s*\}\)/);
  assert.match(card, /<view class="health-data-card"[^>]*@click="goHealth"/);
  assert.match(card, /uni\.switchTab\(\{\s*url:\s*'\/pages\/health\/index'/);
}

function testHealthSubpagesMatchTheirSourceDirectory() {
  const pages = read('pages.json');
  ['glucose', 'diet', 'exercise', 'medicine', 'dataList', 'device', 'authorization', 'authorizedOwners', 'authorizedData', 'profile', 'trend', 'alerts']
    .forEach(page => assert.match(pages, new RegExp('"path"\\s*:\\s*"health/' + page + '"')));
  assert.match(pages, /"root"\s*:\s*"pages\/jk"/);
}

try {
  testAllHealthEntrancesUseTheHealthTab();
  testHealthSubpagesMatchTheirSourceDirectory();
  console.log('health navigation tests passed');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
