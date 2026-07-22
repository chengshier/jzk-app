<template>
  <view class="stock-page"><jk-page-nav title="我的库存"></jk-page-nav>
    <view class="hero"><text class="eyebrow">九州康库存中心</text><text class="identity">{{ stock.identity || '当前身份库存' }}</text><text v-if="stock.freezeReason" class="reason">{{ stock.freezeReason }}</text></view>
    <view v-for="item in stock.items" :key="item.id" class="stock-card"><view class="name">{{ item.productName || '商品已删除' }}</view><text class="sku">SKU：{{ item.skuText || item.skuName || 'SKU 已删除' }}</text><view class="qty"><view><text>可用</text><b>{{ item.availableQty || 0 }}</b></view><view><text>冻结</text><b>{{ item.frozenQty || 0 }}</b></view><view><text>总入库</text><b>{{ item.totalInQty || 0 }}</b></view><view><text>总出库</text><b>{{ item.totalOutQty || 0 }}</b></view></view></view>
    <view class="flow-entry" @click="goFlow">查看库存流水 <text>›</text></view>
  </view>
</template>
<script>
import { getJkMyStock } from '@/api/jk.js'; import JkPageNav from '@/components/jk/jk-page-nav.vue';
export default { components:{JkPageNav}, data(){ return { stock:{items:[]} }; }, onShow(){ getJkMyStock().then(r=>{this.stock=r.data||r||{items:[]};}); }, methods:{goFlow(){uni.navigateTo({url:'/pages/jk/stock/flow'});}} };
</script>
<style scoped>
.stock-page{min-height:100vh;padding:24rpx;background:#f3fbf8}.hero{padding:36rpx 30rpx;border-radius:24rpx;background:linear-gradient(135deg,#20c9ad,#58d58c);color:#fff;display:flex;flex-direction:column}.eyebrow{font-size:24rpx;opacity:.9}.identity{margin-top:10rpx;font-size:36rpx;font-weight:600}.reason{margin-top:12rpx;font-size:24rpx}.stock-card,.flow-entry{margin-top:20rpx;padding:26rpx;border-radius:20rpx;background:#fff;box-shadow:0 10rpx 30rpx rgba(31,122,91,.08)}.name{font-size:30rpx;font-weight:600;color:#183a36}.sku{display:block;margin-top:8rpx;color:#78918b;font-size:24rpx}.qty{display:grid;grid-template-columns:repeat(4,1fr);margin-top:24rpx}.qty view{display:flex;flex-direction:column;color:#78918b;font-size:22rpx}.qty b{margin-top:8rpx;color:#1f7a5b;font-size:32rpx}.flow-entry{display:flex;justify-content:space-between;color:#1f7a5b;font-size:28rpx}
</style>
