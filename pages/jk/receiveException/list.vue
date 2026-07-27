<template>
  <view class="exception-list-page">
    <jk-page-nav title="收货异常记录"/>
    <view class="tabs">
      <view v-for="tab in tabs" :key="tab.value" :class="{active:status===tab.value}" @tap="changeStatus(tab.value)">{{tab.label}}</view>
    </view>
    <view class="list-content">
      <view v-for="item in list" :key="item.id" class="exception-card" @tap="goDetail(item.id)">
        <view class="card-head"><view><text>{{ item.businessTypeText||businessTypeText(item.businessType) }}</text><small>{{ item.businessNo||'-' }}</small></view><jk-status-tag :text="item.statusText||statusText(item.status)" :tone="statusTone(item.status)"/></view>
        <view class="reason"><text>{{ item.exceptionTypeText||typeText(item.exceptionType) }}</text><strong>{{ item.exceptionReason||'未填写异常说明' }}</strong></view>
        <view class="quantity-row"><view><text>应收</text><strong>{{item.expectedTotalQty||0}}</strong></view><view><text>实收</text><strong>{{item.receivedTotalQty||0}}</strong></view><view class="danger"><text>短缺</text><strong>{{item.shortageTotalQty||0}}</strong></view><view class="danger"><text>破损</text><strong>{{item.damagedTotalQty||0}}</strong></view></view>
        <view class="card-foot"><text>{{formatTime(item.createTime)}}</text><text>查看详情 ›</text></view>
      </view>
      <jk-empty v-if="!loading&&!list.length" text="暂无收货异常记录"/>
      <view v-if="loading" class="loading-text">加载中...</view>
      <view v-if="!loading&&finished&&list.length" class="loading-text">没有更多了</view>
    </view>
  </view>
</template>

<script>
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import JkStatusTag from '@/components/jk/jk-status-tag.vue';
import JkEmpty from '@/components/jk/jk-empty.vue';
import { getJkReceiveExceptionList } from '@/api/jk.js';

export default {
  components: { JkPageNav, JkStatusTag, JkEmpty },
  data() {
    return {
      tabs: [{label:'全部',value:''},{label:'待处理',value:'PENDING'},{label:'处理中',value:'PROCESSING'},{label:'已完成',value:'RESOLVED'}],
      status: '', page: 1, limit: 10, list: [], loading: false, finished: false,
    };
  },
  onShow() { this.reset(); },
  onReachBottom() { this.load(); },
  methods: {
    reset() { this.page = 1; this.list = []; this.finished = false; this.load(); },
    changeStatus(value) { if (this.status === value) return; this.status = value; this.reset(); },
    load() {
      if (this.loading || this.finished) return;
      this.loading = true;
      getJkReceiveExceptionList({ page: this.page, limit: this.limit, status: this.status || undefined }).then(response => {
        const payload = response.data || response || {};
        const rows = payload.list || payload.records || [];
        this.list = this.list.concat(rows);
        this.finished = rows.length < this.limit;
        this.page += 1;
      }).catch(error => this.$util.Tips({ title: error || '记录加载失败' }))
        .finally(() => { this.loading = false; });
    },
    goDetail(id) { uni.navigateTo({ url: '/pages/jk/receiveException/detail?id=' + id }); },
    statusText(value) { return { PENDING: '待处理', PROCESSING: '处理中', RESOLVED: '已处理', REJECTED: '已驳回' }[value] || value || '状态未配置'; },
    statusTone(value) { if (value === 'RESOLVED') return 'success'; if (value === 'REJECTED') return 'danger'; if (value === 'PROCESSING') return 'info'; return 'warning'; },
    typeText(value) { return { SHORTAGE: '数量短缺', DAMAGED: '商品破损', MIXED: '短缺并破损', OTHER: '其他异常' }[value] || value || '-'; },
    businessTypeText(value) { return value === 'PLATFORM_ORDER' ? '平台订货' : value === 'STOCK_TRANSFER' ? '库存调拨' : value || '-'; },
    formatTime(value) { return value ? String(value).replace('T', ' ').slice(0, 19) : '-'; },
  },
};
</script>

<style scoped>
.exception-list-page{min-height:100vh;background:#f6f8f8}.tabs{display:flex;position:sticky;z-index:5;top:0;height:82rpx;padding:0 18rpx;background:#fff}.tabs>view{display:flex;position:relative;flex:1;align-items:center;justify-content:center;color:#748087;font-size:21rpx}.tabs>view.active{color:#10a77d;font-weight:700}.tabs>view.active:after{position:absolute;bottom:7rpx;width:38rpx;height:5rpx;border-radius:3rpx;background:#10b981;content:''}.list-content{padding:16rpx 22rpx 38rpx}.exception-card{margin-bottom:16rpx;padding:20rpx;border-radius:18rpx;background:#fff}.card-head{display:flex;align-items:center;justify-content:space-between}.card-head>view{display:flex;flex-direction:column;gap:5rpx}.card-head text{color:#273239;font-size:24rpx;font-weight:700}.card-head small{color:#8b969c;font-size:18rpx}.reason{display:flex;align-items:flex-start;gap:12rpx;margin-top:17rpx;padding:15rpx;border-radius:12rpx;background:#fff6ef}.reason text{flex-shrink:0;padding:4rpx 9rpx;border-radius:8rpx;background:#ffe4d5;color:#bd654a;font-size:17rpx}.reason strong{color:#654f46;font-size:20rpx;font-weight:500;line-height:1.5}.quantity-row{display:grid;grid-template-columns:repeat(4,1fr);margin-top:16rpx}.quantity-row>view{display:flex;flex-direction:column;align-items:center;gap:5rpx;border-right:1rpx solid #edf1f0}.quantity-row>view:last-child{border-right:0}.quantity-row text{color:#7e8a90;font-size:17rpx}.quantity-row strong{color:#159d78;font-size:25rpx}.quantity-row .danger strong{color:#df6557}.card-foot{display:flex;align-items:center;justify-content:space-between;margin-top:17rpx;padding-top:14rpx;border-top:1rpx solid #edf1f0;color:#909a9f;font-size:17rpx}.card-foot text:last-child{color:#10a77d}.loading-text{padding:24rpx;color:#96a0a4;text-align:center;font-size:19rpx}
</style>
