const fs = require('fs');
const path = require('path');

const app = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(app, file), 'utf8');
const requireText = (source, marker, file) => {
  if (!source.includes(marker)) throw new Error(`${file} is missing: ${marker}`);
};

const pages = read('pages.json');
const selectPage = read('pages/jk/identity/select.vue');
const successPage = read('pages/jk/identity/success.vue');
const applyPage = read('pages/jk/identity/apply.vue');

for (const route of ['"path": "identity/select"', '"path": "identity/success"']) {
  requireText(pages, route, 'pages.json');
}

for (const marker of ['getJkPermissionContext', 'canApplyRoles', 'primaryRoleCode', 'currentRole', 'selectedRoleCode', 'apply?roleCode', 'uni.navigateTo']) {
  requireText(selectPage, marker, 'identity/select.vue');
}

for (const marker of ['getJkIdentityApplyList', 'onLoad(query)', 'uni.redirectTo', '/pages/jk/identity/applyList', '/pages/jk/identity/status']) {
  requireText(successPage, marker, 'identity/success.vue');
}

for (const marker of ['mode="multiSelector"', 'parentRegionCode', 'onRegionColumnChange', 'form.recommender', 'buildApplyReason', 'uploadImageOne', 'certificateFiles: JSON.stringify', 'submitJkIdentityApply', 'requestNo', '/pages/jk/identity/success']) {
  requireText(applyPage, marker, 'identity/apply.vue');
}

console.log('jk identity application contract passed');
