<template>
  <view class="detail-page">
    <jk-page-nav :title="pageTitle" />
    <view v-if="detail" class="detail-content">
      <view class="status-hero" :class="detailStatusTone">
        <jk-icon :name="mode==='order'?'order':'transfer'" size="xl"/>
        <view class="status-main"><view><text class="status-name">{{ detailStatusText }}</text><jk-status-tag :text="detailStatusText" :tone="detailStatusTone"/></view><text class="status-desc">{{ statusDescription }}</text></view>
        <image class="status-watermark" src="/static/jk-ui-v2/illustrations/business-hero.png" mode="aspectFit"/>
      </view>

      <view class="card info-card">
        <view class="info-grid">
          <view class="info-item"><jk-icon name="document" size="sm"/><text>{{ businessLabel }}</text><strong>{{ no }}</strong></view>
          <view class="info-item"><jk-icon name="clock" size="sm"/><text>申请时间</text><strong>{{ formatTime(detail.createTime || detail.applyTime) }}</strong></view>
          <view class="info-item"><jk-icon name="user" size="sm"/><text>申请方</text><strong>{{ detail.applicantName || '用户不存在' }}</strong></view>
          <view class="info-item"><jk-icon name="location" size="sm"/><text>所属区域</text><strong>{{ detail.regionName || detail.applicantRegionName || '-' }}</strong></view>
          <view v-if="mode!=='order'" class="info-item"><jk-icon name="user" size="sm"/><text>接收方</text><strong>{{ detail.receiverName || detail.targetUserName || detail.parentName || '-' }}</strong></view>
          <view class="info-item full"><jk-icon name="document" size="sm"/><text>业务说明</text><strong>{{ detail.remark || detail.applyReason || '无' }}</strong></view>
        </view>
      </view>

      <view class="card">
        <view class="section-head"><text class="section-title">商品清单</text><text>共 {{ items.length }} 种商品</text></view>
        <jk-product-row v-for="(item,index) in items" :key="item.id || index" :item="item" :fallback="fallbackProduct(index)">
          <view slot="right" class="product-right"><text>数量</text><strong>{{ item.quantity || item.applyQuantity || 0 }} {{ item.unitName || '' }}</strong><small v-if="item.totalAmount">¥{{ money(item.totalAmount) }}</small></view>
        </jk-product-row>
        <view v-if="detail.totalAmount!==undefined" class="amount-row"><text>订单金额</text><view><strong>¥{{ money(detail.totalAmount) }}</strong><small>共 {{ items.length }} 种商品</small></view></view>
      </view>

      <view class="card timeline-card">
        <view class="section-title">{{ mode==='order'?'订单流程':'调拨流程' }}</view>
        <jk-timeline :steps="timelineSteps" />
      </view>

      <view v-if="vouchers.length" class="card">
        <view class="section-head"><text class="section-title">付款凭证</text><text>{{ vouchers.length }} 张</text></view>
        <view class="voucher-list"><view v-for="v in vouchers" :key="v.id" class="voucher-item"><image :src="v.voucherUrl" mode="aspectFill" @tap="preview(v.voucherUrl)"/><view><text>{{ v.voucherNo || '付款凭证' }}</text><jk-status-tag :text="v.statusText" :tone="v.statusTone"/><small v-if="v.rejectReason">{{ v.rejectReason }}</small></view></view></view>
      </view>

      <view class="tip-card"><jk-icon name="info" size="sm"/><view><text>温馨提示</text><small>{{ mode==='order'?'付款审核通过并发货后，请及时确认收货入库。':'调拨按申请、审核、付款、拨货、收货流程执行，请关注状态变化。' }}</small></view></view>
    </view>

    <view v-if="detail" class="bottom-actions">
      <template v-if="mode==='handleTransfer'">
        <button v-if="detail.status==='SUBMITTED'" class="outline-danger" @tap="audit(false)">驳回</button>
        <button v-if="detail.status==='SUBMITTED'" class="primary-btn" @tap="audit(true)">审核通过</button>
        <button v-if="detail.status==='PAYMENT_SUBMITTED'" class="outline-danger" @tap="payment(false)">驳回付款</button>
        <button v-if="detail.status==='PAYMENT_SUBMITTED'" class="primary-btn" @tap="payment(true)">确认付款</button>
        <button v-if="detail.status==='PAYMENT_APPROVED'" class="primary-btn full-btn" @tap="dispatch">确认拨货</button>
        <button v-if="canClose" class="outline-btn" @tap="close">关闭调拨</button>
      </template>
      <template v-else>
        <button class="outline-btn" @tap="contact">联系对方</button>
        <button v-if="canVoucher" class="primary-btn" @tap="goVoucher">上传凭证</button>
        <button v-else-if="canReceive" class="primary-btn" @tap="goReceive">确认收货</button>
        <button v-else-if="canReturn" class="primary-btn" @tap="applyReturn">申请退回</button>
        <button v-else-if="canCancel" class="outline-danger" @tap="cancelBusiness">取消申请</button>
        <button v-else class="primary-btn" @tap="refresh">刷新状态</button>
      </template>
    </view>
  </view>
