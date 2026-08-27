<template>
	<view class="ui11-page">
		<!-- <view class="ui11-nav">
			<navigator open-type="navigateBack" class="ui11-nav__back">‹</navigator><text
				class="ui11-nav__title">血糖记录</text><text class="ui11-nav__placeholder"></text>
		</view> -->
		<view class="form">
			<view class="ui11-row"><text class="ui11-row__label">血糖值</text><input v-model="form.value"
					class="ui11-input" type="digit" placeholder="请输入血糖值" /><text>mmol/L</text></view>
			<view class="ui11-row"><text class="ui11-row__label">检测时段</text>
				<picker :range="periods" @change="form.period=periods[$event.detail.value]"><text
						class="ui11-row__value">{{form.period}}　›</text></picker>
			</view>
			<view class="ui11-row"><text class="ui11-row__label">检测时间</text><input v-model="form.measuredAt"
					class="ui11-input" placeholder="2026-06-05 16:03" /></view>
			<view class="ui11-row"><text class="ui11-row__label">备注</text><input v-model="form.remark"
					class="ui11-input" placeholder="添加备注（选填）" /></view>
		</view>
		<view class="record-tip">手工录入的数据会与设备同步数据一起显示在健康记录中。</view>
		<view class="ui11-fixed-action">
			<view class="ui11-primary-btn" @click="submit">{{loading?'保存中…':'保存'}}</view>
		</view>
	</view>
</template>
<script>
	import {
		saveGlucose
	} from '@/api/health.js';
	export default {
		data() {
			return {
				loading: false,
				periods: ['早餐前', '午餐前', '晚餐前', '睡前'],
				form: {
					value: '',
					period: '晚餐前',
					measuredAt: '',
					remark: ''
				}
			}
		},
		methods: {
			submit() {
				if (!this.form.value) return uni.showToast({
					title: '请填写血糖值',
					icon: 'none'
				});
				this.loading = true;
				saveGlucose(this.form).then(() => uni.showToast({
					title: '保存成功',
					icon: 'success'
				})).catch(() => uni.showToast({
					title: '健康服务暂未接入',
					icon: 'none'
				})).finally(() => this.loading = false)
			}
		}
	}
</script>
<style lang="scss" scoped>
	.ui11-page {
		min-height: 100vh;
		padding-bottom: 150rpx;
		background: #f7f8fa;
		color: #1f2937;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
	}

	.ui11-nav {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 88rpx;
		background: #fff
	}

	.ui11-nav__back {
		position: absolute;
		left: 20rpx;
		height: 88rpx;
		padding: 0 12rpx;
		color: #1f2937;
		font-size: 48rpx;
		line-height: 88rpx
	}

	.ui11-nav__title {
		font-size: 34rpx;
		font-weight: 600
	}

	.ui11-nav__placeholder {
		display: none
	}

	.form {
		margin: 24rpx 32rpx 0;
		padding: 0 32rpx;
		border-radius: 32rpx;
		background: #fff;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .035)
	}

	.form+.form {
		padding-top: 12rpx;
		padding-bottom: 32rpx
	}

	.ui11-row {
		display: flex;
		align-items: center;
		min-height: 96rpx;
		border-bottom: 1rpx solid #f3f4f6
	}

	.ui11-row:last-child {
		border-bottom: 0
	}

	.ui11-row__label {
		color: #4b5563;
		font-size: 26rpx
	}

	.ui11-input {
		flex: 1;
		margin-left: 28rpx;
		text-align: right;
		color: #1f2937;
		font-size: 25rpx
	}

	.ui11-row>text:last-child {
		margin-left: 8rpx;
		color: #9ca3af;
		font-size: 22rpx
	}

	.ui11-row picker {
		flex: 1;
		text-align: right
	}

	.ui11-row__value {
		color: #374151;
		font-size: 25rpx
	}

	.ui11-section-title {
		padding: 26rpx 0 16rpx;
		color: #1f2937;
		font-size: 27rpx;
		font-weight: 600
	}

	.form textarea {
		width: 100%;
		min-height: 170rpx;
		padding: 22rpx;
		box-sizing: border-box;
		border: 0;
		border-radius: 20rpx;
		background: #f7f8fa;
		color: #1f2937;
		font-size: 24rpx;
		line-height: 1.6
	}

	.record-tip {
		margin: 22rpx 40rpx;
		color: #9ca3af;
		font-size: 21rpx;
		line-height: 1.6
	}

	.ui11-fixed-action {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 18rpx 32rpx calc(18rpx + env(safe-area-inset-bottom));
		border-top: 1rpx solid #f3f4f6;
		background: #fff;
		z-index: 10
	}

	.ui11-primary-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 88rpx;
		border-radius: 999rpx;
		background: #00b386;
		box-shadow: 0 8rpx 20rpx rgba(0, 179, 134, .16);
		color: #fff;
		font-size: 28rpx;
		font-weight: 600
	}
</style>