<template>
  <view class="exception-detail-page">
    <jk-page-nav title="收货异常详情"/>
    <view v-if="detail" class="content">
      <view class="status-card" :class="statusTone">
        <jk-icon name="info" size="lg"/>
        <view><text>{{ detail.statusText || statusText(detail.status) }}</text><small>{{ statusDescription }}</small></view>
        <jk-status-tag :text="detail.exceptionTypeText||typeText(detail.exceptionType)" :tone="statusTone"/>
      </view>

      <view class="card info-card">
        <view class="row"><text>异常单号</text><strong>{{ detail.exceptionNo||'-' }}</strong></view>
        <view class="row"><text>业务类型</text><strong>{{ detail.businessTypeText||businessTypeText(detail.businessType) }}</strong></view>
        <view class="row"><text>业务单号</text><strong>{{ detail.businessNo||'-' }}</strong></view>
        <view class="row"><text>上报时间</text><strong>{{ formatTime(detail.createTime) }}</strong></view>
        <view class="row"><text>异常原因</text><strong>{{ detail.exceptionReason||'-' }}</strong></view>
        <view v-if="detail.handleRemark" class="row"><text>处理说明</text><strong>{{ detail.handleRemark }}</strong></view>
      </view>

      <view class="summary-grid">
        <view><text>应收</text><strong>{{ detail.expectedTotalQty||0 }}</strong></view>
        <view><text>实收</text><strong>{{ detail.receivedTotalQty||0 }}</strong></view>
        <view class="danger"><text>短缺</text><strong>{{ detail.shortageTotalQty||0 }}</strong></view>
        <view class="danger"><text>破损</text><strong>{{ detail.damagedTotalQty||0 }}</strong></view>
      </view>

      <view class="card">
        <view class="section-title">商品差异明细</view>
        <view v-for="item in items" :key="item.id" class="item-row">
          <view class="item-main"><text>{{ item.productName||'商品已删除' }}</text><small>{{ item.skuName||item.skuCode||'默认规格' }}</small></view>
          <view><text>应收 {{item.expectedQty||0}}</text><text>实收 {{item.receivedQty||0}}</text></view>
          <view class="difference"><text v-if="item.shortageQty>0">短缺 {{item.shortageQty}}</text><text v-if="item.damagedQty>0">破损 {{item.damagedQty}}</text></view>
        </view>
      </view>

      <view v-if="evidenceUrls.length" class="card">
        <view class="section-title">异常凭证</view>
        <view class="evidence-list"><image v-for="url in evidenceUrls" :key="url" :src="url" mode="aspectFill" @tap="preview(url)"/></view>
      </view>

      <view class="tip-card"><jk-icon name="clock" size="sm"/><text>{{ nextStepText }}</text></view>
    </view>
    <jk-bottom-action v-if="detail">
      <button class="outline-btn" @tap="goList">查看全部异常记录</button>
      <button v-if="canReceiveAgain" class="primary-btn" @tap="goBusiness">重新核对收货</button>
      <button v-else class="primary-btn" @tap="refresh">刷新处理状态</button>
    </jk-bottom-action>
  </view>
</template>

<script>
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import JkIcon from '@/components/jk/jk-icon.vue';
import JkStatusTag from '@/components/jk/jk-status-tag.vue';
import JkBottomAction from '@/components/jk/jk-bottom-action.vue';
import { getJkReceiveExceptionDetail } from '@/api/jk.js';

