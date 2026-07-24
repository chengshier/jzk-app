<template>
  <view class="income-page">
    <jk-page-nav title="收益中心"/>
    <view class="income-content">
      <view class="summary-card">
        <view><text>累计收益（元）</text><strong>{{money(totalIncome)}}</strong><small>来源于佣金账户累计值</small></view>
        <view><text>待结算（元）</text><strong>{{money(pendingAmount)}}</strong><small>结算时间以后台任务为准</small></view>
        <view><text>可提现（元）</text><strong>{{money(availableAmount)}}</strong><button @tap="go('/pages/jk/withdraw/apply')">立即提现 ›</button></view>
      </view>

      <view class="chart-card">
        <view class="chart-section">
          <view class="section-head"><text>收益趋势</text><small>近7天</small></view>
          <view v-if="hasTrend" class="line-chart">
            <view v-for="item in chartPoints" :key="item.index" class="point-wrap">
              <text v-if="item.last" class="bubble">¥{{item.valueText}}</text>
              <view class="point" :style="item.pointStyle"></view>
              <view v-if="item.segmentStyle" class="segment" :style="item.segmentStyle"></view>
              <small>{{item.day}}</small>
            </view>
          </view>
          <jk-empty v-else text="近7天暂无收益记录"/>
        </view>
        <view class="pie-section">
          <view class="section-head"><text>收益来源</text><small>全部记录</small></view>
          <view v-if="totalRecent>0" class="pie-row">
            <view class="pie" :style="pieStyle"><view><strong>{{money(totalRecent)}}</strong><small>收益总额</small></view></view>
            <view class="legend">
              <view v-for="(item,index) in sourceBreakdown" :key="item.key"><view class="legend-dot" :class="'c'+index"></view><text>{{item.name}}</text><strong>{{item.percent}}%</strong></view>
            </view>
          </view>
          <jk-empty v-else text="暂无收益来源数据"/>
        </view>
      </view>

      <view class="card">
        <view class="section-head"><text>最新收益记录</text><small @tap="go('/pages/jk/commission/list')">全部记录 ›</small></view>
        <view v-for="item in recentRows" :key="item.key" class="income-row" @tap="goDetail(item.raw)">
          <jk-icon :name="item.icon" size="md"/>
          <view><text>{{item.title}}</text><small>{{item.subtitle}}</small></view>
          <view><strong :class="{negative:item.negative}">{{item.amountText}}</strong><small>{{item.statusText}}</small></view>
        </view>
        <jk-empty v-if="loaded&&!recentList.length" text="暂无收益记录"/>
      </view>

      <view class="card quick-card">
        <view class="section-head"><text>快捷入口</text></view>
        <view class="quick-grid">
          <view @tap="go('/pages/jk/commission/list')"><jk-icon name="document" size="lg"/><text>佣金明细</text></view>
          <view @tap="go('/pages/jk/fund/account')"><jk-icon name="wallet" size="lg"/><text>资金账户</text></view>
          <view @tap="go('/pages/jk/withdraw/list')"><jk-icon name="withdraw" size="lg"/><text>提现记录</text></view>
          <view @tap="go('/pages/jk/team/index')"><jk-icon name="team" size="lg"/><text>我的团队</text></view>
        </view>
      </view>
      <view class="safe-tip"><image src="/static/jk-ui-v2/icons/identity.png"/><text>页面仅展示后端真实佣金与资金数据</text></view>
    </view>
  </view>
