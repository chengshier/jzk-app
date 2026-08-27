<template>
	<view class="device-page">
		<!-- <view class="sub-nav">
    <navigator open-type="navigateBack" class="sub-nav__back">‹</navigator>
    <text class="sub-nav__title">设备与授权</text>
    <view class="sub-nav__capsule"><text class="capsule-dots">•••</text><view class="capsule-line"></view><text class="capsule-circle">◉</text></view>
  </view> -->
		<view class="page-content">
			<view v-if="error" class="state-error"><text>{{error}}</text><text class="retry" @tap="load">重新加载</text>
			</view>

			<!-- 未授权：严格按“设备与授权 - 引导页”的层级与视觉 -->
			<block v-if="deviceState==='UNAUTHORIZED'">
				<view class="guide-card">
					<view class="guide-logo">SINOCARE</view>
					<text class="guide-title">连接三诺 CGM</text>
					<text class="guide-copy">完成三诺账号授权后，可同步持续血糖数据</text>
					<view class="guide-button" :class="{disabled:authorizing}" @tap="connectSinocare">
						{{authorizing?'正在打开授权页…':'前往三诺授权页'}}</view>
					<text class="guide-tip">授权完成后，设备监测信息将在收到数据后自动展示</text>
				</view>
				<view class="menu-card">
					<view class="menu-row" @tap="go('/pages/jk/health/authorization')"><text>授权管理</text><text
							class="arrow">›</text></view>
					<view class="menu-row" @tap="go('/pages/jk/health/trend')"><text>查看血糖趋势</text><text
							class="arrow">›</text></view>
				</view>
				<view class="guide-notice">
					<text class="notice-title">温馨提示</text>
					<text class="notice-copy">这里不是蓝牙配对或添加设备入口。\n授权与撤销操作均通过三诺授权页面完成。</text>
				</view>
			</block>

			<!-- 已授权、尚未收到设备监测信息 -->
			<block v-else-if="deviceState==='WAITING'">
				<view class="waiting-card">
					<view class="waiting-head">
						<view class="waiting-brand">
							<view class="brand-logo">SINOCARE</view><text>三诺服务</text>
						</view>
						<text class="auth-pill">已授权</text>
					</view>
					<view class="waiting-body">
						<text class="waiting-title">已完成三诺授权</text>
						<text class="waiting-sub">暂未收到设备监测信息</text>
						<text class="waiting-note">收到设备监测信息后将在此展示设备状态</text>
					</view>
				</view>
				<view class="menu-card">
					<view class="menu-row" @tap="go('/pages/jk/health/authorization')"><text>授权管理</text><text
							class="arrow">›</text></view>
					<view class="menu-row" @tap="go('/pages/jk/health/trend')"><text>查看血糖趋势</text><text
							class="arrow">›</text></view>
					<view class="menu-row" @tap="manageAuthorization"><text>前往三诺授权页管理 / 撤销授权</text><text
							class="arrow">›</text></view>
				</view>
				<view class="waiting-explain">
					<text class="explain-title">说明</text>
					<text class="explain-copy">授权状态与监测状态分开处理。尚未收到设备监测信息时，不展示“监测中 / 已停止”，也不展示设备编号与监测时间。</text>
				</view>
			</block>

			<!-- 已授权且有设备信息 -->
			<block v-else>
				<view class="device-card">
					<view class="device-head">
						<view class="device-logo">SINOCARE</view>
						<view class="device-title-wrap"><text
								class="device-name">{{device.productName||'三诺 CGM'}}</text><text
								class="device-no">设备编号：{{mask(device.deviceSn||'--')}}</text></view>
					</view>
					<view class="info-list">
						<view class="info-row"><text>授权状态</text><text class="status-pill status-auth">已授权</text></view>
						<view class="info-row"><text>监测状态</text><text class="status-pill"
								:class="isMonitoring?'status-sync':'status-stop'">{{isMonitoring?'监测中':'已停止'}}</text>
						</view>
						<view class="info-row"><text>开始监测时间</text><text
								class="info-value">{{time(device.detectionStartTime)}}</text></view>
						<view class="info-row"><text>结束监测时间</text><text
								class="info-value">{{time(device.detectionEndTime)}}</text></view>
						<view class="info-row"><text>最近同步数据时间</text><text
								class="info-value">{{time(device.lastDataAt)}}</text></view>
					</view>
				</view>
				<view class="menu-card">
					<view class="menu-row" @tap="go('/pages/jk/health/authorization')"><text>授权管理</text><text
							class="arrow">›</text></view>
					<view class="menu-row" @tap="go('/pages/jk/health/trend')"><text>查看血糖趋势</text><text
							class="arrow">›</text></view>
					<view class="menu-row" @tap="manageAuthorization"><text>前往三诺授权页管理 / 撤销授权</text><text
							class="arrow external">↗</text></view>
				</view>
				<view class="tips-card"><text class="tips-title">温馨提示</text><text
						class="tips-copy">设备数据由三诺服务同步提供。\n如需管理或撤销授权，请前往三诺官方授权页操作。</text></view>
			</block>
		</view>
	</view>
