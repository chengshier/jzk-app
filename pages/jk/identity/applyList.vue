<template>
  <view class="identity-records"><jk-page-nav title="申请记录"></jk-page-nav>
    <view class="filter-bar"><text v-for="item in filters" :key="item.value" :class="{ active: activeFilter === item.value }" @click="activeFilter = item.value">{{ item.label }}</text></view>
    <view v-for="item in filteredList" :key="item.id" class="record-item" @click="openDetail(item)">
      <view class="record-icon" :class="item.statusClass">{{ item.roleShort }}</view>
      <view class="record-main"><view><strong>{{ item.roleDisplayName }}</strong><text :class="['status-tag', item.statusClass]">{{ item.statusDisplayText }}</text></view><text>申请时间：{{ formatTime(item.createTime) }}</text><text>申请编号：{{ item.applyNo || '-' }}</text></view><text class="chevron">›</text>
    </view>
    <view v-if="loaded && !filteredList.length" class="empty">暂无{{ activeFilterLabel }}申请记录</view>
    <view v-if="filteredList.length" class="no-more">没有更多了</view>
  </view>
</template>
<script>
import { getJkIdentityApplyList } from '@/api/jk.js';
import JkPageNav from '@/components/jk/jk-page-nav.vue';
const ROLE_NAME_MAP = { normal_user: '普通用户', maker: '创客', partner: '合伙人', county_agent: '区县代', health_advisor: '健康顾问', city_agent: '市代', province_agent: '省代' };
export default {
  components: { JkPageNav },
  data() { return { list: [], loaded: false, activeFilter: '', filters: [{ label: '全部', value: '' }, { label: '审核中', value: 'PENDING' }, { label: '已通过', value: 'APPROVED' }, { label: '已拒绝', value: 'REJECTED' }] }; },
  computed: { filteredList() { return this.activeFilter ? this.list.filter(item => item.auditStatus === this.activeFilter || (this.activeFilter === 'APPROVED' && item.auditStatus === 'EFFECTIVE')) : this.list; }, activeFilterLabel() { const current = this.filters.filter(item => item.value === this.activeFilter)[0]; return this.activeFilter ? (current ? current.label : '') : ''; } },
  onShow() { this.loadList(); },
  methods: {
    loadList() { getJkIdentityApplyList({ page: 1, limit: 50 }).then(res => { const data = res.data || res || {}; const rows = Array.isArray(data) ? data : (data.list || data.records || []); this.list = rows.map(item => Object.assign({}, item, { statusClass: this.statusClass(item), roleDisplayName: this.roleName(item), roleShort: this.roleShort(item), statusDisplayText: this.statusText(item) })); }).catch(err => this.$util.Tips({ title: err || '申请记录加载失败' })).finally(() => { this.loaded = true; }); },
    roleName(item) { return item.applyRoleName || ROLE_NAME_MAP[item.applyRoleCode] || item.applyRoleCode || '业务身份'; }, roleShort(item) { return this.roleName(item).slice(0, 1); },
    statusText(item) { return item.auditStatusText || item.statusText || '审核中'; },
    statusClass(item) { if (item.auditStatus === 'REJECTED') return 'rejected'; if (item.auditStatus === 'EFFECTIVE' || item.auditStatus === 'APPROVED') return 'approved'; if (item.auditStatus === 'FROZEN') return 'frozen'; return 'pending'; },
    formatTime(value) { return value ? String(value).replace('T', ' ').slice(0, 19) : '-'; },
    openDetail(item) { uni.navigateTo({ url: '/pages/jk/identity/applyDetail?id=' + item.id }); }
  }
};
</script>
<style lang="scss">
.identity-records{min-height:100vh;background:#fff}.filter-bar{display:flex;gap:42rpx;padding:30rpx 48rpx 22rpx;border-bottom:1rpx solid #edf0f2}.filter-bar text{padding-bottom:15rpx;color:#737d8d;font-size:30rpx}.filter-bar .active{border-bottom:6rpx solid #08b996;color:#08b996;font-weight:700}.record-item{display:flex;align-items:center;margin:0 38rpx;padding:38rpx 0;border-bottom:1rpx solid #edf0f2}.record-icon{display:flex;align-items:center;justify-content:center;width:104rpx;height:104rpx;margin-right:26rpx;border-radius:50%;background:#e4faf4;color:#08b996;font-size:42rpx;font-weight:700}.record-icon.rejected{background:#fff0ed;color:#ff7252}.record-icon.pending{background:#effaf8;color:#0aba97}.record-main{display:flex;flex:1;flex-direction:column;gap:12rpx}.record-main>view{display:flex;align-items:center;gap:16rpx}.record-main strong{color:#202633;font-size:35rpx}.record-main>text{color:#778090;font-size:26rpx}.status-tag{display:inline-block;flex-shrink:0;padding:7rpx 15rpx;border-radius:9rpx;background:#fff0dd;color:#f49c22;font-size:24rpx}.status-tag.approved{background:#e6faf4;color:#08af8d}.status-tag.rejected{background:#ffebe7;color:#ff614b}.status-tag.frozen{background:#edf0f3;color:#6f7885}.chevron{color:#8a94a2;font-size:48rpx}.empty,.no-more{padding:80rpx 0;color:#8a93a0;text-align:center;font-size:27rpx}.no-more{padding:46rpx 0}
</style>
