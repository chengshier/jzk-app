<template>
  <view class="trade-list-page">
    <jk-page-nav :title="pageTitle" />
    <template v-if="mode==='order'">
      <view class="page-content">
        <view class="summary-card">
          <view v-for="item in orderSummary" :key="item.label" class="summary-item">
            <view class="summary-icon"><jk-icon :name="item.icon" size="md"/><text v-if="item.count>0" class="summary-badge">{{ item.count }}</text></view>
            <text class="summary-label">{{ item.label }}</text><text class="summary-count">{{ item.count }}</text>
          </view>
        </view>
        <view class="create-card" @tap="createBusiness"><view class="create-icon">＋</view><view><text>新建订货单</text><small>快速创建新的订货单</small></view><text class="create-arrow">›</text></view>
        <view class="filter-tabs order-tabs"><text v-for="item in orderFilters" :key="item.value" :class="{active:status===item.value}" @tap="changeStatus(item.value)">{{ item.label }}</text></view>
        <view class="order-list">
          <view v-for="item in filteredList" :key="item.id" class="order-row" @tap="goDetail(item)">
            <view class="order-row-head"><jk-icon :name="orderIcon(item)" size="md"/><view class="order-no-wrap"><text class="order-no">{{ getNo(item) }}</text><text class="order-time">创建时间：{{ formatTime(item.createTime || item.applyTime) }}</text></view><jk-status-tag :text="statusText(item)" :tone="statusTone(item.status)"/><text class="row-arrow">›</text></view>
            <view class="order-stats"><view><text>商品数量</text><strong>{{ item.totalQuantity || item.itemCount || item.productCount || 0 }}</strong></view><view><text>订单金额</text><strong>¥{{ money(item.totalAmount) }}</strong></view></view>
          </view>
          <jk-empty v-if="loaded && !filteredList.length" text="暂无订货单"/>
          <view v-if="filteredList.length" class="more-link" @tap="loadMore">查看全部订单 ›</view>
        </view>
      </view>
    </template>

    <template v-else-if="mode==='handleTransfer'">
      <view class="audit-tabs"><text v-for="item in auditFilters" :key="item.value" :class="{active:auditFilter===item.value}" @tap="auditFilter=item.value">{{ item.label }}<small v-if="item.value==='pending'">（{{ pendingAuditCount }}）</small></text></view>
      <view class="audit-list">
        <view v-for="item in auditList" :key="item.id" class="audit-row" @tap="goDetail(item)">
          <jk-icon name="user" size="lg"/>
          <view class="audit-main"><text class="audit-no">调拨单号：{{ getNo(item) }}</text><text>申请人：{{ item.applicantName || item.userName || '用户不存在' }}</text><text>接收方：{{ item.receiverName || item.targetUserName || '-' }}</text><text>商品种类：{{ item.productCount || item.itemCount || 0 }}　 数量：{{ item.totalQuantity || 0 }}</text><text>申请时间：{{ formatTime(item.createTime || item.applyTime) }}</text></view>
          <jk-status-tag :text="statusText(item)" :tone="statusTone(item.status)"/><text class="row-arrow">›</text>
        </view>
        <jk-empty v-if="loaded && !auditList.length" text="暂无调拨审核记录"/>
      </view>
    </template>

    <template v-else>
      <view class="page-content">
        <view class="transfer-banner" @tap="createBusiness"><jk-icon name="transfer" size="lg"/><view><text>申请库存调拨</text><small>向所属区县代提交调拨申请</small></view><text>＋</text></view>
        <view class="filter-tabs"><text v-for="item in transferFilters" :key="item.value" :class="{active:status===item.value}" @tap="changeStatus(item.value)">{{ item.label }}</text></view>
        <view class="order-list">
          <view v-for="item in filteredList" :key="item.id" class="order-row" @tap="goDetail(item)">
            <view class="order-row-head"><jk-icon name="transfer" size="md"/><view class="order-no-wrap"><text class="order-no">{{ getNo(item) }}</text><text class="order-time">{{ formatTime(item.createTime || item.applyTime) }}</text></view><jk-status-tag :text="statusText(item)" :tone="statusTone(item.status)"/><text class="row-arrow">›</text></view>
            <view class="order-stats"><view><text>商品种类</text><strong>{{ item.productCount || item.itemCount || 0 }}</strong></view><view><text>调拨数量</text><strong>{{ item.totalQuantity || 0 }}</strong></view></view>
          </view>
          <jk-empty v-if="loaded && !filteredList.length" text="暂无调拨记录"/>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
