<template>
  <view class="receive-page">
    <jk-page-nav title="收货确认"/>
    <view v-if="detail" class="receive-content">
      <view class="summary-card">
        <jk-icon name="document" size="lg"/>
        <view class="summary-main"><text>{{ mode==='order'?'订单号':'调拨单号' }}</text><strong>{{ no }}</strong></view>
        <jk-status-tag :text="detail.statusText||'待收货'" tone="success"/>
      </view>

      <view class="mode-switch">
        <view :class="{active:receiveMode==='normal'}" @tap="changeMode('normal')"><text>正常收货</text><small>数量与质量无异常</small></view>
        <view :class="{active:receiveMode==='exception'}" @tap="changeMode('exception')"><text>异常收货</text><small>短缺、破损或其他问题</small></view>
      </view>

      <view class="section-head"><text>商品核对</text><small>请按实际到货情况填写</small></view>
      <view :class="['table-head',{exception:receiveMode==='exception'}]"><text>商品信息</text><text>应收</text><text>实收</text><text v-if="receiveMode==='exception'">破损</text></view>
      <view v-for="(item,index) in receiveItems" :key="item.id||index" class="receive-row" :class="{exception:receiveMode==='exception'}">
        <image :src="item.productImage||fallback(index)" mode="aspectFill"/>
        <view class="product-main"><text>{{ item.productName||'商品已删除' }}</text><small>{{ item.skuText||item.skuName||'默认规格' }}</small></view>
        <text class="qty expected">{{ item.expectedQty }}</text>
        <view class="qty-input"><input v-model.number="item.receivedQty" type="number" :disabled="receiveMode==='normal'" @blur="normalizeItem(item)"/></view>
        <view v-if="receiveMode==='exception'" class="qty-input damaged"><input v-model.number="item.damagedQty" type="number" @blur="normalizeItem(item)"/></view>
        <view v-if="receiveMode==='exception' && (shortage(item)>0 || item.damagedQty>0)" class="difference">
          <text v-if="shortage(item)>0">短缺 {{ shortage(item) }}</text>
          <text v-if="item.damagedQty>0">破损 {{ item.damagedQty }}</text>
        </view>
      </view>

      <template v-if="receiveMode==='exception'">
        <view class="section-head exception-head"><text>异常说明</text><small>后台处理完成前不会执行库存入库</small></view>
        <picker :range="exceptionTypes" range-key="label" @change="onTypeChange">
          <view class="picker-row"><text>异常类型</text><strong>{{ currentType.label }}</strong><text class="arrow">›</text></view>
        </picker>
        <textarea v-model.trim="exceptionReason" maxlength="500" placeholder="请说明短缺、破损、包装或物流异常情况"/>
        <text class="count">{{ exceptionReason.length }}/500</text>
        <view class="evidence-title"><text>异常凭证</text><small>建议上传外包装、商品和物流单照片</small></view>
        <view class="upload-card"><payment-voucher-upload v-model="evidenceUrl"/></view>
        <view class="warning-tip"><jk-icon name="info" size="sm"/><text>异常上报后该单将暂停收货。平台完成补发或核对后，订单会恢复为待收货状态，再重新确认正常收货。</text></view>
      </template>
      <view v-else class="normal-tip"><jk-icon name="success" size="sm"/><text>确认正常收货后，将按订单全部应收数量一次性入库，且不可在本页面撤回。</text></view>
    </view>

    <jk-bottom-action>
      <button v-if="receiveMode==='normal'" class="primary-btn" :disabled="submitting" @tap="confirmNormal">{{ submitting?'处理中...':'确认正常收货' }}</button>
      <button v-else class="exception-btn" :disabled="submitting||!exceptionValid" @tap="reportException">{{ submitting?'提交中...':'上报收货异常' }}</button>
    </jk-bottom-action>
  </view>
</template>

<script>
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import JkIcon from '@/components/jk/jk-icon.vue';
import JkStatusTag from '@/components/jk/jk-status-tag.vue';
import JkBottomAction from '@/components/jk/jk-bottom-action.vue';
import paymentVoucherUpload from '@/components/jk/payment-voucher-upload.vue';
import {
  getJkPlatformOrderDetail,
  getJkStockTransferDetail,
  receiveJkPlatformOrder,
  receiveJkStockTransfer,
  reportJkReceiveException,
} from '@/api/jk.js';

