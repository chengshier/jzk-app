<template>
  <view class="stock-detail-page">
    <jk-page-nav title="商品库存详情"/>
    <view class="detail-content">
      <view class="product-card">
        <image :src="productImage" mode="aspectFill"/>
        <view>
          <text class="product-name">{{item.productName||'商品已删除'}}</text>
          <jk-status-tag :text="availableQty>0?'有库存':'无库存'" :tone="availableQty>0?'success':'muted'"/>
          <view class="info-line"><text>规格</text><strong>{{item.skuText||item.skuName||item.unitName||'默认规格'}}</strong></view>
          <view class="info-line"><text>商品编码</text><strong>{{item.skuCode||item.productCode||'-'}}</strong></view>
          <view class="info-line"><text>条形码</text><strong>{{item.barCode||'-'}}</strong></view>
        </view>
      </view>

      <view class="metrics">
        <view><jk-icon name="stock" size="md"/><text>库存总量</text><strong>{{totalQty}}{{unit}}</strong></view>
        <view><jk-icon name="wallet" size="md"/><text>可用库存</text><strong>{{availableQty}}{{unit}}</strong></view>
        <view><jk-icon name="identity" size="md"/><text>冻结库存</text><strong>{{frozenQty}}{{unit}}</strong></view>
        <view><jk-icon name="money" size="md"/><text>库存价值</text><strong>{{money(item.stockValue)}}</strong></view>
      </view>

      <view class="card">
        <view class="section-head"><text>库存趋势</text></view>
        <view v-if="trendRows.length" class="chart">
          <view v-for="row in trendRows" :key="row.key" class="chart-column"><text>{{row.value}}</text><view class="bar" :style="row.style"></view><small>{{row.label}}</small></view>
        </view>
        <jk-empty v-else-if="loaded" text="暂无库存趋势数据"/>
        <text v-if="item.trendDescription" class="data-note">{{item.trendDescription}}</text>
      </view>

      <view class="card">
        <view class="section-head"><text>SKU/批次明细</text></view>
        <template v-if="batches.length">
          <view class="table-head"><text>批次号</text><text>可用库存</text><text>冻结库存</text><text>单位成本</text></view>
          <view v-for="batch in batches" :key="batch.id||batch.batchNo" class="table-row"><text>{{batch.batchNo||'-'}}</text><text>{{batch.availableQty||0}}</text><text>{{batch.frozenQty||0}}</text><text>¥{{money(batch.unitCost)}}</text></view>
        </template>
        <jk-empty v-else-if="loaded" text="暂无真实批次数据"/>
        <text v-if="loaded&&!batches.length" class="data-note">批次应由订货、调拨和退回入库自动生成，不需要重复手工入库。</text>
      </view>

      <button class="flow-button" @tap="goFlow"><jk-icon name="document" size="sm"/>查看库存流水 <text>›</text></button>
      <text class="update-time">数据更新于 {{formatTime(item.updateTime||item.createTime)}}</text>
    </view>
  </view>
