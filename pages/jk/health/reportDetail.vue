<template>
	<view class="report-page">
		<view class="page-nav">
			<view class="page-nav__back" @tap="back">‹</view>
			<text class="page-nav__title">健康报告</text>
		</view>
		<view class="content">
			<view v-if="error" class="state-error"><text>{{error}}</text><text @tap="load">重新加载</text></view>

			<!-- 报告预览（仅数字报告有） -->
			<view v-if="digital" class="preview-card">
				<view class="preview-head">
					<view class="preview-icon">
						<view class="preview-chart">
							<view class="bar" style="height:16rpx"></view>
							<view class="bar" style="height:32rpx"></view>
							<view class="bar" style="height:24rpx"></view>
							<view class="bar" style="height:40rpx"></view>
						</view>
					</view>
					<view class="preview-main">
						<view class="preview-title-row">
							<text class="preview-title">{{digitalTitle}}</text>
							<text class="preview-tag">数字报告</text>
						</view>
						<text class="preview-period">{{digitalMetrics.period}}</text>
						<text class="preview-time">生成时间：{{formatDate(digital.summary.createTime)}}</text>
					</view>
				</view>
				<view class="preview-metrics">
					<view class="preview-metric">
						<text class="preview-metric__label">平均血糖</text>
						<text class="preview-metric__value">{{digitalMetrics.mean}}<text class="preview-metric__unit">mmol/L</text></text>
					</view>
					<view class="preview-metric">
						<text class="preview-metric__label">达标时间 TIR</text>
						<text class="preview-metric__value">{{digitalMetrics.tir}}<text class="preview-metric__unit">%</text></text>
					</view>
					<view class="preview-metric">
						<text class="preview-metric__label">监测天数</text>
						<text class="preview-metric__value">{{digitalMetrics.dayNum}}<text class="preview-metric__unit">天</text></text>
					</view>
				</view>
			</view>

			<!-- 数字报告详情 -->
			<view class="section-card">
				<view class="section-head">
					<view class="section-title-wrap"><text class="section-dot section-dot--digital"></text><text
							class="section-title">数字报告</text></view>
					<text v-if="digitalMetrics.period" class="section-sub">{{digitalMetrics.period}}</text>
				</view>
				<template v-if="digital">
					<view class="grid">
						<view class="grid-item"><text class="grid-label">平均血糖</text><text
								class="grid-value">{{digitalMetrics.mean}}<text class="grid-unit">mmol/L</text></text></view>
						<view class="grid-item"><text class="grid-label">血糖变异系数 CV</text><text
								class="grid-value">{{digitalMetrics.cv}}%</text></view>
						<view class="grid-item"><text class="grid-label">血糖管理指数 GMI</text><text
								class="grid-value">{{digitalMetrics.gmi}}%</text></view>
						<view class="grid-item"><text class="grid-label">达标时间 TIR</text><text
								class="grid-value">{{digitalMetrics.tir}}%</text></view>
						<view class="grid-item"><text class="grid-label">1级高血糖 TAR</text><text
								class="grid-value warn">{{digitalMetrics.tar1}}%</text></view>
						<view class="grid-item"><text class="grid-label">2级高血糖 TAR</text><text
								class="grid-value warn">{{digitalMetrics.tar2}}%</text></view>
						<view class="grid-item"><text class="grid-label">1级低血糖 TBR</text><text
								class="grid-value low">{{digitalMetrics.tbr1}}%</text></view>
						<view class="grid-item"><text class="grid-label">2级低血糖 TBR</text><text
								class="grid-value low">{{digitalMetrics.tbr2}}%</text></view>
						<view class="grid-item full"><text class="grid-label">监测天数</text><text
								class="grid-value">{{digitalMetrics.dayNum}} 天</text></view>
					</view>
				</template>
				<view v-else class="empty">暂无数字报告（三诺数据同步后可查看）</view>
			</view>

			<!-- 文件报告 -->
			<view class="section-card">
				<view class="section-head">
					<view class="section-title-wrap"><text class="section-dot section-dot--file"></text><text
							class="section-title">文件报告</text></view>
				</view>
				<template v-if="pdfInfo">
					<view class="file-card">
						<view class="file-icon">📄</view>
						<view class="file-copy">
							<text class="file-name">{{pdfInfo.name}}</text>
							<text class="file-size">{{formatSize(pdfInfo.size)}}</text>
						</view>
					</view>
					<view class="file-actions">
						<view class="btn btn--primary" @tap="previewFile(pdfInfo.id)">在线预览</view>
						<view class="btn btn--outline" @tap="downloadFile(pdfInfo.id)">下载到本地</view>
					</view>
				</template>
				<view v-else class="empty">暂无文件报告（三诺生成 PDF 后可查看）</view>
			</view>

			<!-- 报告信息 -->
			<view class="section-card">
				<view class="section-head">
					<view class="section-title-wrap"><text class="section-dot section-dot--info"></text><text
							class="section-title">报告信息</text></view>
				</view>
				<view class="info-list">
					<view class="info-row">
						<text class="info-label">数据来源</text>
						<text class="info-value">三诺健康服务</text>
					</view>
					<view class="info-row">
						<text class="info-label">设备编号</text>
						<text class="info-value">{{maskDevice(deviceSn)}}</text>
					</view>
					<view class="info-row">
						<text class="info-label">生成时间</text>
						<text class="info-value">{{formatDate(createTime)}}</text>
					</view>
				</view>
			</view>

			<view class="disclaimer">
				本报告基于三诺同步的健康数据整理，仅用于健康记录回顾，不构成医疗诊断或治疗建议。
			</view>
		</view>
	</view>
