<template>
  <view class="business-page">
    <jk-page-nav title="九州康业务中心" />
    <view class="page-content">
      <view class="identity-banner">
        <view class="banner-avatar"><image src="/static/jk-ui-v2/icons/user.png" mode="aspectFit"/></view>
        <view class="banner-main">
          <view class="banner-title"><text>{{ roleName }}</text><jk-status-tag :text="context.freezeStatus?'身份冻结':'身份正常'" :tone="context.freezeStatus?'danger':'success'"/></view>
          <text class="banner-region">{{ context.regionName || context.regionCode || '暂未绑定区域' }}</text>
          <text class="banner-valid">有效期：长期有效</text>
        </view>
        <button class="detail-btn" @tap="goStatus">身份详情 ›</button>
        <image class="banner-watermark" src="/static/jk-ui-v2/illustrations/identity-hero.png" mode="aspectFit"/>
      </view>

      <view class="overview-card">
        <view class="section-head"><text class="section-title">业务数据概览</text><text class="section-link" @tap="showDataHelp">数据说明 ›</text></view>
        <view class="metric-row">
          <view class="metric-item"><text class="metric-label">库存价值(元)</text><text class="metric-value">{{ stockValue }}</text><jk-icon name="stock" size="md"/></view>
          <view class="metric-item"><text class="metric-label">累计收益(元)</text><text class="metric-value">{{ incomeValue }}</text><jk-icon name="money" size="md"/></view>
          <view class="metric-item"><text class="metric-label">待处理事项</text><text class="metric-value">{{ pendingCount }}</text><jk-icon name="document" size="md"/></view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">常用功能</view>
        <view class="menu-grid">
          <view v-for="item in menus" :key="item.name" class="menu-item" @tap="goMenu(item)">
            <jk-icon :name="item.icon" size="lg"/><text>{{ item.name }}</text>
          </view>
        </view>
      </view>

      <view class="section-card todo-card">
        <view class="section-head"><text class="section-title">待处理事项</text><text class="section-link" @tap="openAllTodo">全部 ›</text></view>
        <view v-for="item in todoItems" :key="item.name" class="todo-row" @tap="go(item.url)">
          <jk-icon :name="item.icon" size="sm"/><text class="todo-name">{{ item.name }}</text><text class="todo-count">{{ item.count }}</text><text class="todo-arrow">›</text>
        </view>
        <jk-empty v-if="!todoItems.length" text="暂无待处理事项"/>
      </view>
    </view>

    <view class="business-tabbar">
      <view class="active" @tap="stay"><jk-icon name="home" size="sm"/><text>首页</text></view>
      <view @tap="go('/pages/jk/stock/index')"><jk-icon name="stock" size="sm"/><text>库存</text></view>
      <view @tap="go(defaultOrderUrl)"><jk-icon name="document" size="sm"/><text>订单</text></view>
      <view @tap="go('/pages/jk/commission/index')"><jk-icon name="money" size="sm"/><text>收益</text></view>
      <view @tap="switchUser"><jk-icon name="user" size="sm"/><text>我的</text></view>
    </view>
  </view>
</template>

