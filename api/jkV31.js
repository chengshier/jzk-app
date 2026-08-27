import request from '@/utils/request.js';

// V3.1 第一批：本人直属下级人数额度
export function getJkTeamQuota(childUserId) {
  const params = childUserId ? { childUserId } : {};
  return request.get('jk/team/quota', params);
}

// V3.1 第二批：业绩、经营收益和线下销售
export function getJkPerformanceSummary() { return request.get('jk/performance/summary'); }
export function getJkPerformanceList(params) { return request.get('jk/performance/list', params); }
export function getJkOperationProfitSummary() { return request.get('jk/operation-profit/summary'); }
export function getJkOperationProfitList(params) { return request.get('jk/operation-profit/list', params); }
export function createJkOfflineSale(data) { return request.post('jk/offline-sale/create', data); }
export function getJkOfflineSaleList(params) { return request.get('jk/offline-sale/list', params); }
export function getJkOfflineSaleDetail(id) { return request.get('jk/offline-sale/' + id); }
export function cancelJkOfflineSale(id, reason) { return request.post('jk/offline-sale/' + id + '/cancel?reason=' + encodeURIComponent(reason), {}); }
export function returnJkOfflineSale(id, data) { return request.post('jk/offline-sale/' + id + '/return', data); }

// V3.1 第三批：个人库存盘点和健康报告
export function createJkStockCheck(data) { return request.post('jk/stock-check/create', data); }
export function getJkStockCheckList(params) { return request.get('jk/stock-check/list', params); }
export function getJkStockCheckDetail(id) { return request.get('jk/stock-check/' + id); }
export function submitJkStockCheck(data) { return request.post('jk/stock-check/submit', data); }
export function getJkHealthReport(params) { return request.get('jk/health/report', params); }
