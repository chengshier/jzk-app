<template>
  <view class="team-page">
    <jk-page-nav title="我的团队"/>
    <view class="team-content">
      <view class="summary-card">
        <view><text>团队总人数</text><strong>{{teamCount}}</strong></view>
        <view><text>今日新增</text><strong>{{todayNew}}</strong></view>
        <view><text>本月新增</text><strong>{{monthNew}}</strong></view>
      </view>
      <view class="search-row">
        <image src="/static/jk-ui-v2/icons/search.png"/>
        <input v-model="keyword" placeholder="搜索成员昵称/手机号"/>
        <view @tap="filterRole">{{roleFilterLabel}} <image src="/static/jk-ui-v2/icons/filter.png"/></view>
      </view>
      <view v-for="(item,index) in filteredMembers" :key="item.id||item.userId||index" class="member-row" @tap="openMember(item)">
        <view class="avatar"><image :src="item.userAvatar||item.avatar||'/static/jk-ui-v2/icons/user.png'" mode="aspectFill"/></view>
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
export default {
  components: { JkPageNav, JkEmpty },
  data() {
    return { data: {}, keyword: '', loaded: false, roleFilter: '' };
  },
  computed: {
    members() { return this.data.directTeam || this.data.members || []; },
    teamCount() { return this.data.teamCount || this.data.totalTeamCount || this.data.directTeamCount || this.members.length; },
    todayNew() { return this.data.todayNewCount || this.data.todayAddCount || 0; },
    monthNew() { return this.data.monthNewCount || this.data.monthAddCount || 0; },
    roleFilterLabel() {
      return { county_agent: '区县代', partner: '合伙人', maker: '创客' }[this.roleFilter] || '全部身份';
    },
    filteredMembers() {
      const keyword = this.keyword.trim().toLowerCase();
      return this.members.filter((item) => {
        if (this.roleFilter && item.roleCode !== this.roleFilter) return false;
        return !keyword || [item.userName, item.nickname, item.userPhone, item.phone, item.roleName]
          .join(' ').toLowerCase().includes(keyword);
      });
    }
  },
  onShow() {
    this.loaded = false;
    getJkTeamSummary().then((response) => {
      this.data = response.data || response || {};
    }).catch(() => {
      this.data = {};
    }).finally(() => {
      this.loaded = true;
    });
  },
  methods: {
    maskPhone(value) {
      const text = String(value || '');
      return text.length >= 11 ? text.slice(0, 3) + '****' + text.slice(-4) : (text || '暂无手机号');
    },
    openMember(item) {
      if (!item.userId) {
        uni.showToast({ title: '成员数据缺少用户标识', icon: 'none' });
        return;
      }
      uni.navigateTo({ url: '/pages/jk/team/member?userId=' + item.userId });
    },
    filterRole() {
      const values = ['', 'county_agent', 'partner', 'maker'];
      uni.showActionSheet({
        itemList: ['全部身份', '区县代', '合伙人', '创客'],
        success: ({ tapIndex }) => { this.roleFilter = values[tapIndex] || ''; }
      });
    }
  }
};
</script>
<style scoped>
.team-page{min-height:100vh;background:#fff}.team-content{padding:16rpx 22rpx 36rpx}.summary-card{display:flex;padding:28rpx 8rpx;border-radius:20rpx;background:linear-gradient(135deg,#16b990,#50d1b3);color:#fff}.summary-card>view{display:flex;flex:1;flex-direction:column;align-items:center;border-right:1rpx solid rgba(255,255,255,.28)}.summary-card>view:last-child{border-right:0}.summary-card text{font-size:22rpx;opacity:.9}.summary-card strong{margin-top:10rpx;font-size:37rpx}.search-row{display:flex;align-items:center;height:68rpx;margin-top:20rpx;border:1rpx solid #e2e8e6;border-radius:34rpx}.search-row>image{width:34rpx;height:34rpx;margin-left:16rpx}.search-row input{flex:1;height:68rpx;padding:0 10rpx;font-size:22rpx}.search-row>view{display:flex;align-items:center;padding:0 14rpx;border-left:1rpx solid #e7eceb;color:#6f7b81;font-size:21rpx}.search-row>view image{width:30rpx;height:30rpx;margin-left:4rpx}.member-row{display:flex;align-items:center;min-height:130rpx;border-bottom:1rpx solid #edf1f0}.avatar{display:flex;align-items:center;justify-content:center;width:78rpx;height:78rpx;flex-shrink:0;border-radius:50%;background:#e4faf4;overflow:hidden}.avatar image{width:68rpx;height:68rpx;border-radius:50%}.main{display:flex;min-width:0;flex:1;flex-direction:column;gap:6rpx;margin-left:14rpx}.main text:first-child{color:#263139;font-size:25rpx;font-weight:700}.main small{font-size:20rpx;font-weight:500}.main text:nth-child(n+2){color:#7e8a90;font-size:20rpx}.arrow{color:#99a3a8;font-size:34rpx}
</style>
