<template>
	<view class="page">
	<!-- 	<view class="page-nav">
			<navigator open-type="navigateBack" class="back">‹</navigator><text>健康记录</text>
			<view class="placeholder"></view>
		</view> -->
		<view class="tabs"><text v-for="t in types" :key="t.value" :class="{active:type===t.value}"
				@tap="change(t.value)">{{t.label}}</text></view>
		<view class="content">
			<view v-for="item in list" :key="item.id" class="record-card">
				<view class="record-head">
					<view class="record-type">
						<view class="type-dot"></view><b>{{item.dataTypeText||item.dataType}}</b>
					</view><text v-if="item.riskLevelText"
						:class="['risk',{danger:item.riskLevel==='HIGH'}]">{{item.riskLevelText}}</text>
				</view><text class="record-value">{{display(item)}}</text><text class="record-time">{{item.measuredAt}}
					{{item.periodCode||''}}</text>
			</view>
			<view v-if="!list.length" class="empty">
				<view class="empty-icon">▱</view><text class="empty-title">暂无记录</text><text
					class="empty-sub">添加记录后将在这里查看</text>
			</view>
		</view>
	</view>
</template>
<script>
	import {
		getHealthDataList
	} from '@/api/health.js';
	export default {
		data() {
			return {
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
		onShow() {
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
				getHealthDataList({
					dataType: this.type,
					page: 1,
					limit: 100
				}).then(r => this.list = this.rows(r)).catch(() => this.list = [])
			},
			display(i) {
				if (i.numericValue != null) return i.numericValue + ' ' + (i.unit || '');
				try {
					const d = JSON.parse(i.detail || '{}');
					return d.content || d.category || d.remark || '已记录'
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

	.record-card {
		margin-bottom: 20rpx;
		padding: 30rpx 32rpx;
		border-radius: 32rpx;
		background: #fff;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .035)
	}

	.record-head,
	.record-type {
		display: flex;
		align-items: center
	}

	.record-head {
		justify-content: space-between
	}

	.record-type {
		gap: 12rpx
	}

	.type-dot {
		width: 14rpx;
		height: 14rpx;
		border-radius: 50%;
		background: #00b386
	}

	.record-type b {
		font-size: 26rpx
	}

	.risk {
		padding: 5rpx 12rpx;
		border-radius: 8rpx;
		background: #fff6e5;
		color: #c9870b;
		font-size: 20rpx
	}

	.risk.danger {
		background: #fff1f0;
		color: #e4544d
	}

	.record-value {
		display: block;
		margin-top: 22rpx;
		font-size: 36rpx;
		font-weight: 600
	}

	.record-time {
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