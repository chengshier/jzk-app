import request from '@/utils/request.js';

// V3.1 第一批：本人直属下级人数额度
export function getJkTeamQuota(childUserId) {
  const params = childUserId ? { childUserId } : {};
  return request.get('jk/team/quota', params);
}
