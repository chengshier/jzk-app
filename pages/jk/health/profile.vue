<template>
	<view class="page">
		<!-- <view class="page-nav">
			<navigator open-type="navigateBack" class="back">‹</navigator><text>健康档案</text>
			<view class="placeholder"></view>
		</view> -->
		<view class="content">
			<view class="tip">
				<view class="tip-icon">i</view><text>完善基础信息与个性化目标范围，便于健康数据展示。</text>
			</view>
			<view class="card"><text class="group-title">基础信息</text>
				<view class="row"><text>身高</text>
					<view class="input-wrap"><input v-model="form.heightCm" type="digit"
							placeholder="请输入" /><text>cm</text></view>
				</view>
				<view class="row"><text>体重</text>
					<view class="input-wrap"><input v-model="form.weightKg" type="digit"
							placeholder="请输入" /><text>kg</text></view>
				</view>
				<view class="row"><text>糖尿病类型</text><input v-model="form.diabetesType" placeholder="选填" /></view>
			</view>
			<view class="card"><text class="group-title">目标血糖范围</text>
				<view class="row"><text>目标血糖下限</text><input v-model="form.glucoseTargetMin" type="digit"
						placeholder="选填" /></view>
				<view class="row"><text>目标血糖上限</text><input v-model="form.glucoseTargetMax" type="digit"
						placeholder="选填" /></view>
				<view class="row"><text>健康备注</text><input v-model="form.remark" placeholder="敏感字段将按配置加密" /></view>
			</view><button class="save" @tap="save">保存档案</button>
		</view>
	</view>
</template>
<script>
	import {
		getHealthProfile,
		saveHealthProfile
	} from '@/api/health.js';
	export default {
		data() {
			return {
				form: {}
			}
		},
		onShow() {
			getHealthProfile().then(r => this.form = (r && r.data) || r || {})
		},
		methods: {
			save() {
				saveHealthProfile(this.form).then(() => uni.showToast({
					title: '保存成功'
				}))
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

	.content {
		padding: 24rpx 32rpx 48rpx
	}

	.tip {
		display: flex;
		align-items: flex-start;
		padding: 22rpx 24rpx;
		border-radius: 20rpx;
		background: #eef8f5;
		color: #647c75;
		font-size: 22rpx;
		line-height: 1.6
	}

	.tip-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30rpx;
		height: 30rpx;
		margin-right: 12rpx;
		border: 2rpx solid #7d9f96;
		border-radius: 50%;
		font-size: 17rpx;
		flex: none
	}

	.card {
		margin-top: 20rpx;
		padding: 0 32rpx 8rpx;
		border-radius: 32rpx;
		background: #fff;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .035)
	}

	.group-title {
		display: block;
		padding: 28rpx 0 12rpx;
		font-size: 28rpx;
		font-weight: 600
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 96rpx;
		border-bottom: 1rpx solid #f3f4f6;
		color: #4b5563;
		font-size: 25rpx
	}

	.row:last-child {
		border-bottom: 0
	}

	.row>input,
	.input-wrap {
		flex: 1;
		margin-left: 28rpx;
		text-align: right
	}

	.row>input {
		font-size: 24rpx
	}

	.input-wrap {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		color: #9ca3af
	}

	.input-wrap input {
		width: 180rpx;
		margin-right: 8rpx;
		text-align: right
	}

	.save {
		height: 88rpx;
		margin-top: 28rpx;
		line-height: 88rpx;
		border-radius: 999rpx;
		background: #00b386;
		box-shadow: 0 8rpx 20rpx rgba(0, 179, 134, .16);
		color: #fff;
		font-size: 28rpx
	}
</style>