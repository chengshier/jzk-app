<template>
  <view class="device-page">
    <view class="page-content">
      <view class="status-card">
        <view class="status-icon">⌁</view>
        <text class="status-title">连接三诺 CGM</text>
        <text class="status-desc">授权后，三诺爱看会将您已授权设备的连续血糖数据同步到健康档案。</text>
        <view class="connect-button" :class="{ disabled: authorizing }" @tap="connectSinocare">{{ authorizing ? '正在打开授权页…' : '去授权' }}</view>
        <text class="authorization-tip">请在三诺授权页使用三诺爱看账号完成授权。</text>
      </view>

      <view class="card">
        <text class="card-title">当前仍可使用</text>
        <view class="feature" @tap="go('/pages/jk/health/glucose')"><text>手工记录血糖</text><text>›</text></view>
        <view class="feature" @tap="go('/pages/jk/health/diet')"><text>记录饮食</text><text>›</text></view>
        <view class="feature" @tap="go('/pages/jk/health/exercise')"><text>记录运动</text><text>›</text></view>
        <view class="feature" @tap="go('/pages/jk/health/medicine')"><text>记录用药</text><text>›</text></view>
        <view class="feature" @tap="go('/pages/jk/health/trend')"><text>查看血糖趋势</text><text>›</text></view>
      </view>

      <view class="card explain-card">
        <text class="card-title">授权说明</text>
        <text>授权仅用于将三诺 CGM 设备数据同步到您的当前健康档案。您可在三诺爱看 App 或授权页撤销授权。</text>
        <text>授权完成后，数据同步可能有短暂延迟；未完成授权不会产生设备绑定或血糖数据。</text>
      </view>
    </view>
  </view>
</template>

<script>
import { prepareSinocareAuthorization } from '@/api/jk.js';
import sinocareAuthorization from '@/libs/sinocareAuthorization.js';

export default {
  data() { return { authorizing: false }; },
  methods: {
    go(url) { uni.navigateTo({ url }); },
    connectSinocare() {
      if (this.authorizing) return;
      this.authorizing = true;
      sinocareAuthorization.startSinocareAuthorization({
        prepareAuthorization: prepareSinocareAuthorization,
        navigateTo: uni.navigateTo
      }).catch(error => {
        this.$util.Tips({ title: (error && (error.message || error.msg)) || String(error || '') || '暂时无法打开三诺授权页' });
      }).finally(() => {
        this.authorizing = false;
      });
    }
  }
};
</script>

<style scoped>
.device-page{min-height:100vh;background:#f7f9f9}.page-content{padding:22rpx}.status-card{display:flex;flex-direction:column;align-items:center;padding:48rpx 34rpx;border-radius:24rpx;background:linear-gradient(145deg,#eafaf6,#fff);box-shadow:0 10rpx 28rpx rgba(31,111,92,.06);text-align:center}.status-icon{display:flex;align-items:center;justify-content:center;width:108rpx;height:108rpx;border-radius:50%;background:#dff7f0;color:#20b995;font-size:60rpx}.status-title{margin-top:24rpx;color:#25342f;font-size:34rpx;font-weight:700}.status-desc{margin-top:16rpx;color:#788680;font-size:24rpx;line-height:1.7}.connect-button{margin-top:28rpx;padding:16rpx 78rpx;border-radius:999rpx;background:#20b995;color:#fff;font-size:27rpx;font-weight:700}.connect-button.disabled{opacity:.58}.authorization-tip{margin-top:18rpx;color:#8a9692;font-size:21rpx}.card{margin-top:20rpx;padding:26rpx;border-radius:22rpx;background:#fff}.card-title{display:block;margin-bottom:10rpx;color:#26352f;font-size:29rpx;font-weight:700}.feature{display:flex;align-items:center;justify-content:space-between;min-height:82rpx;border-bottom:1rpx solid #edf1f0;color:#45544f;font-size:25rpx}.feature:last-child{border-bottom:0}.feature text:last-child{color:#a1aaa7;font-size:34rpx}.explain-card text:not(.card-title){display:block;margin-top:14rpx;color:#7b8883;font-size:23rpx;line-height:1.75}
</style>
