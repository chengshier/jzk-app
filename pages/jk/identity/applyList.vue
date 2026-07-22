<template>
  <view class="jk-page"><jk-page-nav title="申请记录"></jk-page-nav>
    <view class="card tip-card">
      <view class="card-title">申请记录</view>
      <view class="tip-text">可查看审核中、已通过、已驳回、已冻结状态，以及驳回原因。第一阶段只处理身份审核记录，不进入库存、佣金、推广码真实初始化业务。</view>
    </view>

    <view class="record-card" v-for="item in list" :key="item.id">
      <view class="record-head">
        <view class="role-name">{{ roleName(item) }}</view>
        <view class="status" :class="statusClass(item)">{{ statusText(item) }}</view>
      </view>
      <view class="record-line">申请编号：{{ item.applyNo || '-' }}</view>
      <view class="record-line">幂等号：{{ item.requestNo || '-' }}</view>
      <view class="record-line">申请人：{{ item.applicantName || '用户不存在' }}<text v-if="item.applicantPhone"> / {{ item.applicantPhone }}</text></view>
      <view class="record-line" v-if="item.regionName || item.regionCode">区域：{{ item.regionName || '区域未配置' }}</view>
      <view class="record-line">申请时间：{{ formatTime(item.createTime) }}</view>
      <view class="record-line" v-if="item.applyReason">申请原因：{{ item.applyReason }}</view>
      <view class="record-line reject" v-if="item.rejectReason">驳回/禁用原因：{{ item.rejectReason }}</view>
    </view>

    <view class="empty" v-if="!list.length">暂无申请记录</view>
  </view>
</template>

<script>
import { getJkIdentityApplyList } from '@/api/jk.js';
import JkPageNav from '@/components/jk/jk-page-nav.vue';

const ROLE_NAME_MAP = {
  maker: '创客',
  partner: '合伙人',
  county_agent: '区县代',
  normal_user: '普通用户'
};

export default { components: { JkPageNav },
  data() {
    return {
      list: []
    };
  },
  onShow() {
    this.loadList();
  },
  methods: {
    loadList() {
      getJkIdentityApplyList({ page: 1, limit: 20 }).then(res => {
        this.list = res.data || [];
      }).catch(err => {
        this.$util.Tips({ title: err });
      });
    },
    statusText(item) {
      return item.auditStatusText || item.statusText || '--';
    },
    roleName(item) {
      const code = item.applyRoleCode || item.roleCode;
      return item.applyRoleName || item.roleName || ROLE_NAME_MAP[code] || '未知身份';
    },
    statusClass(item) {
      if (item.statusTag === 'success') {
        return 'status-pass';
      }
      if (item.statusTag === 'danger') {
        return 'status-reject';
      }
      if (item.statusTag === 'warning') {
        return 'status-freeze';
      }
      return 'status-pending';
    },

    formatTime(value) {
      if (!value) {
        return '-';
      }
      return String(value).replace('T', ' ');
    }
  }
};
</script>

<style lang="scss">
.jk-page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f6f7fb;
}
.tip-card,
.record-card {
  margin-bottom: 24rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  background: #ffffff;
}
.card-title {
  margin-bottom: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}
.tip-text,
.record-line,
.empty {
  font-size: 24rpx;
  line-height: 1.8;
  color: #6b7280;
}
.record-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.role-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #111827;
}
.status {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}
.status-pending {
  background: #fff7ed;
  color: #c2410c;
}
.status-pass {
  background: #ecfdf5;
  color: #047857;
}
.status-reject {
  background: #fef2f2;
  color: #b91c1c;
}
.status-freeze {
  background: #eff6ff;
  color: #1d4ed8;
}
.reject {
  color: #b91c1c;
}

/* UI1.1 identity application history page */
.jk-page{min-height:100vh;padding:0 22rpx 90rpx;background:linear-gradient(180deg,#54cdbb 0,#bde9e2 230rpx,#f6f8f7 450rpx)}.jk-page .tip-card,.jk-page .record-card{margin:20rpx 0;padding:28rpx;border-radius:24rpx;background:#fff;box-shadow:0 12rpx 30rpx rgba(34,99,88,.07)}.jk-page .tip-card{margin-top:0;padding-top:44rpx;background:linear-gradient(135deg,#f1fffb,#fff)}.jk-page .card-title{padding-left:18rpx;border-left:7rpx solid #28c6a5;color:#303638;font-size:34rpx;font-weight:700}.jk-page .tip-text,.jk-page .record-line{color:#83908e;font-size:25rpx;line-height:1.9}.jk-page .record-head{padding-bottom:18rpx;border-bottom:1rpx solid #edf2f0}.jk-page .role-name{color:#343a3c;font-size:31rpx}.jk-page .status{padding:8rpx 18rpx;font-weight:600}.jk-page .status-pending{background:#fff8e9;color:#d7901a}.jk-page .status-pass{background:#eafaf5;color:#17aa88}.jk-page .status-reject{background:#fff0f1;color:#e45158}.jk-page .status-freeze{background:#eff5f8;color:#5d7c8a}.jk-page .reject{padding:10rpx 16rpx;border-radius:12rpx;background:#fff4f4;color:#d95a60}.jk-page .empty{margin-top:40rpx;text-align:center;color:#95a3a0}

/* Identity application history design system. */
.jk-page{min-height:100vh;padding:32rpx 24rpx 90rpx;background:#F5F7FA!important}.jk-page .tip-card,.jk-page .record-card{margin:0 0 24rpx;padding:32rpx;border:0!important;border-radius:20rpx;background:#FFF!important;box-shadow:0 4rpx 16rpx rgba(0,0,0,.04)!important}.jk-page .tip-card{padding-top:32rpx}.jk-page .card-title{margin-bottom:20rpx;padding:0;border:0;color:#333;font-size:34rpx;font-weight:600}.jk-page .tip-text,.jk-page .record-line,.jk-page .empty{color:#999;font-size:25rpx;line-height:1.9}.jk-page .record-head{margin-bottom:20rpx;padding-bottom:20rpx;border-bottom:1rpx solid #F0F2F5}.jk-page .role-name{color:#333;font-size:31rpx;font-weight:600}.jk-page .status{display:flex;align-items:center;height:48rpx;padding:0 20rpx;border-radius:24rpx;font-size:24rpx;font-weight:600;box-sizing:border-box}.jk-page .status-pending{background:rgba(224,160,59,.12);color:#C88622}.jk-page .status-pass{background:rgba(40,198,165,.10);color:#159E80}.jk-page .status-reject{background:rgba(224,102,102,.10);color:#D85E5E}.jk-page .status-freeze{background:#EEF2F5;color:#71808A}.jk-page .reject{margin-top:12rpx;padding:14rpx 16rpx;border-radius:12rpx;background:rgba(224,102,102,.08);color:#D85E5E}.jk-page .empty{padding:48rpx 0;text-align:center}
</style>
