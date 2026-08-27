<template>
	<view class="page">
		<!-- <view class="page-nav">
			<navigator open-type="navigateBack" class="back">‹</navigator><text>异常提醒</text>
			<view class="placeholder"></view>
		</view> -->
		<view class="tabs"><text v-for="t in tabs" :key="t.v" :class="{active:status===t.v}"
				@tap="status=t.v;load()">{{t.l}}</text></view>
		<view class="content">
			<view v-for="i in list" :key="i.id" class="alert-card">
				<view class="alert-head">
					<view class="alert-title">
						<view class="alert-dot"></view><b>{{i.dataTypeText||i.dataType}}异常提醒</b>
					</view><text :class="['level',{danger:i.alertLevel==='HIGH'}]">{{i.alertLevel}}</text>
				</view><text class="alert-value">记录值：{{i.measuredValue}}</text><text class="alert-time">{{i.createTime}}
					· {{i.statusText||i.status}}</text>
			</view>
			<view v-if="!list.length" class="empty">
				<view class="empty-icon">✓</view><text class="empty-title">暂无异常提醒</text><text
					class="empty-sub">当前没有需要处理的健康提醒</text>
			</view>
		</view>
	</view>
</template>
<script>
	import {
		getHealthAlerts
	} from '@/api/health.js';
	export default {
		data() {
			return {
				status: '',
				list: [],
				tabs: [{
					l: '全部',
					v: ''
				}, {
					l: '待处理',
					v: 'OPEN'
				}, {
					l: '已关注',
					v: 'ACKNOWLEDGED'
				}, {
					l: '已关闭',
					v: 'CLOSED'
				}]
			}
		},
		onShow() {
			this.load()
		},
		methods: {
			load() {
				getHealthAlerts({
					status: this.status,
					page: 1,
					limit: 100
				}).then(r => {
					const d = r && r.data ? r.data : r;
					this.list = (d && d.list) || d || []
				})
			}
		}
	}
</script>
<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		background: #f7f8fa;
		color: #1f2937
	}

	.page-nav {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 88rpx;
		padding: 0 32rpx;
		background: #fff;
		font-size: 34rpx;
		font-weight: 600
	}

	.back {
		position: absolute;
		left: 20rpx;
		height: 88rpx;
		padding: 0 12rpx;
		font-size: 48rpx;
		line-height: 88rpx
	}

	.placeholder {
		display: none
	}

	.tabs {
		display: flex;
		gap: 12rpx;
		padding: 24rpx 32rpx;
		background: #fff;
		overflow: auto
	}

	.tabs text {
		flex: none;
		padding: 12rpx 24rpx;
		border-radius: 999rpx;
		background: #f0f2f5;
		color: #666;
		font-size: 23rpx
	}

	.tabs .active {
		background: #00bfa5;
		color: #fff
	}

	.content {
		padding: 24rpx 32rpx
	}

	.alert-card {
		margin-bottom: 24rpx;
		padding: 32rpx;
		border-radius: 32rpx;
		background: #fff;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .035)
	}

	.alert-head,
	.alert-title {
		display: flex;
		align-items: center
	}

	.alert-head {
		justify-content: space-between
	}

	.alert-title {
		gap: 12rpx
	}

	.alert-title b {
		font-size: 28rpx
	}

	.alert-dot {
		width: 14rpx;
		height: 14rpx;
		border-radius: 50%;
		background: #00b386
	}

	.level {
		padding: 5rpx 12rpx;
		border-radius: 8rpx;
		background: #fff6e5;
		color: #c9870b;
		font-size: 20rpx
	}

	.level.danger {
		background: #fff1f0;
		color: #e4544d
	}

	.alert-value {
		display: block;
		margin-top: 30rpx;
		color: #1f2937;
		font-size: 34rpx;
		font-weight: 600
	}

	.alert-time {
		display: block;
		margin-top: 18rpx;
		color: #9ca3af;
		font-size: 22rpx
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 130rpx 0
	}

	.empty-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 112rpx;
		height: 112rpx;
		border-radius: 32rpx;
		background: #f1f5f4;
		color: #c3ccca;
		font-size: 42rpx
	}

	.empty-title {
		margin-top: 24rpx;
		font-size: 28rpx;
		font-weight: 600
	}

	.empty-sub {
		margin-top: 10rpx;
		color: #9ca3af;
		font-size: 22rpx
	}
</style>