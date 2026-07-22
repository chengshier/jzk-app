<template>
	<view class="health-data-component">
		<view class="health-data-card" :style="[boxStyle]">
			<view class="health-data-card__head">
				<view class="health-data-card__head-main">
					<text
						class="health-data-card__title"
						:style="{ color: color('titleColor', '#19bf9b') }"
					>
						{{ value('titleConfig', '测试数据') }}
					</text>

					<text
						class="health-data-card__subtitle"
						:style="{ color: color('mutedColor', '#98a0a6') }"
					>
						{{ value('subTitleConfig', '守护您的健康') }}
					</text>
				</view>

				<view
					class="health-data-card__more"
					:style="{ color: color('mutedColor', '#98a0a6') }"
					@click="goHealth"
				>
					<text class="health-data-card__more-text">
						{{ value('moreConfig', '更多数据') }}
					</text>
					<text class="health-data-card__more-arrow">></text>
				</view>
			</view>

			<view class="health-data-card__body">
				<view class="health-data-card__metric">
					<text class="health-data-card__label">
						{{ value('metricLabelConfig', '今日血糖') }}
					</text>

					<view class="health-data-card__value-row">
						<text class="health-data-card__number">
							{{ value('glucoseConfig', '5.8') }}
						</text>
						<text class="health-data-card__unit">
							{{ value('unitConfig', 'mmol/L') }}
						</text>
					</view>

					<view class="health-data-card__meta">
						<text class="health-data-card__time">
							{{ value('timeConfig', '测量时间 07:30') }}
						</text>
						<text class="health-data-card__status">
							{{ value('statusConfig', '正常') }}
						</text>
					</view>
				</view>

				<view class="health-data-card__advice">
					<view
						class="health-data-card__advice-title"
						:style="{ color: color('accentColor', '#1fc8a5') }"
					>
						<text class="health-data-card__advice-icon"></text>
						<text>
							{{ value('adviceTitleConfig', '健康建议') }}
						</text>
					</view>

					<text class="health-data-card__advice-name">
						{{ value('adviceLabelConfig', '饮食建议') }}
					</text>

					<text class="health-data-card__advice-text">
						{{ value('adviceConfig', '多吃蔬菜，少食多餐') }}
					</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'healthDataCard',

	/*
	 * 微信小程序会把 Vue 组件编译成自定义组件。
	 * virtualHost 开启后，不再让额外的组件宿主节点参与宽度和 flex 布局，
	 * 由模板中的第一层 view 直接参与布局，从根因上统一 H5 与小程序盒模型。
	 */
	options: {
		virtualHost: true,
		styleIsolation: 'shared'
	},

	props: {
		dataConfig: {
			type: Object,
			default: () => ({})
		}
	},

	computed: {
		boxStyle() {
			const config = this.dataConfig || {};

			const radius = this.numberValue(config.bgStyle, 12);
			const marginTop = this.numberValue(config.mbConfig, 10);
			const horizontalMargin = this.numberValue(config.lrConfig, 8);
			const paddingTop = this.numberValue(config.upConfig, 12);
			const paddingBottom = this.numberValue(config.downConfig, 12);

			return {
				backgroundColor: this.color('bgColor', '#ffffff'),
				borderRadius: `${radius * 2}rpx`,

				marginTop: `${marginTop * 2}rpx`,
				marginRight: `${horizontalMargin * 2}rpx`,
				marginBottom: '0',
				marginLeft: `${horizontalMargin * 2}rpx`,

				paddingTop: `${paddingTop * 2}rpx`,
				paddingRight: '24rpx',
				paddingBottom: `${paddingBottom * 2}rpx`,
				paddingLeft: '24rpx',

				boxSizing: 'border-box'
			};
		}
	},

	methods: {
		goHealth() {
			uni.navigateTo({
				url: '/pages/health/index'
			});
		},

		numberValue(config, fallback) {
			if (
				!config ||
				config.val === undefined ||
				config.val === null ||
				config.val === ''
			) {
				return fallback;
			}

			const result = Number(config.val);
			return Number.isNaN(result) ? fallback : result;
		},

		value(key, fallback) {
			const config = this.dataConfig && this.dataConfig[key];

			if (
				!config ||
				config.val === undefined ||
				config.val === null
			) {
				return fallback;
			}

			return config.val;
		},

		color(key, fallback) {
			const config = this.dataConfig && this.dataConfig[key];

			if (
				config &&
				Array.isArray(config.color) &&
				config.color[0] &&
				config.color[0].item
			) {
				return config.color[0].item;
			}

			return fallback;
		}
	}
};
</script>

