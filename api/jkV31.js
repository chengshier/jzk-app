import request from '@/utils/request.js';

// V3.1 补漏：普通用户个人资料标准区域，不要求代理身份。
export function getJkProfileRegion() { return request.get('jk/user-profile/region'); }
export function saveJkProfileRegion(data) { return request.post('jk/user-profile/region', data); }
export function getJkRegionOptions(params) { return request.get('jk/region/options', params || {}); }

// 第一批：直属下级人数额度
export function getJkTeamQuota(childUserId) {
  const params = childUserId ? { childUserId } : {};
  return request.get('jk/team/quota', params);
}

// 第二批：线下终端销售
export function resolveJkOfflineCustomer(phone) { return request.get('jk/offline-sale/customer/resolve', { phone }); }
export function createJkOfflineSale(data) { return request.post('jk/offline-sale/create', data); }
export function getJkOfflineSaleList(params) { return request.get('jk/offline-sale/list', params); }
export function getJkOfflineSaleDetail(id) { return request.get('jk/offline-sale/' + id); }
export function cancelJkOfflineSale(id, data) { return request.post('jk/offline-sale/' + id + '/cancel', data); }
export function returnJkOfflineSale(id, data) { return request.post('jk/offline-sale/' + id + '/return', data); }

// 第二批：业绩和经营收益，与平台应付佣金分开展示
export function getJkPerformanceSummary() { return request.get('jk/performance/summary'); }
export function getJkPerformanceList(params) { return request.get('jk/performance/list', params); }
export function getJkOperationProfitSummary() { return request.get('jk/operation-profit/summary'); }
export function getJkOperationProfitList(params) { return request.get('jk/operation-profit/list', params); }
export function getJkOperationProfitDetail(id) { return request.get('jk/operation-profit/' + id); }

// 第三批：库存盘点
export function getJkStockCheckList(params) { return request.get('jk/stock-check/list', params); }
export function getJkStockCheckDetail(id) { return request.get('jk/stock-check/' + id); }
export function createJkStockCheck(data) { return request.post('jk/stock-check/create', data); }
export function countJkStockCheck(id, data) { return request.post('jk/stock-check/' + id + '/count', data); }
export function submitJkStockCheck(id, data) { return request.post('jk/stock-check/' + id + '/submit', data); }

// 第三批：异常收货 V2 处理进度
export function getJkReceiveResolutionList(exceptionId) { return request.get('jk/receive-exception-resolution/list', { exceptionId }); }

// 第三批：健康周报/月报
export function generateJkHealthReport(data) { return request.post('jk/health/report/generate', data); }
export function getJkHealthReportList(params) { return request.get('jk/health/report/list', params); }
export function getJkHealthReportDetail(id) { return request.get('jk/health/report/' + id); }

// 第三批：真实微信小程序码
export function generateJkPromotionCode(sceneCode, requestNo) { return request.get('jk/promotion-code/generate', { sceneCode, requestNo }); }

// 第三批：小程序订阅消息主动授权配置；scene 仅支持 BUSINESS / WITHDRAW。
export function getJkSubscriptionConfig(scene) { return request.get('jk/subscription/config', { scene: scene || 'BUSINESS' }); }
