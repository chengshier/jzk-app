<template>
  <view class="income-page">
    <jk-page-nav title="收益中心"/>
    <view class="income-content">
      <view class="platform-card">
        <view class="card-head"><view><text>平台佣金</text><small>平台另行支付，可按规则结算提现</small></view><jk-icon name="money" size="lg"/></view>
        <strong>¥{{money(platformTotal)}}</strong>
        <view class="platform-row"><view><text>待结算</text><b>¥{{money(pendingAmount)}}</b></view><view><text>可提现</text><b>¥{{money(availableAmount)}}</b></view><button @tap="go('/pages/jk/withdraw/apply')">申请提现</button></view>
      </view>

      <view class="separate-tip">三类金额分别记账：业绩用于经营统计，经营收益是线下已实现毛利，只有平台佣金进入提现账户。</view>

      <view class="account-grid">
        <view class="account-card" @tap="go('/pages/jk/trade/list?mode=performance')"><view><jk-icon name="document" size="md"/><text>我的业绩</text></view><strong>¥{{money(performanceTotal)}}</strong><small>不等于佣金 ›</small></view>
        <view class="account-card profit" @tap="go('/pages/jk/trade/list?mode=operationProfit')"><view><jk-icon name="wallet" size="md"/><text>经营收益</text></view><strong>¥{{money(operationProfit)}}</strong><small>线下已实现 ›</small></view>
      </view>

      <view class="card">
        <view class="section-head"><text>最新平台佣金</text><small @tap="go('/pages/jk/commission/list')">全部记录 ›</small></view>
        <view v-for="item in recentRows" :key="item.key" class="income-row" @tap="goDetail(item.raw)">
          <jk-icon :name="item.icon" size="md"/>
          <view><text>{{item.title}}</text><small>{{item.subtitle}}</small></view>
          <view><strong :class="{negative:item.negative}">{{item.amountText}}</strong><small>{{item.statusText}}</small></view>
        </view>
        <jk-empty v-if="loaded&&!recentList.length" text="暂无平台佣金记录"/>
      </view>

      <view class="card quick-card">
        <view class="section-head"><text>快捷入口</text></view>
        <view class="quick-grid">
          <view @tap="go('/pages/jk/commission/list')"><jk-icon name="document" size="lg"/><text>佣金明细</text></view>
          <view @tap="go('/pages/jk/fund/account')"><jk-icon name="wallet" size="lg"/><text>资金账户</text></view>
          <view @tap="go('/pages/jk/withdraw/list')"><jk-icon name="withdraw" size="lg"/><text>提现记录</text></view>
          <view @tap="go('/pages/jk/trade/list?mode=offlineSale')"><jk-icon name="order" size="lg"/><text>线下销售</text></view>
        </view>
      </view>
      <view class="safe-tip"><image src="https://file.wit.cn/jzk/static/jk-ui-v2/icons/identity.png"/><text>页面仅展示后端真实账户、业绩和经营数据</text></view>
    </view>
  </view>
