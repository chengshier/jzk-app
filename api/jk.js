import request from '@/utils/request.js';

export function getJkPermissionContext() {
  return request.get('jk/permission/context');
}

export function submitJkIdentityApply(data) {
  return request.post('jk/identity/apply', data);
}

export function getJkIdentityApplyList(data) {
  return request.get('jk/identity/apply/list', data);
}

export function getJkIdentityStatus() {
  return request.get('jk/identity/status');
}

export function getJkIdentityRegionOptions() {
  return request.get('jk/identity/region/options');
}

export function getJkProductTradeView(productId, skuId) {
  const query = skuId ? ('?skuId=' + skuId) : '';
  return request.get('jk/product/trade-view/' + productId + query, {}, { noAuth: true });
}

export function createJkPlatformOrder(data) { return request.post('jk/platform-order/create', data); }
export function getJkPlatformOrderList(data) { return request.get('jk/platform-order/list', data); }
export function getJkPlatformOrderDetail(id) { return request.get('jk/platform-order/' + id + '/detail'); }
export function submitJkPlatformOrderVoucher(id, data) { return request.post('jk/platform-order/' + id + '/voucher', data); }
export function receiveJkPlatformOrder(id, data = {}) { return request.post('jk/platform-order/' + id + '/receive', data); }

export function createJkStockTransfer(data) { return request.post('jk/stock-transfer/create', data); }
export function getJkStockTransferList(data) { return request.get('jk/stock-transfer/list', data); }
export function getJkStockTransferDetail(id) { return request.get('jk/stock-transfer/' + id + '/detail'); }
export function submitJkStockTransferVoucher(id, data) { return request.post('jk/stock-transfer/' + id + '/voucher', data); }
export function receiveJkStockTransfer(id, data = {}) { return request.post('jk/stock-transfer/' + id + '/receive', data); }

export function getJkHandledTransferList(data) { return request.get('jk/stock-transfer/handle/list', data); }
export function getJkHandledTransferDetail(id) { return request.get('jk/stock-transfer/handle/detail/' + id); }
export function auditJkHandledTransfer(data) { return request.post('jk/stock-transfer/handle/audit', data); }
export function confirmJkHandledTransferPayment(data) { return request.post('jk/stock-transfer/handle/confirm-payment', data); }
export function confirmJkHandledTransfer(data) { return request.post('jk/stock-transfer/handle/confirm-transfer', data); }
export function closeJkHandledTransfer(data) { return request.post('jk/stock-transfer/handle/close', data); }
export function getJkMyStock() { return request.get('jk/stock/my'); }
export function getJkMyStockFlows(data) { return request.get('jk/stock/flow/list', data); }

export function getJkCommissionSummary() { return request.get('jk/commission/summary'); }
export function getJkCommissionList(data) { return request.get('jk/commission/list', data); }
export function getJkCommissionDetail(id) { return request.get('jk/commission/detail/' + id); }
export function getJkFundAccount() { return request.get('jk/fund/account'); }
export function getJkFundFlows(data) { return request.get('jk/fund/flow/list', data); }
export function getJkWithdrawConfig() { return request.get('jk/withdraw/config'); }
export function applyJkWithdraw(data) { return request.post('jk/withdraw/apply', data); }
export function getJkWithdrawList(data) { return request.get('jk/withdraw/list', data); }
export function getJkWithdrawDetail(id) { return request.get('jk/withdraw/detail/' + id); }
