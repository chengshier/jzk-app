import request from '@/utils/request.js';

// 客户端只上报推广场景打开；成交事件必须由后端业务完成事件生成。
export function recordJkPromotionOpen(data) {
  return request.post('jk/promotion-effect/open', data);
}
