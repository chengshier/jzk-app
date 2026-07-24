<template>
  <view class="member-page">
    <jk-page-nav title="成员详情"/>
    <view class="member-content">
      <view class="profile-card">
        <image class="avatar" :src="item.avatar||item.userAvatar||'/static/jk-ui-v2/icons/user.png'" mode="aspectFill"/>
        <view class="profile-main">
          <view><text>{{item.userName||item.nickname||'团队成员'}}</text><jk-status-tag :text="item.roleName||item.identityName||'成员'" tone="success"/></view>
          <small>手机号：{{maskPhone(item.userPhone||item.phone)}}</small>
          <small>加入时间：{{formatDate(item.joinTime||item.createTime)}}</small>
          <small>所属区域：{{item.regionName||'-'}}</small>
        </view>
        <image class="watermark" src="/static/jk-ui-v2/illustrations/identity-hero.png" mode="aspectFit"/>
      </view>

      <view class="metrics">
        <view><text>直属下级</text><strong>{{displayNumber(item.directCount!==undefined?item.directCount:item.directTeamCount)}}</strong></view>
        <view><text>团队人数</text><strong>{{displayNumber(item.teamCount)}}</strong></view>
        <view><text>累计贡献（元）</text><strong>{{item.contributionAvailable?displayMoney(item.totalContribution):'-'}}</strong></view>
      </view>

      <view class="card">
        <view class="section-title">关系信息</view>
        <view class="row"><text>上级成员</text><strong>{{item.parentName||'-'}}</strong></view>
        <view class="row"><text>身份类型</text><strong>{{item.roleName||item.identityName||'-'}}</strong></view>
        <view class="row"><text>身份状态</text><jk-status-tag :text="item.statusText||item.identityStatusText||'暂无状态数据'" :tone="statusTone"/></view>
        <view class="row"><text>加入来源</text><strong>{{item.bindSource||item.relationType||'-'}}</strong></view>
        <view v-if="item.freezeReason" class="row"><text>冻结原因</text><strong>{{item.freezeReason}}</strong></view>
      </view>

      <view class="card">
        <view class="section-head"><text>贡献记录</text></view>
        <view v-for="(record,index) in contributionRecords" :key="record.id||index" class="record-row">
          <jk-icon :name="index%3===0?'wallet':index%3===1?'document':'money'" size="md"/>
          <view><text>{{record.name}}</text><small>{{record.no}} · {{record.time}}</small></view>
          <view><strong>+{{money(record.amount)}}</strong><small>{{record.status}}</small></view>
        </view>
        <jk-empty v-if="loaded&&!contributionRecords.length" text="暂无可核算贡献记录"/>
        <text v-if="loaded&&!contributionRecords.length" class="data-note">{{item.contributionMessage||'当前没有可确认的成员贡献数据，页面不会生成模拟佣金。'}}</text>
      </view>

      <view class="card">
        <view class="section-head"><text>最近动态</text></view>
        <view v-for="(activity,index) in activities" :key="activity.id||index" class="dynamic">
          <view class="dot"></view><text>{{activity.title||activity.content||activity.activityText}}</text><small>{{formatTime(activity.createTime||activity.time)}}</small>
        </view>
        <jk-empty v-if="loaded&&!activities.length" text="暂无真实成员动态"/>
      </view>
    </view>
    <view class="bottom-actions"><button class="outline-btn" @tap="contact"><jk-icon name="document" size="sm"/>联系成员</button><button class="primary-btn" @tap="backTeam"><jk-icon name="team" size="sm"/>查看团队</button></view>
  </view>
