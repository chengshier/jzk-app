<template>
  <view class="trade-page"><jk-page-nav title="平台订货"></jk-page-nav>
    <view class="summary"><view v-for="item in summary" :key="item.label"><text>{{ item.label }}</text><strong>{{ item.count }}</strong></view></view>
    <view class="create-order" @click="createOrder"><text>＋</text><view><strong>新建订货单</strong><view>快速创建新的订货单</view></view><b>›</b></view>
    <view class="filters">
      <view v-for="item in filters" :key="item.value" :class="['filter', status === item.value ? 'active' : '']" @click="changeStatus(item.value)">{{ item.label }}</view>
    </view>
    <view class="list">
      <view v-for="item in list" :key="item.id" class="card" @click="goDetail(item)">
        <view class="row"><text class="order-no">{{ getNo(item) }}</text><text class="status">{{ statusText(item) }}</text></view>
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
import { getJkPlatformOrderList, getJkStockTransferList, getJkHandledTransferList } from '@/api/jk';import JkPageNav from '@/components/jk/jk-page-nav.vue';
import { jkBusinessStatusText } from '@/utils/jk-display.js';
export default {components:{JkPageNav},
  data() { return { mode: 'order', status: '', list: [] }; },
  computed: {
    modeTitle() { return this.mode === 'handleTransfer' ? '下级调拨申请' : (this.mode === 'transfer' ? '我的调拨' : '区县代订货'); },
    filters() { return [{ label: '全部', value: '' }, { label: '待付款', value: 'CREATED' }, { label: '待发货', value: 'PAYMENT_SUBMITTED' }, { label: '待收货', value: 'SHIPPED' }, { label: '已完成', value: 'STOCK_IN' }]; },
    summary(){const c=s=>this.list.filter(x=>x.status===s).length;return[{label:'待付款',count:c('CREATED')},{label:'待发货',count:c('PAYMENT_SUBMITTED')},{label:'待收货',count:c('SHIPPED')},{label:'已完成',count:c('STOCK_IN')}];}
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
    createOrder(){uni.navigateTo({url:'/pages/jk/trade/create'});},
    getNo(item) { return this.mode === 'order' ? item.platformOrderNo : item.transferNo; },
    goDetail(item) { uni.navigateTo({ url: '/pages/jk/trade/detail?mode=' + this.mode + '&id=' + item.id }); }
  }
};
</script>

<style scoped>
.trade-page{min-height:100vh;background:#fff}.summary{display:flex;margin:24rpx 28rpx;padding:28rpx 10rpx;border:1rpx solid #cceee7;border-radius:22rpx}.summary view{display:flex;flex:1;flex-direction:column;gap:14rpx;border-right:1rpx solid #d9eee9;text-align:center}.summary view:last-child{border:0}.summary text,.muted{color:#7d8796;font-size:24rpx}.summary strong{font-size:38rpx}.create-order{display:flex;align-items:center;gap:24rpx;margin:0 28rpx 26rpx;padding:27rpx;border-radius:22rpx;background:linear-gradient(135deg,#05b995,#12cfad);color:#fff}.create-order>text{display:flex;align-items:center;justify-content:center;width:84rpx;height:84rpx;border-radius:18rpx;background:#fff;color:#08bd99;font-size:66rpx}.create-order strong{font-size:34rpx}.create-order view view{margin-top:8rpx;font-size:24rpx}.create-order b{margin-left:auto;font-size:55rpx}.filters{display:flex;justify-content:space-around;margin:10rpx 0 12rpx;border-bottom:1rpx solid #edf0f2}.filter{padding:18rpx 4rpx;color:#6d7888;font-size:26rpx}.filter.active{border-bottom:5rpx solid #08b996;color:#08b996;font-weight:700}.list{padding:0 30rpx}.card{background:#fff;padding:30rpx 4rpx;border-bottom:1rpx solid #edf0f2}.row{display:flex;justify-content:space-between;margin-bottom:14rpx}.order-no{color:#202633;font-size:34rpx;font-weight:700}.status{padding:7rpx 15rpx;border-radius:10rpx;background:#e8faf5;color:#08aa8b;font-size:24rpx}.muted{line-height:1.8}.empty{text-align:center;color:#95aaa2;padding:120rpx 0}
</style>