</template>
<script>
	import JkPageNav from '@/components/jk/jk-page-nav.vue';
	import {
		prepareSinocareAuthorization
	} from '@/api/jk.js';
	import {
		getHealthDeviceStatus
	} from '@/api/health.js';
	import sinocareAuthorization from '@/libs/sinocareAuthorization.js';
	export default {
		components: {
			JkPageNav
		},
		data() {
			return {
				authorizing: false,
				device: {},
				error: ''
			}
		},
		computed: {
			deviceState() {
				if (this.device.authorized && this.device.hasGlucoseData) return 'SYNCED';
				if (this.device.authorized) return 'WAITING';
				return 'UNAUTHORIZED'
			},
			isMonitoring() {
				if (!this.device.hasGlucoseData) return false
				const lastDataAt = this.timeMs(this.device.lastDataAt)
				const detectionEndTime = this.timeMs(this.device.detectionEndTime)
				return !detectionEndTime || detectionEndTime > Date.now() || (lastDataAt && lastDataAt > detectionEndTime)
			}
		},
		onShow() {
			this.load()
		},
		methods: {
			timeMs(value) {
				if (!value) return 0
				if (typeof value === 'number') return value < 100000000000 ? value * 1000 : value
				return new Date(String(value).replace(/-/g, '/')).getTime() || 0
			},
			load() {
				this.error = '';
				getHealthDeviceStatus().then(r => this.device = r && r.data !== undefined ? r.data : (r || {})).catch(() =>
					this.error = '加载失败，请检查网络后重新加载')
			},
			go(url) {
				uni.navigateTo({
					url
				})
			},
			mask(v) {
				v = String(v);
				return v.length > 4 ? '****' + v.slice(-4) : v
			},
			time(v) {
				return v ? String(v).replace('T', ' ').slice(0, 16) : '--'
			},
			manageAuthorization() {
				this.connectSinocare()
			},
			connectSinocare() {
				if (this.authorizing) return;
				this.authorizing = true;
				sinocareAuthorization.startSinocareAuthorization({
					prepareAuthorization: prepareSinocareAuthorization,
					navigateTo: uni.navigateTo
				}).catch(e => this.$util.Tips({
					title: (e && (e.message || e.msg)) || '暂时无法打开三诺授权页'
				})).finally(() => this.authorizing = false)
			}
		}
	};
