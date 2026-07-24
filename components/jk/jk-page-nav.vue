<template>
  <view class="jk-page-nav" :class="{ 'jk-page-nav--transparent': transparent }">
    <view class="jk-page-nav__safe" :style="{ height: statusBarHeight + 'px' }"></view>
    <view class="jk-page-nav__bar">
      <view class="jk-page-nav__side jk-page-nav__side--left">
        <view v-if="showBack" class="jk-page-nav__back" @tap="goBack">‹</view>
      </view>
      <view class="jk-page-nav__title">{{ title }}</view>
      <view class="jk-page-nav__side jk-page-nav__side--right">
        <slot name="right"></slot>
        <!-- #ifndef MP -->
        <view v-if="showMockCapsule" class="jk-page-nav__capsule">
          <text class="jk-page-nav__dots">•••</text>
          <view class="jk-page-nav__divider"></view>
          <view class="jk-page-nav__ring"><view class="jk-page-nav__ring-dot"></view></view>
        </view>
        <!-- #endif -->
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    title: { type: String, default: '' },
    transparent: { type: Boolean, default: false },
    showBack: { type: Boolean, default: true },
    showMockCapsule: { type: Boolean, default: true }
  },
  data() {
    return { statusBarHeight: uni.getSystemInfoSync().statusBarHeight || 0 };
  },
  methods: {
    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack();
      } else {
        uni.switchTab({ url: '/pages/user/index' });
      }
    }
  }
};
</script>

<style scoped>
.jk-page-nav{position:relative;z-index:30;background:#fff}
.jk-page-nav--transparent{background:transparent}
.jk-page-nav__bar{position:relative;display:flex;align-items:center;justify-content:center;height:92rpx;padding:0 26rpx;box-sizing:border-box}
.jk-page-nav__title{max-width:430rpx;overflow:hidden;color:#121a20;font-size:33rpx;font-weight:700;line-height:1;text-align:center;text-overflow:ellipsis;white-space:nowrap}
.jk-page-nav__side{position:absolute;top:0;display:flex;align-items:center;height:92rpx}
.jk-page-nav__side--left{left:18rpx}.jk-page-nav__side--right{right:18rpx}
.jk-page-nav__back{display:flex;align-items:center;justify-content:center;width:64rpx;height:64rpx;color:#141a1e;font-family:Arial,sans-serif;font-size:62rpx;font-weight:300;line-height:1;transform:translateY(-2rpx)}
.jk-page-nav__capsule{display:flex;align-items:center;justify-content:space-evenly;width:164rpx;height:62rpx;border:1rpx solid rgba(0,0,0,.08);border-radius:34rpx;background:rgba(255,255,255,.88);box-shadow:0 2rpx 12rpx rgba(24,45,40,.04)}
.jk-page-nav__dots{color:#111;font-size:26rpx;font-weight:800;letter-spacing:4rpx;transform:translateY(-5rpx)}
.jk-page-nav__divider{width:1rpx;height:34rpx;background:rgba(0,0,0,.10)}
.jk-page-nav__ring{display:flex;align-items:center;justify-content:center;width:29rpx;height:29rpx;border:5rpx solid #111;border-radius:50%;box-sizing:border-box}
.jk-page-nav__ring-dot{width:7rpx;height:7rpx;border-radius:50%;background:#111}
</style>
