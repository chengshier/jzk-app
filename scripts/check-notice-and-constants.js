const fs = require('fs');
const path = require('path');

const appRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(appRoot, '..');
const read = (relative) => fs.readFileSync(path.join(workspaceRoot, relative), 'utf8');

const expectedConstantDocs = {
  'crmeb/crmeb-common/src/main/java/com/zbkj/common/constants/jiuzhoukang/JkBizConstants.java': [
    '九州康业务领域通用常量。',
    '业务角色。',
    '审核状态。',
    '库存流水类型。'
  ],
  'crmeb/crmeb-common/src/main/java/com/zbkj/common/constants/jiuzhoukang/JkRelationPermissionCodes.java': [
    '九州康 V3.1 关系人数规则与管理员强制调整后台权限常量。',
    '关系人数规则。',
    '上下级关系调整。'
  ],
  'crmeb/crmeb-common/src/main/java/com/zbkj/common/constants/jiuzhoukang/JkV31PermissionCodes.java': [
    '九州康 V3.1 补充后台权限常量。',
    '分佣与业绩。',
    '经营计划。'
  ]
};

for (const [relative, markers] of Object.entries(expectedConstantDocs)) {
  const source = read(relative);
  for (const marker of markers) {
    if (!source.includes(marker)) throw new Error(`missing constant documentation marker: ${relative} -> ${marker}`);
  }
}

const reminder = read('app/components/homeIndex/news.vue');
for (const marker of [
  'min-height:96rpx',
  'padding:8rpx 0',
  'align-self:stretch',
  'display:flex',
  'align-items:center',
  'min-height:48rpx',
  'line-height:44rpx'
]) {
  if (!reminder.includes(marker)) throw new Error(`missing UI11 notice spacing marker: ${marker}`);
}

console.log('notice spacing and Jiuzhoukang constant documentation contract passed');
