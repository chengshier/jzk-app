const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function testHealthExperienceApiAndPagesExist() {
  const api = read('api/health.js');
  const home = read('pages/health/index.vue');
  const device = read('pages/jk/health/device.vue');
  const trend = read('pages/jk/health/trend.vue');
  const reportIndex = read('pages/jk/report/index.vue');
  const reportDetail = read('pages/jk/health/reportDetail.vue');
  const pages = read('pages.json');

  ['getHealthDeviceStatus', 'getGlucoseTrend', 'getSinocareHealthReportList', 'getSinocareHealthReportDetail'].forEach(name => assert.match(api, new RegExp('export const ' + name)));
  assert.match(home, /deviceState/);
  assert.match(home, /isMonitoring/);
  assert.match(home, /未授权/);
  assert.match(home, /等待设备同步/);
  assert.match(home, /健康报告/);
  assert.match(device, /deviceState/);
  assert.match(device, /isMonitoring/);
  assert.match(device, /暂未收到设备监测信息/);
  assert.match(trend, /canvas/);
  assert.match(trend, /7 天/);
  assert.match(trend, /30 天/);
  assert.match(pages, /"path"\s*:\s*"health\/reportDetail"/);
  assert.match(reportIndex, /openReport\(x\)\{uni\.navigateTo\(\{url:'\/pages\/jk\/health\/reportDetail\?id='/);
  assert.match(home, /authorized.*hasGlucoseData/);
  assert.match(device, /productName[\s\S]*deviceSn[\s\S]*detectionStartTime[\s\S]*lastDataAt/);
  assert.match(device, /授权管理|前往三诺授权页管理/);
  assert.match(trend, /startAt[\s\S]*endAt/);
  assert.match(trend, /v-for="item in tableRows"/);
  assert.match(trend, /tableRows\(\)[\s\S]*?\.slice\(\)\.sort\(/);
  assert.match(home, /startAt[\s\S]*endAt/);
  assert.match(reportDetail, /getSinocareHealthReportList[\s\S]*getSinocareHealthReportDetail[\s\S]*from '@\/api\/health\.js'/);
  assert.match(reportDetail, /Promise\.all\(\[this\.fetchLatest\('DIGITAL'\), this\.fetchLatest\('PDF'\)\]\)/);
  assert.match(reportDetail, /parsePayload\(payload\)/);
  assert.doesNotMatch(reportDetail, /JSON\.stringify\(p\)/);
  assert.match(reportDetail, /数据来源[\s\S]*三诺健康服务/);
  assert.match(reportDetail, /仅用于健康记录回顾，不构成医疗诊断或治疗建议/);
  assert.match(home, /latestReport\.reportType/);
  assert.match(home, /latestReport\.createTime/);
  assert.match(home, /report\.deviceSn/);
  assert.match(home, /go\('\/pages\/jk\/health\/reportDetail'\)/);
  assert.match(reportIndex, /source=local/);
  assert.match(trend, /<glucose-u-charts[\s\S]*:height-rpx="330"[\s\S]*canvas-id="healthTrendGlucoseChart"/);
  [home, device, trend, reportDetail].forEach(page => {
    assert.match(page, /加载失败/);
    assert.match(page, /重新加载|重试/);
  });
}

try {
  testHealthExperienceApiAndPagesExist();
  console.log('health experience static tests passed');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
