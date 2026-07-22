<template>
  <view class="trade-page">
    <view class="header"><text>{{ modeTitle }}</text><text class="sub">交易记录</text></view>
    <view class="filters">
      <view v-for="item in filters" :key="item.value" :class="['filter', status === item.value ? 'active' : '']" @click="changeStatus(item.value)">{{ item.label }}</view>
    </view>
    <view class="list">
      <view v-for="item in list" :key="item.id" class="card" @click="goDetail(item)">
        <view class="row"><text>{{ modeTitle }}</text><text class="status">{{ statusText(item) }}</text></view>
        <view class="muted">{{ getNo(item) }}</view>
        <view class="muted" v-if="item.firstProductName || item.firstSkuText || item.firstSkuName">
          商品：{{ item.firstProductName || '商品已删除' }}<text v-if="item.firstSkuText || item.firstSkuName"> / {{ item.firstSkuText || item.firstSkuName }}</text>
        </view>
        <view class="muted">申请人：{{ item.applicantName || '用户不存在' }}<text v-if="item.applicantPhone"> / {{ item.applicantPhone }}</text></view>
        <view class="muted">金额：{{ item.totalAmount || 0 }}</view>
      </view>
      <view v-if="!list.length" class="empty">暂无数据</view>
    </view>
  </view>
</template>

<script>
import { getJkPlatformOrderList, getJkStockTransferList, getJkHandledTransferList } from '@/api/jk';
import { jkBusinessStatusText } from '@/utils/jk-display.js';
export default {
  data() { return { mode: 'order', status: '', list: [] }; },
  computed: {
    modeTitle() { return this.mode === 'handleTransfer' ? '下级调拨申请' : (this.mode === 'transfer' ? '我的调拨' : '区县代订货'); },
    filters() { return [{ label: '全部', value: '' }, { label: '待付款审核', value: 'PAYMENT_SUBMITTED' }, { label: '已完成', value: 'STOCK_IN' }]; }
  },
  onLoad(query) {
    this.mode = query.mode || 'order';
    if (!['order', 'transfer', 'handleTransfer'].includes(this.mode)) {
      this.$util.Tips({ title: '无效的业务类型' });
      return;
    }
    this.loadData();
  },
  onShow() { if (['order', 'transfer', 'handleTransfer'].includes(this.mode)) this.loadData(); },
  methods: {
    statusText(item) { return item.statusText || jkBusinessStatusText(item.status); },
    loadData() {
      const api = this.mode === 'handleTransfer' ? getJkHandledTransferList : (this.mode === 'transfer' ? getJkStockTransferList : getJkPlatformOrderList);
      api({ page: 1, limit: 50, status: this.status }).then((res) => {
        const payload = res && res.data ? res.data : res;
        this.list = (payload && payload.list) || [];
      }).catch(() => { this.list = []; });
    },
    changeStatus(status) { this.status = status; this.loadData(); },
    getNo(item) { return this.mode === 'order' ? item.platformOrderNo : item.transferNo; },
    goDetail(item) { uni.navigateTo({ url: '/pages/jk/trade/detail?mode=' + this.mode + '&id=' + item.id }); }
  }
};
</script>

<style scoped>
.trade-page{min-height:100vh;background:#f4faf7;padding:24rpx}.header{padding:18rpx 8rpx;color:#137a57;font-size:36rpx;font-weight:600}.sub{font-size:24rpx;color:#85a69a;margin-left:16rpx;font-weight:400}.filters{display:flex;gap:16rpx;margin:10rpx 0 20rpx}.filter{padding:12rpx 22rpx;background:#fff;border-radius:30rpx;color:#638278;font-size:25rpx}.filter.active{background:#24bd91;color:#fff}.card{background:#fff;border-radius:18rpx;padding:26rpx;margin-bottom:18rpx;box-shadow:0 6rpx 20rpx rgba(32,130,92,.08)}.row{display:flex;justify-content:space-between;margin-bottom:14rpx;color:#274b3d}.status{color:#139b70}.muted{color:#82988f;font-size:25rpx;line-height:1.8}.empty{text-align:center;color:#95aaa2;padding:120rpx 0}
</style>
