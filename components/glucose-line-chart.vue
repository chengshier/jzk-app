<template>
	<view class="glc">
		<!-- 主图 -->
		<view class="glc-chart-wrap" :style="{ height: heightRpx + 'rpx' }">
		<canvas
			class="glc-canvas"
			:id="cid"
			type="2d"
			@touchstart="onChartTouch"
			@touchmove="onChartTouch"
			@touchend="onChartTouchEnd"
			@touchcancel="onChartTouchCancel"
		></canvas>

			<!-- Tooltip：松手后保留，不再一松手就消失 -->
			<view v-if="tip && showTooltip" class="glc-tip" :style="tipStyle">
				<text v-if="tip.time" class="glc-tip-time">{{ tip.time }}</text>
				<text class="glc-tip-val">{{ tip.value }} mmol/L</text>
				<text v-if="tip.source" class="glc-tip-source">{{ tip.source }}</text>
			</view>
		</view>

		<!-- 时间窗口 / 导航轴 -->
		<view v-if="showNavigator && hasData" class="glc-navigator">
			<view class="glc-window-row">
				<text class="glc-window-text">{{ viewRangeText }}</text>
				<text v-if="!followLatest" class="glc-latest" @tap="jumpToLatest">回到最新</text>
			</view>

			<movable-area id="glcNavArea" class="glc-nav-area">
				<view class="glc-nav-track"></view>
				<view class="glc-nav-center-line"></view>

				<movable-view
					class="glc-nav-window"
					direction="horizontal"
					:x="navX"
					:style="{ width: navWindowWidthPx + 'px' }"
					:out-of-bounds="false"
					:damping="30"
					@change="onNavigatorChange"
					@touchend="onNavigatorTouchEnd"
				>
					<view class="glc-nav-handle glc-nav-handle-left"></view>
					<view class="glc-nav-handle glc-nav-handle-right"></view>
				</movable-view>
			</movable-area>

			<view class="glc-nav-labels">
				<text>{{ fullStartText }}</text>
				<text>{{ fullEndText }}</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'GlucoseLineChart',

	props: {
		// 血糖数值数组（mmol/L）
		points: {
			type: Array,
			default: () => []
		},

		// 与 points 等长的时间
		// 推荐直接传完整时间，例如：2026-08-20 14:36:00
		times: {
			type: Array,
			default: () => []
		},

		// 可选：与 points 等长的数据来源，如“三诺 CGM”
		sources: {
			type: Array,
			default: () => []
		},

		color: {
			type: String,
			default: '#00B386'
		},

		// 图表高度
		heightRpx: {
			type: Number,
			default: 320
		},

		minY: {
			type: Number,
			default: 0
		},

		maxY: {
			type: Number,
			default: 15
		},

		// today / week / month
		rangeType: {
			type: String,
			default: 'today'
		},

		// 三诺 CGM 当前约 3 分钟一条。
		// 当 times 缺失或部分解析失败时，用它补时间轴。
		intervalMinutes: {
			type: Number,
			default: 3
		},

		// 默认时间窗口：
		// 今日：最近 2 小时
		// 7天：最近 24 小时
		// 30天：最近 24 小时
		windowMinutes: {
			type: Object,
			default: () => ({
				today: 120,
				day: 120,
				'1d': 120,
				week: 1440,
				'7d': 1440,
				month: 1440,
				'30d': 1440
			})
		},

		// 最大实际绘制点数量。
		// 超出后使用 min-max sampling，避免数千个点卡顿。
		maxRenderPoints: {
			type: Number,
			default: 240
		},

		// 数据量小于该值时才显示所有圆点；
		// 3 分钟一条的 CGM 数据不会再画成“绿色珠链”。
		pointVisibleLimit: {
			type: Number,
			default: 24
		},

		// 小于等于此值认为不是有效 CGM 血糖值，防止 null -> 0 后曲线突然掉到底部。
		minValidValue: {
			type: Number,
			default: 0.1
		},

		showTooltip: {
			type: Boolean,
			default: true
		},

		showNavigator: {
			type: Boolean,
			default: true
		},

		// 可选：真实目标范围。
		// 只有上下限都存在时才绘制，不自行假设目标值。
		targetMin: {
			type: [Number, String],
			default: null
		},

		targetMax: {
			type: [Number, String],
			default: null
		},

		// 如果页面已经知道查询范围，可传入。
		// 不传则按当前数据最早/最晚时间自动计算。
		rangeStart: {
			type: [Number, String],
			default: null
		},

		rangeEnd: {
			type: [Number, String],
			default: null
		},

		// 新 CGM 数据到来时，如果用户仍在查看最新窗口，就自动跟到最新。
		autoFollowLatest: {
			type: Boolean,
			default: true
		}
	},

	data() {
		return {
			cid: 'glc' + Math.random().toString(36).slice(2, 9),

			// CSS 尺寸
			w: 300,
			h: 150,

			// Canvas buffer 尺寸
			bufW: 300,
			bufH: 150,
			dpr: 1,

			rectLeft: 0,

			// 导航轴尺寸
			navWidth: 300,
			navX: 0,
			navWindowWidthPx: 48,
			navMinWidthPx: 36,
			internalNavMoving: false,

			// 标准化后的完整数据
			fullData: [],

			fullStart: 0,
			fullEnd: 0,
			viewStart: 0,
			viewEnd: 0,

			followLatest: true,

			// 当前主图实际绘制坐标（抽样后）
			coords: [],
			visibleRaw: [],

			tip: null,
			tipStyle: '',
			selectedPoint: null,

			ready: false,
			pendingRangeReset: true,

			drawTimer: null,
			refreshTimer: null,

			// Canvas 2D 节点与上下文（替代旧的 createCanvasContext）
			canvasNode: null,
			ctx2d: null
		}
	},

	computed: {
		hasData() {
			return this.fullData.length > 0
		},

		viewRangeText() {
			if (!this.viewStart || !this.viewEnd) return ''
			return this.formatRange(this.viewStart, this.viewEnd)
		},

		fullStartText() {
			return this.fullStart ? this.formatAxisTime(this.fullStart, true) : ''
		},

		fullEndText() {
			return this.fullEnd ? this.formatAxisTime(this.fullEnd, true) : ''
		}
	},

	watch: {
		points: {
			handler() {
				this.scheduleRefresh(false)
			},
			deep: true
		},

		times: {
			handler() {
				this.scheduleRefresh(false)
			},
			deep: true
		},

		sources: {
			handler() {
				this.scheduleRefresh(false)
			},
			deep: true
		},

		rangeType() {
			// 先让旧数据立即按新范围重置一次，避免按钮切换后画面完全不动；
			// 同时保留 pendingRangeReset，等接口新数据到达后再重置一次。
			this.pendingRangeReset = true
			this.clearSelection()

			if (this.ready) {
				this.refreshData(true)
				this.pendingRangeReset = true
			}
		},

		targetMin() {
			this.scheduleDraw()
		},

		targetMax() {
			this.scheduleDraw()
		}
	},

	mounted() {
		this.$nextTick(() => {
			this.measure(() => {
				this.ready = true
				this.refreshData(true)
			})
		})
	},

	beforeDestroy() {
		if (this.drawTimer) clearTimeout(this.drawTimer)
		if (this.refreshTimer) clearTimeout(this.refreshTimer)
	},

	methods: {
		/**
		 * 页面布局发生变化时可以由父页面通过 ref 主动调用：
		 * this.$refs.chart.resize()
		 */
		resize() {
			this.$nextTick(() => {
				this.measure(() => {
					this.updateNavigatorGeometry()
					this.scheduleDraw(0)
				})
			})
		},

		measureNavigator(done) {
			if (!this.showNavigator || !this.hasData) {
				if (done) done()
				return
			}

			this.$nextTick(() => {
				uni.createSelectorQuery()
					.in(this)
					.select('#glcNavArea')
					.boundingClientRect(rect => {
						if (rect && rect.width) this.navWidth = rect.width
						if (done) done()
					})
					.exec()
			})
		},

		measure(done) {
			let dpr = 1
			try {
				dpr = uni.getSystemInfoSync().pixelRatio || 1
			} catch (e) {}

			this.dpr = dpr

			const query = uni.createSelectorQuery().in(this)
			query.select('#' + this.cid).fields({ node: true, size: true, rect: true })
			if (this.showNavigator) {
				query.select('#glcNavArea').boundingClientRect()
			}

			query.exec(res => {
				const info = res && res[0]
				const navRect = this.showNavigator && res ? res[1] : null

				if (info && info.node && info.width && info.height) {
					this.w = info.width
					this.h = info.height
					this.rectLeft = info.left || 0

					this.bufW = Math.max(1, Math.round(this.w * dpr))
					this.bufH = Math.max(1, Math.round(this.h * dpr))

					// Canvas 2D：直接设置节点的物理像素尺寸，这是唯一能可靠
					// 改变画布缓冲区大小的方式。旧的 canvas-id + createCanvasContext
					// 在首次渲染后不会再响应 width/height 属性变化，导致折线被裁到角落。
					const canvas = info.node
					canvas.width = this.bufW
					canvas.height = this.bufH
					this.canvasNode = canvas
					this.ctx2d = canvas.getContext('2d')
				}

				if (navRect && navRect.width) {
					this.navWidth = navRect.width
				}

				this.$nextTick(() => {
					if (done) done()
				})
			})
		},

		scheduleRefresh(resetWindow) {
			if (!this.ready) return

			if (resetWindow) this.pendingRangeReset = true

			if (this.refreshTimer) clearTimeout(this.refreshTimer)

			// 合并 points / times / sources 同一批更新，避免连续重算 2~3 次。
			this.refreshTimer = setTimeout(() => {
				this.refreshTimer = null
				this.refreshData(this.pendingRangeReset)
			}, 16)
		},

		refreshData(resetWindow) {
			const oldLatest = this.fullData.length
				? this.fullData[this.fullData.length - 1].ts
				: 0

			this.fullData = this.normalizeData()
			
			console.log(
				'glucose fullData',
				this.fullData.slice(0,3),
				this.fullData.slice(-3)
			)
			
			console.log(
				'window',
				this.viewStart,
				this.viewEnd
			)

			if (!this.fullData.length) {
				this.fullStart = 0
				this.fullEnd = 0
				this.viewStart = 0
				this.viewEnd = 0
				this.coords = []
				this.visibleRaw = []
				this.clearSelection()
				this.scheduleDraw(0)
				return
			}

			const firstDataTs = this.fullData[0].ts
			const latestDataTs = this.fullData[this.fullData.length - 1].ts

			const propStart = this.parseTime(this.rangeStart)
			const propEnd = this.parseTime(this.rangeEnd)

			this.fullStart = propStart || firstDataTs
			this.fullEnd = propEnd || latestDataTs

			if (this.fullEnd <= this.fullStart) {
				this.fullStart = firstDataTs
				this.fullEnd = Math.max(latestDataTs, firstDataTs + 60 * 1000)
			}

			const latestChanged = latestDataTs > oldLatest

			if (
				resetWindow ||
				!this.viewStart ||
				!this.viewEnd ||
				(this.autoFollowLatest && this.followLatest && latestChanged)
			) {
				this.setLatestWindow()
			} else {
				this.clampWindow()
			}

			this.pendingRangeReset = false

			// fullData 从空变为有数据后，导航轴才会通过 v-if 真正挂载。
			// 此时再量一次导航轴宽度，避免首次渲染时滑块位置偏移。
			if (this.showNavigator) {
				this.measureNavigator(() => {
					this.updateNavigatorGeometry()
					this.scheduleDraw(0)
				})
			} else {
				this.updateNavigatorGeometry()
				this.scheduleDraw(0)
			}
		},

		normalizeData() {
			const raw = []
			const len = Array.isArray(this.points) ? this.points.length : 0
			const intervalMs = Math.max(1, Number(this.intervalMinutes) || 3) * 60 * 1000

			for (let i = 0; i < len; i++) {
				const n = Number(this.points[i])

				if (!Number.isFinite(n) || n <= this.minValidValue) continue

				raw.push({
					value: n,
					time: this.times[i] || '',
					source: this.sources[i] || '',
					ts: this.parseTime(this.times[i]),
					originalIndex: i
				})
			}

			if (!raw.length) return []

			// 至少存在一个合法时间时，尽量根据相邻点补齐缺失时间。
			let validIndex = -1
			for (let i = 0; i < raw.length; i++) {
				if (raw[i].ts) {
					validIndex = i
					break
				}
			}

			if (validIndex >= 0) {
				// 向前补
				for (let i = validIndex - 1; i >= 0; i--) {
					raw[i].ts = raw[i + 1].ts - intervalMs
				}

				// 向后补
				for (let i = validIndex + 1; i < raw.length; i++) {
					if (!raw[i].ts) {
						raw[i].ts = raw[i - 1].ts + intervalMs
					}
				}
			} else {
				// 完全没有时间时，用“现在”作为最后一点，
				// 按配置的 3 分钟间隔生成时间轴。
				const end = Date.now()
				const start = end - (raw.length - 1) * intervalMs

				raw.forEach((item, i) => {
					item.ts = start + i * intervalMs
				})
			}

			// 接口即使按 DESC 返回，也统一转为时间正序绘图。
			raw.sort((a, b) => a.ts - b.ts)

			return raw
		},

		parseTime(input) {
			if (input === null || input === undefined || input === '') return 0

			if (typeof input === 'number') {
				if (!Number.isFinite(input)) return 0
				// 兼容秒级时间戳
				return input < 100000000000 ? input * 1000 : input
			}

			const str = String(input).trim()

			if (!str) return 0

			// 纯数字时间戳
			if (/^\d{10,13}$/.test(str)) {
				const num = Number(str)
				return str.length === 10 ? num * 1000 : num
			}

			// HH:mm / HH:mm:ss
			if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
				const parts = str.split(':').map(Number)
				const d = new Date()
				d.setHours(parts[0] || 0, parts[1] || 0, parts[2] || 0, 0)
				return d.getTime()
			}

			// 带 Z / +08:00 等时区信息的 ISO 时间必须保留时区直接解析，
			// 否则去掉 Z 会把 UTC 时间误当成本地时间，时间轴会整体偏移。
			if (/T/.test(str) && /(Z|[+-]\d{2}:?\d{2})$/i.test(str)) {
				const isoTs = new Date(str).getTime()
				return Number.isFinite(isoTs) ? isoTs : 0
			}

			// Safari / 部分小程序对 “yyyy-MM-dd HH:mm:ss” 兼容不稳定，
			// 对“无时区”的时间字符串再转成 yyyy/MM/dd HH:mm:ss。
			// 微信小程序对 yyyy-MM-dd HH:mm:ss 兼容不好
			// 手动解析，避免时间变成 0
			
			const match = str.match(
				/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/
			)
			
			if (match) {
			
				const year = Number(match[1])
				const month = Number(match[2]) - 1
				const day = Number(match[3])
				const hour = Number(match[4])
				const minute = Number(match[5])
				const second = Number(match[6] || 0)
			
				return new Date(
					year,
					month,
					day,
					hour,
					minute,
					second
				).getTime()
			
			}
			
			const ts = new Date(str).getTime()
			
			return Number.isFinite(ts) ? ts : 0
		},

		getWindowDuration() {
			const config = this.windowMinutes || {}
			const rawType = String(this.rangeType || '').toLowerCase()

			let normalizedType = rawType
			if (rawType === 'day' || rawType === '1d') normalizedType = 'today'
			if (rawType === '7d') normalizedType = 'week'
			if (rawType === '30d') normalizedType = 'month'

			let minutes = Number(
				config[rawType] !== undefined
					? config[rawType]
					: config[normalizedType]
			)

			if (!Number.isFinite(minutes) || minutes <= 0) {
				minutes = normalizedType === 'today' ? 120 : 1440
			}

			const desired = minutes * 60 * 1000
			const total = Math.max(1, this.fullEnd - this.fullStart)

			return Math.min(desired, total)
		},

		setLatestWindow() {
			if (!this.fullData.length) return

			const latestTs = this.fullData[this.fullData.length - 1].ts
			const duration = this.getWindowDuration()

			this.viewEnd = Math.min(this.fullEnd, latestTs)
			this.viewStart = this.viewEnd - duration

			if (this.viewStart < this.fullStart) {
				this.viewStart = this.fullStart
				this.viewEnd = Math.min(this.fullEnd, this.fullStart + duration)
			}

			this.followLatest = true
			this.clearSelection()
		},

		clampWindow() {
			const duration = Math.max(1, this.viewEnd - this.viewStart)
			const total = Math.max(1, this.fullEnd - this.fullStart)

			if (duration >= total) {
				this.viewStart = this.fullStart
				this.viewEnd = this.fullEnd
				return
			}

			if (this.viewStart < this.fullStart) {
				this.viewStart = this.fullStart
				this.viewEnd = this.viewStart + duration
			}

			if (this.viewEnd > this.fullEnd) {
				this.viewEnd = this.fullEnd
				this.viewStart = this.viewEnd - duration
			}
		},

		updateNavigatorGeometry() {
			if (!this.showNavigator || !this.navWidth || !this.fullStart || !this.fullEnd) return

			const total = Math.max(1, this.fullEnd - this.fullStart)
			const duration = Math.min(total, Math.max(1, this.viewEnd - this.viewStart))

			const proportionalWidth = this.navWidth * (duration / total)
			this.navWindowWidthPx = Math.min(
				this.navWidth,
				Math.max(this.navMinWidthPx, proportionalWidth)
			)

			const movable = Math.max(0, this.navWidth - this.navWindowWidthPx)
			const timeMovable = Math.max(1, total - duration)

			const ratio = Math.max(
				0,
				Math.min(1, (this.viewStart - this.fullStart) / timeMovable)
			)

			this.internalNavMoving = true
			this.navX = movable * ratio

			this.$nextTick(() => {
				setTimeout(() => {
					this.internalNavMoving = false
				}, 0)
			})
		},

		onNavigatorChange(e) {
			if (this.internalNavMoving) return
			if (!e || !e.detail) return
			if (!this.fullStart || !this.fullEnd) return

			const x = Number(e.detail.x)
			if (!Number.isFinite(x)) return

			const total = Math.max(1, this.fullEnd - this.fullStart)
			const duration = Math.min(total, Math.max(1, this.viewEnd - this.viewStart))
			const movable = Math.max(1, this.navWidth - this.navWindowWidthPx)
			const timeMovable = Math.max(0, total - duration)

			const ratio = Math.max(0, Math.min(1, x / movable))

			this.viewStart = this.fullStart + ratio * timeMovable
			this.viewEnd = this.viewStart + duration

			// 用户把窗口拖到最右侧时才继续自动追最新数据。
			this.followLatest = ratio >= 0.985

			this.clearSelection()
			this.scheduleDraw(16)

			this.$emit('window-change', {
				start: this.viewStart,
				end: this.viewEnd,
				followLatest: this.followLatest
			})
		},

		onNavigatorTouchEnd() {
			this.$emit('window-change-end', {
				start: this.viewStart,
				end: this.viewEnd,
				followLatest: this.followLatest
			})
		},

		jumpToLatest() {
			this.setLatestWindow()
			this.updateNavigatorGeometry()
			this.scheduleDraw(0)

			this.$emit('window-change', {
				start: this.viewStart,
				end: this.viewEnd,
				followLatest: true
			})
		},

		scheduleDraw(delay) {
			if (!this.ready) return

			if (this.drawTimer) clearTimeout(this.drawTimer)

			this.drawTimer = setTimeout(() => {
				this.drawTimer = null
				this.draw()
			}, typeof delay === 'number' ? delay : 16)
		},

		getVisibleRaw() {
			if (!this.fullData.length) return []

			const start = this.viewStart || this.fullStart
			const end = this.viewEnd || this.fullEnd

			// 二分查找开始位置
			let lo = 0
			let hi = this.fullData.length

			while (lo < hi) {
				const mid = (lo + hi) >> 1
				if (this.fullData[mid].ts < start) lo = mid + 1
				else hi = mid
			}

			const result = []

			for (let i = Math.max(0, lo - 1); i < this.fullData.length; i++) {
				const item = this.fullData[i]

				if (item.ts > end) {
					// 多保留右边相邻点有助于曲线边缘连续
					if (result.length && item.ts - end <= this.intervalMinutes * 60 * 1000 * 2) {
						result.push(item)
					}
					break
				}

				if (item.ts >= start) result.push(item)
			}

			return result
		},

		/**
		 * Min-Max sampling：
		 * 每个时间桶保留最低值和最高值，
		 * 比“每隔 N 个取一个”更不容易丢掉血糖高峰/低谷。
		 */
		sampleMinMax(data, limit) {
			if (!Array.isArray(data) || data.length <= limit) return data.slice()
			if (limit < 4) return [data[0], data[data.length - 1]]

			const first = data[0]
			const last = data[data.length - 1]
			const middle = data.slice(1, -1)

			const bucketCount = Math.max(1, Math.floor((limit - 2) / 2))
			const bucketSize = middle.length / bucketCount
			const sampled = [first]

			for (let b = 0; b < bucketCount; b++) {
				const start = Math.floor(b * bucketSize)
				const end = Math.min(middle.length, Math.floor((b + 1) * bucketSize))

				if (start >= end) continue

				let minItem = middle[start]
				let maxItem = middle[start]

				for (let i = start + 1; i < end; i++) {
					const item = middle[i]
					if (item.value < minItem.value) minItem = item
					if (item.value > maxItem.value) maxItem = item
				}

				if (minItem.ts <= maxItem.ts) {
					sampled.push(minItem)
					if (maxItem !== minItem) sampled.push(maxItem)
				} else {
					sampled.push(maxItem)
					if (maxItem !== minItem) sampled.push(minItem)
				}
			}

			sampled.push(last)

			sampled.sort((a, b) => a.ts - b.ts)

			return sampled.slice(0, limit)
		},

		draw() {
			const D = this.dpr
			const w = this.bufW
			const h = this.bufH

			if (!w || !h) return

			const ctx = this.ctx2d
			if (!ctx) return

			ctx.clearRect(0, 0, w, h)
			ctx.fillStyle = '#ffffff'
			ctx.fillRect(0, 0, w, h)

			const padL = 36 * D
			const padR = 12 * D
			const padT = 14 * D
			const padB = 30 * D

			const plotW = Math.max(1, w - padL - padR)
			const plotH = Math.max(1, h - padT - padB)

			const yMin = Number(this.minY)
			const yMax = Number(this.maxY)
			const ySpan = Math.max(0.001, yMax - yMin)

			const xStart = this.viewStart || this.fullStart
			const xEnd = this.viewEnd || this.fullEnd
			const xSpan = Math.max(1, xEnd - xStart)

			const xOf = ts => {
				const ratio = (ts - xStart) / xSpan
				return padL + Math.max(0, Math.min(1, ratio)) * plotW
			}

			const yOf = value => {
				const ratio = (Number(value) - yMin) / ySpan
				return padT + plotH * (1 - Math.max(0, Math.min(1, ratio)))
			}

			// 目标范围：只有真实上下限都存在时绘制
			const tMin = Number(this.targetMin)
			const tMax = Number(this.targetMax)

			if (
				this.targetMin !== null &&
				this.targetMin !== '' &&
				this.targetMax !== null &&
				this.targetMax !== '' &&
				Number.isFinite(tMin) &&
				Number.isFinite(tMax) &&
				tMax > tMin
			) {
				const y1 = yOf(tMax)
				const y2 = yOf(tMin)

				ctx.fillStyle = 'rgba(0,179,134,0.055)'
				ctx.fillRect(padL, y1, plotW, Math.max(1, y2 - y1))
			}

			// 横向网格 + Y 轴
			ctx.strokeStyle = '#F0F2F5'
			ctx.lineWidth = 1 * D
			ctx.fillStyle = '#8A92A6'
			ctx.font = (10 * D) + 'px sans-serif'

			const yTicks = [0, 5, 10, 15].filter(v => v >= yMin && v <= yMax)

			yTicks.forEach(v => {
				const y = yOf(v)

				ctx.beginPath()
				ctx.moveTo(padL, y)
				ctx.lineTo(w - padR, y)
				ctx.stroke()

				ctx.fillText(String(v), 4 * D, y + 3 * D)
			})

			// X 轴时间标签
			ctx.fillStyle = '#8A92A6'
			ctx.font = (9 * D) + 'px sans-serif'

			const tickCount = 5

			for (let i = 0; i < tickCount; i++) {
				const ratio = i / (tickCount - 1)
				const ts = xStart + xSpan * ratio
				const x = padL + plotW * ratio
				const text = this.formatAxisTime(ts, false)

				let tx = x
				if (i === 0) tx = padL
				else if (i === tickCount - 1) tx = w - padR - this.estimateTextWidth(text, 9 * D)
				else tx = x - this.estimateTextWidth(text, 9 * D) / 2

				ctx.fillText(text, tx, h - 8 * D)
			}

			this.visibleRaw = this.getVisibleRaw()
			
			console.log(
			 'draw debug',
			 {
			   full:this.fullData.length,
			   visible:this.visibleRaw.length,
			   start:this.viewStart,
			   end:this.viewEnd
			 }
			)

			if (!this.visibleRaw.length) {
				this.coords = []

				ctx.fillStyle = '#A8AFBD'
				ctx.font = (12 * D) + 'px sans-serif'

				const text = '该时段暂无血糖数据'
				const tw = this.estimateTextWidth(text, 12 * D)

				ctx.fillText(
					text,
					Math.max(padL, (w - tw) / 2),
					padT + plotH / 2
				)
console.log({
    canvas:this.bufW,
    canvasH:this.bufH,
    coordsLength:this.coords.length
})
				return
			}

			const renderData = this.sampleMinMax(
				this.visibleRaw,
				Math.max(20, Number(this.maxRenderPoints) || 240)
			)

			this.coords = renderData.map(item => ({
				x: xOf(item.ts),
				y: yOf(item.value),
				item
			}))

			if (this.coords.length >= 2) {
				// 渐变面积
				// ctx.beginPath()
				// ctx.moveTo(this.coords[0].x, this.coords[0].y)

				// for (let i = 1; i < this.coords.length; i++) {
				// 	ctx.lineTo(this.coords[i].x, this.coords[i].y)
				// }

				// ctx.lineTo(this.coords[this.coords.length - 1].x, padT + plotH)
				// ctx.lineTo(this.coords[0].x, padT + plotH)
				// ctx.closePath()

				// const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH)
				// grad.addColorStop(0, 'rgba(0,179,134,0.14)')
				// grad.addColorStop(1, 'rgba(0,179,134,0)')

				// ctx.setFillStyle(grad)
				// ctx.fill()

				// 折线
				ctx.beginPath()

				this.coords.forEach((c, i) => {
					if (i === 0) ctx.moveTo(c.x, c.y)
					else ctx.lineTo(c.x, c.y)
				})

				ctx.strokeStyle = this.color
				ctx.lineWidth = 2 * D
				ctx.lineCap = 'round'
				ctx.lineJoin = 'round'
				ctx.stroke()
			}

			// 少量点时才绘制所有圆点
			if (this.visibleRaw.length <= this.pointVisibleLimit) {
				this.coords.forEach(c => {
					ctx.beginPath()
					ctx.fillStyle = '#ffffff'
					ctx.arc(c.x, c.y, 3 * D, 0, Math.PI * 2)
					ctx.fill()

					ctx.strokeStyle = this.color
					ctx.lineWidth = 1.8 * D
					ctx.stroke()
				})
			}

			// 当前选中点：始终单独高亮
			if (this.selectedPoint) {
				const item = this.selectedPoint
				const sx = xOf(item.ts)
				const sy = yOf(item.value)

				// 竖向辅助线
				ctx.beginPath()
				ctx.moveTo(sx, padT)
				ctx.lineTo(sx, padT + plotH)

				ctx.strokeStyle = 'rgba(0,179,134,0.25)'
				ctx.lineWidth = 1 * D
				ctx.stroke()

				// 外圈
				ctx.beginPath()
				ctx.fillStyle = '#ffffff'
				ctx.arc(sx, sy, 5.5 * D, 0, Math.PI * 2)
				ctx.fill()

				ctx.strokeStyle = this.color
				ctx.lineWidth = 2.2 * D
				ctx.stroke()

				// 内点
				ctx.beginPath()
				ctx.fillStyle = this.color
				ctx.arc(sx, sy, 2.2 * D, 0, Math.PI * 2)
				ctx.fill()
			}
			console.log({
			    canvas:this.bufW,
			    canvasH:this.bufH,
			    coordsLength:this.coords.length
			})
		},

		onChartTouch(e) {
			if (!this.visibleRaw.length || !this.viewStart || !this.viewEnd) return

			const touch =
				(e.touches && e.touches[0]) ||
				(e.changedTouches && e.changedTouches[0])

			if (!touch) return

			let xCss

			// 小程序 canvas touch.x 通常就是相对 canvas 的坐标。
			if (
				touch.x !== undefined &&
				Number.isFinite(Number(touch.x)) &&
				Number(touch.x) >= 0 &&
				Number(touch.x) <= this.w + 4
			) {
				xCss = Number(touch.x)
			} else {
				xCss = Number(touch.clientX || 0) - this.rectLeft
			}

			const padLCss = 36
			const padRCss = 12
			const plotWCss = Math.max(1, this.w - padLCss - padRCss)

			const ratio = Math.max(
				0,
				Math.min(1, (xCss - padLCss) / plotWCss)
			)

			const targetTs =
				this.viewStart +
				(this.viewEnd - this.viewStart) * ratio

			const best = this.findNearestPoint(this.visibleRaw, targetTs)

			if (!best) return

			this.selectedPoint = best

			const xDev =
				padLCss * this.dpr +
				ratio * plotWCss * this.dpr

			const ySpan = Math.max(0.001, Number(this.maxY) - Number(this.minY))
			const yRatio =
				(best.value - Number(this.minY)) / ySpan

			const yDev =
				14 * this.dpr +
				(this.bufH - 14 * this.dpr - 30 * this.dpr) *
					(1 - Math.max(0, Math.min(1, yRatio)))

			this.tip = {
				value: best.value,
				time: this.formatTooltipTime(best.ts, best.time),
				source: best.source || ''
			}

			// 防止 Tooltip 靠近左右边缘时被裁掉
			const leftPercent = Math.max(
				14,
				Math.min(86, (xDev / this.bufW) * 100)
			)

			const topPercent = Math.max(
				14,
				Math.min(88, (yDev / this.bufH) * 100)
			)

			this.tipStyle =
				'left:' + leftPercent + '%;' +
				'top:' + topPercent + '%;'

			this.scheduleDraw(0)

			this.$emit('point-change', {
				value: best.value,
				time: best.time,
				timestamp: best.ts,
				source: best.source,
				index: best.originalIndex
			})
		},

		onChartTouchEnd() {
			// 故意不清除 Tooltip。
			// 用户松手后仍可阅读当前血糖信息。
		},

		onChartTouchCancel() {
			// 系统取消手势时清除，避免残留异常状态。
			this.clearSelection()
			this.scheduleDraw(0)
		},

		findNearestPoint(data, ts) {
			if (!data || !data.length) return null

			let lo = 0
			let hi = data.length - 1

			while (lo < hi) {
				const mid = Math.floor((lo + hi) / 2)

				if (data[mid].ts < ts) lo = mid + 1
				else hi = mid
			}

			const a = data[lo]
			const b = lo > 0 ? data[lo - 1] : null

			if (!b) return a

			return Math.abs(a.ts - ts) < Math.abs(b.ts - ts) ? a : b
		},

		clearSelection() {
			this.tip = null
			this.tipStyle = ''
			this.selectedPoint = null
		},

		formatAxisTime(ts, fullRange) {
			const d = new Date(ts)

			if (!Number.isFinite(d.getTime())) return ''

			const hh = this.pad2(d.getHours())
			const mm = this.pad2(d.getMinutes())

			const windowMs = Math.max(0, this.viewEnd - this.viewStart)

			if (
				fullRange &&
				this.fullEnd - this.fullStart > 24 * 60 * 60 * 1000
			) {
				return (d.getMonth() + 1) + '/' + d.getDate()
			}

			if (
				!fullRange &&
				windowMs > 24 * 60 * 60 * 1000
			) {
				return (d.getMonth() + 1) + '/' + d.getDate()
			}

			return hh + ':' + mm
		},

		formatTooltipTime(ts, fallback) {
			const d = new Date(ts)

			if (!Number.isFinite(d.getTime())) return fallback || ''

			const now = new Date()

			const sameDay =
				d.getFullYear() === now.getFullYear() &&
				d.getMonth() === now.getMonth() &&
				d.getDate() === now.getDate()

			const time =
				this.pad2(d.getHours()) +
				':' +
				this.pad2(d.getMinutes())

			if (sameDay) return '今天 ' + time

			return (
				(d.getMonth() + 1) +
				'/' +
				d.getDate() +
				' ' +
				time
			)
		},

		formatRange(start, end) {
			const a = new Date(start)
			const b = new Date(end)

			if (
				!Number.isFinite(a.getTime()) ||
				!Number.isFinite(b.getTime())
			) return ''

			const sameDay =
				a.getFullYear() === b.getFullYear() &&
				a.getMonth() === b.getMonth() &&
				a.getDate() === b.getDate()

			if (sameDay) {
				return (
					this.pad2(a.getHours()) +
					':' +
					this.pad2(a.getMinutes()) +
					' - ' +
					this.pad2(b.getHours()) +
					':' +
					this.pad2(b.getMinutes())
				)
			}

			return (
				(a.getMonth() + 1) +
				'/' +
				a.getDate() +
				' ' +
				this.pad2(a.getHours()) +
				':' +
				this.pad2(a.getMinutes()) +
				' - ' +
				(b.getMonth() + 1) +
				'/' +
				b.getDate() +
				' ' +
				this.pad2(b.getHours()) +
				':' +
				this.pad2(b.getMinutes())
			)
		},

		pad2(n) {
			return Number(n) < 10 ? '0' + Number(n) : String(Number(n))
		},

		estimateTextWidth(text, fontSize) {
			// Canvas legacy API 不方便可靠 measureText，
			// 用中英文混排安全估算，主要用于 X 轴末端防溢出。
			const str = String(text || '')
			let units = 0

			for (let i = 0; i < str.length; i++) {
				units += str.charCodeAt(i) > 255 ? 1 : 0.56
			}

			return units * fontSize
		}
	}
}
</script>