</template>
<script>
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import JkIcon from '@/components/jk/jk-icon.vue';
import JkStatusTag from '@/components/jk/jk-status-tag.vue';
import JkEmpty from '@/components/jk/jk-empty.vue';
import { getJkStockSkuDetail } from '@/api/jk.js';
export default {
  components: { JkPageNav, JkIcon, JkStatusTag, JkEmpty },
  data() { return { item: {}, skuId: null, productId: null, loaded: false }; },
  computed: {
    productImage() { return this.item.productImage || this.item.image || 'https://file.wit.cn/jzk/static/jk-ui-v2/products/glucose-paper.png'; },
    availableQty() { return Number(this.item.availableQuantity !== undefined ? this.item.availableQuantity : (this.item.availableQty || this.item.stockQuantity || 0)); },
    frozenQty() { return Number(this.item.frozenQuantity !== undefined ? this.item.frozenQuantity : (this.item.frozenQty || 0)); },
    totalQty() { return this.availableQty + this.frozenQty; },
    unit() { return this.item.unitName || ''; },
    trendRows() {
      const source = Array.isArray(this.item.trend) ? this.item.trend : [];
      if (!source.length) return [];
      const values = source.map((row) => Number(row.value !== undefined ? row.value : (row.quantity || 0)));
      const max = Math.max(...values, 1);
      return source.map((row, index) => {
        const value = values[index];
        return { key: row.date || row.label || index, value, label: row.label || String(row.date || '').slice(5), style: { height: Math.max(12, value / max * 110) + 'rpx' } };
      });
    },
    batches() { return Array.isArray(this.item.batchList) ? this.item.batchList : (Array.isArray(this.item.batches) ? this.item.batches : []); }
  },
  onLoad(query) {
    this.skuId = query.skuId ? Number(query.skuId) : null;
    this.productId = query.productId ? Number(query.productId) : null;
    if (!this.skuId) {
      try { this.item = JSON.parse(decodeURIComponent(query.item || '%7B%7D')); } catch (error) { this.item = {}; }
      this.loaded = true;
      return;
    }
    getJkStockSkuDetail(this.skuId, this.productId).then((response) => {
      this.item = response.data || response || {};
    }).catch((error) => {
      this.item = {};
      uni.showToast({ title: (error && error.message) || '库存详情加载失败', icon: 'none' });
    }).finally(() => { this.loaded = true; });
  },
  methods: {
    money(value) { const number = Number(value || 0); return Number.isNaN(number) ? '0.00' : number.toFixed(2); },
    formatTime(value) { return value ? String(value).replace('T', ' ').slice(0, 19) : '-'; },
    goFlow() {
      const query = [];
      if (this.item.productId) query.push('productId=' + this.item.productId);
      if (this.item.skuId) query.push('skuId=' + this.item.skuId);
      uni.navigateTo({ url: '/pages/jk/stock/flow' + (query.length ? ('?' + query.join('&')) : '') });
    }
  }
};
</script>
<style scoped>
.stock-detail-page{min-height:100vh;background:#f7f9f9}.detail-content{padding:14rpx 22rpx 36rpx}.product-card{display:flex;align-items:flex-start;padding:20rpx;border-radius:20rpx;background:#fff}.product-card>image{width:190rpx;height:190rpx;flex-shrink:0;border-radius:16rpx;background:#f4f8f7}.product-card>view{min-width:0;flex:1;margin-left:18rpx}.product-name{display:inline-block;max-width:270rpx;overflow:hidden;color:#1f2a30;font-size:28rpx;font-weight:700;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle}.product-card ::v-deep .jk-status-tag{margin-left:8rpx}.info-line{display:flex;margin-top:13rpx;color:#7a868c;font-size:21rpx}.info-line text{width:96rpx}.info-line strong{color:#3c484e;font-weight:500}.metrics{display:flex;margin-top:18rpx;padding:20rpx 6rpx;border-radius:18rpx;background:linear-gradient(135deg,#effbf8,#fff)}.metrics>view{display:flex;flex:1;flex-direction:column;align-items:center;border-right:1rpx solid #e0ece9}.metrics>view:last-child{border-right:0}.metrics text{margin-top:5rpx;color:#7e8a90;font-size:19rpx}.metrics strong{margin-top:8rpx;color:#202b31;font-size:24rpx}.card{margin-top:18rpx;padding:22rpx;border-radius:20rpx;background:#fff}.section-head{display:flex;align-items:center;justify-content:space-between}.section-head>text{color:#1f2937;font-size:27rpx;font-weight:700}.chart{display:flex;align-items:flex-end;height:180rpx;margin-top:18rpx;padding-top:18rpx;border-bottom:1rpx solid #dce8e5}.chart-column{display:flex;flex:1;height:170rpx;flex-direction:column;align-items:center;justify-content:flex-end}.chart-column>text{color:#627178;font-size:16rpx}.bar{width:18rpx;margin:5rpx 0;border-radius:8rpx 8rpx 0 0;background:linear-gradient(180deg,#10b981,#b8eee0)}.chart-column small{margin-top:5rpx;color:#879299;font-size:15rpx}.table-head,.table-row{display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr;align-items:center}.table-head{margin-top:16rpx;padding:12rpx 0;color:#7e8a90;font-size:18rpx}.table-row{min-height:52rpx;border-bottom:1rpx solid #edf1f0;color:#344147;font-size:20rpx}.table-head text:not(:first-child),.table-row text:not(:first-child){text-align:right}.data-note{display:block;margin-top:8rpx;color:#9aa4a9;text-align:center;font-size:18rpx}.flow-button{display:flex;align-items:center;justify-content:center;height:72rpx;margin-top:18rpx;border:1rpx solid #dce9e5;border-radius:15rpx;background:#fff;color:#10a981;font-size:23rpx;line-height:72rpx}.flow-button::after{border:0}.flow-button>text{margin-left:8rpx}.update-time{display:block;margin-top:16rpx;color:#9aa4a9;text-align:center;font-size:18rpx}
</style>