</script>
<style lang="scss" scoped>
	.device-page {
		min-height: 100vh;
		background: #f5f7f8;
		color: #1f2937;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
	}

	.sub-nav {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 96rpx;
		padding: 0 32rpx;
		background: #fff
	}

	.sub-nav__back {
		position: absolute;
		left: 24rpx;
		top: 0;
		display: flex;
		align-items: center;
		height: 96rpx;
		padding: 0 12rpx;
		color: #1f2937;
		font-size: 48rpx;
		line-height: 96rpx
	}

	.sub-nav__title {
		font-size: 34rpx;
		font-weight: 600
	}

	.sub-nav__capsule {
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
		color: #4b5563
	}

	.capsule-dots {
		font-size: 24rpx;
		letter-spacing: 1rpx;
		transform: translateY(-4rpx)
	}

	.capsule-line {
		width: 1rpx;
		height: 24rpx;
		margin: 0 12rpx;
		background: #d1d5db
	}

	.capsule-circle {
		font-size: 21rpx
	}

	.page-content {
		padding: 32rpx
	}

	.state-error {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
		padding: 20rpx 24rpx;
		border-radius: 18rpx;
		background: #fff4f2;
		color: #b94d45;
		font-size: 24rpx
	}

	.retry {
		color: #00b386;
		font-weight: 600
	}

	.guide-card,
	.waiting-card,
	.device-card,
	.menu-card,
	.tips-card {
		background: #fff;
		border-radius: 32rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .04)
	}

	.guide-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 64rpx 48rpx 54rpx;
		text-align: center
	}

	.guide-logo {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 144rpx;
		height: 144rpx;
		border: 1rpx solid #e5e7eb;
		border-radius: 50%;
		background: #f9fafb;
		color: #9ca3af;
		font-size: 20rpx;
		font-weight: 600;
		letter-spacing: 1rpx
	}

	.guide-title {
		margin-top: 48rpx;
		color: #1f2937;
		font-size: 40rpx;
		font-weight: 700
	}

	.guide-copy {
		margin-top: 16rpx;
		color: #6b7280;
		font-size: 24rpx;
		line-height: 1.6
	}

	.guide-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 88rpx;
		margin-top: 56rpx;
		border-radius: 999rpx;
		background: #10b981;
		box-shadow: 0 8rpx 14rpx rgba(16, 185, 129, .18);
		color: #fff;
		font-size: 30rpx;
		font-weight: 500
	}

	.guide-button.disabled {
		opacity: .55
	}

	.guide-tip {
		margin-top: 20rpx;
		color: #9ca3af;
		font-size: 20rpx
	}

	.menu-card {
		margin-top: 32rpx;
		overflow: hidden
	}

	.menu-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 94rpx;
		padding: 0 40rpx;
		border-bottom: 1rpx solid #f3f4f6;
		color: #374151;
		font-size: 28rpx
	}

	.menu-row:last-child {
		border-bottom: 0
	}

	.arrow {
		color: #d1d5db;
		font-size: 34rpx;
		font-weight: 300
	}

	.external {
		font-size: 25rpx
	}

	.guide-notice {
		margin-top: 44rpx;
		padding: 40rpx;
		border: 1rpx solid #e9f8f2;
		border-radius: 32rpx;
		background: #f0f7f4
	}

	.notice-title,
	.notice-copy {
		display: block
	}

	.notice-title {
		color: #1f2937;
		font-size: 28rpx;
		font-weight: 700
	}

	.notice-copy {
		margin-top: 14rpx;
		color: #6b7280;
		font-size: 24rpx;
		line-height: 1.75
	}

	.waiting-card {
		padding: 32rpx;
		min-height: 400rpx
	}

	.waiting-head {
		display: flex;
		align-items: center;
		justify-content: space-between
	}

	.waiting-brand {
		display: flex;
		align-items: center;
		gap: 20rpx;
		color: #1c2433;
		font-size: 32rpx;
		font-weight: 600
	}

	.brand-logo {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 84rpx;
		height: 84rpx;
		border: 1rpx solid #f0f2f1;
		border-radius: 50%;
		color: #9ca3af;
		font-size: 15rpx
	}

	.auth-pill {
		padding: 6rpx 16rpx;
		border-radius: 999rpx;
		background: #e5fcf4;
		color: #00c885;
		font-size: 22rpx;
		font-weight: 500
	}

	.waiting-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 54rpx 12rpx 10rpx;
		text-align: center
	}

	.waiting-title {
		color: #1c2433;
		font-size: 34rpx;
		font-weight: 600
	}

	.waiting-sub {
		margin-top: 12rpx;
		color: #6b7280;
		font-size: 28rpx;
		font-weight: 500
	}

	.waiting-note {
		margin-top: 12rpx;
		color: #9ca3af;
		font-size: 22rpx
	}

	.waiting-explain {
		padding: 28rpx 4rpx 0
	}

	.explain-title,
	.explain-copy {
		display: block
	}

	.explain-title {
		color: #1c2433;
		font-size: 26rpx;
		font-weight: 600
	}

	.explain-copy {
		margin-top: 14rpx;
		color: #9ca3af;
		font-size: 23rpx;
		line-height: 1.7
	}

	.device-card {
		padding: 40rpx
	}

	.device-head {
		display: flex;
		align-items: center;
		margin-bottom: 32rpx
	}

	.device-logo {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 128rpx;
		height: 128rpx;
		margin-right: 32rpx;
		border: 1rpx solid #e5e7eb;
		border-radius: 50%;
		background: #f9fafb;
		color: #9ca3af;
		font-size: 18rpx;
		font-weight: 600
	}

	.device-title-wrap {
		min-width: 0
	}

	.device-name,
	.device-no {
		display: block
	}

	.device-name {
		color: #1f2937;
		font-size: 40rpx;
		font-weight: 600
	}

	.device-no {
		margin-top: 8rpx;
		color: #6b7280;
		font-size: 24rpx
	}

	.info-list {
		display: flex;
		flex-direction: column
	}

	.info-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 82rpx;
		color: #6b7280;
		font-size: 26rpx
	}

	.info-value {
		color: #1f2937;
		text-align: right
	}

	.status-pill {
		padding: 6rpx 12rpx;
		border-radius: 8rpx;
		font-size: 22rpx
	}

	.status-auth {
		background: #ecfdf5;
		color: #10b981
	}

	.status-sync {
		background: #eff6ff;
		color: #3b82f6
	}

	.status-stop {
		background: #f3f4f6;
		color: #6b7280
	}

	.tips-card {
		position: relative;
		margin-top: 32rpx;
		padding: 40rpx;
		overflow: hidden
	}

	.tips-title,
	.tips-copy {
		display: block
	}

	.tips-title {
		color: #1f2937;
		font-size: 28rpx;
		font-weight: 500
	}

	.tips-copy {
		margin-top: 18rpx;
		color: #6b7280;
		font-size: 24rpx;
		line-height: 1.7
	}
</style>
