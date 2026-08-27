<template>
	<view class="trend-page">
		<!-- <view class="sub-nav">
			<navigator open-type="navigateBack" class="sub-nav__back">‹</navigator><text
				class="sub-nav__title">血糖趋势详情</text>
			<view class="sub-nav__capsule"><text>•••</text>
				<view></view><text>◉</text>
			</view>
		</view> -->
		<view class="range-bar"><text v-for="x in ranges" :key="x.value"
				:class="['range-pill',{active:range===x.value}]" @tap="changeRange(x.value)">{{x.label}}</text></view>
		<view v-if="error" class="state-error"><text>{{error}}</text><text @tap="load">重新加载</text></view>
		<view class="section chart-section">
			<view class="chart-title-wrap"><text class="section-title">{{rangeLabel}}血糖曲线</text><text
					class="unit">{{loading?'正在加载…':'mmol/L'}}</text></view>
			<view class="trend-canvas">
				<glucose-u-charts
					:records="rows"
					mode="detail"
					:range-type="range"
					:max-y="15"
					:height-rpx="330"
					canvas-id="healthTrendGlucoseChart"
				/>
			</view>
			<view class="legend">
				<view class="legend-line"></view><text>血糖曲线</text>
			</view>
			<view v-if="!rows.length" class="empty-chart">暂无可绘制数据</view>
			<view class="chart-note"><text class="note-icon">i</text><text>未配置目标范围或暂未收到目标范围数据时，仅显示血糖曲线</text></view>
		</view>
		<view class="section data-section">
			<text class="section-title">血糖数据</text>
			<text class="data-sub">ⓘ 数据按时间倒序排列</text>
			<view class="table-head"><text>时间</text><text>血糖值 (mmol/L)</text><text>来源</text></view>
			<view v-for="item in tableRows" :key="item.measuredAt" class="table-row">
				<text>{{time(item.measuredAt||item.recordedAt||item.time)}}</text><text>{{item.numericValue||item.value||'--'}}</text><text>三诺
					CGM 同步</text></view>
			<view v-if="!rows.length" class="empty">暂无血糖数据</view>
		</view>
	</view>
</template>
<script>
	import JkPageNav from '@/components/jk/jk-page-nav.vue';
	import GlucoseUCharts from '@/components/glucose-ucharts.vue';
	import {
		getGlucoseTrend
	} from '@/api/health.js';
	export default {
		components: {
			JkPageNav,
			GlucoseUCharts
		},
		data() {
			return {
				range: 'DAY',
				ranges: [{
					label: '今日',
					value: 'DAY'
				}, {
					label: '7 天',
					value: 'WEEK'
				}, {
					label: '30 天',
					value: 'MONTH'
				}],
				payload: {},
				loading: false,
				error: '',
				trendCache: {},
				requestSeq: 0,
				cacheMaxAge: 60000
			}
		},
		computed: {
			rows() {
				const x = this.payload.records || this.payload.list || this.payload.points || [];
				return Array.isArray(x) ? x : []
			},
			tableRows() {
				return this.rows.slice().sort((a, b) => this.recordTime(b) - this.recordTime(a))
			},
			summary() {
				return this.payload.summary || this.payload
			},
		rangeLabel() {
			return {
				DAY: '24 小时',
				WEEK: '7 天',
				MONTH: '30 天'
			} [this.range]
		},
	},
		onShow() {
			this.load()
		},
		methods: {
			value: r => r && r.data !== undefined ? r.data : (r || {}),
			recordTime(item) {
				const value = item && (item.measuredAt || item.recordedAt || item.time);
				if (!value) return 0;
				if (typeof value === 'number') return value < 100000000000 ? value * 1000 : value;
				return new Date(String(value).replace(/-/g, '/')).getTime() || 0;
			},
			changeRange(v) {
				if (this.range === v) return;

				this.range = v;
				this.error = '';

				const cached = this.trendCache[v];

				if (cached && cached.payload) {
					this.payload = cached.payload;
					this.loading = false;

					// 60 秒内切回已看过的范围直接显示，不重复请求。
					if (Date.now() - cached.at < this.cacheMaxAge) return;
				}

				this.fetchRange(v, !!cached);
			},
			dateRange(rangeKey) {
				const key = rangeKey || this.range;
				const end = new Date();
				const start = new Date(end);

				if (key === 'DAY') {
					start.setHours(0, 0, 0, 0);
				} else {
					start.setDate(start.getDate() - (key === 'WEEK' ? 6 : 29));
					start.setHours(0, 0, 0, 0);
				}

				return {
					startAt: start.toISOString(),
					endAt: end.toISOString()
				}
			},
			load() {
				const cached = this.trendCache[this.range];

				if (cached && cached.payload) {
					this.payload = cached.payload;
					this.loading = false;

					if (Date.now() - cached.at < this.cacheMaxAge) return;
				}

				this.fetchRange(this.range, !!cached);
			},
			fetchRange(rangeKey, background) {
				const seq = ++this.requestSeq;
				const queryRange = this.dateRange(rangeKey);

				if (!background) {
					this.loading = true;
					this.error = '';
				}

				getGlucoseTrend(queryRange).then(r => {
					const payload = this.value(r);

					this.$set(this.trendCache, rangeKey, {
						payload,
						at: Date.now()
					});

					// 快速切换范围时，旧请求只进入缓存，不覆盖当前页。
					if (this.range === rangeKey) {
						this.payload = payload;
					}
				}).catch(() => {
					if (this.range === rangeKey && !this.trendCache[rangeKey]) {
						this.error = '加载失败，请检查网络后重新加载';
					}
				}).finally(() => {
					if (this.range === rangeKey && seq === this.requestSeq) {
						this.loading = false;
					}
				})
			},
			time(v) {
				return v ? String(v).replace('T', ' ').slice(this.range === 'DAY' ? 11 : 5, 16) : '--'
			}
		}
	};
