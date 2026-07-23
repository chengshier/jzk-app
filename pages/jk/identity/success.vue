<template>
  <view class="identity-success">
    <jk-page-nav title="申请提交成功"></jk-page-nav>
    <view class="success-head"><view class="success-icon">✓</view><view class="success-title">申请已提交，等待审核</view><view class="success-desc">我们将在 <text>1-2 个工作日</text> 内完成审核，请耐心等待。</view></view>
    <view class="record-card">
      <view class="record-row"><text>申请身份</text><strong>{{ application.roleName || '业务身份' }}</strong></view>
      <view class="record-row"><text>申请人</text><strong>{{ application.applicantName || '当前用户' }}</strong></view>
      <view class="record-row"><text>申请时间</text><strong>{{ application.createTime || '提交成功后生成' }}</strong></view>
      <view class="record-row"><text>审核流程</text><strong>区县代初审 → 平台复审</strong></view>
      <view class="record-row"><text>预计审核时间</text><strong>1-2 个工作日</strong></view>
    </view>
    <button class="secondary-btn" @click="viewApplications">查看申请记录</button>
    <button class="primary-btn" @click="backToStatus">返回业务中心</button>
  </view>
</template>

<script>
import { getJkIdentityApplyList } from '@/api/jk.js';
import JkPageNav from '@/components/jk/jk-page-nav.vue';
export default {
  components: { JkPageNav },
  data() { return { application: { roleName: '', applicantName: '', createTime: '', applyNo: '' } }; },
  onLoad(query) {
    this.application = { roleName: query.roleName || '', applicantName: query.applicantName || '', createTime: query.createTime || '', applyNo: query.applyNo || '' };
    if (!this.application.roleName || !this.application.createTime) this.loadLatestApplication();
  },
  methods: {
    loadLatestApplication() {
      getJkIdentityApplyList({ page: 1, limit: 1 }).then(res => {
        const data = res.data || res || {};
        const row = (data.list || data.records || [])[0];
        if (row) this.application = { roleName: row.applyRoleName, applicantName: row.applicantName, createTime: row.createTime, applyNo: row.applyNo };
      }).catch(() => {});
    },
    viewApplications() { uni.redirectTo({ url: '/pages/jk/identity/applyList' }); },
    backToStatus() { uni.redirectTo({ url: '/pages/jk/identity/status' }); }
  }
};
</script>

<style lang="scss">
.identity-success { min-height: 100vh; padding: 0 34rpx 80rpx; background: radial-gradient(circle at 50% 18%, #e7fff8, #fff 37%); box-sizing: border-box; }.success-head { padding: 80rpx 0 60rpx; text-align: center; }.success-icon { display: flex; align-items: center; justify-content: center; width: 170rpx; height: 170rpx; margin: 0 auto 42rpx; border: 22rpx solid #d9f9f1; border-radius: 50%; background: #08c3a0; color: #fff; font-size: 94rpx; box-shadow: 0 12rpx 35rpx rgba(8,195,160,.22); }.success-title { margin-bottom: 20rpx; color: #202633; font-size: 42rpx; font-weight: 700; }.success-desc { color: #717b89; font-size: 28rpx; }.success-desc text { color: #08b996; }.record-card { overflow: hidden; margin-bottom: 58rpx; padding: 0 28rpx; border-radius: 24rpx; background: #fff; box-shadow: 0 10rpx 35rpx rgba(20,60,51,.08); }.record-row { display: flex; justify-content: space-between; align-items: center; min-height: 102rpx; border-bottom: 1rpx solid #e9edef; font-size: 28rpx; }.record-row:last-child { border-bottom: 0; }.record-row text { color: #727b88; }.record-row strong { max-width: 400rpx; color: #202633; text-align: right; font-weight: 500; }.secondary-btn, .primary-btn { height: 92rpx; margin-bottom: 22rpx; border-radius: 46rpx; line-height: 92rpx; font-size: 32rpx; font-weight: 600; }.secondary-btn { border: 2rpx solid #08b996; background: #fff; color: #08b996; }.primary-btn { background: #08b996; color: #fff; box-shadow: 0 12rpx 22rpx rgba(8,185,150,.25); }
</style>
