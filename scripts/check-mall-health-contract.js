const fs = require('fs');
const path = require('path');
const app = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(app, file), 'utf8');
const pages = read('pages.json');

if (!fs.existsSync(path.join(app, 'pages/mall/index.vue'))) throw new Error('missing mall root page');
if (!pages.includes('"path": "pages/mall/index"')) throw new Error('missing mall root route');
if (!fs.existsSync(path.join(app, 'api/health.js'))) throw new Error('missing health api contract');
for (const marker of ['getProductslist', 'goShopDetail', 'mall-banner-glucose-management.png']) {
  if (!read('pages/mall/index.vue').includes(marker)) throw new Error('missing mall behavior: ' + marker);
}
for (const marker of ['saveGlucose', 'saveDiet', 'saveExercise', 'saveMedicine']) {
  if (!read('api/health.js').includes(marker)) throw new Error('missing health API: ' + marker);
}
for (const [file, api] of Object.entries({
  'pages/jk/health/glucose.vue': 'saveGlucose',
  'pages/jk/health/diet.vue': 'saveDiet',
  'pages/jk/health/exercise.vue': 'saveExercise',
  'pages/jk/health/medicine.vue': 'saveMedicine'
})) {
  const source = read(file);
  if (!source.includes(api) || !source.includes('v-model')) throw new Error(`missing interactive health form: ${file}`);
}
if (!read('components/homeIndex/healthDataCard.vue').includes('goHealth')) throw new Error('missing health dashboard navigation');
const mall = read('pages/mall/index.vue');
for (const marker of ['mall-card__title-row', 'mall-card__name', 'mall-card__tags']) {
  if (!mall.includes(marker)) throw new Error(`missing stable mall card section: ${marker}`);
}
console.log('mall and health contract passed');