export default {
  components: { JkPageNav, JkIcon, JkStatusTag, JkBottomAction },
  data() { return { id: 0, detail: null, items: [] }; },
  computed: {
    statusTone() {
      if (!this.detail) return 'warning';
      if (this.detail.status === 'RESOLVED') return 'success';
      if (this.detail.status === 'REJECTED') return 'danger';
      if (this.detail.status === 'PROCESSING') return 'info';
      return 'warning';
    },
    canReceiveAgain() { return this.detail && ['RESOLVED', 'REJECTED'].includes(this.detail.status); },
    statusDescription() {
      const map = { PENDING: '异常已上报，等待平台受理', PROCESSING: '平台正在核对或安排补发', RESOLVED: '异常已处理，请重新核对收货', REJECTED: '上报已驳回，请重新核对实际到货' };
      return map[this.detail.status] || '请关注平台处理进度';
    },
    nextStepText() {
      if (this.canReceiveAgain) return '业务单已恢复为待收货状态。请确认补发或核对完成后，重新执行正常收货。';
      return '异常处理期间不会进行库存入库，也不会触发本次业务的完成业绩。';
    },
    evidenceUrls() {
      try { return this.detail && this.detail.evidenceJson ? JSON.parse(this.detail.evidenceJson) : []; } catch (e) { return []; }
    },
  },
  onLoad(query) { this.id = Number(query.id); this.load(); },
  onShow() { if (this.id) this.load(); },
  methods: {
    load() {
      getJkReceiveExceptionDetail(this.id).then(response => {
        const payload = response.data || response || {};
        this.detail = payload.exception || payload;
        this.items = payload.items || [];
      }).catch(error => this.$util.Tips({ title: error || '异常详情加载失败' }));
    },
    statusText(value) { return { PENDING: '待处理', PROCESSING: '处理中', RESOLVED: '已处理', REJECTED: '已驳回' }[value] || value || '状态未配置'; },
    typeText(value) { return { SHORTAGE: '数量短缺', DAMAGED: '商品破损', MIXED: '短缺并破损', OTHER: '其他异常' }[value] || value || '-'; },
    businessTypeText(value) { return value === 'PLATFORM_ORDER' ? '平台订货' : value === 'STOCK_TRANSFER' ? '库存调拨' : value || '-'; },
    formatTime(value) { return value ? String(value).replace('T', ' ').slice(0, 19) : '-'; },
    preview(url) { uni.previewImage({ urls: this.evidenceUrls, current: url }); },
    refresh() { this.load(); },
    goList() { uni.navigateTo({ url: '/pages/jk/receiveException/list' }); },
    goBusiness() {
      const mode = this.detail.businessType === 'PLATFORM_ORDER' ? 'order' : 'transfer';
      uni.redirectTo({ url: '/pages/jk/trade/receive?mode=' + mode + '&id=' + this.detail.businessId });
    },
  },
};
</script>

<style scoped>
.exception-detail-page{min-height:100vh;padding-bottom:132rpx;background:#f6f8f8}.content{padding:18rpx 22rpx 38rpx}.status-card{display:flex;align-items:center;gap:14rpx;padding:22rpx;border-radius:18rpx;background:#fff4e8}.status-card>view{display:flex;flex:1;flex-direction:column;gap:7rpx}.status-card text{color:#704d28;font-size:27rpx;font-weight:700}.status-card small{color:#947354;font-size:18rpx}.status-card.success{background:#eafaf5}.status-card.success text{color:#16795e}.status-card.info{background:#edf7ff}.status-card.info text{color:#316f9c}.status-card.danger{background:#fff0ee}.status-card.danger text{color:#a34e45}.card{margin-top:18rpx;padding:20rpx;border-radius:18rpx;background:#fff}.row{display:flex;align-items:flex-start;justify-content:space-between;gap:20rpx;min-height:68rpx;padding:10rpx 0;border-bottom:1rpx solid #edf1f0}.row:last-child{border-bottom:0}.row text{color:#78848a;font-size:21rpx}.row strong{max-width:460rpx;color:#283239;text-align:right;font-size:21rpx;font-weight:500;line-height:1.5}.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10rpx;margin-top:18rpx}.summary-grid>view{display:flex;min-height:90rpx;flex-direction:column;align-items:center;justify-content:center;border-radius:15rpx;background:#fff}.summary-grid text{color:#7d898e;font-size:18rpx}.summary-grid strong{margin-top:7rpx;color:#16a77e;font-size:29rpx}.summary-grid .danger strong{color:#e36b5d}.section-title{color:#263139;font-size:25rpx;font-weight:700}.item-row{position:relative;display:flex;align-items:center;gap:16rpx;min-height:100rpx;border-bottom:1rpx solid #edf1f0}.item-row:last-child{border-bottom:0}.item-main{display:flex;min-width:0;flex:1;flex-direction:column;gap:5rpx}.item-main text{overflow:hidden;color:#29333a;font-size:22rpx;font-weight:600;text-overflow:ellipsis;white-space:nowrap}.item-main small{color:#8a959a;font-size:18rpx}.item-row>view:nth-child(2){display:flex;flex-direction:column;gap:5rpx;color:#66737a;font-size:18rpx}.difference{display:flex;min-width:105rpx;flex-direction:column;gap:5rpx;color:#e16052;font-size:18rpx}.evidence-list{display:flex;flex-wrap:wrap;gap:12rpx;margin-top:14rpx}.evidence-list image{width:150rpx;height:150rpx;border-radius:12rpx}.tip-card{display:flex;align-items:flex-start;gap:10rpx;margin-top:18rpx;padding:17rpx;border-radius:14rpx;background:#eef5f2;color:#688077;font-size:19rpx;line-height:1.6}.outline-btn{border:1rpx solid #10b981!important;background:#fff!important;color:#10a77d!important}.primary-btn{border:0!important;background:#10b981!important;color:#fff!important}
</style>