</template>

<script>
import JkPageNav from '@/components/jk/jk-page-nav.vue';import JkIcon from '@/components/jk/jk-icon.vue';import JkStatusTag from '@/components/jk/jk-status-tag.vue';import JkTimeline from '@/components/jk/jk-timeline.vue';import JkProductRow from '@/components/jk/jk-product-row.vue';
import {getJkPlatformOrderDetail,getJkStockTransferDetail,getJkHandledTransferDetail,auditJkHandledTransfer,confirmJkHandledTransferPayment,confirmJkHandledTransfer,closeJkHandledTransfer,cancelJkPlatformOrder,cancelJkStockTransfer} from '@/api/jk.js';
import {jkAuditStatusText,jkBusinessStatusText} from '@/utils/jk-display.js';
export default {
  components:{JkPageNav,JkIcon,JkStatusTag,JkTimeline,JkProductRow},
  data(){return{mode:'order',id:0,detail:null,items:[],vouchers:[],auditLogs:[]};},
  computed:{
    pageTitle(){return this.mode==='handleTransfer'?'区县代审核':this.mode==='transfer'?'调拨详情':'订货详情';},businessLabel(){return this.mode==='order'?'订单号':'调拨单号';},no(){return this.mode==='order'?this.detail.platformOrderNo:this.detail.transferNo;},
    canVoucher(){return this.mode!=='handleTransfer'&&['CREATED','AUDIT_APPROVED','PAYMENT_REJECTED'].includes(this.detail.status);},
    canReceive(){return(this.mode==='order'&&this.detail.status==='SHIPPED')||(this.mode==='transfer'&&this.detail.status==='TRANSFERRED');},
    canClose(){return['SUBMITTED','AUDIT_APPROVED','PAYMENT_REJECTED'].includes(this.detail.status);},
    canCancel(){return this.mode!=='handleTransfer'&&((this.mode==='order'&&['CREATED','PAYMENT_REJECTED'].includes(this.detail.status))||(this.mode==='transfer'&&['SUBMITTED','AUDIT_REJECTED','PAYMENT_REJECTED'].includes(this.detail.status)));},
    canReturn(){return this.mode==='transfer'&&this.detail.status==='STOCK_IN';},
    detailStatusText(){return this.statusText(this.detail.statusText,this.detail.status);},
    detailStatusTone(){return this.statusTone(this.detail.status);},
    statusDescription(){const map={SUBMITTED:'调拨申请已提交，请耐心等待审核',CREATED:'订单已创建，请尽快完成付款',PAYMENT_SUBMITTED:'付款凭证已提交，等待审核',PAYMENT_APPROVED:'付款已确认，等待拨货',SHIPPED:'订单已发货，请确认收货',TRANSFERRED:'商品已拨出，请确认收货',STOCK_IN:'业务已完成并成功入库',AUDIT_REJECTED:'审核未通过，请查看原因',PAYMENT_REJECTED:'付款凭证审核未通过'};return map[this.detail.status]||'请关注业务处理状态';},
    timelineSteps(){const s=this.detail.status;const order=this.mode==='order';const defs=order?[['提交订单',['CREATED','PAYMENT_SUBMITTED','PAYMENT_APPROVED','SHIPPED','STOCK_IN']],['付款审核',['PAYMENT_SUBMITTED','PAYMENT_APPROVED','SHIPPED','STOCK_IN']],['备货发货',['SHIPPED','STOCK_IN']],['收货确认',['STOCK_IN']]]:[['提交申请',['SUBMITTED','AUDIT_APPROVED','PAYMENT_SUBMITTED','PAYMENT_APPROVED','TRANSFERRED','STOCK_IN']],['审核',['AUDIT_APPROVED','PAYMENT_SUBMITTED','PAYMENT_APPROVED','TRANSFERRED','STOCK_IN']],['确认付款',['PAYMENT_APPROVED','TRANSFERRED','STOCK_IN']],['确认拨货',['TRANSFERRED','STOCK_IN']],['确认收货',['STOCK_IN']]];return defs.map((d,index)=>({title:d[0],done:d[1].includes(s),current:d[1].includes(s)&&(index===defs.length-1||!defs[index+1][1].includes(s)),danger:['AUDIT_REJECTED','PAYMENT_REJECTED','CLOSED'].includes(s)&&index===1,time:this.timelineTime(index)}));}
  },
  onLoad(q){this.mode=q.mode||'order';this.id=Number(q.id);if(!['order','transfer','handleTransfer'].includes(this.mode))return this.$util.Tips({title:'无效业务类型'});this.load();},onShow(){if(this.id)this.load();},
  methods:{
    load(){const f=this.mode==='handleTransfer'?getJkHandledTransferDetail:(this.mode==='transfer'?getJkStockTransferDetail:getJkPlatformOrderDetail);f(this.id).then(r=>{const p=r.data||r||{};this.detail=this.mode==='order'?(p.order||p):(p.transfer||p);this.items=p.items||this.detail.items||[];this.vouchers=(p.vouchers||[]).map(v=>Object.assign({},v,{statusText:this.auditStatusText(v.voucherStatusText||v.auditStatusText,v.auditStatus),statusTone:this.statusTone(v.auditStatus)}));this.auditLogs=p.auditLogs||[];}).catch(e=>this.$util.Tips({title:e||'详情加载失败'}));},
    statusText(text,status){return text||jkBusinessStatusText(status);},auditStatusText(text,status){return text||jkAuditStatusText(status);},statusTone(status){if(['STOCK_IN','COMPLETED','AUDIT_APPROVED','PAYMENT_APPROVED','TRANSFERRED'].includes(status))return'success';if(['AUDIT_REJECTED','PAYMENT_REJECTED','CLOSED','CANCELLED','REJECTED'].includes(status))return'danger';if(['SHIPPED'].includes(status))return'info';return'warning';},
    timelineTime(index){const log=this.auditLogs[index];const base=index===0?(this.detail.createTime||this.detail.applyTime):(log&&log.createTime);return base?String(base).replace('T',' ').slice(5,16):'';},formatTime(v){return v?String(v).replace('T',' ').slice(0,19):'-';},money(v){const n=Number(v||0);return Number.isNaN(n)?String(v||'0.00'):n.toFixed(2);},fallbackProduct(index){return['/static/jk-ui-v2/products/meter.png','/static/jk-ui-v2/products/glucose-paper.png','/static/jk-ui-v2/products/needle.png','/static/jk-ui-v2/products/wipes.png'][index%4];},
    goVoucher(){uni.navigateTo({url:'/pages/jk/trade/voucher?mode='+this.mode+'&id='+this.id});},goReceive(){uni.navigateTo({url:'/pages/jk/trade/receive?mode='+this.mode+'&id='+this.id});},
    audit(approved){const action=()=>auditJkHandledTransfer({businessId:this.id,approved,remark:approved?'APP审核通过':'APP审核驳回'}).then(()=>this.load());if(approved)return action();uni.showModal({title:'驳回调拨',editable:true,placeholderText:'请输入驳回原因',success:r=>{if(r.confirm)auditJkHandledTransfer({businessId:this.id,approved:false,remark:r.content||'APP审核驳回'}).then(()=>this.load());}});},
    payment(approved){confirmJkHandledTransferPayment({businessId:this.id,approved,remark:approved?'APP确认付款':'APP驳回付款'}).then(()=>this.load());},dispatch(){confirmJkHandledTransfer({businessId:this.id,remark:'APP确认拨货'}).then(()=>this.load());},close(){closeJkHandledTransfer({businessId:this.id,remark:'APP关闭调拨'}).then(()=>this.load());},
    cancelBusiness(){uni.showModal({title:'取消申请',editable:true,placeholderText:'请输入取消原因',success:r=>{if(r.confirm)(this.mode==='order'?cancelJkPlatformOrder:cancelJkStockTransfer)(this.id,{businessId:this.id,remark:r.content||'申请人主动取消'}).then(()=>this.load());}});},applyReturn(){uni.navigateTo({url:'/pages/jk/return/create?transferId='+this.id});},preview(url){uni.previewImage({urls:[url],current:url});},contact(){uni.showToast({title:'请通过平台客服或绑定手机号联系',icon:'none'});},refresh(){this.load();}
  }
};
</script>