</template>
<script>
import JkPageNav from'@/components/jk/jk-page-nav.vue';import JkIcon from'@/components/jk/jk-icon.vue';import JkEmpty from'@/components/jk/jk-empty.vue';
import{getJkCommissionSummary,getJkCommissionList}from'@/api/jk.js';import{getJkPerformanceSummary,getJkOperationProfitSummary}from'@/api/jkV31.js';import{jkSourceTypeText}from'@/utils/jk-display.js';
export default{components:{JkPageNav,JkIcon,JkEmpty},data(){return{summary:{},commission:{},fund:{},performance:{},operationProfit:0,list:[],loaded:false}},computed:{platformTotal(){return this.summary.totalCommissionAmount||this.commission.totalCommissionAmount||0},pendingAmount(){return this.summary.pendingSettleAmount||this.commission.pendingSettleAmount||0},availableAmount(){return this.summary.withdrawableAmount||this.summary.availableAmount||this.fund.availableAmount||0},performanceTotal(){return this.performance.total||0},recentList(){return this.list.slice(0,5)},recentRows(){return this.recentList.map((item,index)=>{const amount=Number(item.commissionAmount||item.amount||0);return{key:item.id||index,raw:item,icon:index%2?'document':'wallet',title:item.rewardTypeText||item.sourceTypeText||jkSourceTypeText(item.sourceType)||'平台奖励',subtitle:(item.sourceNo||item.orderNo||'业务单据')+' · '+this.formatTime(item.createTime),negative:amount<0,amountText:(amount>=0?'+':'')+this.money(amount),statusText:item.commissionStatusText||item.statusText||item.status||'-'}})}},onShow(){this.load()},methods:{load(){this.loaded=false;Promise.all([getJkCommissionSummary().catch(()=>({})),getJkCommissionList({}).catch(()=>[]),getJkPerformanceSummary().catch(()=>({})),getJkOperationProfitSummary().catch(()=>0)]).then(([summaryRes,listRes,performanceRes,profitRes])=>{const d=summaryRes.data||summaryRes||{};this.summary=d;this.commission=d.commissionAccount||{};this.fund=d.fundAccount||{};this.performance=performanceRes.data||performanceRes||{};this.operationProfit=profitRes.data!==undefined?profitRes.data:profitRes;const list=listRes.data||listRes||[];this.list=Array.isArray(list)?list:(list.list||list.records||[])}).finally(()=>this.loaded=true)},money(v){const n=Number(v||0);return Number.isNaN(n)?String(v||'0.00'):n.toFixed(2)},formatTime(v){return v?String(v).replace('T',' ').slice(5,16):'-'},go(url){uni.navigateTo({url})},goDetail(item){if(item.id)uni.navigateTo({url:'/pages/jk/commission/detail?id='+item.id})}}};
</script>
<style scoped>.income-page{min-height:100vh;background:#f7f9f9}.income-content{padding:14rpx 22rpx 36rpx}.platform-card{padding:26rpx 24rpx;border-radius:22rpx;background:linear-gradient(135deg,#12b88e,#53d0b2);color:#fff}.card-head{display:flex;align-items:center;justify-content:space-between}.card-head>view{display:flex;flex-direction:column;gap:6rpx}.card-head text{font-size:29rpx;font-weight:700}.card-head small{font-size:19rpx;opacity:.9}.platform-card>strong{display:block;margin-top:22rpx;font-size:47rpx}.platform-row{display:flex;align-items:center;margin-top:22rpx;padding-top:18rpx;border-top:1rpx solid rgba(255,255,255,.28)}.platform-row>view{display:flex;min-width:145rpx;flex-direction:column;gap:5rpx}.platform-row text{font-size:18rpx;opacity:.88}.platform-row b{font-size:23rpx}.platform-row button{height:54rpx;margin:0 0 0 auto;padding:0 20rpx;border-radius:28rpx;background:#fff;color:#10a981;font-size:20rpx;line-height:54rpx}.platform-row button::after{border:0}.separate-tip{margin-top:16rpx;padding:16rpx 18rpx;border-radius:14rpx;background:#fff8e8;color:#8b6a22;font-size:19rpx;line-height:1.65}.account-grid{display:flex;gap:16rpx;margin-top:18rpx}.account-card{flex:1;padding:20rpx;border:1rpx solid #d8eee8;border-radius:18rpx;background:#f6fffc}.account-card.profit{border-color:#f3dfb2;background:#fffaf0}.account-card>view{display:flex;align-items:center;gap:8rpx;color:#425158;font-size:22rpx}.account-card strong{display:block;margin-top:16rpx;color:#10a981;font-size:31rpx}.account-card.profit strong{color:#e19a21}.account-card small{display:block;margin-top:7rpx;color:#849197;font-size:18rpx}.card{margin-top:18rpx;padding:22rpx;border-radius:20rpx;background:#fff;box-shadow:0 6rpx 18rpx rgba(24,68,58,.035)}.section-head{display:flex;align-items:center;justify-content:space-between}.section-head>text{color:#1f2937;font-size:27rpx;font-weight:700}.section-head small{color:#879299;font-size:19rpx}.income-row{display:flex;align-items:center;min-height:92rpx;border-bottom:1rpx solid #edf1f0}.income-row:last-child{border-bottom:0}.income-row>view:nth-child(2){display:flex;min-width:0;flex:1;flex-direction:column;gap:5rpx;margin-left:10rpx}.income-row>view:nth-child(2) text{color:#29343a;font-size:22rpx;font-weight:600}.income-row small{color:#8b969c;font-size:17rpx}.income-row>view:last-child{display:flex;flex-direction:column;align-items:flex-end;gap:4rpx}.income-row strong{color:#10b981;font-size:23rpx}.income-row strong.negative{color:#ef5b4c}.quick-card{padding-bottom:16rpx}.quick-grid{display:flex;margin-top:18rpx}.quick-grid>view{display:flex;flex:1;flex-direction:column;align-items:center;gap:7rpx;color:#4c5a60;font-size:20rpx}.safe-tip{display:flex;align-items:center;justify-content:center;gap:6rpx;margin-top:18rpx;color:#82a098;font-size:18rpx}.safe-tip image{width:25rpx;height:25rpx}</style>
