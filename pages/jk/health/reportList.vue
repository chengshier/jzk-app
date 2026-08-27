<template>
	<view class="report-list-page">
		<view class="page-nav">
			<view class="page-nav__back" @tap="back">‹</view>
			<text class="page-nav__title">健康报告</text>
		</view>
		<view class="tabs">
			<view class="tab" :class="{active: active==='DIGITAL'}" @tap="switchTab('DIGITAL')">数字报告</view>
			<view class="tab" :class="{active: active==='PDF'}" @tap="switchTab('PDF')">文件报告</view>
		</view>
		<view class="list-wrap">
			<scroll-view scroll-y class="scroll" @scrolltolower="loadMore">
				<view v-if="loading && list.length===0" class="loading">加载中...</view>
				<view v-if="error" class="state-error"><text>{{error}}</text><text @tap="reload">重新加载</text></view>
				<template v-if="!loading || list.length">
					<view v-for="item in list" :key="item.id" class="report-item" @tap="open(item)">
						<view class="item-head">
							<text class="item-title">{{itemTitle(item)}}</text>
							<text class="item-tag" :class="'tag--'+active">{{active==='DIGITAL'?'数字报告':'文件报告'}}</text>
						</view>
						<text class="item-period">{{itemPeriod(item)}}</text>
						<view class="item-foot">
							<text class="item-time">生成时间：{{formatDate(item.createTime)}}</text>
							<text v-if="active==='PDF' && item.fileSize" class="item-size">{{formatSize(item.fileSize)}}</text>
						</view>
					</view>
				</template>
				<view v-if="!loading && list.length===0" class="empty">
					<text>暂无{{active==='DIGITAL'?'数字':'文件'}}报告</text>
					<text class="empty-sub">三诺数据同步后将自动展示</text>
				</view>
				<view v-if="finished && list.length" class="no-more">没有更多了</view>
			</scroll-view>
		</view>
	</view>
</template>
<script>
	import { getSinocareHealthReportList } from '@/api/health.js';

	function pick(res, fallback) {
		return res && res.data !== undefined ? res.data : (res || fallback);
	}

	export default {
		data() {
			return {
				active: 'DIGITAL',
				list: [],
				page: 1,
				limit: 10,
				loading: false,
				finished: false,
				error: ''
			}
		},
		onLoad() {
			this.reload();
		},
		methods: {
			switchTab(type) {
				if (this.active === type || this.loading) return;
				this.active = type;
				this.reload();
			},
			reload() {
				this.page = 1;
				this.list = [];
				this.finished = false;
				this.error = '';
				this.load();
			},
			load() {
				if (this.loading || this.finished) return;
				this.loading = true;
				getSinocareHealthReportList({
					reportType: this.active,
					page: this.page,
					limit: this.limit
				}).then(res => {
					const data = pick(res, []);
					const arr = Array.isArray(data) ? data : (data.list || data.records || []);
					this.list = this.page === 1 ? arr : this.list.concat(arr);
					if (arr.length < this.limit) this.finished = true;
					else this.page += 1;
				}).catch(() => this.error = '加载失败，请检查网络').finally(() => this.loading = false);
			},
			loadMore() {
				this.load();
			},
			itemTitle(item) {
				if (this.active === 'PDF') return item.fileName || '三诺健康管理评估报告.pdf';
				const period = item.periodText || '';
				if (period) return '血糖阶段报告';
				return '三诺数字报告';
			},
			itemPeriod(item) {
				if (this.active === 'PDF') {
					const name = item.fileName || '';
					const m = name.match(/(\d{4}-\d{2}-\d{2})至(\d{4}-\d{2}-\d{2})/);
					if (m) return `${m[1]} 至 ${m[2]}`;
					return '';
				}
				return item.periodText || '';
			},
			formatDate(x) {
				return String(x || '--').slice(0, 16).replace('T', ' ');
			},
			formatSize(bytes) {
				const n = Number(bytes) || 0;
				if (n < 1024) return n + ' B';
				if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
				return (n / 1024 / 1024).toFixed(1) + ' MB';
			},
			open(item) {
				uni.navigateTo({
					url: '/pages/jk/health/reportDetail?id=' + encodeURIComponent(item.id) + '&source=sinocare'
				});
			},
			back() {
				const pages = getCurrentPages();
				if (pages && pages.length > 1) uni.navigateBack();
				else uni.switchTab({ url: '/pages/health/index' });
			}
		}
	};
</script>
<style lang="scss" scoped>
	.report-list-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #f7f8fa;
		color: #111827;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
	}

	.page-nav {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 88rpx;
		padding: 0 32rpx;
		border-bottom: 1rpx solid #f3f4f6;
		background: #fff;
		flex: none
	}

	.page-nav__back {
		position: absolute;
		left: 20rpx;
		display: flex;
		align-items: center;
		height: 88rpx;
		padding: 0 12rpx;
		color: #1f2937;
		font-size: 48rpx
	}

	.page-nav__title {
		font-size: 34rpx;
		font-weight: 600
	}

	.tabs {
		display: flex;
		padding: 20rpx 32rpx;
		background: #fff;
		flex: none
	}

	.tab {
		flex: 1;
		text-align: center;
		padding: 18rpx 0;
		margin: 0 10rpx;
		border-radius: 36rpx;
		background: #f3f4f6;
		color: #666;
		font-size: 28rpx
	}

	.tab.active {
		background: #00a870;
		color: #fff;
		font-weight: 600
	}

	.list-wrap {
		flex: 1;
		overflow: hidden
	}

	.scroll {
		height: 100%;
		padding: 24rpx 32rpx
	}

	.loading,
	.no-more,
	.empty {
		text-align: center;
		color: #999;
		font-size: 24rpx;
		padding: 40rpx 0
	}

	.empty-sub {
		display: block;
		margin-top: 12rpx;
		font-size: 22rpx
	}

	.state-error {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 18rpx;
		padding: 20rpx 24rpx;
		border-radius: 16rpx;
		background: #fff4f2;
		color: #b94d45;
		font-size: 23rpx
	}

	.state-error text:last-child {
		color: #00a870
	}

	.report-item {
		background: #fff;
		border-radius: 24rpx;
		padding: 28rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, .03)
	}

	.item-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx
	}

	.item-title {
		flex: 1;
		min-width: 0;
		font-size: 28rpx;
		font-weight: 600;
		color: #111827;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis
	}

	.item-tag {
		flex: none;
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		font-size: 20rpx
	}

	.tag--DIGITAL {
		background: #eff6ff;
		color: #3b82f6
	}

	.tag--PDF {
		background: #fff1e6;
		color: #fa8c16
	}

	.item-period {
		display: block;
		margin-top: 14rpx;
		color: #666;
		font-size: 24rpx
	}

	.item-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 16rpx
	}

	.item-time {
		color: #999;
		font-size: 22rpx
	}

	.item-size {
		color: #666;
		font-size: 22rpx
	}
</style>
