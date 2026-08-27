<template>
  <view class="team-page">
    <jk-page-nav title="我的团队"/>
    <view class="team-content">
      <view class="summary-card">
        <view><text>直属人数</text><strong>{{directCount}}</strong></view>
        <view><text>额度上限</text><strong>{{quota.maxDirectChildren == null ? '--' : quota.maxDirectChildren}}</strong></view>
        <view><text>剩余名额</text><strong>{{quota.remainingCount == null ? '--' : quota.remainingCount}}</strong></view>
      </view>
      <view v-if="quota.maxDirectChildren != null" class="quota-card" :class="{warning:quota.warning,full:quota.full}">
        <view class="quota-head"><text>直属下级人数额度</text><text>{{quota.usedCount||0}} + 预占 {{quota.reservedCount||0}} / {{quota.maxDirectChildren}}</text></view>
        <view class="quota-track"><view :style="{width:quotaPercent+'%'}"/></view>
        <text class="quota-note">{{quota.full?'人数额度已满，暂不能继续绑定':(quota.warning?'人数额度即将用完，请提前联系管理员':'当前额度正常')}} · {{quota.ruleName||'默认规则'}}</text>
      </view>
      <view class="search-row">
        <image src="https://file.wit.cn/jzk/static/jk-ui-v2/icons/search.png"/>
        <input v-model="keyword" placeholder="搜索成员昵称/手机号"/>
        <view @tap="filterRole">{{roleFilterLabel}} <image src="https://file.wit.cn/jzk/static/jk-ui-v2/icons/filter.png"/></view>
      </view>
      <view v-for="(item,index) in filteredMembers" :key="item.id||item.userId||index" class="member-row" @tap="openMember(item)">
        <view class="avatar"><image :src="item.userAvatar||item.avatar||'https://file.wit.cn/jzk/static/jk-ui-v2/icons/user.png'" mode="aspectFill"/></view>
        <view class="main">
          <text>{{item.userName||item.nickname||('用户'+(item.userId||''))}} <small>（{{item.roleName||item.identityName||'成员'}}）</small></text>
          <text>{{maskPhone(item.userPhone||item.phone)}}</text>
          <text>直属下级：{{item.directTeamCount||0}}人　|　团队：{{item.teamCount||0}}人</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <jk-empty v-if="loaded&&!filteredMembers.length" text="暂无团队成员"/>
    </view>
  </view>
</template>
<script>
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import JkEmpty from '@/components/jk/jk-empty.vue';
import { getJkTeamSummary } from '@/api/jk.js';
import { getJkTeamQuota } from '@/api/jkV31.js';
export default {
  components: { JkPageNav, JkEmpty },
  data() { return { data: {}, quota: {}, keyword: '', loaded: false, roleFilter: '' }; },
  computed: {
    members() { return this.data.directTeam || this.data.members || []; },
    directCount() { return Number(this.quota.usedCount != null ? this.quota.usedCount : (this.data.directTeamCount || this.members.length)); },
    quotaPercent() { const max=Number(this.quota.maxDirectChildren||0); return max?Math.min(100,Math.round((Number(this.quota.usedCount||0)+Number(this.quota.reservedCount||0))*100/max)):0; },
    roleFilterLabel() { return { county_agent: '区县代', partner: '合伙人', maker: '创客', normal_user:'普通用户' }[this.roleFilter] || '全部身份'; },
    filteredMembers() {
      const keyword = this.keyword.trim().toLowerCase();
      return this.members.filter((item) => {
        if (this.roleFilter && item.roleCode !== this.roleFilter) return false;
        return !keyword || [item.userName, item.nickname, item.userPhone, item.phone, item.roleName].join(' ').toLowerCase().includes(keyword);
      });
    }
  },
  onShow() {
    this.loaded = false;
    Promise.all([getJkTeamSummary().catch(()=>({})),getJkTeamQuota().catch(()=>({}))]).then(([summaryRes,quotaRes])=>{
      this.data=summaryRes.data||summaryRes||{};
      this.quota=quotaRes.data||quotaRes||{};
    }).finally(()=>{this.loaded=true;});
  },
  methods: {
    maskPhone(value) { const text=String(value||''); return text.length>=11?text.slice(0,3)+'****'+text.slice(-4):(text||'暂无手机号'); },
    openMember(item) { if(!item.userId)return uni.showToast({title:'成员数据缺少用户标识',icon:'none'});uni.navigateTo({url:'/pages/jk/team/member?userId='+item.userId}); },
    filterRole() {
      const values=['','normal_user','maker','partner','county_agent'];
      uni.showActionSheet({itemList:['全部身份','普通用户','创客','合伙人','区县代'],success:({tapIndex})=>{this.roleFilter=values[tapIndex]||'';}});
    }
  }
};
</script>
<style scoped>
.team-page{min-height:100vh;background:#fff}.team-content{padding:16rpx 22rpx 36rpx}.summary-card{display:flex;padding:28rpx 8rpx;border-radius:20rpx;background:linear-gradient(135deg,#16b990,#50d1b3);color:#fff}.summary-card>view{display:flex;flex:1;flex-direction:column;align-items:center;border-right:1rpx solid rgba(255,255,255,.28)}.summary-card>view:last-child{border-right:0}.summary-card text{font-size:22rpx;opacity:.9}.summary-card strong{margin-top:10rpx;font-size:37rpx}.quota-card{margin-top:18rpx;padding:22rpx;border-radius:18rpx;background:#effaf7}.quota-card.warning{background:#fff8e8}.quota-card.full{background:#fff0f0}.quota-head{display:flex;justify-content:space-between;color:#30433e;font-size:23rpx;font-weight:600}.quota-track{height:12rpx;margin:16rpx 0;border-radius:999rpx;background:rgba(41,200,166,.16);overflow:hidden}.quota-track view{height:100%;border-radius:999rpx;background:#29c8a6}.warning .quota-track view{background:#e6a23c}.full .quota-track view{background:#f56c6c}.quota-note{color:#70807b;font-size:20rpx}.search-row{display:flex;align-items:center;height:68rpx;margin-top:20rpx;border:1rpx solid #e2e8e6;border-radius:34rpx}.search-row>image{width:34rpx;height:34rpx;margin-left:16rpx}.search-row input{flex:1;height:68rpx;padding:0 10rpx;font-size:22rpx}.search-row>view{display:flex;align-items:center;padding:0 14rpx;border-left:1rpx solid #e7eceb;color:#6f7b81;font-size:21rpx}.search-row>view image{width:30rpx;height:30rpx;margin-left:4rpx}.member-row{display:flex;align-items:center;min-height:130rpx;border-bottom:1rpx solid #edf1f0}.avatar{display:flex;align-items:center;justify-content:center;width:78rpx;height:78rpx;flex-shrink:0;border-radius:50%;background:#e4faf4;overflow:hidden}.avatar image{width:68rpx;height:68rpx;border-radius:50%}.main{display:flex;min-width:0;flex:1;flex-direction:column;gap:6rpx;margin-left:14rpx}.main text:first-child{color:#263139;font-size:25rpx;font-weight:700}.main small{font-size:20rpx;font-weight:500}.main text:nth-child(n+2){color:#7e8a90;font-size:20rpx}.arrow{color:#99a3a8;font-size:34rpx}
</style>