</template>
<script>
	import {
		getSinocareHealthReportList,
		getSinocareHealthReportDetail
	} from '@/api/health.js';
	import {
		HTTP_REQUEST_URL,
		TOKENNAME
	} from '@/config/app';
	import store from '@/store';

	function pick(res, fallback) {
		return res && res.data !== undefined ? res.data : (res || fallback);
	}

	export default {
		data() {
			return {
				digital: null,
				pdf: null,
				error: '',
				loading: false
			}
		},
		computed: {
			digitalMetrics() {
				const p = this.digital ? this.digital.payload : {};
				const cgm = p.cgmDetail || {};
				const base = Array.isArray(cgm.base) && cgm.base[0] ? cgm.base[0] : {};
				const tr = Array.isArray(cgm.tr) && cgm.tr[0] ? cgm.tr[0] : {};
				const val = (o) => (o && o.value != null ? o.value : '--');
				const begin = p.beginDate || '';
				const end = p.endDate || '';
				const period = begin && end ? `${begin} 至 ${end}` : (this.digital && this.digital.summary && this.digital.summary.periodText) || '';
				return {
					dayNum: cgm.dayNum != null ? cgm.dayNum : '--',
					mean: base.mean != null ? base.mean : '--',
					cv: base.cv != null ? base.cv : '--',
					gmi: base.gmi != null ? base.gmi : '--',
					tir: val(tr.tir),
					tar1: val(tr.tar1),
					tar2: val(tr.tar2),
					tbr1: val(tr.tbr1),
					tbr2: val(tr.tbr2),
					period
				}
			},
			digitalTitle() {
				const p = this.digital ? this.digital.payload : {};
				const begin = p.beginDate || '';
				const end = p.endDate || '';
				if (!begin || !end) return '三诺数字报告';
				const days = Math.max(1, Math.ceil((new Date(end).getTime() - new Date(begin).getTime()) / 86400000) + 1);
				if (days <= 1) return '血糖日报';
				if (days <= 7) return '血糖周报';
				if (days <= 31) return '血糖月报';
				return '血糖阶段报告';
			},
			pdfInfo() {
				if (!this.pdf) return null;
				const s = this.pdf.summary || {};
				const p = this.pdf.payload || {};
				return {
					id: s.id,
					name: s.fileName || p.name || '三诺健康管理评估报告.pdf',
					size: s.fileSize || p.size || 0
				}
			},
			deviceSn() {
				if (this.digital && this.digital.summary && this.digital.summary.deviceSn) return this.digital.summary.deviceSn;
				if (this.digital && this.digital.payload && this.digital.payload.deviceSn) return this.digital.payload.deviceSn;
				if (this.pdf && this.pdf.summary && this.pdf.summary.deviceSn) return this.pdf.summary.deviceSn;
				if (this.pdf && this.pdf.payload && this.pdf.payload.deviceSn) return this.pdf.payload.deviceSn;
				return '';
			},
			createTime() {
				if (this.digital && this.digital.summary && this.digital.summary.createTime) return this.digital.summary.createTime;
				if (this.pdf && this.pdf.summary && this.pdf.summary.createTime) return this.pdf.summary.createTime;
				return '';
			}
		},
		onLoad() {
			this.load()
		},
		methods: {
			load() {
				if (this.loading) return;
				this.loading = true;
				this.error = '';
				Promise.all([this.fetchLatest('DIGITAL'), this.fetchLatest('PDF')])
					.then(([d, f]) => {
						this.digital = d;
						this.pdf = f;
					})
					.catch(() => this.error = '加载失败，请检查网络后重新加载')
					.finally(() => this.loading = false)
			},
			async fetchLatest(type) {
				const listRes = await getSinocareHealthReportList({
					reportType: type,
					limit: 1
				});
				const list = pick(listRes, []);
				if (!Array.isArray(list) || !list.length) return null;
				const summary = list[0];
				const detailRes = await getSinocareHealthReportDetail(summary.id);
				const detail = pick(detailRes, {});
				const payload = this.parsePayload(detail.payload);
				return {
					summary,
					detail,
					payload
				}
			},
			parsePayload(payload) {
				if (!payload) return {};
				if (typeof payload === 'object') return payload;
				try {
					const parsed = JSON.parse(payload);
					return parsed && typeof parsed === 'object' ? parsed : {}
				} catch (e) {
					return {}
				}
			},
			formatDate(x) {
				return String(x || '--').slice(0, 16).replace('T', ' ');
			},
			formatSize(bytes) {
				const n = Number(bytes) || 0;
				if (n < 1024) return n + ' B';
				if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
				return (n / 1024 / 1024).toFixed(1) + ' MB'
			},
			maskDevice(sn) {
				if (!sn) return '--';
				const s = String(sn);
				if (s.length <= 4) return s;
				return '****' + s.slice(-4);
			},
			fileUrl(id) {
				if (!id) return '';
				return HTTP_REQUEST_URL + '/api/front/jk/health/sinocare/report/' + id + '/file';
			},
			authHeader() {
				const header = {};
				const token = store.state.app.token;
				if (token) header[TOKENNAME] = token;
				return header;
			},
			previewFile(id) {
				const url = this.fileUrl(id);
				if (!url) return;
				// #ifdef H5
				window.open(url, '_blank');
				// #endif
				// #ifndef H5
				uni.navigateTo({
					url: '/pages/users/web_page/index?webUel=' + encodeURIComponent(url) + '&title=' + encodeURIComponent('报告预览')
				});
				// #endif
			},
			downloadFile(id) {
				const url = this.fileUrl(id);
				if (!url) return;
				uni.showLoading({ title: '正在下载报告' });
				uni.downloadFile({
					url,
					header: this.authHeader(),
					success: (res) => {
						if (res.statusCode === 200) {
							uni.openDocument({
								filePath: res.tempFilePath,
								fileType: 'pdf',
								showMenu: true,
								fail: () => uni.showToast({ title: '打开失败', icon: 'none' })
							});
						} else {
							uni.showToast({ title: '下载失败', icon: 'none' });
						}
					},
					fail: () => uni.showToast({ title: '下载失败', icon: 'none' }),
					complete: () => uni.hideLoading()
				})
			},
			back() {
				const pages = getCurrentPages();
				if (pages && pages.length > 1) {
					uni.navigateBack();
				} else {
					uni.switchTab({ url: '/pages/health/index' });
				}
			}
		}
	};