</script>
<style lang="scss" scoped>
	.trend-page {
		min-height: 100vh;
		background: #f7f8fa;
		color: #1f2937;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
	}

	.sub-nav {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 88rpx;
		padding: 0 32rpx;
		background: #fff
	}

	.sub-nav__back {
		position: absolute;
		left: 24rpx;
		display: flex;
		align-items: center;
		height: 88rpx;
		padding: 0 12rpx;
		color: #1f2937;
		font-size: 48rpx
	}

	.sub-nav__title {
		font-size: 34rpx;
		font-weight: 500
	}

	.sub-nav__capsule {
		position: absolute;
		right: 24rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
		color: #374151;
		font-size: 22rpx
	}

	.sub-nav__capsule view {
		width: 1rpx;
		height: 24rpx;
		background: #e5e7eb
	}

	.range-bar {
		display: flex;
		gap: 16rpx;
		padding: 24rpx 32rpx;
		background: #fff
	}

	.range-pill {
		padding: 12rpx 40rpx;
		border-radius: 999rpx;
		background: #f0f2f5;
		color: #666;
		font-size: 26rpx;
		font-weight: 500
	}

	.range-pill.active {
		background: #00bfa5;
		color: #fff
	}

	.state-error {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 16rpx 32rpx;
		padding: 20rpx 24rpx;
		border-radius: 14rpx;
		background: #fff4f2;
		color: #b94d45;
		font-size: 23rpx
	}

	.state-error text:last-child {
		color: #00bfa5
	}

	.section {
		margin-top: 16rpx;
		padding: 32rpx;
		background: #fff
	}

	.chart-title-wrap {
		display: flex;
		flex-direction: column;
		align-items: flex-start
	}

	.section-title {
		display: block;
		color: #111827;
		font-size: 30rpx;
		font-weight: 600
	}

	.unit {
		margin-top: 8rpx;
		color: #6b7280;
		font-size: 22rpx
	}

	.trend-canvas {
		width: 686rpx;
		height: 382rpx;
		margin-top: 18rpx
	}

	.legend {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 18rpx;
		color: #4b5563;
		font-size: 24rpx
	}

	.legend-line {
		width: 24rpx;
		height: 4rpx;
		margin-right: 8rpx;
		border-radius: 2rpx;
		background: #00bfa5
	}

	.empty-chart {
		margin-top: 8rpx;
		color: #9ca3af;
		font-size: 22rpx;
		text-align: center
	}

	.chart-note {
		display: flex;
		align-items: flex-start;
		margin-top: 28rpx;
		padding: 20rpx 22rpx;
		border-radius: 16rpx;
		background: #f9fafb;
		color: #6b7280;
		font-size: 22rpx;
		line-height: 1.5
	}

	.note-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28rpx;
		height: 28rpx;
		margin-right: 12rpx;
		border: 2rpx solid #9ca3af;
		border-radius: 50%;
		font-size: 18rpx;
		flex: none
	}

	.data-section {
		padding-bottom: 20rpx
	}

	.data-sub {
		display: block;
		margin-top: 10rpx;
		margin-bottom: 24rpx;
		color: #6b7280;
		font-size: 22rpx
	}

	.table-head,
	.table-row {
		display: grid;
		grid-template-columns: 1fr 1.45fr 1.2fr;
		align-items: center
	}

	.table-head {
		min-height: 64rpx;
		padding: 0 16rpx;
		border-bottom: 1rpx solid #f3f4f6;
		background: #f9fafb;
		color: #6b7280;
		font-size: 21rpx
	}

	.table-row {
		min-height: 88rpx;
		padding: 0 16rpx;
		border-bottom: 1rpx solid #f9fafb;
		color: #1f2937;
		font-size: 23rpx
	}

	.table-head text:nth-child(2),
	.table-row text:nth-child(2) {
		text-align: center
	}

	.table-head text:last-child,
	.table-row text:last-child {
		text-align: right;
		color: #6b7280
	}

	.empty {
		padding: 70rpx 0;
		color: #9ca3af;
		font-size: 23rpx;
		text-align: center
	}
</style>
