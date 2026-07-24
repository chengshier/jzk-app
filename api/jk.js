import request from '@/utils/request.js';

export function getJkPermissionContext() {
  return request.get('jk/permission/context');
}

export function getJkBusinessSummary() {
  return request.get('jk/business/summary');
}

export function submitJkIdentityApply(data) {
  return request.post('jk/identity/apply', data);
}

export function getJkIdentityApplyList(data) {
  return request.get('jk/identity/apply/list', data);
}

export function getJkIdentityApplyDetail(id) {
  return request.get('jk/identity/apply/' + id);
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

export function getJkProductCatalog(keyword) {
  return request.get('jk/product/catalog', { keyword: keyword || '' });
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

// 团队、推广二维码、推广素材与换绑
export function getJkTeamSummary() { return request.get('jk/team/summary'); }
export function getJkPromotionQrcode() { return request.get('jk/team/qrcode'); }
export function getJkPromotionMaterials(data) { return request.get('jk/promotion/material/list', data); }
export function getJkEligibleParentOptions(data) { return request.get('jk/team/relation-change/parent-options', data); }
export function applyJkRelationChange(data) { return request.post('jk/team/relation-change/apply', data); }
export function getJkRelationChangeList(data) { return request.get('jk/team/relation-change/list', data); }
export function getJkRelationChangeDetail(id) { return request.get('jk/team/relation-change/' + id); }
export function cancelJkRelationChange(id, data) {
  const query = '?requestNo=' + encodeURIComponent(data.requestNo) + '&reason=' + encodeURIComponent(data.reason || '');
  return request.post('jk/team/relation-change/' + id + '/cancel' + query, {});
}

// 申请方主动取消
export function cancelJkPlatformOrder(id, data) { return request.post('jk/platform-order/' + id + '/cancel', data); }
export function cancelJkStockTransfer(id, data) { return request.post('jk/stock-transfer/' + id + '/cancel', data); }

// 调拨退回 V1
export function createJkStockTransferReturn(data) { return request.post('jk/stock-transfer-return/create', data); }
export function getJkStockTransferReturnList(data) { return request.get('jk/stock-transfer-return/list', data); }
export function getJkStockTransferReturnDetail(id) { return request.get('jk/stock-transfer-return/' + id); }
export function cancelJkStockTransferReturn(id, data) { return request.post('jk/stock-transfer-return/' + id + '/cancel', data); }
export function shipJkStockTransferReturn(id, data) { return request.post('jk/stock-transfer-return/' + id + '/ship', data); }
export function getJkHandledReturnList(data) { return request.get('jk/stock-transfer-return/handle/list', data); }
export function getJkHandledReturnDetail(id) { return request.get('jk/stock-transfer-return/handle/' + id); }
export function auditJkHandledReturn(data) { return request.post('jk/stock-transfer-return/handle/audit', data); }
export function receiveJkHandledReturn(data) { return request.post('jk/stock-transfer-return/handle/receive', data); }
export function refundJkHandledReturn(data) { return request.post('jk/stock-transfer-return/handle/refund', data); }
export function closeJkHandledReturn(data) { return request.post('jk/stock-transfer-return/handle/close', data); }

// 第六阶段个人经营中心
export function getJkPersonalReport(params) { return request.get('jk/report/summary', params); }