<style scoped>
.glc {
	position: relative;
	width: 100%;
}

.glc-chart-wrap {
	position: relative;
	width: 100%;
	min-height: 260rpx;
}

.glc-canvas {
	width: 100%;
	height: 100%;
	display: block;
}

.glc-tip {
	position: absolute;
	transform: translate(-50%, -112%);
	min-width: 150rpx;
	background: rgba(35, 45, 66, 0.94);
	color: #fff;
	padding: 12rpx 16rpx;
	border-radius: 12rpx;
	line-height: 1.35;
	white-space: nowrap;
	pointer-events: none;
	z-index: 8;
	box-sizing: border-box;
}

.glc-tip::after {
	content: '';
	position: absolute;
	left: 50%;
	bottom: -10rpx;
	transform: translateX(-50%);
	width: 0;
	height: 0;
	border-left: 10rpx solid transparent;
	border-right: 10rpx solid transparent;
	border-top: 10rpx solid rgba(35, 45, 66, 0.94);
}

.glc-tip-time {
	display: block;
	font-size: 20rpx;
	opacity: 0.78;
	margin-bottom: 4rpx;
}

.glc-tip-val {
	display: block;
	font-size: 24rpx;
	font-weight: 600;
}

.glc-tip-source {
	display: block;
	font-size: 18rpx;
	opacity: 0.72;
	margin-top: 4rpx;
}

