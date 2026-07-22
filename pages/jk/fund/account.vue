<template>
  <view class="page">
    <jk-page-nav title="资金账户" />

    <view class="hero">
      <text class="hero-label">可提现金额</text>
      <text class="hero-amount">¥ {{ formatAmount(account.availableAmount) }}</text>
      <text class="hero-meta">{{ account.roleName || '身份未配置' }}<text v-if="account.regionName"> / {{ account.regionName }}</text></text>
      <text v-if="account.applicantName || account.userNickname || account.applicantPhone" class="hero-user">
        {{ account.applicantName || '用户不存在' }}
        <text v-if="account.userNickname"> / {{ account.userNickname }}</text>
        <text v-if="account.applicantPhone"> / {{ account.applicantPhone }}</text>
      </text>
      <text v-if="account.statusText" class="hero-status">状态：{{ account.statusText }}</text>
    </view>

    <view v-for="item in cards" :key="item.key" class="card">
      <text class="card-label">{{ item.label }}</text>
      <text class="card-amount">¥ {{ formatAmount(account[item.key]) }}</text>
    </view>

    <view class="entry" @click="goFlow">
      <text>查看资金流水</text>
      <text>›</text>
    </view>
  </view>
</template>

<script>
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import { getJkFundAccount } from '@/api/jk.js';

export default {
  components: { JkPageNav },
  data() {
    return {
      account: {},
      cards: [
        { key: 'withdrawingAmount', label: '提现中' },
        { key: 'withdrawnAmount', label: '已提现' },
        { key: 'frozenAmount', label: '冻结资金' },
        { key: 'rejectedReturnAmount', label: '驳回退回' }
      ]
    };
  },
  onShow() {
    getJkFundAccount().then((res) => {
      this.account = res.data || res || {};
    });
  },
  methods: {
    goFlow() {
      uni.navigateTo({ url: '/pages/jk/fund/flow' });
    },
    formatAmount(value) {
      if (value === null || value === undefined || value === '') {
        return '0.00';
      }
      return value;
    }
  }
};
</script>

<style scoped>
.page{min-height:100vh;background:#f3fbf8;padding:24rpx}
.hero{padding:40rpx 32rpx;border-radius:22rpx;background:linear-gradient(135deg,#20c9ad,#58d58c);display:flex;flex-direction:column;color:#fff;box-shadow:0 12rpx 32rpx rgba(31,122,91,.16)}
.hero-label{font-size:24rpx;opacity:.9}
.hero-amount{margin-top:12rpx;font-size:54rpx;font-weight:600}
.hero-meta,.hero-user,.hero-status{margin-top:10rpx;font-size:24rpx;opacity:.95}
.card,.entry{margin-top:16rpx;background:#fff;padding:26rpx 28rpx;border-radius:18rpx;display:flex;justify-content:space-between;align-items:center;box-shadow:0 10rpx 30rpx rgba(31,122,91,.07)}
.card-label{color:#6e8780;font-size:26rpx}
.card-amount{color:#1b7d60;font-size:30rpx;font-weight:600}
.entry{color:#16856b;font-size:28rpx}
</style>
