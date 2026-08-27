<template>
  <view class="success-page">
    <jk-page-nav title="申请提交成功" transparent />
    <view class="success-content">
      <view class="success-visual">
        <view class="visual-ring"><image src="https://file.wit.cn/jzk/static/jk-ui-v2/icons/success.png" mode="aspectFit" /></view>
      </view>
      <text class="success-title">申请已提交，等待审核</text>
      <text class="success-desc">我们将在 <text>1–2 个工作日</text> 内完成审核，请耐心等待。</text>

      <view class="record-card">
        <view class="record-row"><view><jk-icon name="identity" size="sm"/><text>申请身份</text></view><strong>{{ application.roleName || '业务身份' }}</strong></view>
        <view class="record-row"><view><jk-icon name="user" size="sm"/><text>申请人</text></view><strong>{{ application.applicantName || '当前用户' }}</strong></view>
        <view class="record-row"><view><jk-icon name="calendar" size="sm"/><text>申请时间</text></view><strong>{{ formatTime(application.createTime) }}</strong></view>
        <view class="record-row"><view><jk-icon name="flow" size="sm"/><text>审核流程</text></view><strong>区县代初审 <text class="green">→</text> 平台复审</strong></view>
        <view class="record-row"><view><jk-icon name="clock" size="sm"/><text>预计审核时间</text></view><strong>1–2 个工作日</strong></view>
      </view>
    </view>
    <view class="bottom-buttons">
      <button class="outline-btn" @tap="viewApplications"><image src="https://file.wit.cn/jzk/static/jk-ui-v2/icons/document.png" mode="aspectFit"/>查看申请记录</button>
      <button class="primary-btn" @tap="backToBusiness"><image src="https://file.wit.cn/jzk/static/jk-ui-v2/icons/wallet.png" mode="aspectFit"/>返回业务中心</button>
    </view>
  </view>
</template>

<script>
import { getJkIdentityApplyList } from '@/api/jk.js';
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import JkIcon from '@/components/jk/jk-icon.vue';
export default {
  components:{ JkPageNav, JkIcon },
  data(){ return { application:{ roleName:'', applicantName:'', createTime:'', applyNo:'' } }; },
  onLoad(query){
    this.application = { roleName:query.roleName || '', applicantName:query.applicantName || '', createTime:query.createTime || '', applyNo:query.applyNo || '' };
    if (!this.application.roleName || !this.application.createTime) this.loadLatestApplication();
  },
  methods:{
    loadLatestApplication(){
      getJkIdentityApplyList({ page:1, limit:1 }).then(res => {
        const data = res.data || res || {}; const row = (data.list || data.records || [])[0];
        if (row) this.application = { roleName:row.applyRoleName, applicantName:row.applicantName, createTime:row.createTime, applyNo:row.applyNo };
      }).catch(()=>{});
    },
    formatTime(value){ return value ? String(value).replace('T',' ').slice(0,19) : '提交成功后生成'; },
    viewApplications(){ uni.redirectTo({ url:'/pages/jk/identity/applyList' }); },
    backToBusiness(){ uni.redirectTo({ url:'/pages/jk/business/index' }); },
    backToStatus(){ uni.redirectTo({ url:'/pages/jk/identity/status' }); }
  }
};
</script>

<style scoped>
.success-page{min-height:100vh;padding-bottom:210rpx;background:radial-gradient(circle at 50% 22%,#e6fff8 0,#f8fffd 31%,#fff 55%)}.success-content{padding:34rpx 28rpx 40rpx;text-align:center}.success-visual{height:250rpx;display:flex;align-items:center;justify-content:center}.visual-ring{display:flex;align-items:center;justify-content:center;width:164rpx;height:164rpx;border:18rpx solid #dff9f2;border-radius:50%;background:#fff;box-shadow:0 18rpx 38rpx rgba(16,185,129,.16)}.visual-ring image{width:136rpx;height:136rpx}.success-title{display:block;color:#172128;font-size:42rpx;font-weight:800}.success-desc{display:block;margin-top:18rpx;color:#717d84;font-size:26rpx}.success-desc text{color:#10b981;font-weight:600}.record-card{margin-top:42rpx;padding:0 24rpx;border-radius:24rpx;background:#fff;box-shadow:0 10rpx 34rpx rgba(20,67,56,.07);text-align:left}.record-row{display:flex;align-items:center;justify-content:space-between;min-height:96rpx;border-bottom:1rpx solid #edf1f0}.record-row:last-child{border-bottom:0}.record-row>view{display:flex;align-items:center;gap:14rpx;color:#707c83;font-size:25rpx}.record-row strong{max-width:370rpx;color:#1e2930;text-align:right;font-size:26rpx;font-weight:500}.green{color:#10b981}.bottom-buttons{position:fixed;z-index:30;right:0;bottom:0;left:0;padding:16rpx 28rpx calc(20rpx + env(safe-area-inset-bottom));background:rgba(255,255,255,.97)}.bottom-buttons button{display:flex;align-items:center;justify-content:center;height:84rpx;margin:0 0 16rpx;border-radius:42rpx;font-size:28rpx;font-weight:600}.bottom-buttons button::after{border:0}.bottom-buttons button image{width:38rpx;height:38rpx;margin-right:10rpx}.outline-btn{border:2rpx solid #12b98f!important;background:#fff!important;color:#10a981!important}.primary-btn{background:linear-gradient(90deg,#12b98f,#08ad82)!important;color:#fff!important}.primary-btn image{filter:brightness(0) invert(1)}
</style>