export default {
  components: { JkPageNav, JkIcon, JkStatusTag, JkBottomAction, paymentVoucherUpload },
  data() {
    return {
      mode: 'order', id: 0, detail: null, items: [], receiveItems: [], submitting: false,
      receiveMode: 'normal', exceptionReason: '', evidenceUrl: '', exceptionTypeIndex: 0,
      exceptionTypes: [
        { label: '数量短缺', value: 'SHORTAGE' },
        { label: '商品破损', value: 'DAMAGED' },
        { label: '短缺并破损', value: 'MIXED' },
        { label: '其他异常', value: 'OTHER' },
      ],
    };
  },
  computed: {
    no() { return this.mode === 'order' ? this.detail.platformOrderNo : this.detail.transferNo; },
    currentType() { return this.exceptionTypes[this.exceptionTypeIndex] || this.exceptionTypes[0]; },
    hasDifference() { return this.receiveItems.some(item => this.shortage(item) > 0 || Number(item.damagedQty || 0) > 0); },
    exceptionValid() { return !!this.exceptionReason && (this.hasDifference || this.currentType.value === 'OTHER'); },
  },
  onLoad(query) {
    this.mode = query.mode === 'transfer' ? 'transfer' : 'order';
    this.id = Number(query.id);
    this.load();
  },
  methods: {
    load() {
      const api = this.mode === 'order' ? getJkPlatformOrderDetail : getJkStockTransferDetail;
      api(this.id).then(response => {
        const payload = response.data || response || {};
        this.detail = this.mode === 'order' ? (payload.order || payload) : (payload.transfer || payload);
        this.items = payload.items || [];
        this.receiveItems = this.items.map(item => Object.assign({}, item, {
          expectedQty: Number(item.quantity || 0),
          receivedQty: Number(item.quantity || 0),
          damagedQty: 0,
          itemRemark: '',
        }));
      }).catch(error => this.$util.Tips({ title: error || '收货信息加载失败' }));
    },
    changeMode(mode) {
      this.receiveMode = mode;
      this.receiveItems.forEach(item => {
        item.receivedQty = item.expectedQty;
        item.damagedQty = 0;
      });
    },
    onTypeChange(event) { this.exceptionTypeIndex = Number(event.detail.value || 0); },
    normalizeItem(item) {
      let received = Number(item.receivedQty || 0);
      let damaged = Number(item.damagedQty || 0);
      received = Math.max(0, Math.min(item.expectedQty, Math.floor(received)));
      damaged = Math.max(0, Math.min(received, Math.floor(damaged)));
      item.receivedQty = received;
      item.damagedQty = damaged;
    },
    shortage(item) { return Math.max(0, Number(item.expectedQty || 0) - Number(item.receivedQty || 0)); },
    fallback(index) { return ['https://file.wit.cn/jzk/static/jk-ui-v2/products/meter.png', 'https://file.wit.cn/jzk/static/jk-ui-v2/products/glucose-paper.png'][index % 2]; },
    confirmNormal() {
      uni.showModal({
        title: '确认正常收货',
        content: '确认商品数量和质量均无异常？确认后将按全部应收数量入库。',
        success: result => {
          if (!result.confirm) return;
          this.submitting = true;
          const api = this.mode === 'order' ? receiveJkPlatformOrder : receiveJkStockTransfer;
          api(this.id, { businessId: this.id, remark: 'APP确认正常收货' })
            .then(() => uni.redirectTo({ url: '/pages/jk/trade/complete?mode=' + this.mode + '&id=' + this.id }))
            .catch(error => this.$util.Tips({ title: error || '确认收货失败' }))
            .finally(() => { this.submitting = false; });
        },
      });
    },
    reportException() {
      this.receiveItems.forEach(this.normalizeItem);
      if (!this.exceptionReason) return this.$util.Tips({ title: '请填写异常原因' });
      if (!this.hasDifference && this.currentType.value !== 'OTHER') return this.$util.Tips({ title: '请填写实际短缺或破损数量' });
      const data = {
        requestNo: 'RECEIVE-EX-' + Date.now(),
        businessType: this.mode === 'order' ? 'PLATFORM_ORDER' : 'STOCK_TRANSFER',
        businessId: this.id,
        exceptionType: this.currentType.value,
        exceptionReason: this.exceptionReason,
        evidenceUrls: this.evidenceUrl ? [this.evidenceUrl] : [],
        items: this.receiveItems.map(item => ({
          businessItemId: item.id,
          receivedQty: Number(item.receivedQty || 0),
          damagedQty: Number(item.damagedQty || 0),
          itemRemark: item.itemRemark || '',
        })),
      };
      uni.showModal({
        title: '上报收货异常',
        content: '上报后该业务单将暂停入库，等待平台处理。确认提交？',
        success: result => {
          if (!result.confirm) return;
          this.submitting = true;
          reportJkReceiveException(data).then(response => {
            const payload = response.data || response || {};
            const exception = payload.exception || payload;
            uni.redirectTo({ url: '/pages/jk/receiveException/detail?id=' + exception.id });
          }).catch(error => this.$util.Tips({ title: error || '异常上报失败' }))
            .finally(() => { this.submitting = false; });
        },
      });
    },
  },
};
</script>

