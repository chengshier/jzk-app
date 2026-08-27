<template>
  <view class="page">
    <jk-page-nav title="经营收益" />
    <view class="content">
      <view class="summary-card">
        <text>{{tab==='performance'?'有效业绩':'线下经营收益'}}</text>
        <strong>{{money(summaryAmount)}}</strong>
        <small v-if="tab==='profit'">线下已实现，不进入平台提现账户</small>
        <small v-else>业绩用于统计和规则判断，不等于可提现佣金</small>
      </view>
      <view class="tabs"><view :class="{active:tab==='performance'}" @tap="switchTab('performance')">业绩账本</view><view :class="{active:tab==='profit'}" @tap="switchTab('profit')">经营收益</view></view>
      <view v-for="item in list" :key="item.id" class="record-card" @tap="showSnapshot(item)">
        <view class="head"><text>{{ title(item) }}</text><jk-status-tag :text="item.status||'有效'" :tone="tone(item.status)" /></view>
        <view class="amount">{{ tab==='performance' ? money(item.performanceAmount) : money(item.profitAmount) }}</view>
        <view class="line"><text>来源</text><text>{{ item.sourceType }} · {{ item.sourceNo||'--' }}</text></view>
        <view v-if="tab==='profit'" class="line"><text>收入/成本</text><text>{{money(item.revenueAmount)}} / {{money(item.costAmount)}}</text></view>
        <view class="line"><text>已冲减</text><text>{{money(item.reversedAmount)}}</text></view>
        <view class="time">{{ item.occurredAt||item.createTime||'' }}</view>
      </view>
      <jk-empty v-if="loaded&&!list.length" text="暂无经营记录" />
      <view v-if="hasMore" class="more" @tap="loadMore">加载更多</view>
    </view>
  </view>
</template>
<script>
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import JkStatusTag from '@/components/jk/jk-status-tag.vue';
import JkEmpty from '@/components/jk/jk-empty.vue';
import { getJkPerformanceSummary,getJkPerformanceList,getJkOperationProfitSummary,getJkOperationProfitList } from '@/api/jkV31.js';
export default {components:{JkPageNav,JkStatusTag,JkEmpty},data(){return{tab:'performance',summary:{},list:[],page:1,limit:20,total:0,loaded:false}},computed:{summaryAmount(){return this.tab==='performance'?this.summary.validPerformanceAmount:this.summary.confirmedProfitAmount},hasMore(){return this.list.length<this.total}},onLoad(o){if(o&&o.tab==='profit')this.tab='profit'},onShow(){this.reload()},methods:{value(r){return(r&&r.data)||r||{}},money(v){const n=Number(v||0);return n.toFixed(2)},title(item){return this.tab==='performance'?(item.performanceType||'业务业绩'):'经营毛利'},tone(s){return s==='REVERSED'?'danger':s==='PARTIALLY_REVERSED'?'warning':'success'},switchTab(tab){if(this.tab===tab)return;this.tab=tab;this.reload()},reload(){this.page=1;this.list=[];this.loadSummary();this.load()},loadSummary(){const fn=this.tab==='performance'?getJkPerformanceSummary:getJkOperationProfitSummary;fn().then(r=>{this.summary=this.value(r)}).catch(()=>{this.summary={}})},load(){this.loaded=false;const fn=this.tab==='performance'?getJkPerformanceList:getJkOperationProfitList;fn({page:this.page,limit:this.limit}).then(r=>{const d=this.value(r);const rows=d.list||d.records||[];this.total=Number(d.total||rows.length);this.list=this.page===1?rows:this.list.concat(rows)}).finally(()=>{this.loaded=true})},loadMore(){if(!this.hasMore)return;this.page++;this.load()},showSnapshot(item){uni.showModal({title:'记录说明',content:'本记录基于业务发生时的关系、来源和规则快照生成。换绑或规则变更不会改写历史记录。',showCancel:false})}}}
</script>
<style scoped>.page{min-height:100vh;background:#f7f9f9}.content{padding:18rpx 22rpx 40rpx}.summary-card{display:flex;flex-direction:column;padding:30rpx;border-radius:22rpx;background:linear-gradient(135deg,#16b990,#50d1b3);color:#fff}.summary-card text{font-size:24rpx}.summary-card strong{margin-top:12rpx;font-size:50rpx}.summary-card small{margin-top:10rpx;font-size:21rpx;opacity:.88}.tabs{display:flex;margin:20rpx 0;padding:6rpx;border-radius:18rpx;background:#fff}.tabs view{flex:1;padding:18rpx;text-align:center;color:#7a858a;font-size:24rpx}.tabs .active{border-radius:14rpx;background:#e6faf4;color:#0eaa82;font-weight:700}.record-card{margin-bottom:16rpx;padding:24rpx;border-radius:20rpx;background:#fff}.head,.line{display:flex;justify-content:space-between}.head>text{font-size:27rpx;font-weight:700;color:#273238}.amount{margin:18rpx 0;color:#0fa981;font-size:42rpx;font-weight:700}.line{margin-top:10rpx;color:#7c878c;font-size:22rpx}.line text:last-child{color:#3e4b51}.time{margin-top:14rpx;color:#a1aaae;font-size:20rpx}.more{text-align:center;padding:24rpx;color:#11a981;font-size:23rpx}</style>
