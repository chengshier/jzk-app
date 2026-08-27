<template>
	<view class="page">
		<!-- <view class="page-nav">
			<navigator open-type="navigateBack" class="back">‹</navigator><text>授权健康数据</text>
			<view class="placeholder"></view>
		</view> -->
		<view class="owner-card">
			<view class="owner-avatar">{{name.slice(0,1)}}</view>
			<view><text class="owner-name">{{name}}</text><text class="owner-sub">仅展示当前有效授权范围</text></view>
		</view>
		<view class="tabs"><text v-for="t in types" :key="t.value" :class="{active:type===t.value}"
				@tap="change(t.value)">{{t.label}}</text></view>
		<view class="content">
			<view v-for="item in list" :key="item.id" class="data-card">
				<view class="data-head"><text>{{item.dataTypeText||item.dataType}}</text><text class="chevron">›</text>
				</view><text class="data-value">{{display(item)}}</text><text
					class="data-time">{{item.measuredAt}}</text>
			</view>
			<view v-if="!list.length" class="empty">
				<view class="empty-icon">≡</view><text class="empty-title">当前授权范围内暂无数据</text>
			</view>
		</view>
	</view>
</template>
<script>
	import {
		getAuthorizedHealthData
	} from '@/api/health.js';
	export default {
		data() {
			return {
				ownerUserId: '',
				name: '用户',
				type: '',
				list: [],
				types: [{
					label: '全部',
					value: ''
				}, {
					label: '血糖',
					value: 'GLUCOSE'
				}, {
					label: '饮食',
					value: 'DIET'
				}, {
					label: '运动',
					value: 'EXERCISE'
				}, {
					label: '用药',
					value: 'MEDICINE'
				}]
			}
		},
		onLoad(o) {
			this.ownerUserId = o.ownerUserId;
			this.name = decodeURIComponent(o.name || '用户');
			this.load()
		},
		methods: {
			rows(r) {
				const d = r && r.data ? r.data : r;
				return (d && d.list) || d || []
			},
			change(v) {
				this.type = v;
				this.load()
			},
			load() {
				getAuthorizedHealthData(this.ownerUserId, {
					dataType: this.type,
					page: 1,
					limit: 100
				}).then(r => this.list = this.rows(r)).catch(() => this.list = [])
			},
			display(i) {
				if (i.numericValue != null) return i.numericValue + ' ' + (i.unit || '');
				try {
					const d = JSON.parse(i.detail || '{}');
					return d.content || d.category || '已记录'
				} catch (e) {
					return '已记录'
				}
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

	.owner-card {
		display: flex;
		align-items: center;
		margin: 24rpx 32rpx;
		padding: 28rpx 32rpx;
		border-radius: 32rpx;
		background: #fff;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .035)
	}

	.owner-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 72rpx;
		height: 72rpx;
		margin-right: 18rpx;
		border-radius: 50%;
		background: #ecfdf5;
		color: #00b386;
		font-size: 28rpx;
		font-weight: 700
	}

	.owner-name,
	.owner-sub {
		display: block
	}

	.owner-name {
		font-size: 28rpx;
		font-weight: 600
	}

	.owner-sub {
		margin-top: 7rpx;
		color: #9ca3af;
		font-size: 21rpx
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

	.data-card {
		margin-bottom: 20rpx;
		padding: 30rpx 32rpx;
		border-radius: 32rpx;
		background: #fff;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .035)
	}

	.data-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: #6b7280;
		font-size: 23rpx
	}

	.chevron {
		color: #d1d5db;
		font-size: 32rpx
	}

	.data-value {
		display: block;
		margin-top: 18rpx;
		color: #1f2937;
		font-size: 36rpx;
		font-weight: 600
	}

	.data-time {
		display: block;
		margin-top: 20rpx;
		padding-top: 18rpx;
		border-top: 1rpx solid #f3f4f6;
		color: #9ca3af;
		font-size: 21rpx
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
		font-size: 44rpx
	}

	.empty-title {
		margin-top: 24rpx;
		color: #6b7280;
		font-size: 24rpx
	}
</style>