</template>
<script>
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import JkIcon from '@/components/jk/jk-icon.vue';
import JkStatusTag from '@/components/jk/jk-status-tag.vue';
import JkEmpty from '@/components/jk/jk-empty.vue';
import { getJkTeamMemberDetail } from '@/api/jk.js';
export default {
  components: { JkPageNav, JkIcon, JkStatusTag, JkEmpty },
  data() { return { item: {}, userId: null, loaded: false }; },
  computed: {
    contributionRecords() {
      const list = this.item.contributionRecords || this.item.commissionList || [];
      return list.slice(0, 3).map((row) => ({
        id: row.id,
        name: row.sourceTypeText || row.name || '业务佣金',
        no: row.sourceNo || row.orderNo || '-',
        time: this.formatTime(row.createTime),
        amount: row.amount || row.commissionAmount || 0,
        status: row.statusText || row.status || '-'
      }));
    },
    activities() {
      const list = this.item.activityList || this.item.activities || [];
      return Array.isArray(list) ? list.slice(0, 5) : [];
    },
    statusTone() {
      const text = this.item.statusText || this.item.identityStatusText || '';
      return text.indexOf('冻结') >= 0 || text.indexOf('停用') >= 0 ? 'warning' : (text ? 'success' : 'muted');
    }
  },
  onLoad(query) {
    this.userId = query.userId ? Number(query.userId) : null;
    if (!this.userId) {
      try { this.item = JSON.parse(decodeURIComponent(query.item || '%7B%7D')); } catch (error) { this.item = {}; }
      this.loaded = true;
      return;
    }
    getJkTeamMemberDetail(this.userId).then((response) => {
      this.item = response.data || response || {};
    }).catch((error) => {
      this.item = {};
      uni.showToast({ title: (error && error.message) || '成员详情加载失败', icon: 'none' });
    }).finally(() => {
      this.loaded = true;
    });
  },
  methods: {
    maskPhone(value) { const text = String(value || ''); return text.length >= 11 ? text.slice(0, 3) + '****' + text.slice(-4) : (text || '-'); },
    money(value) { const number = Number(value || 0); return Number.isNaN(number) ? String(value || '0.00') : number.toFixed(2); },
    displayMoney(value) { return value === undefined || value === null || value === '' ? '-' : this.money(value); },
    displayNumber(value) { return value === undefined || value === null || value === '' ? '-' : value; },
    formatDate(value) { return value ? String(value).slice(0, 10) : '-'; },
    formatTime(value) { return value ? String(value).replace('T', ' ').slice(0, 19) : '-'; },
    contact() {
      if (this.item.userPhone || this.item.phone) uni.makePhoneCall({ phoneNumber: String(this.item.userPhone || this.item.phone) });
      else uni.showToast({ title: '暂无成员手机号', icon: 'none' });
    },
    backTeam() { uni.navigateBack(); }
  }
};
</script>
<style scoped>
.member-page{min-height:100vh;padding-bottom:110rpx;background:#f7f9f9}.member-content{padding:14rpx 22rpx 36rpx}.profile-card{position:relative;display:flex;align-items:center;min-height:160rpx;overflow:hidden;padding:22rpx;border-radius:20rpx;background:linear-gradient(135deg,#eafaf6,#f8fffd)}.avatar{width:100rpx;height:100rpx;flex-shrink:0;border:5rpx solid #fff;border-radius:50%;background:#fff}.profile-main{position:relative;z-index:2;display:flex;flex:1;flex-direction:column;gap:6rpx;margin-left:16rpx}.profile-main>view{display:flex;align-items:center;gap:10rpx}.profile-main>view>text{color:#1f2a30;font-size:29rpx;font-weight:700}.profile-main small{color:#77858b;font-size:20rpx}.watermark{position:absolute;right:-38rpx;bottom:-68rpx;width:220rpx;height:220rpx;opacity:.12}.metrics{display:flex;margin-top:16rpx;padding:20rpx 8rpx;border-radius:18rpx;background:#fff}.metrics>view{display:flex;flex:1;flex-direction:column;align-items:center;border-right:1rpx solid #e5ecea}.metrics>view:last-child{border-right:0}.metrics text{color:#7d898f;font-size:19rpx}.metrics strong{margin-top:8rpx;color:#10b981;font-size:27rpx}.card{margin-top:16rpx;padding:22rpx;border-radius:19rpx;background:#fff}.section-title,.section-head>text{color:#1f2937;font-size:27rpx;font-weight:700}.row{display:flex;align-items:center;justify-content:space-between;min-height:70rpx;border-bottom:1rpx solid #edf1f0}.row:last-child{border-bottom:0}.row>text{color:#738087;font-size:22rpx}.row strong{max-width:430rpx;color:#273239;text-align:right;font-size:22rpx;font-weight:500}.section-head{display:flex;align-items:center;justify-content:space-between}.record-row{display:flex;align-items:center;min-height:90rpx;border-bottom:1rpx solid #edf1f0}.record-row>view:nth-child(2){display:flex;flex:1;flex-direction:column;gap:4rpx;margin-left:8rpx}.record-row>view:nth-child(2) text{color:#28343a;font-size:21rpx;font-weight:600}.record-row small{color:#8b969c;font-size:17rpx}.record-row>view:last-child{display:flex;flex-direction:column;align-items:flex-end;gap:4rpx}.record-row strong{color:#10b981;font-size:22rpx}.dynamic{display:grid;grid-template-columns:18rpx 1fr auto;gap:8rpx;align-items:center;min-height:54rpx}.dot{width:8rpx;height:8rpx;border-radius:50%;background:#10b981}.dynamic text{color:#405057;font-size:20rpx}.dynamic small{color:#8b969c;font-size:16rpx}.data-note{display:block;margin-top:8rpx;color:#9aa4a9;text-align:center;font-size:18rpx}.bottom-actions{position:fixed;z-index:40;right:0;bottom:0;left:0;display:flex;gap:14rpx;padding:14rpx 22rpx calc(16rpx + env(safe-area-inset-bottom));background:#fff}.bottom-actions button{display:flex;flex:1;align-items:center;justify-content:center;height:76rpx;margin:0;border-radius:38rpx;font-size:24rpx;line-height:76rpx}.bottom-actions button::after{border:0}.outline-btn{border:2rpx solid #10b981!important;background:#fff!important;color:#10a981!important}.primary-btn{background:#10b981!important;color:#fff!important}.primary-btn ::v-deep image{filter:brightness(0) invert(1)}
</style>
