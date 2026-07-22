<template>
  <view class="page">
    <view class="card">
      <text class="title">{{ title }}</text>
      <text class="hint">价格和金额由后台使用 PriceCalculateService 实时重算，前端输入仅作为下单参考。</text>
    </view>
    <view class="card">
      <text>商品：{{ productName || '商品已删除' }}</text>
      <text v-if="skuName || skuId" class="muted">规格：{{ skuName || 'SKU 已删除' }}</text>
      <text v-if="!productName || (!skuName && skuId)" class="muted">
        <text v-if="!productName">商品信息已失效，系统将按原记录提交</text>
        <text v-if="!productName && !skuName && skuId"> / </text>
        <text v-if="!skuName && skuId">规格信息已失效，系统将按原记录提交</text>
      </text>
      <input v-model.number="quantity" type="number" placeholder="请输入数量" />
    </view>
    <button type="primary" :loading="loading" @click="submit">{{ title }}</button>
  </view>
</template>

<script>
import { createJkPlatformOrder, createJkStockTransfer, getJkProductTradeView } from '@/api/jk.js';

export default {
  data() {
    return { mode: 'order', productId: null, skuId: null, productName: '', skuName: '', quantity: 1, loading: false };
  },
  computed: {
    title() {
      return this.mode === 'transfer' ? '申请调拨' : '向平台订货';
    },
  },
  onLoad(query) {
    this.mode = query.mode || 'order';
    this.productId = Number(query.productId);
    this.skuId = query.skuId ? Number(query.skuId) : null;
    this.productName = query.productName ? decodeURIComponent(query.productName) : '';
    this.skuName = query.skuName ? decodeURIComponent(query.skuName) : '';
    this.loadTradeView();
  },
  methods: {
    loadTradeView() {
      if (!this.productId) return;
      getJkProductTradeView(this.productId, this.skuId).then((res) => {
        const view = res && res.data ? res.data : res;
        const product = view && view.product ? view.product : {};
        if (!this.productName) {
          this.productName = product.storeName || '';
        }
        if (!this.skuName) {
          this.skuName = product.skuText || product.skuName || '';
        }
      }).catch(() => {});
    },
    submit() {
      if (!this.productId || this.quantity < 1) {
        return this.$util.Tips({ title: '请填写有效数量' });
      }
      this.loading = true;
      const data = {
        requestNo: 'APP' + Date.now(),
        items: [{ productId: this.productId, skuId: this.skuId, quantity: Number(this.quantity) }],
      };
      const api = this.mode === 'transfer' ? createJkStockTransfer : createJkPlatformOrder;
      api(data).then((res) => {
        const payload = res && res.data ? res.data : res;
        const id = payload && payload.id;
        this.$util.Tips({ title: '提交成功', icon: 'success' });
        setTimeout(() => {
          if (id) {
            uni.redirectTo({ url: '/pages/jk/trade/detail?mode=' + this.mode + '&id=' + id });
          } else {
            uni.navigateBack();
          }
        }, 500);
      }).catch((e) => {
        this.$util.Tips({ title: (e && e.msg) || '提交失败' });
      }).finally(() => {
        this.loading = false;
      });
    },
  },
};
</script>

<style scoped>
.page { padding: 24rpx; background: #f5f5f5; min-height: 100vh; }
.card { background: #fff; padding: 28rpx; border-radius: 12rpx; margin-bottom: 20rpx; display: flex; flex-direction: column; gap: 16rpx; }
.title { font-size: 32rpx; font-weight: 600; }
.hint,.muted { font-size: 24rpx; color: #999; }
input { border: 1rpx solid #ddd; padding: 16rpx; border-radius: 8rpx; }
</style>