<style scoped>
.receive-page{min-height:100vh;padding-bottom:132rpx;background:#f6f8f8}.receive-content{padding:18rpx 22rpx 40rpx}.summary-card{display:flex;align-items:center;padding:20rpx;border-radius:18rpx;background:linear-gradient(135deg,#eafbf7,#f8fffd)}.summary-main{display:flex;flex:1;flex-direction:column;margin-left:12rpx}.summary-card text{color:#76838a;font-size:21rpx}.summary-card strong{margin-top:5rpx;color:#263139;font-size:24rpx}.mode-switch{display:grid;grid-template-columns:1fr 1fr;gap:14rpx;margin-top:20rpx}.mode-switch>view{display:flex;min-height:94rpx;flex-direction:column;justify-content:center;padding:0 18rpx;border:2rpx solid #e4e9e7;border-radius:16rpx;background:#fff}.mode-switch>view.active{border-color:#12b98a;background:#ebfaf5}.mode-switch text{color:#273239;font-size:24rpx;font-weight:700}.mode-switch small{margin-top:6rpx;color:#89959a;font-size:18rpx}.mode-switch .active text{color:#0c9e75}.section-head{display:flex;align-items:flex-end;justify-content:space-between;margin-top:26rpx}.section-head text{color:#1f2937;font-size:28rpx;font-weight:700}.section-head small{color:#8b969c;font-size:18rpx}.table-head{display:grid;grid-template-columns:1fr 84rpx 94rpx;margin-top:16rpx;padding:14rpx 10rpx;background:#eef3f1;color:#738078;font-size:19rpx}.table-head text:nth-child(n+2){text-align:center}.table-head.exception{grid-template-columns:1fr 76rpx 88rpx 88rpx}.receive-row{position:relative;display:grid;grid-template-columns:82rpx 1fr 84rpx 94rpx;align-items:center;min-height:116rpx;padding:10rpx 0;border-bottom:1rpx solid #e7ecea;background:#fff}.receive-row.exception{grid-template-columns:82rpx 1fr 76rpx 88rpx 88rpx}.receive-row>image{width:70rpx;height:70rpx;border-radius:10rpx}.product-main{display:flex;min-width:0;flex-direction:column;gap:6rpx}.product-main text{overflow:hidden;color:#273239;font-size:22rpx;font-weight:600;text-overflow:ellipsis;white-space:nowrap}.product-main small{color:#8b969c;font-size:18rpx}.qty{text-align:center;font-size:21rpx}.expected{color:#626e73}.qty-input{display:flex;justify-content:center}.qty-input input{width:66rpx;height:52rpx;border:1rpx solid #d9e2df;border-radius:9rpx;background:#f8faf9;text-align:center;font-size:21rpx}.qty-input input[disabled]{border-color:transparent;background:transparent;color:#0da67b}.qty-input.damaged input{border-color:#f0c2bc;background:#fff6f5}.difference{position:absolute;right:4rpx;bottom:2rpx;display:flex;gap:10rpx;color:#e25a4c;font-size:16rpx}.exception-head small{color:#e06b5e}.picker-row{display:flex;align-items:center;min-height:82rpx;margin-top:14rpx;padding:0 18rpx;border-radius:14rpx;background:#fff}.picker-row>text:first-child{color:#6e7a80;font-size:21rpx}.picker-row strong{flex:1;color:#273239;text-align:right;font-size:22rpx}.arrow{margin-left:12rpx;color:#9ca6aa;font-size:30rpx}.receive-content textarea{width:100%;height:170rpx;margin-top:14rpx;padding:18rpx;border-radius:14rpx;background:#fff;font-size:22rpx;box-sizing:border-box}.count{display:block;margin-top:-28rpx;padding-right:14rpx;color:#9aa4a8;text-align:right;font-size:17rpx}.evidence-title{display:flex;align-items:flex-end;justify-content:space-between;margin-top:26rpx}.evidence-title text{color:#273239;font-size:25rpx;font-weight:700}.evidence-title small{color:#8b969c;font-size:17rpx}.upload-card{min-height:190rpx;margin-top:12rpx;padding:16rpx;border:2rpx dashed #d8e2df;border-radius:15rpx;background:#fff}.warning-tip,.normal-tip{display:flex;align-items:flex-start;gap:10rpx;margin-top:18rpx;padding:17rpx;border-radius:14rpx;font-size:19rpx;line-height:1.6}.warning-tip{background:#fff4e8;color:#9d6d34}.normal-tip{background:#eafaf5;color:#5e8176}.primary-btn,.exception-btn{border:0!important;color:#fff!important}.primary-btn{background:#10b981!important}.exception-btn{background:#ed765f!important}.exception-btn[disabled],.primary-btn[disabled]{opacity:.5}
</style>