<style lang="scss" scoped>
.health-data-component {
	display: block;
	width: 100%;
	min-width: 0;
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

.health-data-card {
	display: block;
	width: auto;
	min-width: 0;
	max-width: none;
	box-sizing: border-box;
}

.health-data-card__head {
	display: flex;
	align-items: center;
	min-width: 0;
	padding-bottom: 16rpx;
}

.health-data-card__head-main {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
}

.health-data-card__title {
	flex: none;
	font-size: 32rpx;
	font-weight: 700;
	line-height: 1.2;
	white-space: nowrap;
}

.health-data-card__subtitle {
	flex: 1;
	min-width: 0;
	margin-left: 12rpx;
	font-size: 22rpx;
	line-height: 1.2;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.health-data-card__more {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	flex-shrink: 0;
	min-width: 132rpx;
	margin-left: 16rpx;
	font-size: 22rpx;
	line-height: 1.2;
	white-space: nowrap;
}

.health-data-card__more-text {
	white-space: nowrap;
}

.health-data-card__more-arrow {
	margin-left: 6rpx;
	font-size: 20rpx;
}

.health-data-card__body {
	display: flex;
	width: 100%;
	min-width: 0;
	padding-top: 18rpx;
	border-top: 1rpx solid #eef1f2;
	box-sizing: border-box;
}

.health-data-card__metric {
	flex: 1;
	width: 0;
	min-width: 0;
	padding-right: 18rpx;
	border-right: 1rpx solid #eef1f2;
	box-sizing: border-box;
}

.health-data-card__label,
.health-data-card__meta,
.health-data-card__advice-text {
	color: #98a0a6;
	font-size: 22rpx;
}

.health-data-card__value-row {
	display: flex;
	align-items: baseline;
	min-width: 0;
}

.health-data-card__number {
	color: #30343b;
	font-size: 52rpx;
	line-height: 1.2;
}

.health-data-card__unit {
	flex-shrink: 0;
	margin-left: 4rpx;
	color: #98a0a6;
	font-size: 22rpx;
	white-space: nowrap;
}

.health-data-card__meta {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-width: 0;
	margin-top: 4rpx;
}

.health-data-card__time {
	min-width: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.health-data-card__status {
	flex-shrink: 0;
	margin-left: 8rpx;
	padding: 1rpx 12rpx;
	color: #19bf9b;
	border: 1rpx solid #79d9c4;
	border-radius: 22rpx;
	white-space: nowrap;
}

.health-data-card__advice {
	display: flex;
	flex: 1;
	flex-direction: column;
	width: 0;
	min-width: 0;
	padding-left: 22rpx;
	box-sizing: border-box;
}

.health-data-card__advice-title {
	display: flex;
	align-items: center;
	font-size: 25rpx;
	font-weight: 600;
	line-height: 1.2;
}

.health-data-card__advice-icon {
	flex-shrink: 0;
	width: 12rpx;
	height: 12rpx;
	margin-right: 10rpx;
	border-radius: 50%;
	background: currentColor;
}

.health-data-card__advice-name {
	margin-top: 13rpx;
	color: #30343b;
	font-size: 27rpx;
}

.health-data-card__advice-text {
	margin-top: 4rpx;
	line-height: 1.45;
	word-break: break-all;
}
</style>
