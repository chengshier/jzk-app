<template>
	<view class="health-page">
		<jk-page-nav title="健康中心" :show-back="true" />

		<view class="page-content">
			<view v-if="loading" class="state-note">正在加载健康数据…</view>
			<view v-if="error" class="state-error">
				<text>{{error}}</text>
				<text @tap="load">重新加载</text>
			</view>

			<!-- 有血糖数据：严格按设计稿“健康中心 - 主页（滚动优化版）”结构 -->
			<view v-if="latestValue !== '--' || previewPoints.length" class="data-state">
				<view class="latest-card data-card" @tap="go('/pages/jk/health/trend')">
					<view class="latest-title-row">
						<view class="latest-title-icon">
							<view class="latest-title-icon-core"></view>
						</view>
						<text class="latest-title">最新血糖</text>
					</view>
					<view class="latest-value-row">
						<text class="latest-value">{{ latestValue }}</text>
						<text class="latest-unit">mmol/L</text>
					</view>
					<text class="latest-meta">三诺 CGM 同步 · {{ latestTime }}</text>
					<view class="latest-heart" aria-hidden="true">♡</view>
				</view>

				<view class="trend-card data-card">
					<view class="trend-head">
						<view class="section-title-wrap">
							<text class="section-icon chart-icon">⌁</text>
							<text class="section-title">24 小时血糖曲线</text>
						</view>
						<view class="range-switch">
							<text :class="range==='DAY' ? 'range-active' : 'range-inactive'" @tap="changeRange('DAY')">今日</text>
							<text :class="range==='WEEK' ? 'range-active' : 'range-inactive'" @tap="changeRange('WEEK')">7 天</text>
						</view>
					</view>
					<text class="chart-unit">mmol/L</text>
					<view class="chart-shell">
						<glucose-u-charts
							:records="chartRows"
							mode="summary"
							:range-type="range"
							:max-y="15"
							:height-rpx="320"
							canvas-id="healthHomeGlucoseChart"
						/>
					</view>
					<view class="chart-bottom-row">
						<view class="legend">
							<view class="legend-line"></view><text>血糖曲线</text>
						</view>
						<view class="view-all" @tap="go('/pages/jk/health/trend')"><text>查看全部</text><text
								class="chevron">›</text></view>
					</view>
					<view class="chart-tip">
						<text class="info-icon">ⓘ</text>
						<text>未配置目标范围或暂未收到目标范围数据时，仅显示血糖曲线</text>
					</view>
				</view>

				<!-- 设备状态与“是否已有血糖数据”完全解耦 -->
				<view v-if="deviceState==='SYNCED'" class="device-section data-card"
					@tap="go('/pages/jk/health/device')">
					<view class="section-title-wrap device-heading">
						<text class="section-icon">⚙</text>
						<text class="section-title">监测设备</text>
					</view>
					<view class="device-main-row">
						<view class="device-left">
							<view class="device-logo">SINOCARE</view>
							<view class="device-copy">
								<text class="device-name">{{device.productName||'三诺 CGM'}}</text>
								<view class="device-status-line"><text>授权状态：</text><text class="status-authorized">✓
										已授权</text></view>
								<view class="device-status-line"><text>监测状态：</text><text
										:class="isMonitoring?'status-monitoring':'status-stopped'">{{isMonitoring?'◉ 监测中':'已停止'}}</text>
								</view>
							</view>
						</view>
						<text class="row-arrow">›</text>
					</view>
					<view class="device-meta">
						<view class="meta-row"><text>设备编号</text><text>{{device.deviceSn||'--'}}</text></view>
						<view class="meta-row"><text>开始监测时间</text><text>{{device.detectionStartTime||'--'}}</text>
						</view>
						<view class="meta-row"><text>最近同步数据时间</text><text>{{device.lastDataAt||latestTime}}</text>
						</view>
					</view>
				</view>

				<view v-else class="empty-device-card empty-card" @tap="go('/pages/jk/health/device')">
					<view class="empty-section-title">
						<view class="empty-title-icon link-icon">↻</view><text>监测设备</text>
					</view>
					<view class="empty-device-row">
						<view class="empty-device-left">
							<view class="empty-device-logo">◎</view>
							<view class="empty-device-copy">
								<text
									class="empty-device-name">{{deviceState==='UNAUTHORIZED'?'连接三诺 CGM':(device.productName||'三诺 CGM')}}</text>
								<text
									class="empty-device-desc">{{deviceState==='UNAUTHORIZED'?'授权后可自动同步三诺 CGM 血糖数据，实时掌握血糖变化趋势。':'已完成三诺授权，等待设备监测信息同步。'}}</text>
							</view>
						</view>
						<view v-if="deviceState==='UNAUTHORIZED'" class="empty-outline-button device-auth">去授权</view>
						<view v-else class="authorized-pill">已授权</view>
					</view>
				</view>

				<view class="report-section data-card">
					<view class="section-head">
						<view class="section-title-wrap"><text class="section-icon">▤</text><text
								class="section-title">健康报告</text></view>
						<view class="view-all" @tap="go('/pages/jk/health/reportList')">
							<text>查看全部</text><text class="chevron">›</text></view>
					</view>
					<view v-if="latestReport.id" class="report-main-row" @tap="openReport(latestReport)">
						<view class="report-left">
							<view class="report-icon">▱</view>
							<view class="report-copy">
							<view class="report-title-row"><text
									class="report-name">{{ reportName(latestReport) }}</text><text
									class="report-tag" :class="latestReport.reportType==='PDF'?'report-tag--file':'report-tag--digital'">{{ reportTag(latestReport) }}</text></view>
							<text class="report-date">{{ reportDate(latestReport.createTime) }}</text>
							<text class="report-date">{{ reportMeta(latestReport) }}</text>
							</view>
						</view>
						<view class="report-btn">查看报告</view>
					</view>
					<view v-else class="report-main-row muted-report"
						@tap="go('/pages/jk/report/index?mode=healthReport')">
						<view class="report-left">
							<view class="report-icon">▱</view>
							<view class="report-copy"><text class="report-name">暂无健康报告</text><text
									class="report-date">同步数据后可在这里查看健康报告</text></view>
						</view>
						<text class="row-arrow">›</text>
					</view>
				</view>

				<view class="records-section data-card">
					<view class="section-head">
						<view class="section-title-wrap"><text class="section-icon">▱</text><text
								class="section-title">最近记录</text></view>
						<view class="view-all" @tap="go('/pages/jk/health/dataList')"><text>查看全部</text><text
								class="chevron">›</text></view>
					</view>
					<view v-if="recentRecords.length" class="records-list">
						<view v-for="item in recentRecords" :key="item.id" class="record-row">
							<view class="record-left">
								<view class="record-icon" :class="item.dataType||''">♥</view>
								<text class="record-title">{{ item.dataTypeText||item.dataType||'健康记录' }}</text>
								<text class="record-time">{{ item.measuredAt||item.recordedAt||'--' }}</text>
								<text class="source-tag"
									:class="(item.sourceType||item.source)==='DEVICE_SYNC'?'source-sync':'source-manual'">{{ sourceText(item) }}</text>
							</view>
							<view class="record-right"><text class="record-value">{{ recordValue(item) }}</text><text
									class="row-arrow small">›</text></view>
						</view>
					</view>
					<view v-else class="empty-record-inline"><text>暂无记录</text></view>
				</view>

				<view class="floating-add" @tap="go('/pages/jk/health/glucose')">
					<view class="floating-plus">＋</view>
					<view class="floating-copy"><text class="floating-title">添加记录</text><text class="floating-sub">血糖 /
							饮食 / 活动 / 用药</text></view>
				</view>
			</view>

			<!-- 无血糖数据：严格按设计稿“健康中心 - 未授权/无数据”结构 -->
			<view v-else class="empty-state">
				<view class="empty-latest-card empty-card">
					<view class="empty-section-title">
						<view class="empty-title-icon">●</view><text>最新血糖</text>
					</view>
					<view class="empty-value-row">
						<view class="empty-number-wrap"><text class="empty-number">--</text><text
								class="empty-unit">mmol/L</text></view>
						<view class="empty-round-icon">—</view>
					</view>
					<text class="empty-meta">暂无数据</text>
				</view>

				<view class="empty-trend-card empty-card">
					<text class="empty-block-title">24 小时血糖曲线</text>
					<view class="empty-trend-body">
						<view class="empty-chart-symbol">⌁</view>
						<text class="empty-trend-title">暂无血糖数据</text>
						<text class="empty-trend-desc">添加记录或连接三诺 CGM 获取数据</text>
						<view class="empty-outline-button" @tap="go('/pages/jk/health/glucose')">添加血糖记录</view>
					</view>
				</view>

				<view class="empty-device-card empty-card">
					<view class="empty-section-title">
						<view class="empty-title-icon link-icon">↻</view><text>监测设备</text>
					</view>
					<view class="empty-device-row">
						<view class="empty-device-left">
							<view class="empty-device-logo">◎</view>
							<view class="empty-device-copy">
								<text
									class="empty-device-name">{{deviceState==='UNAUTHORIZED'?'连接三诺 CGM':(device.productName||'三诺 CGM')}}</text>
								<text
									class="empty-device-desc">{{deviceState==='UNAUTHORIZED'?'授权后可自动同步三诺 CGM 血糖数据，实时掌握血糖变化趋势。':'已完成三诺授权，等待设备监测信息同步。'}}</text>
							</view>
						</view>
						<view v-if="deviceState==='UNAUTHORIZED'" class="empty-outline-button device-auth"
							@tap="go('/pages/jk/health/device')">去授权</view>
						<view v-else class="authorized-pill" @tap="go('/pages/jk/health/device')">已授权</view>
					</view>
				</view>

				<view class="empty-record-card empty-card">
					<view class="empty-section-title muted-title-icon">
						<view class="empty-title-icon gray">▱</view><text>最近记录</text>
					</view>
					<view v-if="!recentRecords.length" class="empty-record-body">
						<text class="empty-record-title">暂无记录</text>
						<text class="empty-record-desc">添加记录，记录你的健康生活</text>
						<view class="empty-outline-button" @tap="go('/pages/jk/health/glucose')">添加记录</view>
					</view>
					<view v-else class="records-list compact-records">
						<view v-for="item in recentRecords" :key="item.id" class="record-row">
							<view class="record-left">
								<view class="record-icon">♥</view><text
									class="record-title">{{ item.dataTypeText||item.dataType||'健康记录' }}</text><text
									class="record-time">{{ item.measuredAt||item.recordedAt||'--' }}</text>
							</view>
							<view class="record-right"><text class="record-value">{{ recordValue(item) }}</text><text
									class="row-arrow small">›</text></view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
	import JkPageNav from '@/components/jk/jk-page-nav.vue';
	import GlucoseUCharts from '@/components/glucose-ucharts.vue';
	import {
		getHealthDashboard,
		getHealthDeviceStatus,
		getGlucoseTrend,
		getSinocareHealthReportList
	} from '@/api/health.js';
	export default {
		components: {
			JkPageNav,
			GlucoseUCharts
		},
		data() {
			return {
			dashboard: {},
			device: {},
			trend: {},
			range: 'DAY',
			reports: [],
				loading: false,
				error: '',
				trendCache: {},
				trendRequestSeq: 0
			}
		},
		computed: {
			deviceState() {
				if (this.device.authorized && this.device.hasGlucoseData) return 'SYNCED';
				if (this.device.authorized) return 'WAITING';
				return 'UNAUTHORIZED';
			},
			isMonitoring() {
				if (!this.device.hasGlucoseData) return false;
				const lastDataAt = this.timeMs(this.device.lastDataAt);
				const detectionEndTime = this.timeMs(this.device.detectionEndTime);
				return !detectionEndTime || detectionEndTime > Date.now() || (lastDataAt && lastDataAt > detectionEndTime);
			},
			latest() {
				return this.dashboard.latestGlucose || this.device.latestGlucose || this.trend.latestGlucose || {};
			},
			latestValue() {
				return this.latest.numericValue || this.latest.value || '--';
			},
			latestTime() {
				return this.latest.measuredAt || this.latest.recordedAt || '暂无同步数据';
			},
			latestRisk() {
				return this.latest.riskLevelText || this.latest.riskText || '正常';
			},
			riskClass() {
				const x = String(this.latest.riskLevel || '').toUpperCase();
				return x === 'HIGH' ? 'risk-high' : x === 'LOW' || x === 'MEDIUM' ? 'risk-warn' : 'risk-normal';
			},
			chartRows() {
				const a = this.trend.points || this.trend.records || this.trend.list || [];
				if (!Array.isArray(a)) return [];
				const valid = a.filter(x => {
					const raw = x && x.numericValue != null ? x.numericValue : (x ? x.value : null);
					const value = Number(raw);
					return Number.isFinite(value) && value > 0;
				});
				return this.range === 'DAY' ? valid.slice(-40) : valid;
			},
			previewPoints() {
				return this.chartRows.slice(-12);
			},
			deviceSummary() {
				return this.deviceState === 'UNAUTHORIZED' ? '未授权，点击连接设备' : this.deviceState === 'WAITING' ? '已授权，等待设备同步' :
					'已同步 · ' + (this.device.productName || this.device.deviceSn || '连续监测中');
			},
			recentRecords() {
				return this.dashboard.recentRecords || [];
			},
			latestReport() {
				return this.reports[0] || {}
			}
		},
		onShow() {
			this.load()
		},
		methods: {
			value: r => r && r.data !== undefined ? r.data : (r || {}),
			timeMs(value) {
				if (!value) return 0;
				if (typeof value === 'number') return value < 100000000000 ? value * 1000 : value;
				return new Date(String(value).replace(/-/g, '/')).getTime() || 0;
			},
			rangeStart(days) {
				const d = new Date();
				d.setHours(0, 0, 0, 0);
				d.setDate(d.getDate() - days + 1);
				return d.toISOString()
			},
			load() {
				this.loading = true;
				this.error = '';
				this.loadTrend();
				Promise.all([getHealthDashboard(), getHealthDeviceStatus(), getSinocareHealthReportList({
					page: 1,
					limit: 1
				})]).then(([a, b, d]) => {
					this.dashboard = this.value(a);
					this.device = this.value(b);
					const x = this.value(d);
					this.reports = Array.isArray(x) ? x : (x.list || x.records || [])
				}).catch(() => this.error = '加载失败，请检查网络后重新加载').finally(() => this.loading = false)
			},
			loadTrend() {
				const rangeKey = this.range;
				const cached = this.trendCache[rangeKey];

				if (cached && cached.payload) {
					this.trend = cached.payload;
				}

				const days = rangeKey === 'WEEK' ? 7 : 1;
				const seq = ++this.trendRequestSeq;

				getGlucoseTrend({
					startAt: this.rangeStart(days),
					endAt: new Date().toISOString()
				}).then(r => {
					const payload = this.value(r);

					this.$set(this.trendCache, rangeKey, {
						payload,
						at: Date.now()
					});

					if (this.range === rangeKey && seq === this.trendRequestSeq) {
						this.trend = payload;
					}
				}).catch(() => {})
			},
			changeRange(v) {
				if (this.range === v) return;
				this.range = v;

				const cached = this.trendCache[v];
				if (cached && cached.payload) {
					this.trend = cached.payload;
				}

				this.loadTrend()
			},
			go(url) {
				uni.navigateTo({
					url
				})
			},
			openReport(x) {
				this.go('/pages/jk/health/reportDetail')
			},
			reportTag(report) {
				return report.reportType === 'PDF' ? '文件报告' : '数字报告'
			},
			reportName(report) {
				if (report.reportType === 'PDF') return '三诺文件报告'
				if (report.reportType === 'DIGITAL') return '三诺数字报告'
				return {
					DAILY: '血糖日报',
					WEEKLY: '血糖周报',
					MONTHLY: '血糖月报'
				} [report.reportType] || report.reportType || '三诺健康报告'
			},
			reportMeta(report) {
				const parts = [report.deviceSn || '--']
				if (report.reportType === 'PDF' && report.fileSize) parts.push(this.formatSize(report.fileSize))
				if (report.reportType === 'DIGITAL' && report.periodText) parts.push(report.periodText)
				return parts.join(' · ')
			},
			formatSize(bytes) {
				const n = Number(bytes) || 0
				if (n < 1024) return n + ' B'
				if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
				return (n / 1024 / 1024).toFixed(1) + ' MB'
			},
			reportDate(x) {
				return String(x || '--').slice(0, 10)
			},
			sourceText(i) {
				return {
					DEVICE_SYNC: '三诺 CGM 同步',
					DEVICE: '设备同步',
					MANUAL: '手工录入'
				} [i.sourceType || i.source] || '健康记录'
			},
			recordValue(i) {
				return i.numericValue != null ? i.numericValue + ' ' + (i.unit || 'mmol/L') : (i.value || '已记录')
			}
		}
	};
