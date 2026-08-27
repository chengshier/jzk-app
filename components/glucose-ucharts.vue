<template>
	<view class="guc">
		<block v-if="chartData.categories.length">
			<qiun-data-charts
				:style="chartStyle"
				type="line"
				:canvasId="canvasId"
				:canvas2d="true"
				:ontouch="true"
				:tooltipShow="true"
				:ontap="true"
				:onmovetip="mode === 'detail'"
				:openmouse="true"
				:opts="chartOpts"
				:chartData="chartData"
				:animation="false"
			/>
			<view v-if="hasTimeline" class="guc-timeline">
				<text class="guc-timeline-label">{{ timelineStartLabel }}</text>
				<slider
					class="guc-timeline-slider"
					:min="0"
					:max="timelineMax"
					:value="resolvedTimelineStart"
					:step="1"
					activeColor="#00B386"
					backgroundColor="#E7EEF0"
					block-color="#00B386"
					:block-size="14"
					@changing="onTimelineChanging"
					@change="onTimelineChange"
				/>
				<text class="guc-timeline-label guc-timeline-label-right">{{ timelineEndLabel }}</text>
			</view>
		</block>
		<view v-else class="guc-empty">暂无可绘制数据</view>
	</view>
</template>

<script>
export default {
	name: 'GlucoseUCharts',
	data() {
		return {
			timelineStart: null
		}
	},
	props: {
		records: {
			type: Array,
			default: () => []
		},
		mode: {
			type: String,
			default: 'summary' // summary | detail
		},
		rangeType: {
			type: String,
			default: 'DAY' // DAY | WEEK | MONTH
		},
		maxY: {
			type: Number,
			default: 15
		},
		heightRpx: {
			type: Number,
			default: 320
		},
		targetMin: {
			type: [Number, String],
			default: null
		},
		targetMax: {
			type: [Number, String],
			default: null
		},
		canvasId: {
			type: String,
			default: 'glucoseUChart'
		}
	},
	computed: {
		chartStyle() {
			return 'width:100%;height:' + (Number(this.heightRpx) || 320) + 'rpx;'
		},
		normalizedRows() {
			const rows = Array.isArray(this.records) ? this.records : []

			return rows
				.map((item, index) => {
					const rawValue = item && item.numericValue != null
						? item.numericValue
						: (item ? item.value : null)
					const value = Number(rawValue)
					const rawTime = item
						? (item.measuredAt || item.recordedAt || item.time || item.collectedAt || item.dataTime || item.createTime || '')
						: ''
					const timestamp = this.parseTime(rawTime)

					if (!Number.isFinite(value) || value <= 0 || !timestamp) return null

					return {
						value,
						timestamp,
						rawTime: String(rawTime || ''),
						source: this.sourceText(item),
						originalIndex: index
					}
				})
				.filter(Boolean)
				.sort((a, b) => a.timestamp - b.timestamp)
		},

		displayRows() {
			const rows = this.normalizedRows
			if (!rows.length) return []

			// 首页：今天最多约 480 个点，直接给 uCharts；
			// 7天首页做 30 分钟桶，避免一次塞 3000+ 点。
			// 详情页：
			// DAY 保留原始 3 分钟数据；
			// WEEK 用 30 分钟桶；
			// MONTH 用 2 小时桶。
			let bucketMinutes = 0

			if (this.rangeType === 'WEEK') bucketMinutes = 30
			else if (this.rangeType === 'MONTH') bucketMinutes = 120

			if (!bucketMinutes) return rows

			return this.minMaxBucket(rows, bucketMinutes)
		},

		itemCount() {
			if (this.mode !== 'detail') return 0

			// 默认视窗：
			// DAY: 40 个 * 3分钟 ≈ 2小时
			// WEEK: 48 个 * 30分钟 ≈ 24小时
			// MONTH: 12 个 * 2小时 ≈ 24小时
			if (this.rangeType === 'DAY') return 40
			if (this.rangeType === 'WEEK') return 48
			return 12
		},

		hasTimeline() {
			return this.mode === 'detail' &&
				this.itemCount > 0 &&
				this.displayRows.length > this.itemCount
		},

		timelineMax() {
			return Math.max(0, this.displayRows.length - this.itemCount)
		},

		resolvedTimelineStart() {
			const start = this.timelineStart === null
				? this.timelineMax
				: Number(this.timelineStart)
			return Math.min(this.timelineMax, Math.max(0, Number.isFinite(start) ? start : 0))
		},

		visibleRows() {
			if (!this.hasTimeline) return this.displayRows
			const start = this.resolvedTimelineStart
			return this.displayRows.slice(start, start + this.itemCount)
		},

		timelineStartLabel() {
			const row = this.visibleRows[0]
			return row ? this.formatCategory(row.timestamp) : ''
		},

		timelineEndLabel() {
			const row = this.visibleRows[this.visibleRows.length - 1]
			return row ? this.formatCategory(row.timestamp) : ''
		},

		chartData() {
			const rows = this.visibleRows

			return {
				categories: rows.map(x => this.formatCategory(x.timestamp)),
				series: [{
					name: '血糖',
					data: rows.map(x => Number(x.value.toFixed(2))),
					format: 'mmol/L'
				}]
			}
		},

		chartOpts() {
			const detail = this.mode === 'detail'
			const opts = {
				color: ['#00B386'],
				padding: detail ? [10, 10, 0, 2] : [8, 8, 0, 2],
				// 时间范围由下方原生 slider 控制；关闭 qiun 内置滚动，
				// 让用户既能拖时间轴，也能点按曲线查看提示。
				enableScroll: false,
				dataLabel: false,
				dataPointShape: true,
				dataPointShapeType: 'solid',
				legend: {
					show: false
				},
				xAxis: {
					labelCount: 4,
					disableGrid: true,
					axisLine: false,
					fontColor: '#8A92A6',
					fontSize: 10,
					rotateLabel: false,
					scrollShow: false
				},
				yAxis: {
					disabled: false,
					disableGrid: false,
					gridType: 'solid',
					gridColor: '#F3F4F6',
					splitNumber: 3,
					data: [{
						min: 0,
						max: Number(this.maxY) || 15,
						tofix: 0,
						fontColor: '#8A92A6',
						fontSize: 10,
						axisLine: false
					}]
				},
				extra: {
					line: {
						type: 'curve',
						width: 3,
						activeType: 'solid'
					},
					tooltip: {
						showBox: true,
						showArrow: true,
						showCategory: true,
						borderWidth: 0,
						borderRadius: 6,
						bgColor: '#232D42',
						bgOpacity: 0.92,
						fontColor: '#FFFFFF',
						gridType: 'solid',
						gridColor: '#00B386',
						dashLength: 4,
						splitLine: true
					}
				}
			}

			return opts
		}
	},
	methods: {
		onTimelineChanging(event) {
			this.timelineStart = Number(event && event.detail ? event.detail.value : 0)
		},

		onTimelineChange(event) {
			this.onTimelineChanging(event)
		},

		parseTime(input) {
			if (input === null || input === undefined || input === '') return 0

			if (typeof input === 'number') {
				if (!Number.isFinite(input)) return 0
				return input < 100000000000 ? input * 1000 : input
			}

			const str = String(input).trim()
			if (!str) return 0

			if (/^\d{10,13}$/.test(str)) {
				const n = Number(str)
				return str.length === 10 ? n * 1000 : n
			}

			// 带时区 ISO 字符串，例如 2026-08-20T07:30:00.000Z
			if (/T/.test(str) && /(Z|[+-]\d{2}:?\d{2})$/i.test(str)) {
				const ts = new Date(str).getTime()
				return Number.isFinite(ts) ? ts : 0
			}

			// 后端实际返回的 yyyy-MM-dd HH:mm:ss，手动解析避免小程序兼容问题。
			const m = str.match(
				/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/
			)

			if (m) {
				const ts = new Date(
					Number(m[1]),
					Number(m[2]) - 1,
					Number(m[3]),
					Number(m[4]),
					Number(m[5]),
					Number(m[6] || 0),
					0
				).getTime()

				return Number.isFinite(ts) ? ts : 0
			}

			const ts = new Date(str).getTime()
			return Number.isFinite(ts) ? ts : 0
		},

		sourceText(item) {
			const source = item && (
				item.sourceName ||
				item.sourceText ||
				item.sourceType ||
				item.source
			)

			if (source === 'DEVICE_SYNC' || source === 'DEVICE') return '三诺 CGM'
			return source || '三诺 CGM'
		},

		formatCategory(ts) {
			const d = new Date(ts)
			const hh = this.pad2(d.getHours())
			const mm = this.pad2(d.getMinutes())

			if (this.rangeType === 'DAY') {
				return hh + ':' + mm
			}

			return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + hh + ':' + mm
		},

		pad2(v) {
			return Number(v) < 10 ? '0' + Number(v) : String(Number(v))
		},

		minMaxBucket(rows, bucketMinutes) {
			if (!rows.length || !bucketMinutes) return rows.slice()

			const bucketMs = bucketMinutes * 60 * 1000
			const buckets = {}

			rows.forEach(item => {
				const key = Math.floor(item.timestamp / bucketMs)

				if (!buckets[key]) {
					buckets[key] = {
						min: item,
						max: item
					}
					return
				}

				if (item.value < buckets[key].min.value) buckets[key].min = item
				if (item.value > buckets[key].max.value) buckets[key].max = item
			})

			const result = []

			Object.keys(buckets)
				.sort((a, b) => Number(a) - Number(b))
				.forEach(key => {
					const bucket = buckets[key]
					if (bucket.min === bucket.max) {
						result.push(bucket.min)
					} else if (bucket.min.timestamp <= bucket.max.timestamp) {
						result.push(bucket.min, bucket.max)
					} else {
						result.push(bucket.max, bucket.min)
					}
				})

			return result.sort((a, b) => a.timestamp - b.timestamp)
		}
	}
}
</script>

<style scoped>
.guc {
	width: 100%;
	height: 100%;
}

.guc-timeline {
	display: flex;
	align-items: center;
	gap: 8rpx;
	width: 100%;
	padding: 0 4rpx 6rpx;
	box-sizing: border-box;
}

.guc-timeline-slider {
	flex: 1;
	min-width: 0;
	margin: 0;
}

.guc-timeline-label {
	flex: 0 0 76rpx;
	color: #8a92a6;
	font-size: 18rpx;
	line-height: 28rpx;
	white-space: nowrap;
}

.guc-timeline-label-right {
	text-align: right;
}

.guc-empty {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	color: #9ca3af;
	font-size: 22rpx;
}
</style>
