import request from '@/utils/request.js';

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
