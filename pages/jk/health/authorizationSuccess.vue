<template>
  <view class="auth-success-page">
    <view class="page-nav">
      <view class="page-nav__left" @tap="back"><text class="back-icon">‹</text></view>
      <text class="page-nav__title">授权结果</text>
      <view class="page-nav__capsule">
        <text class="capsule-dots">•••</text>
        <view class="capsule-line"></view>
        <text class="capsule-circle">◉</text>
      </view>
    </view>

    <view class="content">
      <view class="success-card">
        <view class="success-icon">
          <view class="check check-left"></view>
          <view class="check check-right"></view>
        </view>

        <text class="success-title">{{ titleText }}</text>
        <text class="success-subtitle">{{ subtitleText }}</text>
        <text class="success-desc">系统将自动同步后续设备监测信息和血糖数据</text>

        <view class="status-panel">
          <view class="status-row">
            <text class="status-label">授权状态</text>
            <view class="status-value" :class="statusClass">
              <text class="status-dot"></text>
              <text>{{ statusText }}</text>
            </view>
          </view>
          <view class="status-divider"></view>
          <view class="status-row status-row--next">
            <text class="status-label">下一步</text>
            <text class="status-next">等待设备监测信息</text>
          </view>
        </view>

        <view class="notice-box">
          <view class="notice-icon">i</view>
          <text class="notice-text">收到设备监测信息后，设备编号、监测状态和同步时间将在设备页面自动展示。</text>
        </view>

        <view class="primary-button" @tap="goHealth">返回健康中心</view>
        <view class="secondary-button" @tap="goDevice">查看设备状态</view>
      </view>

      <view v-if="authState==='PENDING' || authState==='ERROR'" class="confirm-banner" :class="authState==='ERROR' ? 'confirm-banner--error' : ''">
        <text class="confirm-text">{{ authState==='ERROR' ? '无法获取授权状态，请稍后重试' : '正在确认授权结果，请稍候…（' + retryCount + '/6）' }}</text>
        <text v-if="authState==='ERROR'" class="retry-link" @tap="checkAuth">点击重试</text>
      </view>

      <text class="bottom-tip">无需再次授权，请耐心等待三诺设备数据同步</text>
    </view>
  </view>
</template>

<script>
import { getHealthDeviceStatus } from '@/api/health.js';
export default {
  data() {
    return {
      authState: 'LOADING', // LOADING | AUTHORIZED | PENDING | ERROR
      query: {},
      retryCount: 0,
      checking: false
    };
  },
  computed: {
    titleText() {
      if (this.authState === 'AUTHORIZED') return '授权成功';
      if (this.authState === 'ERROR') return '状态获取失败';
      return '授权确认中';
    },
    subtitleText() {
      if (this.authState === 'AUTHORIZED') return '三诺账号授权已完成';
      if (this.authState === 'ERROR') return '暂时无法读取授权状态';
      return '正在确认授权结果，请稍候';
    },
    statusText() {
      if (this.authState === 'AUTHORIZED') return '已授权';
      if (this.authState === 'ERROR') return '获取失败';
      return '确认中';
    },
    statusClass() {
      if (this.authState === 'AUTHORIZED') return 'status-value--success';
      if (this.authState === 'ERROR') return 'status-value--error';
      return 'status-value--pending';
    }
  },
  onLoad(query) {
    // 三诺重定向可能携带的参数（对接文档未明确列出，仅做兜底记录，真实授权状态以后端为准）
    this.query = query || {};
    // 若当前运行在 web-view 内（小程序 / App），先尝试拉起原生成功页，体验更顺
    this.tryLaunchNative();
    this.checkAuth();
  },
  methods: {
    // 当前页面通过三诺重定向的 redirect-url 落在 web-view 内的 H5 实例。
    // 目标平台是小程序 / App，需要把它"拉起"成原生页，否则按钮只会切换 web-view 实例、无法退出。
    tryLaunchNative() {
      const q = this.query || {};
      // 已经从 web-view 拉起过的原生页（query 带 native=1），不再二次跳转，避免死循环
      if (q.native === '1') return;
      const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
      const target = '/pages/jk/health/authorizationSuccess?native=1';
      // 微信小程序 web-view：直接用 wx.miniProgram 拉起原生页
      if (typeof wx !== 'undefined' && wx.miniProgram) {
        wx.miniProgram.redirectTo({ url: target });
        return;
      }
      // App web-view：通过 uni.postMessage 通知原生容器拉起原生页
      if (typeof plus !== 'undefined' || /Html5Plus/i.test(ua)) {
        if (typeof uni !== 'undefined' && uni.postMessage) {
          uni.postMessage({ data: { action: 'launchNative', page: target } });
        }
        return;
      }
      // 普通 H5（非 web-view）：无原生容器，原地展示即可
    },
    checkAuth() {
      if (this.checking) return;
      this.checking = true;
      if (this.authState !== 'PENDING') this.authState = 'LOADING';
      getHealthDeviceStatus()
        .then(r => {
          const data = r && r.data !== undefined ? r.data : (r || {});
          if (data.authorized === true) {
            this.authState = 'AUTHORIZED';
          } else if (this.retryCount < 6) {
            this.retryCount++;
            this.authState = 'PENDING';
            setTimeout(() => this.checkAuth(), 1500);
          } else {
            this.authState = 'PENDING';
          }
        })
        .catch(() => {
          this.authState = 'ERROR';
        })
        .finally(() => {
          this.checking = false;
        });
    },
    back() {
      const pages = getCurrentPages();
      if (pages && pages.length > 1) {
        uni.navigateBack();
        return;
      }
      this.goHealth();
    },
    goHealth() {
      uni.switchTab({ url: '/pages/health/index' });
    },
    goDevice() {
      uni.redirectTo({ url: '/pages/jk/health/device' });
    }
  }
};
</script>