</template>
<script>
import JkPageNav from'@/components/jk/jk-page-nav.vue';
import JkIcon from'@/components/jk/jk-icon.vue';
import JkEmpty from'@/components/jk/jk-empty.vue';
import{getJkCommissionSummary,getJkCommissionList}from'@/api/jk.js';
import{jkSourceTypeText}from'@/utils/jk-display.js';
export default{
  components:{JkPageNav,JkIcon,JkEmpty},
  data(){return{summary:{},commission:{},fund:{},list:[],loaded:false}},
  computed:{
    totalIncome(){return this.summary.totalCommissionAmount||this.commission.totalCommissionAmount||0},
    pendingAmount(){return this.summary.pendingSettleAmount||this.commission.pendingSettleAmount||0},
    availableAmount(){return this.summary.withdrawableAmount||this.summary.availableAmount||this.fund.availableAmount||0},
    recentList(){return this.list.slice(0,5)},
    recentRows(){return this.recentList.map((item,index)=>{const amount=Number(item.commissionAmount||item.amount||0);return{key:item.id||index,raw:item,icon:this.incomeIcon(item,index),title:item.sourceTypeText||this.sourceTypeText(item.sourceType)||'业务收益',subtitle:(item.sourceNo||item.orderNo||'业务单据')+' · '+this.formatTime(item.createTime),negative:amount<0,amountText:this.signed(amount),statusText:item.commissionStatusText||item.statusText||item.status||'-'}})},
    trendData(){const days=[];const map={};for(let i=6;i>=0;i--){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-i);const key=this.dateKey(d);map[key]=0;days.push({key,label:(d.getMonth()+1)+'/'+d.getDate()})}this.list.forEach(item=>{const key=this.dateKey(item.createTime);if(Object.prototype.hasOwnProperty.call(map,key))map[key]+=Number(item.commissionAmount||item.amount||0)});return days.map(x=>({label:x.label,value:map[x.key]}))},
    hasTrend(){return this.trendData.some(x=>x.value!==0)},
    maxTrend(){return Math.max(...this.trendData.map(x=>Math.abs(x.value)),1)},
    chartPoints(){return this.trendData.map((x,i)=>({index:i,day:x.label,last:i===this.trendData.length-1,valueText:this.money(x.value),pointStyle:{bottom:(Math.abs(x.value)/this.maxTrend*105)+'rpx'},segmentStyle:i<this.trendData.length-1?this.segmentStyle(i):null}))},
    totalRecent(){return this.list.reduce((s,x)=>s+Math.max(0,Number(x.commissionAmount||x.amount||0)),0)},
    sourceBreakdown(){const buckets={order:{name:'订单佣金',amount:0},team:{name:'团队奖励',amount:0},activity:{name:'活动奖励',amount:0},other:{name:'其他收益',amount:0}};this.list.forEach(item=>{const amount=Math.max(0,Number(item.commissionAmount||item.amount||0));const type=String(item.sourceType||'').toUpperCase();if(type.includes('TEAM'))buckets.team.amount+=amount;else if(type.includes('ACTIVITY'))buckets.activity.amount+=amount;else if(type.includes('ORDER')||type.includes('RETAIL')||type.includes('TRANSFER'))buckets.order.amount+=amount;else buckets.other.amount+=amount});return Object.keys(buckets).map(key=>({key,name:buckets[key].name,amount:buckets[key].amount,percent:this.totalRecent?Number((buckets[key].amount/this.totalRecent*100).toFixed(1)):0}))},
    pieStyle(){const p=this.sourceBreakdown.map(x=>x.percent);const a=p[0],b=a+p[1],c=b+p[2];return{background:`conic-gradient(#10b981 0 ${a}%,#3b82f6 ${a}% ${b}%,#f59e0b ${b}% ${c}%,#a78bfa ${c}% 100%)`}}
  },
  onShow(){this.load()},
  methods:{
    load(){this.loaded=false;Promise.all([getJkCommissionSummary().catch(()=>({})),getJkCommissionList({}).catch(()=>[])]) .then(([summaryRes,listRes])=>{const d=summaryRes.data||summaryRes||{};this.summary=d;this.commission=d.commissionAccount||{};this.fund=d.fundAccount||{};const list=listRes.data||listRes||[];this.list=Array.isArray(list)?list:(list.list||list.records||[])}).finally(()=>this.loaded=true)},
    money(v){const n=Number(v||0);return Number.isNaN(n)?String(v||'0.00'):n.toFixed(2)},signed(v){const n=Number(v||0);return(n>=0?'+':'')+this.money(n)},
    formatTime(v){return v?String(v).replace('T',' ').slice(5,16):'-'},sourceTypeText(v){return jkSourceTypeText(v)},
    incomeIcon(item,i){const t=String(item.sourceType||'').toUpperCase();if(t.includes('TEAM'))return'team';if(t.includes('ACTIVITY'))return'promotion';return i%2?'document':'wallet'},
    go(url){uni.navigateTo({url})},goDetail(item){if(item.id)uni.navigateTo({url:'/pages/jk/commission/detail?id='+item.id})},
    dateKey(v){const d=v instanceof Date?v:new Date(v);if(Number.isNaN(d.getTime()))return'';return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')},
    segmentStyle(i){const a=Math.abs(this.trendData[i].value),b=Math.abs(this.trendData[i+1].value);const y1=a/this.maxTrend*105,y2=b/this.maxTrend*105;const dy=y1-y2;const width=100;const length=Math.sqrt(width*width+dy*dy);const angle=Math.atan2(dy,width)*180/Math.PI;return{width:length+'rpx',transform:'rotate('+(-angle)+'deg)',bottom:y1+'rpx'}}
  }
};
</script>
<style scoped>
.income-page{min-height:100vh;background:#f7f9f9}.income-content{padding:14rpx 22rpx 36rpx}.summary-card{display:flex;padding:24rpx 10rpx;border-radius:20rpx;background:linear-gradient(135deg,#eefbf8,#fff)}.summary-card>view{display:flex;flex:1;flex-direction:column;align-items:center;border-right:1rpx solid #dfece9}.summary-card>view:last-child{border-right:0}.summary-card text{color:#6f7c83;font-size:20rpx}.summary-card strong{margin-top:9rpx;color:#202b31;font-size:30rpx}.summary-card small{margin-top:7rpx;color:#849096;text-align:center;font-size:17rpx}.summary-card button{height:38rpx;margin-top:7rpx;padding:0 12rpx;border-radius:20rpx;background:#10b981;color:#fff;font-size:17rpx;line-height:38rpx}.summary-card button::after{border:0}.chart-card,.card{margin-top:18rpx;padding:22rpx;border-radius:20rpx;background:#fff;box-shadow:0 6rpx 18rpx rgba(24,68,58,.035)}.chart-card{display:flex;gap:22rpx}.chart-section{flex:1}.pie-section{width:46%}.section-head{display:flex;align-items:center;justify-content:space-between}.section-head>text{color:#1f2937;font-size:27rpx;font-weight:700}.section-head small{color:#879299;font-size:19rpx}.line-chart{display:flex;align-items:flex-end;height:160rpx;margin-top:12rpx;border-bottom:1rpx solid #e3e9e7}.point-wrap{position:relative;flex:1;height:145rpx}.point{position:absolute;left:50%;z-index:2;width:10rpx;height:10rpx;border:3rpx solid #10b981;border-radius:50%;background:#fff;transform:translateX(-50%)}.segment{position:absolute;left:50%;z-index:1;height:3rpx;background:#10b981;transform-origin:left center}.point-wrap>small{position:absolute;right:0;bottom:-20rpx;left:0;color:#8b969c;text-align:center;font-size:14rpx}.bubble{position:absolute;right:-20rpx;z-index:4;padding:5rpx 7rpx;border-radius:6rpx;background:#10b981;color:#fff;font-size:14rpx;bottom:112rpx}.pie-row{display:flex;align-items:center;margin-top:16rpx}.pie{position:relative;display:flex;align-items:center;justify-content:center;width:116rpx;height:116rpx;border-radius:50%}.pie::before{position:absolute;width:72rpx;height:72rpx;border-radius:50%;background:#fff;content:''}.pie>view{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center}.pie strong{font-size:17rpx}.pie small{font-size:13rpx;color:#829096}.legend{flex:1;margin-left:10rpx}.legend>view{display:grid;grid-template-columns:12rpx 1fr auto;gap:5rpx;align-items:center;margin:5rpx 0;color:#6f7c83;font-size:14rpx}.legend-dot{width:9rpx;height:9rpx;border-radius:50%;background:#10b981}.legend-dot.c1{background:#3b82f6}.legend-dot.c2{background:#f59e0b}.legend-dot.c3{background:#a78bfa}.income-row{display:flex;align-items:center;min-height:92rpx;border-bottom:1rpx solid #edf1f0}.income-row:last-child{border-bottom:0}.income-row>view:nth-child(2){display:flex;min-width:0;flex:1;flex-direction:column;gap:5rpx;margin-left:10rpx}.income-row>view:nth-child(2) text{color:#29343a;font-size:22rpx;font-weight:600}.income-row small{color:#8b969c;font-size:17rpx}.income-row>view:last-child{display:flex;flex-direction:column;align-items:flex-end;gap:4rpx}.income-row strong{color:#10b981;font-size:23rpx}.income-row strong.negative{color:#ef5b4c}.quick-card{padding-bottom:16rpx}.quick-grid{display:flex;margin-top:18rpx}.quick-grid>view{display:flex;flex:1;flex-direction:column;align-items:center;gap:7rpx;color:#4c5a60;font-size:20rpx}.safe-tip{display:flex;align-items:center;justify-content:center;gap:6rpx;margin-top:18rpx;color:#82a098;font-size:18rpx}.safe-tip image{width:25rpx;height:25rpx}
</style>