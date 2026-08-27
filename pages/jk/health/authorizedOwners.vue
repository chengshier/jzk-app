<template>
	<view class="page">
		<!-- <view class="page-nav">
			<navigator open-type="navigateBack" class="back">‹</navigator><text>用户授权</text>
			<view class="placeholder"></view>
		</view> -->
		<view class="content">
			<view class="notice">
				<view class="notice-icon">i</view><text>仅展示用户主动授权给你的范围；用户撤销后会立即失效。</text>
			</view>
			<navigator v-for="item in list" :key="item.authorizationId"
				:url="'/pages/jk/health/authorizedData?ownerUserId='+item.ownerUserId+'&name='+encodeURIComponent(item.ownerName||'用户')"
				class="owner-row">
				<view class="owner-left">
					<view class="avatar">{{(item.ownerName||'用').slice(0,1)}}</view>
					<view><b>{{item.ownerName||'用户'}}</b><text class="phone">{{item.ownerPhoneMasked}}</text></view>
				</view>
				<view class="owner-right"><text class="scope">{{item.scopeCodes}}</text><text class="view-link">查看
						›</text></view>
			</navigator>
			<view v-if="!list.length" class="empty">
				<view class="empty-icon">人</view><text>暂无用户授权</text>
			</view>
		</view>
	</view>
</template>
<script>
	import {
		getAuthorizedHealthOwners
	} from '@/api/health.js';
	export default {
		data() {
			return {
				list: []
			}
		},
		onShow() {
			getAuthorizedHealthOwners().then(r => this.list = (r && r.data) || r || []).catch(() => this.list = [])
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
		padding: 24rpx 32rpx
	}

	.notice {
		display: flex;
		align-items: flex-start;
		padding: 24rpx;
		border-radius: 20rpx;
		background: #fff8e8;
		color: #8a651b;
		font-size: 22rpx;
		line-height: 1.6
	}

	.notice-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30rpx;
		height: 30rpx;
		margin-right: 12rpx;
		border: 2rpx solid #a98435;
		border-radius: 50%;
		font-size: 18rpx;
		flex: none
	}

	.owner-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 20rpx;
		padding: 30rpx 32rpx;
		border-radius: 32rpx;
		background: #fff;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .035)
	}

	.owner-left {
		display: flex;
		align-items: center;
		min-width: 0
	}

	.avatar {
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

	.owner-left b,
	.phone,
	.scope,
	.view-link {
		display: block
	}

	.owner-left b {
		font-size: 27rpx
	}

	.phone {
		margin-top: 7rpx;
		color: #9ca3af;
		font-size: 21rpx
	}

	.owner-right {
		max-width: 300rpx;
		text-align: right
	}

	.scope {
		color: #9ca3af;
		font-size: 20rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis
	}

	.view-link {
		margin-top: 9rpx;
		color: #00a870;
		font-size: 22rpx
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 130rpx 0;
		color: #8b9491;
		font-size: 24rpx
	}

	.empty-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 112rpx;
		height: 112rpx;
		margin-bottom: 24rpx;
		border-radius: 32rpx;
		background: #f1f5f4;
		color: #c3ccca;
		font-size: 36rpx
	}
</style>