</script>
<style scoped>
	.health-page {
		min-height: 100vh;
		background: #f9fafb;
		color: #232d42;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
	}

	.page-content {
		padding: 16rpx 32rpx 220rpx
	}

	.empty-state {
		padding-top: 16rpx
	}

	.state-note,
	.state-error {
		margin-bottom: 24rpx;
		padding: 18rpx 22rpx;
		border-radius: 16rpx;
		font-size: 22rpx
	}

	.state-note {
		background: #eef8f5;
		color: #64807a
	}

	.state-error {
		display: flex;
		justify-content: space-between;
		background: #fff0ef;
		color: #d95b50
	}

	.data-card,
	.empty-card {
		background: #fff;
		border-radius: 32rpx
	}

	.data-card {
		margin-bottom: 32rpx;
		box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, .05)
	}

	.latest-card {
		position: relative;
		padding: 40rpx;
		overflow: hidden
	}

	.latest-title-row,
	.latest-value-row,
	.trend-head,
	.section-title-wrap,
	.range-switch,
	.chart-bottom-row,
	.legend,
	.view-all,
	.chart-tip,
	.device-main-row,
	.device-left,
	.device-status-line,
	.meta-row,
	.section-head,
	.report-main-row,
	.report-left,
	.report-title-row,
	.record-row,
	.record-left,
	.record-right,
	.empty-section-title,
	.empty-value-row,
	.empty-number-wrap,
	.empty-device-row,
	.empty-device-left {
		display: flex;
		align-items: center
	}

	.latest-title-row {
		gap: 16rpx
	}

	.latest-title-icon {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		background: rgba(0, 179, 134, .20)
	}

	.latest-title-icon-core {
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;
		background: #00B386
	}

	.latest-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1f2937
	}

	.latest-value-row {
		align-items: flex-end;
		margin-top: 18rpx
	}

	.latest-value {
		font-size: 96rpx;
		line-height: 1;
		font-weight: 700;
		color: #00B386
	}

	.latest-unit {
		margin: 0 0 8rpx 8rpx;
		font-size: 28rpx;
		font-weight: 500;
		color: #6b7280
	}

	.latest-meta {
		display: block;
		margin-top: 16rpx;
		font-size: 24rpx;
		color: #6b7280
	}

	.latest-heart {
		position: absolute;
		right: -2rpx;
		bottom: -22rpx;
		font-size: 164rpx;
		line-height: 1;
		color: rgba(0, 179, 134, .10)
	}

	.trend-card {
		padding: 32rpx
	}

	.trend-head {
		justify-content: space-between;
		margin-bottom: 28rpx
	}

	.section-title-wrap {
		gap: 16rpx
	}

	.section-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32rpx;
		height: 32rpx;
		color: #00B386;
		font-size: 26rpx;
		line-height: 1
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1f2937
	}

	.range-switch {
		padding: 4rpx;
		border-radius: 999rpx;
		background: #f3f4f6;
		font-size: 24rpx
	}

	.range-active,
	.range-inactive {
		padding: 8rpx 24rpx;
		border-radius: 999rpx
	}

	.range-active {
		background: #fff;
		color: #00B386;
		font-weight: 500;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, .05)
	}

	.range-inactive {
		color: #6b7280;
		font-weight: 500
	}

	.chart-unit {
		display: block;
		margin-bottom: 2rpx;
		color: #9ca3af;
		font-size: 20rpx
	}

	.chart-shell {
		position: relative;
		height: 320rpx;
		margin-top: 2rpx
	}

	.chart-grid {
		position: absolute;
		left: 36rpx;
		right: 0;
		border-top: 1rpx solid #F3F4F6
	}

	.grid-15 {
		top: 24rpx
	}

	.grid-10 {
		top: 104rpx
	}

	.grid-5 {
		top: 184rpx
	}

	.grid-0 {
		top: 264rpx
	}

	.y-axis-label {
		position: absolute;
		left: 0;
		width: 28rpx;
		color: #8A92A6;
		font-size: 18rpx;
		text-align: left
	}

	.y15 {
		top: 12rpx
	}

	.y10 {
		top: 92rpx
	}

	.y5 {
		top: 172rpx
	}

	.y0 {
		top: 252rpx
	}

	.curve-stage {
		position: absolute;
		left: 36rpx;
		right: 0;
		top: 24rpx;
		height: 240rpx;
		overflow: hidden
	}

	.curve-area {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 100%;
		background: linear-gradient(to bottom, rgba(0, 179, 134, .12), rgba(0, 179, 134, 0));
		clip-path: polygon(0 72%, 14% 78%, 28% 58%, 42% 54%, 56% 65%, 70% 55%, 84% 70%, 100% 58%, 100% 100%, 0 100%)
	}

	.curve-segment {
		position: absolute;
		height: 4rpx;
		border-radius: 4rpx;
		background: #00B386;
		transform-origin: left center
	}

	.s1 {
		left: 0;
		top: 173rpx;
		width: 14.5%;
		transform: rotate(8deg)
	}

	.s2 {
		left: 14%;
		top: 187rpx;
		width: 15.5%;
		transform: rotate(-17deg)
	}

	.s3 {
		left: 28%;
		top: 143rpx;
		width: 15%;
		transform: rotate(-3deg)
	}

	.s4 {
		left: 42%;
		top: 134rpx;
		width: 15%;
		transform: rotate(8deg)
	}

	.s5 {
		left: 56%;
		top: 156rpx;
		width: 15%;
		transform: rotate(-10deg)
	}

	.s6 {
		left: 70%;
		top: 132rpx;
		width: 15%;
		transform: rotate(12deg)
	}

	.s7 {
		left: 84%;
		top: 161rpx;
		width: 16%;
		transform: rotate(-9deg)
	}

	.curve-point {
		position: absolute;
		width: 8rpx;
		height: 8rpx;
		border-radius: 50%;
		background: #00B386;
		transform: translate(-50%, -50%)
	}

	.p1 {
		left: 0;
		top: 173rpx
	}

	.p2 {
		left: 14%;
		top: 187rpx
	}

	.p3 {
		left: 28%;
		top: 143rpx
	}

	.p4 {
		left: 42%;
		top: 134rpx
	}

	.p5 {
		left: 56%;
		top: 156rpx
	}

	.p6 {
		left: 70%;
		top: 132rpx
	}

	.p7 {
		left: 84%;
		top: 161rpx
	}

	.p8 {
		left: 100%;
		top: 139rpx
	}

	.x-axis-label {
		position: absolute;
		top: 284rpx;
		color: #8A92A6;
		font-size: 17rpx;
		transform: translateX(-50%)
	}

	.x0 {
		left: 36rpx;
		transform: none
	}

	.x1 {
		left: 17%
	}

	.x2 {
		left: 31%
	}

	.x3 {
		left: 46%
	}

	.x4 {
		left: 61%
	}

	.x5 {
		left: 76%
	}

	.x6 {
		right: 0;
		left: auto;
		transform: none
	}

	.chart-bottom-row {
		justify-content: space-between;
		margin-top: 14rpx
	}

	.legend {
		gap: 12rpx;
		color: #4b5563;
		font-size: 24rpx
	}

	.legend-line {
		width: 24rpx;
		height: 4rpx;
		border-radius: 4rpx;
		background: #00B386
	}

	.view-all {
		gap: 8rpx;
		color: #6b7280;
		font-size: 24rpx
	}

	.chevron {
		font-size: 26rpx;
		color: #9ca3af
	}

	.chart-tip {
		gap: 14rpx;
		margin-top: 24rpx;
		padding: 16rpx;
		border-radius: 16rpx;
		background: #f9fafb;
		color: #6b7280;
		font-size: 24rpx;
		line-height: 1.45
	}

	.info-icon {
		color: #9ca3af;
		font-size: 22rpx
	}

	.device-section,
	.report-section,
	.records-section {
		padding: 32rpx
	}

	.device-heading {
		margin-bottom: 32rpx
	}

	.device-main-row {
		justify-content: space-between;
		padding-bottom: 32rpx;
		margin-bottom: 24rpx;
		border-bottom: 1rpx solid #f3f4f6
	}

	.device-left {
		gap: 24rpx
	}

	.device-logo {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 96rpx;
		height: 96rpx;
		border-radius: 50%;
		background: #f3f4f6;
		color: #9ca3af;
		font-size: 16rpx;
		font-weight: 700
	}

	.device-copy {
		min-width: 0
	}

	.device-name {
		display: block;
		font-size: 28rpx;
		font-weight: 600;
		color: #1f2937
	}

	.device-status-line {
		margin-top: 8rpx;
		color: #6b7280;
		font-size: 24rpx
	}

	.status-authorized {
		margin-left: 4rpx;
		color: #00B386
	}

	.status-monitoring {
		margin-left: 4rpx;
		color: #3b82f6
	}

	.status-stopped {
		margin-left: 4rpx;
		color: #6b7280
	}

	.row-arrow {
		color: #9ca3af;
		font-size: 30rpx;
		line-height: 1
	}

	.row-arrow.small {
		font-size: 24rpx
	}

	.device-meta {
		font-size: 24rpx;
		color: #6b7280
	}

	.meta-row {
		justify-content: space-between;
		margin-top: 16rpx
	}

	.meta-row:first-child {
		margin-top: 0
	}

	.meta-row text:last-child {
		color: #1f2937
	}

	.section-head {
		justify-content: space-between;
		margin-bottom: 32rpx
	}

	.report-main-row {
		justify-content: space-between
	}

	.report-left {
		gap: 24rpx;
		min-width: 0
	}

	.report-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80rpx;
		height: 80rpx;
		border-radius: 8rpx;
		background: #E6F7F2;
		color: #00B386;
		font-size: 36rpx
	}

	.report-copy {
		min-width: 0
	}

	.report-title-row {
		gap: 12rpx
	}

	.report-name {
		display: block;
		font-size: 28rpx;
		font-weight: 600;
		color: #1f2937
	}

	.report-tag {
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		background: #eff6ff;
		color: #3b82f6;
		font-size: 20rpx
	}

	.report-tag--digital {
		background: #eff6ff;
		color: #3b82f6
	}

	.report-tag--file {
		background: #fff1e6;
		color: #fa8c16
	}

	.report-date {
		display: block;
		margin-top: 6rpx;
		color: #9ca3af;
		font-size: 20rpx
	}

	.report-btn {
		padding: 12rpx 24rpx;
		border-radius: 999rpx;
		background: #00B386;
		color: #fff;
		font-size: 24rpx;
		white-space: nowrap
	}

	.muted-report {
		opacity: .86
	}

	.record-row {
		justify-content: space-between;
		min-height: 72rpx;
		margin-top: 12rpx
	}

	.record-row:first-child {
		margin-top: 0
	}

	.record-left {
		gap: 10rpx;
		min-width: 0;
		flex: 1
	}

	.record-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		background: #fef2f2;
		color: #ef4444;
		font-size: 16rpx
	}

	.record-icon.DIET,
	.record-icon.FOOD {
		background: #fff7ed;
		color: #f97316
	}

	.record-icon.EXERCISE,
	.record-icon.ACTIVITY {
		background: #eff6ff;
		color: #3b82f6
	}

	.record-icon.MEDICINE,
	.record-icon.MEDICATION {
		background: #faf5ff;
		color: #a855f7
	}

	.record-title {
		font-size: 28rpx;
		color: #1f2937
	}

	.record-time {
		font-size: 24rpx;
		color: #9ca3af
	}

	.source-tag {
		padding: 4rpx 10rpx;
		border-radius: 6rpx;
		font-size: 20rpx
	}

	.source-sync {
		background: #E6F7F2;
		color: #00B386
	}

	.source-manual {
		background: #f3f4f6;
		color: #6b7280
	}

	.record-right {
		gap: 6rpx;
		flex-shrink: 0
	}

	.record-value {
		max-width: 190rpx;
		color: #00B386;
		font-size: 28rpx;
		font-weight: 600;
		text-align: right
	}

	.empty-record-inline {
		padding: 24rpx 0;
		color: #9ca3af;
		text-align: center;
		font-size: 20rpx
	}

	.floating-add {
		position: fixed;
		left: 5%;
		right: 5%;
		bottom: 160rpx;
		z-index: 40;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		padding: 20rpx 28rpx;
		border-radius: 999rpx;
		background: #00B386;
		color: #fff;
		box-shadow: 0 12rpx 26rpx rgba(0, 179, 134, .24)
	}

	.floating-plus {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		background: #fff;
		color: #00B386;
		font-size: 24rpx;
		font-weight: 700
	}

	.floating-copy {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		line-height: 1.15
	}

	.floating-title {
		font-size: 28rpx;
		font-weight: 700
	}

	.floating-sub {
		margin-top: 2rpx;
		font-size: 20rpx;
		opacity: .8
	}

	.empty-card {
		margin-bottom: 32rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .04)
	}

	.empty-latest-card,
	.empty-trend-card,
	.empty-device-card,
	.empty-record-card {
		padding: 32rpx
	}

	.empty-section-title {
		gap: 16rpx;
		font-size: 32rpx;
		font-weight: 500;
		color: #1f2937
	}

	.empty-title-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		background: #ecfdf5;
		color: #00c48c;
		font-size: 18rpx
	}

	.empty-title-icon.gray {
		background: #f3f4f6;
		color: #6b7280
	}

	.empty-value-row {
		justify-content: space-between;
		align-items: flex-end;
		margin-top: 16rpx
	}

	.empty-number-wrap {
		align-items: flex-end;
		gap: 16rpx
	}

	.empty-number {
		font-size: 72rpx;
		font-weight: 600;
		line-height: 1;
		color: #d1d5db
	}

	.empty-unit {
		margin-bottom: 6rpx;
		color: #9ca3af;
		font-size: 28rpx
	}

	.empty-round-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 96rpx;
		height: 96rpx;
		border: 1rpx solid #f3f4f6;
		border-radius: 50%;
		background: #f9fafb;
		color: #d1d5db;
		font-size: 30rpx
	}

	.empty-meta {
		display: block;
		margin-top: 24rpx;
		color: #9ca3af;
		font-size: 24rpx
	}

	.empty-block-title {
		display: block;
		margin-bottom: 48rpx;
		color: #1f2937;
		font-size: 32rpx;
		font-weight: 500
	}

	.empty-trend-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 64rpx 0
	}

	.empty-chart-symbol {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 128rpx;
		height: 128rpx;
		margin-bottom: 32rpx;
		border-radius: 32rpx;
		background: #f9fafb;
		color: #d1d5db;
		font-size: 48rpx
	}

	.empty-trend-title {
		color: #1f2937;
		font-size: 32rpx;
		font-weight: 500
	}

	.empty-trend-desc {
		margin-top: 8rpx;
		margin-bottom: 48rpx;
		color: #9ca3af;
		font-size: 24rpx;
		text-align: center
	}

	.empty-outline-button {
		margin-top: 0;
		padding: 16rpx 48rpx;
		border: 2rpx solid #00c48c;
		border-radius: 999rpx;
		color: #00c48c;
		font-size: 28rpx;
		font-weight: 500;
		line-height: 1
	}

	.empty-device-card .empty-section-title {
		margin-bottom: 32rpx
	}

	.empty-device-row {
		justify-content: space-between
	}

	.empty-device-left {
		gap: 24rpx;
		min-width: 0
	}

	.empty-device-logo {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 96rpx;
		height: 96rpx;
		border: 1rpx solid #f3f4f6;
		border-radius: 50%;
		background: #f9fafb;
		color: #d1d5db;
		font-size: 28rpx
	}

	.empty-device-copy {
		max-width: 320rpx
	}

	.empty-device-name {
		display: block;
		color: #1f2937;
		font-size: 28rpx;
		font-weight: 500
	}

	.empty-device-desc {
		display: block;
		margin-top: 8rpx;
		color: #6b7280;
		font-size: 24rpx;
		line-height: 1.35
	}

	.empty-outline-button.device-auth {
		margin-top: 0;
		padding: 12rpx 32rpx;
		white-space: nowrap
	}

	.authorized-pill {
		padding: 12rpx 28rpx;
		border-radius: 999rpx;
		background: #ecfdf5;
		color: #00c48c;
		font-size: 28rpx;
		white-space: nowrap
	}

	.empty-record-card .empty-section-title {
		margin-bottom: 32rpx
	}

	.empty-record-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48rpx 0
	}

	.empty-record-title {
		color: #6b7280;
		font-size: 28rpx
	}

	.empty-record-desc {
		margin-top: 8rpx;
		margin-bottom: 48rpx;
		color: #9ca3af;
		font-size: 24rpx
	}

	.empty-record-body .empty-outline-button {
		margin-top: 0
	}

	.compact-records {
		padding-top: 4rpx
	}
</style>