</script>
<style lang="scss" scoped>
	.report-page {
		min-height: 100vh;
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
		background: #fff
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

	.content {
		padding: 24rpx 32rpx 48rpx
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

	.preview-card,
	.section-card {
		background: #fff;
		border-radius: 32rpx;
		box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, .04)
	}

	.preview-card {
		padding: 32rpx;
		margin-bottom: 24rpx
	}

	.preview-head {
		display: flex;
		align-items: flex-start
	}

	.preview-icon {
		width: 88rpx;
		height: 88rpx;
		border-radius: 20rpx;
		background: #e6f9f3;
		display: flex;
		align-items: center;
		justify-content: center;
		flex: none;
		margin-right: 24rpx
	}

	.preview-chart {
		display: flex;
		align-items: flex-end;
		gap: 6rpx;
		height: 44rpx
	}

	.preview-chart .bar {
		width: 10rpx;
		border-radius: 5rpx;
		background: #00a870
	}

	.preview-main {
		flex: 1;
		min-width: 0
	}

	.preview-title-row {
		display: flex;
		align-items: center;
		gap: 12rpx
	}

	.preview-title {
		color: #111827;
		font-size: 32rpx;
		font-weight: 600
	}

	.preview-tag {
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		background: #eff6ff;
		color: #3b82f6;
		font-size: 20rpx
	}

	.preview-period {
		display: block;
		margin-top: 10rpx;
		color: #666;
		font-size: 24rpx
	}

	.preview-time {
		display: block;
		margin-top: 6rpx;
		color: #999;
		font-size: 22rpx
	}

	.preview-metrics {
		display: flex;
		margin-top: 28rpx;
		padding-top: 28rpx;
		border-top: 1rpx solid #f3f4f6
	}

	.preview-metric {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 0
	}

	.preview-metric__label {
		color: #999;
		font-size: 20rpx
	}

	.preview-metric__value {
		margin-top: 10rpx;
		color: #00a870;
		font-size: 40rpx;
		font-weight: 700
	}

	.preview-metric__unit {
		margin-left: 4rpx;
		color: #999;
		font-size: 20rpx;
		font-weight: 400
	}

	.section-card {
		padding: 32rpx;
		margin-top: 24rpx
	}

	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between
	}

	.section-title-wrap {
		display: flex;
		align-items: center;
		gap: 12rpx
	}

	.section-dot {
		width: 12rpx;
		height: 28rpx;
		border-radius: 6rpx
	}

	.section-dot--digital {
		background: #3b82f6
	}

	.section-dot--file {
		background: #fa8c16
	}

	.section-dot--info {
		background: #9ca3af
	}

	.section-title {
		color: #111827;
		font-size: 30rpx;
		font-weight: 600
	}

	.section-sub {
		color: #999;
		font-size: 23rpx
	}

	.grid {
		display: flex;
		flex-wrap: wrap;
		margin-top: 28rpx
	}

	.grid-item {
		display: flex;
		flex-direction: column;
		width: 50%;
		padding: 20rpx 0;
		border-top: 1rpx solid #f3f4f6
	}

	.grid-item.full {
		width: 100%
	}

	.grid-label {
		color: #666;
		font-size: 23rpx
	}

	.grid-value {
		margin-top: 10rpx;
		color: #111827;
		font-size: 32rpx;
		font-weight: 600
	}

	.grid-unit {
		margin-left: 4rpx;
		color: #999;
		font-size: 20rpx;
		font-weight: 400
	}

	.grid-value.warn {
		color: #fa8c16
	}

	.grid-value.low {
		color: #ef4444
	}

	.file-card {
		display: flex;
		align-items: center;
		margin-top: 28rpx;
		padding: 28rpx;
		border: 1rpx solid #f3f4f6;
		border-radius: 24rpx;
		background: #f9fafb
	}

	.file-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80rpx;
		height: 80rpx;
		margin-right: 24rpx;
		border-radius: 16rpx;
		background: #fff1e6;
		font-size: 40rpx;
		flex: none
	}

	.file-copy {
		min-width: 0;
		flex: 1
	}

	.file-name {
		display: block;
		color: #111827;
		font-size: 26rpx;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis
	}

	.file-size {
		display: block;
		margin-top: 8rpx;
		color: #999;
		font-size: 22rpx
	}

	.file-actions {
		margin-top: 24rpx;
		display: flex;
		justify-content: flex-end;
		gap: 16rpx
	}

	.btn {
		padding: 16rpx 32rpx;
		border-radius: 40rpx;
		font-size: 26rpx
	}

	.btn--primary {
		background: #00a870;
		color: #fff
	}

	.btn--outline {
		background: #fff;
		color: #00a870;
		border: 1rpx solid #00a870
	}

	.info-list {
		margin-top: 16rpx
	}

	.info-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 22rpx 0;
		border-bottom: 1rpx solid #f3f4f6
	}

	.info-row:last-child {
		border-bottom: none
	}

	.info-label {
		color: #666;
		font-size: 26rpx
	}

	.info-value {
		color: #111827;
		font-size: 26rpx
	}

	.empty {
		margin-top: 24rpx;
		padding: 40rpx 0;
		color: #999;
		font-size: 24rpx;
		text-align: center
	}

	.disclaimer {
		margin: 32rpx 10rpx 0;
		color: #999;
		font-size: 21rpx;
		line-height: 1.7;
		text-align: center
	}
</style>