<style lang="scss" scoped>
.auth-success-page {
  min-height: 100vh;
  background: #f5f7f8;
  color: #1f2937;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.page-nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  padding: 0 32rpx;
  background: #fff;
}

.page-nav__left {
  position: absolute;
  left: 24rpx;
  top: 0;
  display: flex;
  align-items: center;
  height: 96rpx;
  padding: 0 12rpx;
}

.back-icon {
  color: #1f2937;
  font-size: 48rpx;
  font-weight: 300;
  line-height: 96rpx;
}

.page-nav__title {
  font-size: 34rpx;
  font-weight: 600;
}

.page-nav__capsule {
  position: absolute;
  right: 24rpx;
  display: flex;
  align-items: center;
  height: 52rpx;
  padding: 0 16rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 999rpx;
  background: #fff;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, .03);
  color: #4b5563;
}

.capsule-dots {
  font-size: 24rpx;
  letter-spacing: 1rpx;
  transform: translateY(-4rpx);
}

.capsule-line {
  width: 1rpx;
  height: 24rpx;
  margin: 0 12rpx;
  background: #d1d5db;
}

.capsule-circle {
  font-size: 21rpx;
}

.content {
  padding: 32rpx 32rpx 48rpx;
}

.success-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 72rpx 40rpx 44rpx;
  border-radius: 32rpx;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .04);
}

.success-icon {
  position: relative;
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  background: #e8fbf4;
}

.success-icon::after {
  position: absolute;
  left: 20rpx;
  top: 20rpx;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #00b386;
  content: '';
}

.check {
  position: absolute;
  z-index: 2;
  height: 7rpx;
  border-radius: 999rpx;
  background: #fff;
  transform-origin: left center;
}

.check-left {
  left: 43rpx;
  top: 68rpx;
  width: 28rpx;
  transform: rotate(45deg);
}

.check-right {
  left: 61rpx;
  top: 82rpx;
  width: 48rpx;
  transform: rotate(-48deg);
}

.success-title {
  margin-top: 36rpx;
  color: #1f2937;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.35;
}

.success-subtitle {
  margin-top: 14rpx;
  color: #4b5563;
  font-size: 27rpx;
  font-weight: 500;
}

.success-desc {
  margin-top: 12rpx;
  color: #9ca3af;
  font-size: 22rpx;
  line-height: 1.65;
  text-align: center;
}

.status-panel {
  width: 100%;
  margin-top: 48rpx;
  padding: 0 28rpx;
  box-sizing: border-box;
  border-radius: 24rpx;
  background: #f8faf9;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 88rpx;
}

.status-label {
  color: #6b7280;
  font-size: 24rpx;
}

.status-value {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  font-weight: 500;
}

.status-value--success {
  color: #00b386;
}

.status-value--pending {
  color: #d97706;
}

.status-value--error {
  color: #dc2626;
}

.confirm-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 28rpx;
  padding: 22rpx 28rpx;
  box-sizing: border-box;
  border-radius: 20rpx;
  background: #fff7ed;
}

.confirm-banner--error {
  background: #fef2f2;
}

.confirm-text {
  color: #b45309;
  font-size: 23rpx;
  line-height: 1.6;
}

.confirm-banner--error .confirm-text {
  color: #b91c1c;
}

.retry-link {
  margin-left: 16rpx;
  color: #00a77d;
  font-size: 23rpx;
  font-weight: 600;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  margin-right: 10rpx;
  border-radius: 50%;
  background: #00b386;
}

.status-next {
  color: #374151;
  font-size: 24rpx;
  font-weight: 500;
}

.status-divider {
  height: 1rpx;
  background: #edf0ef;
}

.notice-box {
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin-top: 28rpx;
  padding: 24rpx;
  box-sizing: border-box;
  border-radius: 20rpx;
  background: #f2f8f6;
}

.notice-icon {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 30rpx;
  height: 30rpx;
  margin-top: 2rpx;
  margin-right: 14rpx;
  border: 1rpx solid #8dd8c0;
  border-radius: 50%;
  color: #00a77d;
  font-size: 20rpx;
  font-weight: 600;
}

.notice-text {
  flex: 1;
  color: #6b7280;
  font-size: 22rpx;
  line-height: 1.65;
}

.primary-button,
.secondary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 88rpx;
  box-sizing: border-box;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.primary-button {
  margin-top: 44rpx;
  background: #00b386;
  box-shadow: 0 8rpx 14rpx rgba(0, 179, 134, .16);
  color: #fff;
}

.secondary-button {
  margin-top: 20rpx;
  border: 1rpx solid #8bdac2;
  background: #fff;
  color: #00a77d;
}

.bottom-tip {
  display: block;
  margin-top: 28rpx;
  color: #9ca3af;
  font-size: 21rpx;
  line-height: 1.6;
  text-align: center;
}
</style>
