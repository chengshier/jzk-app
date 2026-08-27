<template>
  <view class="device-page">
    <view class="page-content">
      <view class="status-card">
        <view class="status-icon">⌁</view>
        <text class="status-title">设备接入准备中</text>
        <text class="status-desc">当前尚未接入可用的血糖仪厂商，暂不提供设备序列号绑定、自动拉取或厂商回调同步。</text>
        <view class="status-tag">当前状态：未开放</view>
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
        <text class="card-title">设备接入说明</text>
        <text>系统已保留通用设备接入框架，但只有厂商提供接口文档、测试账号、测试设备、回调协议、字段和签名规则后，才会开放具体设备绑定。</text>
        <text>在正式接入前，页面不会伪造设备状态，也不会显示不存在的同步结果。</text>
      </view>
    </view>
  </view>
</template>

<script>
export default { methods: { go(url) { uni.navigateTo({ url }); } } };
</script>

<style scoped>
.device-page{min-height:100vh;background:#f7f9f9}.page-content{padding:22rpx}.status-card{display:flex;flex-direction:column;align-items:center;padding:48rpx 34rpx;border-radius:24rpx;background:linear-gradient(145deg,#eafaf6,#fff);box-shadow:0 10rpx 28rpx rgba(31,111,92,.06);text-align:center}.status-icon{display:flex;align-items:center;justify-content:center;width:108rpx;height:108rpx;border-radius:50%;background:#dff7f0;color:#20b995;font-size:60rpx}.status-title{margin-top:24rpx;color:#25342f;font-size:34rpx;font-weight:700}.status-desc{margin-top:16rpx;color:#788680;font-size:24rpx;line-height:1.7}.status-tag{margin-top:24rpx;padding:10rpx 22rpx;border-radius:999rpx;background:#f1f3f3;color:#7e8985;font-size:22rpx}.card{margin-top:20rpx;padding:26rpx;border-radius:22rpx;background:#fff}.card-title{display:block;margin-bottom:10rpx;color:#26352f;font-size:29rpx;font-weight:700}.feature{display:flex;align-items:center;justify-content:space-between;min-height:82rpx;border-bottom:1rpx solid #edf1f0;color:#45544f;font-size:25rpx}.feature:last-child{border-bottom:0}.feature text:last-child{color:#a1aaa7;font-size:34rpx}.explain-card text:not(.card-title){display:block;margin-top:14rpx;color:#7b8883;font-size:23rpx;line-height:1.75}
</style>