import { getJkPlatformOrderList, getJkStockTransferList, getJkHandledTransferList } from '@/api/jk.js';
import JkPageNav from '@/components/jk/jk-page-nav.vue';import JkIcon from '@/components/jk/jk-icon.vue';import JkStatusTag from '@/components/jk/jk-status-tag.vue';import JkEmpty from '@/components/jk/jk-empty.vue';
import { jkBusinessStatusText } from '@/utils/jk-display.js';
export default {
  components:{JkPageNav,JkIcon,JkStatusTag,JkEmpty},
  data(){return{mode:'order',status:'',auditFilter:'pending',list:[],loaded:false};},
  computed:{
    pageTitle(){return this.mode==='handleTransfer'?'区县代审核':this.mode==='transfer'?'我的调拨':'平台订货';},
    orderFilters(){return[{label:'全部',value:''},{label:'待付款',value:'CREATED'},{label:'待发货',value:'PAYMENT_SUBMITTED'},{label:'待收货',value:'SHIPPED'},{label:'已完成',value:'STOCK_IN'}];},
    transferFilters(){return[{label:'全部',value:''},{label:'待审核',value:'SUBMITTED'},{label:'待付款',value:'AUDIT_APPROVED'},{label:'待拨货',value:'PAYMENT_APPROVED'},{label:'已完成',value:'STOCK_IN'}];},
    auditFilters(){return[{label:'待审核',value:'pending'},{label:'已审核',value:'approved'},{label:'已驳回',value:'rejected'}];},
    filteredList(){return this.status?this.list.filter(x=>x.status===this.status):this.list;},
    pendingAuditCount(){return this.list.filter(x=>['SUBMITTED','PAYMENT_SUBMITTED','PAYMENT_APPROVED'].includes(x.status)).length;},
    auditList(){return this.list.filter(x=>{if(this.auditFilter==='pending')return['SUBMITTED','PAYMENT_SUBMITTED','PAYMENT_APPROVED'].includes(x.status);if(this.auditFilter==='rejected')return['AUDIT_REJECTED','PAYMENT_REJECTED','CLOSED'].includes(x.status);return['AUDIT_APPROVED','TRANSFERRED','STOCK_IN'].includes(x.status);});},
    orderSummary(){const c=s=>this.list.filter(x=>x.status===s).length;return[{label:'待付款',count:c('CREATED')+c('PAYMENT_REJECTED'),icon:'wallet'},{label:'待发货',count:c('PAYMENT_SUBMITTED')+c('PAYMENT_APPROVED'),icon:'transfer'},{label:'待收货',count:c('SHIPPED'),icon:'stock'},{label:'已完成',count:c('STOCK_IN'),icon:'success'}];}
  },
  onLoad(query){this.mode=query.mode||'order';if(!['order','transfer','handleTransfer'].includes(this.mode)){this.$util.Tips({title:'无效的业务类型'});return;}this.loadData();},
  onShow(){if(['order','transfer','handleTransfer'].includes(this.mode))this.loadData();},
  methods:{
    loadData(){const api=this.mode==='handleTransfer'?getJkHandledTransferList:(this.mode==='transfer'?getJkStockTransferList:getJkPlatformOrderList);api({page:1,limit:100,status:this.status}).then(res=>{const payload=res&&res.data?res.data:res;this.list=(payload&&((payload.list||payload.records)))||[];}).catch(()=>{this.list=[];}).finally(()=>{this.loaded=true;});},
    changeStatus(status){this.status=status;},createBusiness(){uni.navigateTo({url:'/pages/jk/trade/create?mode='+this.mode});},
    getNo(item){return this.mode==='order'?item.platformOrderNo:item.transferNo;},statusText(item){return item.statusText||jkBusinessStatusText(item.status);},
    statusTone(status){if(['STOCK_IN','COMPLETED','AUDIT_APPROVED','TRANSFERRED'].includes(status))return'success';if(['AUDIT_REJECTED','PAYMENT_REJECTED','CLOSED','CANCELLED'].includes(status))return'danger';if(['SHIPPED','PAYMENT_APPROVED'].includes(status))return'info';return'warning';},
    orderIcon(item){if(item.status==='STOCK_IN')return'success';if(item.status==='SHIPPED')return'transfer';return'order';},
    money(v){if(v===null||v===undefined||v==='')return'0.00';const n=Number(v);return Number.isNaN(n)?String(v):n.toFixed(2);},formatTime(v){return v?String(v).replace('T',' ').slice(0,19):'-';},
    goDetail(item){uni.navigateTo({url:'/pages/jk/trade/detail?mode='+this.mode+'&id='+item.id});},loadMore(){uni.showToast({title:'已加载全部订单',icon:'none'});}
  }
};
</script>

