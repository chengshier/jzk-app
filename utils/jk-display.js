export function jkPayStatusText(status) {
  const map = {
    UNPAID: '未付款',
    PAYMENT_SUBMITTED: '待确认付款',
    APPROVED: '付款已确认',
    REJECTED: '付款已驳回'
  };
  return map[status] || status || '--';
}

export function jkReceiveStatusText(status) {
  const map = {
    WAIT_RECEIVE: '待收货',
    UNRECEIVED: '待收货',
    RECEIVED: '已收货',
    STOCK_IN: '已入库',
    PENDING: '待入库',
    EXCEPTION: '收货异常处理中'
  };
  return map[status] || status || '--';
}

export function jkAuditStatusText(status) {
  const map = {
    NONE: '未发起',
    PENDING: '待审核',
    APPROVED: '审核通过',
    EFFECTIVE: '已生效',
    FROZEN: '已冻结',
    REJECTED: '已驳回',
    CANCELLED: '已取消'
  };
  return map[status] || status || '--';
}

export function jkScopeTypeText(scopeType) {
  const map = {
    PLATFORM: '平台范围',
    PLATFORM_ALL: '平台全部数据',
    PROVINCE: '省级范围',
    CITY: '市级范围',
    COUNTY: '区县范围',
    REGION_SELF: '所属区域',
    PERSONAL: '个人范围',
    SELF: '个人范围',
    DIRECT_TEAM: '直属团队',
    TEAM: '团队范围'
  };
  return map[scopeType] || scopeType || '未设置';
}

export function jkBusinessStatusText(status) {
  const map = {
    CREATED: '待提交付款',
    SUBMITTED: '待审核',
    PENDING_AUDIT: '待审核',
    AUDIT_REJECTED: '审核驳回',
    AUDIT_APPROVED: '审核通过',
    PENDING_PAYMENT: '待付款',
    PAYMENT_SUBMITTED: '已提交付款凭证',
    PAYMENT_REJECTED: '付款驳回',
    PAYMENT_APPROVED: '付款审核通过',
    WAIT_TRANSFER: '待拨货',
    WAIT_SHIP: '待发货',
    TRANSFERRED: '已拨货',
    SHIPPED: '已发货',
    RECEIVE_EXCEPTION: '收货异常处理中',
    RECEIVED: '已收货',
    STOCK_IN: '已入库',
    CANCELLED: '已取消',
    CLOSED: '已关闭'
  };
  return map[status] || status || '--';
}

export function jkCommissionStatusText(status) {
  const map = {
    CREATED: '已创建',
    PENDING_SETTLE: '待结算',
    FROZEN: '已冻结',
    SETTLED: '已结算',
    AVAILABLE: '可提现',
    WITHDRAWING: '提现中',
    WITHDRAWN: '已提现',
    REVERSED: '已冲正',
    CANCELLED: '已取消'
  };
  return map[status] || status || '--';
}

export function jkWithdrawStatusText(status) {
  const map = {
    SUBMITTED: '已提交',
    AUDITING: '审核中',
    APPROVED: '审核通过',
    REJECTED: '已驳回',
    PAID: '已打款',
    CANCELLED: '已取消'
  };
  return map[status] || status || '--';
}

export function jkSourceTypeText(sourceType) {
  const map = {
    RETAIL_ORDER: '零售订单',
    PLATFORM_ORDER: '平台订货',
    PLATFORM_ORDER_STOCK_IN: '平台订货入库',
    STOCK_TRANSFER: '库存调拨',
    WITHDRAW: '提现申请',
    MANUAL_ADJUST: '人工调整'
  };
  return map[sourceType] || sourceType || '--';
}

export function jkFundFlowTypeText(flowType) {
  const map = {
    SETTLE_IN: '结算入账',
    WITHDRAW_FREEZE: '提现冻结',
    WITHDRAW_RELEASE: '提现释放',
    WITHDRAW_PAID: '提现打款',
    REVERSE_DEDUCT: '冲正扣减',
    MANUAL_ADJUST: '人工调整'
  };
  return map[flowType] || flowType || '--';
}

export function jkStockFlowTypeText(flowType) {
  const map = {
    TEST_INIT: '测试初始化',
    FREEZE: '冻结库存',
    RELEASE: '释放冻结',
    OUTBOUND: '出库',
    INBOUND: '入库'
  };
  return map[flowType] || flowType || '--';
}