<style scoped>
.detail-page{min-height:100vh;padding-bottom:128rpx;background:#f7f9f9}.detail-content{padding:16rpx 22rpx 32rpx}.status-hero{position:relative;display:flex;align-items:center;min-height:140rpx;overflow:hidden;padding:22rpx;border-radius:20rpx;background:linear-gradient(135deg,#20c39c,#61d4b6);color:#fff}.status-hero.warning{background:linear-gradient(135deg,#23c4a0,#67d8bc)}.status-hero.danger{background:linear-gradient(135deg,#ff7a6e,#ff9a85)}.status-hero.info{background:linear-gradient(135deg,#4ca5ee,#76bdf5)}.status-main{position:relative;z-index:2;flex:1;margin-left:14rpx}.status-main>view{display:flex;align-items:center;gap:10rpx}.status-name{font-size:32rpx;font-weight:700}.status-desc{display:block;margin-top:10rpx;font-size:21rpx;opacity:.9}.status-main ::v-deep .jk-status-tag{background:rgba(255,255,255,.22);color:#fff}.status-watermark{position:absolute;right:-55rpx;bottom:-100rpx;width:250rpx;height:250rpx;opacity:.13}.card{margin-top:18rpx;padding:22rpx;border-radius:20rpx;background:#fff;box-shadow:0 7rpx 20rpx rgba(24,67,57,.04)}.info-grid{display:flex;flex-wrap:wrap}.info-item{display:grid;width:50%;grid-template-columns:46rpx 118rpx 1fr;align-items:center;min-height:66rpx;box-sizing:border-box}.info-item.full{width:100%}.info-item>text{color:#78858c;font-size:21rpx}.info-item strong{overflow:hidden;color:#273239;font-size:21rpx;font-weight:500;text-overflow:ellipsis;white-space:nowrap}.section-head{display:flex;align-items:center;justify-content:space-between}.section-title{color:#1f2937;font-size:28rpx;font-weight:700}.section-head>text{color:#89949a;font-size:20rpx}.product-right{display:flex;flex-shrink:0;flex-direction:column;align-items:flex-end;gap:6rpx}.product-right text{color:#8b969c;font-size:19rpx}.product-right strong{color:#10b981;font-size:25rpx}.product-right small{color:#273139;font-size:21rpx}.amount-row{display:flex;align-items:center;justify-content:space-between;padding-top:20rpx;color:#66757c;font-size:23rpx}.amount-row>view{display:flex;flex-direction:column;align-items:flex-end}.amount-row strong{color:#10b981;font-size:30rpx}.amount-row small{margin-top:5rpx;color:#929da2;font-size:19rpx}.timeline-card{padding-bottom:28rpx}.timeline-card>.section-title{margin-bottom:24rpx}.voucher-list{margin-top:12rpx}.voucher-item{display:flex;align-items:center;padding:14rpx 0;border-bottom:1rpx solid #edf1f0}.voucher-item:last-child{border-bottom:0}.voucher-item image{width:94rpx;height:94rpx;border-radius:12rpx}.voucher-item>view{display:flex;flex:1;flex-direction:column;align-items:flex-start;gap:6rpx;margin-left:12rpx}.voucher-item text{color:#273239;font-size:22rpx}.voucher-item small{color:#ef5b4c;font-size:19rpx}.tip-card{display:flex;align-items:flex-start;gap:10rpx;margin-top:18rpx;padding:18rpx;border-radius:16rpx;background:#f5fbf9}.tip-card>view{display:flex;flex:1;flex-direction:column;gap:6rpx}.tip-card text{color:#48635b;font-size:22rpx}.tip-card small{color:#7f908a;font-size:20rpx;line-height:1.55}.bottom-actions{position:fixed;z-index:40;right:0;bottom:0;left:0;display:flex;gap:16rpx;padding:16rpx 22rpx calc(16rpx + env(safe-area-inset-bottom));background:rgba(255,255,255,.98);box-shadow:0 -7rpx 22rpx rgba(24,67,57,.06)}.bottom-actions button{flex:1;height:78rpx;margin:0;border-radius:39rpx;font-size:26rpx;line-height:78rpx}.bottom-actions button::after{border:0}.primary-btn{background:#10b981!important;color:#fff!important}.outline-btn{border:2rpx solid #10b981!important;background:#fff!important;color:#10a981!important}.outline-danger{border:2rpx solid #ef5b4c!important;background:#fff!important;color:#ef5b4c!important}.full-btn{width:100%}
</style>