<script>
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import JkIcon from '@/components/jk/jk-icon.vue';
import JkStatusTag from '@/components/jk/jk-status-tag.vue';
import JkEmpty from '@/components/jk/jk-empty.vue';
import { getJkPermissionContext, getJkMyStock, getJkCommissionSummary, getJkPlatformOrderList, getJkStockTransferList, getJkHandledTransferList } from '@/api/jk.js';
const ROLE={maker:'创客',partner:'合伙人',county_agent:'区县代',normal_user:'普通用户',health_advisor:'健康顾问',city_agent:'市代',province_agent:'省代'};
export default {
  components:{JkPageNav,JkIcon,JkStatusTag,JkEmpty},
  data(){return{context:{permissions:[]},stockValue:'0.00',incomeValue:'0.00',pending:{order:0,transfer:0,audit:0,receive:0}};},
  computed:{
    roleName(){return this.context.primaryRoleName||ROLE[this.context.primaryRoleCode]||'普通用户';},
    pendingCount(){return Number(this.pending.order||0)+Number(this.pending.transfer||0)+Number(this.pending.audit||0)+Number(this.pending.receive||0);},
    defaultOrderUrl(){return this.context.primaryRoleCode==='county_agent'?'/pages/jk/trade/list?mode=order':'/pages/jk/trade/list?mode=transfer';},
    menus(){
      const role=this.context.primaryRoleCode;const items=[];
      if(role==='county_agent')items.push({name:'平台订货',icon:'order',url:'/pages/jk/trade/list?mode=order'},{name:'下级调拨',icon:'transfer',url:'/pages/jk/trade/list?mode=handleTransfer'});
      if(['maker','partner'].includes(role))items.push({name:'我的调拨',icon:'transfer',url:'/pages/jk/trade/list?mode=transfer'});
      if(['maker','partner','county_agent'].includes(role))items.push({name:'我的库存',icon:'stock',url:'/pages/jk/stock/index'},{name:'库存流水',icon:'flow',url:'/pages/jk/stock/flow'},{name:'收益中心',icon:'money',url:'/pages/jk/commission/index'},{name:'资金账户',icon:'wallet',url:'/pages/jk/fund/account'},{name:'提现申请',icon:'withdraw',url:'/pages/jk/withdraw/apply'},{name:'我的团队',icon:'team',url:'/pages/jk/team/index'});
      return items.slice(0,8);
    },
    todoItems(){
      const items=[];
      if(this.context.primaryRoleCode==='county_agent'){
        if(this.pending.audit)items.push({name:'待审核调拨单',icon:'document',count:this.pending.audit,url:'/pages/jk/trade/list?mode=handleTransfer'});
        if(this.pending.receive)items.push({name:'待确认收货',icon:'stock',count:this.pending.receive,url:'/pages/jk/trade/list?mode=order'});
        if(this.pending.order)items.push({name:'订单待付款',icon:'wallet',count:this.pending.order,url:'/pages/jk/trade/list?mode=order'});
      }else{
        if(this.pending.transfer)items.push({name:'待处理调拨单',icon:'transfer',count:this.pending.transfer,url:'/pages/jk/trade/list?mode=transfer'});
      }
      return items;
    }
  },
  onShow(){this.load();},
  methods:{
    load(){
      getJkPermissionContext().then(r=>this.context=r.data||r||{permissions:[]}).catch(()=>{});
      getJkMyStock().then(r=>{const d=r.data||r||{};this.stockValue=this.money(d.totalValue||d.stockValue||d.totalAmount)}).catch(()=>{});
      getJkCommissionSummary().then(r=>{const d=r.data||r||{};this.incomeValue=this.money(d.totalCommissionAmount||d.totalAmount||d.settledAmount||(d.fundAccount&&d.fundAccount.availableAmount))}).catch(()=>{});
      getJkPlatformOrderList({page:1,limit:100}).then(r=>{const rows=((r.data||r||{}).list||[]);this.pending.order=rows.filter(x=>['CREATED','PAYMENT_REJECTED'].includes(x.status)).length;this.pending.receive=rows.filter(x=>x.status==='SHIPPED').length;}).catch(()=>{});
      getJkStockTransferList({page:1,limit:100}).then(r=>{const rows=((r.data||r||{}).list||[]);this.pending.transfer=rows.filter(x=>['SUBMITTED','AUDIT_APPROVED','PAYMENT_SUBMITTED','PAYMENT_APPROVED','TRANSFERRED'].includes(x.status)).length;}).catch(()=>{});
      getJkHandledTransferList({page:1,limit:100}).then(r=>{const rows=((r.data||r||{}).list||[]);this.pending.audit=rows.filter(x=>['SUBMITTED','PAYMENT_SUBMITTED','PAYMENT_APPROVED'].includes(x.status)).length;}).catch(()=>{});
    },
    money(v){if(v===null||v===undefined||v==='')return'0.00';const n=Number(v);return Number.isNaN(n)?String(v):n.toFixed(2);},
    go(url){if(this.context.freezeStatus)return this.$util.Tips({title:this.context.disabledReasonText||'当前身份已冻结'});uni.navigateTo({url});},
    goMenu(item){this.go(item.url);},goStatus(){uni.navigateTo({url:'/pages/jk/identity/status'});},openAllTodo(){this.go(this.context.primaryRoleCode==='county_agent'?'/pages/jk/trade/list?mode=handleTransfer':'/pages/jk/trade/list?mode=transfer');},showDataHelp(){uni.showToast({title:'数据来源于库存、佣金及业务单据汇总',icon:'none'});},switchUser(){uni.switchTab({url:'/pages/user/index'});},stay(){}
  }
};
</script>

