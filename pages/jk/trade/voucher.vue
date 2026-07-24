<template>
  <view class="voucher-page">
    <jk-page-nav title="上传付款凭证" />
    <view v-if="detail" class="voucher-content">
      <view class="summary-card"><jk-icon name="document" size="lg"/><view><text>{{ businessLabel }}</text><strong>{{ no }}</strong></view><view class="amount"><text>应付金额</text><strong>¥{{ money(detail.totalAmount) }}</strong></view></view>
      <view class="section-title">上传凭证</view><text class="section-desc">请上传清晰的付款凭证，支持 JPG/PNG 格式，单张不超过 10MB</text>
      <view class="upload-card"><payment-voucher-upload v-model="voucherUrl"/></view>
      <view class="section-title note-title">备注说明 <text>（选填）</text></view><textarea v-model="remark" maxlength="200" placeholder="请输入备注说明，如付款方式、特殊说明等"/><text class="count">{{ remark.length }}/200</text>
    </view>
    <jk-bottom-action><button class="primary-btn" :disabled="!voucherUrl||submitting" @tap="submit">{{ submitting?'提交中...':'提交凭证' }}</button></jk-bottom-action>
  </view>
</template>
<script>
import JkPageNav from '@/components/jk/jk-page-nav.vue';import JkIcon from '@/components/jk/jk-icon.vue';import JkBottomAction from '@/components/jk/jk-bottom-action.vue';import paymentVoucherUpload from '@/components/jk/payment-voucher-upload.vue';
import {getJkPlatformOrderDetail,getJkStockTransferDetail,submitJkPlatformOrderVoucher,submitJkStockTransferVoucher} from '@/api/jk.js';
export default{components:{JkPageNav,JkIcon,JkBottomAction,paymentVoucherUpload},data(){return{mode:'order',id:0,detail:null,voucherUrl:'',remark:'',submitting:false}},computed:{businessLabel(){return this.mode==='order'?'订单号':'调拨单号'},no(){return this.mode==='order'?this.detail.platformOrderNo:this.detail.transferNo}},onLoad(q){this.mode=q.mode==='transfer'?'transfer':'order';this.id=Number(q.id);this.load()},methods:{load(){(this.mode==='order'?getJkPlatformOrderDetail:getJkStockTransferDetail)(this.id).then(r=>{const p=r.data||r||{};this.detail=this.mode==='order'?(p.order||p):(p.transfer||p)})},money(v){const n=Number(v||0);return Number.isNaN(n)?String(v||'0.00'):n.toFixed(2)},submit(){if(!this.voucherUrl)return this.$util.Tips({title:'请上传付款凭证'});this.submitting=true;(this.mode==='order'?submitJkPlatformOrderVoucher:submitJkStockTransferVoucher)(this.id,{voucherUrl:this.voucherUrl,remark:this.remark}).then(()=>{this.$util.Tips({title:'凭证已提交'});setTimeout(()=>uni.navigateBack(),500)}).finally(()=>this.submitting=false)}}};
</script>
<style scoped>
.voucher-page{min-height:100vh;padding-bottom:126rpx;background:#fff}.voucher-content{padding:18rpx 24rpx 36rpx}.summary-card{display:flex;align-items:center;padding:22rpx;border-radius:18rpx;background:linear-gradient(135deg,#edfcf8,#f8fffd)}.summary-card>view:nth-child(2){display:flex;flex:1;flex-direction:column;margin-left:12rpx}.summary-card text{color:#7d8a90;font-size:21rpx}.summary-card strong{margin-top:5rpx;color:#273239;font-size:24rpx}.amount{display:flex;flex-direction:column;align-items:flex-end}.amount strong{color:#10b981;font-size:31rpx}.section-title{margin-top:28rpx;padding-left:12rpx;border-left:5rpx solid #10b981;color:#1f2937;font-size:28rpx;font-weight:700}.section-title text{color:#9aa3a8;font-size:20rpx;font-weight:400}.section-desc{display:block;margin:10rpx 0 16rpx;color:#8a959b;font-size:21rpx}.upload-card{min-height:220rpx;padding:18rpx;border:2rpx dashed #dfe6e4;border-radius:16rpx}.note-title{margin-top:28rpx}.voucher-content textarea{width:100%;height:180rpx;margin-top:16rpx;padding:18rpx;border-radius:14rpx;background:#f8faf9;font-size:23rpx;box-sizing:border-box}.count{display:block;margin-top:-30rpx;padding-right:12rpx;color:#9fa8ac;text-align:right;font-size:19rpx}.primary-btn{border:0!important;background:#10b981!important;color:#fff!important}.primary-btn[disabled]{opacity:.5}
</style>