<style scoped>
.trade-list-page{min-height:100vh;background:#fff}.page-content{padding:18rpx 22rpx 36rpx}.summary-card{display:flex;padding:22rpx 10rpx;border:1rpx solid #cdeee6;border-radius:20rpx;background:#f8fffd}.summary-item{display:flex;flex:1;flex-direction:column;align-items:center;border-right:1rpx solid #dcece8}.summary-item:last-child{border-right:0}.summary-icon{position:relative}.summary-badge{position:absolute;right:-12rpx;top:-8rpx;min-width:26rpx;height:26rpx;border-radius:14rpx;background:#ff5c42;color:#fff;font-size:17rpx;line-height:26rpx;text-align:center}.summary-label{margin-top:7rpx;color:#59676d;font-size:21rpx}.summary-count{margin-top:7rpx;color:#1f2a30;font-size:28rpx;font-weight:700}.create-card,.transfer-banner{display:flex;align-items:center;margin-top:18rpx;padding:18rpx;border-radius:18rpx;background:linear-gradient(90deg,#11b98f,#08ae82);color:#fff}.create-icon{display:flex;align-items:center;justify-content:center;width:62rpx;height:62rpx;border-radius:12rpx;background:#fff;color:#10b981;font-size:44rpx}.create-card>view:nth-child(2),.transfer-banner>view:nth-child(2){display:flex;flex:1;flex-direction:column;margin-left:15rpx}.create-card>view text,.transfer-banner>view text{font-size:27rpx;font-weight:700}.create-card small,.transfer-banner small{margin-top:5rpx;font-size:20rpx;opacity:.9}.create-arrow,.transfer-banner>text:last-child{font-size:40rpx}.filter-tabs{display:flex;margin-top:18rpx;border-bottom:1rpx solid #edf1f0}.filter-tabs text{position:relative;flex:1;padding:16rpx 0;color:#6e7b82;text-align:center;font-size:23rpx}.filter-tabs text.active{color:#10b981;font-weight:700}.filter-tabs text.active::after{position:absolute;right:25%;bottom:0;left:25%;height:4rpx;border-radius:2rpx;background:#10b981;content:''}.order-row{padding:22rpx 0;border-bottom:1rpx solid #edf1f0}.order-row-head{display:flex;align-items:center}.order-no-wrap{min-width:0;flex:1;margin-left:12rpx}.order-no{display:block;color:#1f2a30;font-size:26rpx;font-weight:700}.order-time{display:block;margin-top:6rpx;color:#8b969c;font-size:20rpx}.row-arrow{margin-left:8rpx;color:#9ba5aa;font-size:34rpx}.order-stats{display:flex;margin:15rpx 0 0 76rpx}.order-stats>view{display:flex;min-width:160rpx;flex-direction:column;color:#8a959b;font-size:20rpx}.order-stats strong{margin-top:5rpx;color:#263139;font-size:25rpx}.more-link{padding:28rpx 0;color:#10b981;text-align:center;font-size:22rpx}.transfer-banner{margin-top:0}.audit-tabs{display:flex;border-bottom:1rpx solid #edf1f0}.audit-tabs>text{position:relative;flex:1;padding:24rpx 0;color:#606e75;text-align:center;font-size:25rpx}.audit-tabs>text.active{color:#10b981;font-weight:700}.audit-tabs>text.active::after{position:absolute;right:34%;bottom:0;left:34%;height:5rpx;border-radius:3rpx;background:#10b981;content:''}.audit-tabs small{font-size:21rpx}.audit-list{padding:0 22rpx}.audit-row{display:flex;align-items:flex-start;min-height:170rpx;padding:22rpx 0;border-bottom:1rpx solid #edf1f0}.audit-main{display:flex;min-width:0;flex:1;flex-direction:column;gap:7rpx;margin-left:14rpx;color:#6f7d84;font-size:21rpx}.audit-no{color:#27333a;font-size:24rpx;font-weight:700}.audit-row ::v-deep .jk-status-tag{margin-top:3rpx}
</style>