.glc-navigator {
	padding: 8rpx 4rpx 0;
	box-sizing: border-box;
}

.glc-window-row {
	height: 38rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 6rpx;
}

.glc-window-text {
	font-size: 20rpx;
	color: #8A92A6;
}

.glc-latest {
	font-size: 20rpx;
	color: #00B386;
	padding: 6rpx 0 6rpx 16rpx;
}

.glc-nav-area {
	position: relative;
	width: 100%;
	height: 44rpx;
	background: transparent;
	overflow: visible;
}

.glc-nav-track {
	position: absolute;
	left: 0;
	right: 0;
	top: 17rpx;
	height: 10rpx;
	border-radius: 999rpx;
	background: #EFF2F5;
}

.glc-nav-center-line {
	position: absolute;
	left: 6rpx;
	right: 6rpx;
	top: 21rpx;
	height: 2rpx;
	background: rgba(138, 146, 166, 0.16);
}

.glc-nav-window {
	position: relative;
	top: 7rpx;
	height: 30rpx;
	border: 2rpx solid #00B386;
	border-radius: 999rpx;
	background: rgba(0, 179, 134, 0.12);
	box-sizing: border-box;
	overflow: visible;
}

.glc-nav-handle {
	position: absolute;
	top: 50%;
	width: 8rpx;
	height: 18rpx;
	border-radius: 99rpx;
	background: #00B386;
	transform: translateY(-50%);
}

.glc-nav-handle-left {
	left: 7rpx;
}

.glc-nav-handle-right {
	right: 7rpx;
}

.glc-nav-labels {
	margin-top: 4rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 18rpx;
	color: #A8AFBD;
}
</style>