<style scoped>
.business-page{min-height:100vh;padding-bottom:118rpx;background:#f7f9f9}.page-content{padding:16rpx 22rpx 28rpx}.identity-banner{position:relative;display:flex;align-items:center;height:190rpx;overflow:hidden;padding:24rpx 22rpx;border-radius:22rpx 22rpx 0 0;background:linear-gradient(135deg,#45d3b4,#74dcc5);box-sizing:border-box;color:#fff}.banner-avatar{display:flex;align-items:center;justify-content:center;width:96rpx;height:96rpx;flex-shrink:0;border:8rpx solid rgba(255,255,255,.78);border-radius:50%;background:#fff}.banner-avatar image{width:76rpx;height:76rpx}.banner-main{position:relative;z-index:2;flex:1;margin-left:18rpx}.banner-title{display:flex;align-items:center;gap:10rpx}.banner-title>text{font-size:31rpx;font-weight:700}.banner-region,.banner-valid{display:block;margin-top:8rpx;font-size:22rpx;opacity:.92}.detail-btn{position:relative;z-index:2;height:58rpx;margin:0;padding:0 18rpx;border-radius:29rpx;background:#fff;color:#10a981;font-size:22rpx;line-height:58rpx}.detail-btn::after{border:0}.banner-watermark{position:absolute;right:-42rpx;bottom:-96rpx;width:250rpx;height:250rpx;opacity:.13}.overview-card{position:relative;z-index:3;margin-top:-4rpx;padding:26rpx 24rpx 24rpx;border-radius:20rpx;background:#fff;box-shadow:0 9rpx 25rpx rgba(23,72,60,.055)}.section-head{display:flex;align-items:center;justify-content:space-between}.section-title{color:#1f2937;font-size:30rpx;font-weight:700}.section-link{color:#7f8b91;font-size:22rpx}.metric-row{display:flex;margin-top:22rpx}.metric-item{display:flex;flex:1;flex-direction:column;align-items:center;border-right:1rpx solid #e9eeee}.metric-item:last-child{border-right:0}.metric-label{color:#7d898f;font-size:21rpx}.metric-value{margin:12rpx 0 10rpx;color:#1c272d;font-size:31rpx;font-weight:700}.section-card{margin-top:20rpx;padding:24rpx;border-radius:20rpx;background:#fff;box-shadow:0 8rpx 22rpx rgba(23,72,60,.045)}.menu-grid{display:flex;flex-wrap:wrap;padding-top:20rpx}.menu-item{display:flex;width:25%;flex-direction:column;align-items:center;gap:8rpx;margin-bottom:24rpx;color:#3f4d53;font-size:22rpx}.todo-card{padding-bottom:12rpx}.todo-row{display:flex;align-items:center;min-height:72rpx;border-bottom:1rpx solid #edf1f0}.todo-row:last-child{border-bottom:0}.todo-name{flex:1;margin-left:12rpx;color:#3d4a50;font-size:24rpx}.todo-count{color:#263139;font-size:26rpx;font-weight:700}.todo-arrow{margin-left:10rpx;color:#a0aaaf;font-size:32rpx}.business-tabbar{position:fixed;z-index:60;right:0;bottom:0;left:0;display:flex;height:104rpx;padding-bottom:env(safe-area-inset-bottom);border-top:1rpx solid #edf0ef;background:#fff}.business-tabbar>view{display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;gap:4rpx;color:#808b91;font-size:20rpx}.business-tabbar .active{color:#10b981}
</style>
