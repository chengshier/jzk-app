<template>
	<view class="consultation-component">
		<view class="consultation-card" :style="[boxStyle]">
			<view class="consultation-card__tabs">
				<text
					v-for="(tab, index) in tabs"
					:key="index"
					class="consultation-card__tab"
					:class="{ active: index === activeIndex }"
					@click="activeIndex = index"
				>
					{{ tab }}
				</text>
			</view>

			<view
				v-for="(item, index) in notices"
				:key="index"
				class="consultation-card__notice"
				@click="go(item.link)"
			>
				<view class="consultation-card__notice-main">
					<view class="consultation-card__notice-title-row">
						<text class="consultation-card__notice-title">
							{{ item.title }}
						</text>

						<text
							v-if="item.badge"
							class="consultation-card__badge"
						>
							{{ item.badge }}
						</text>
					</view>

					<text class="consultation-card__date">
						{{ item.date }}
					</text>
				</view>

				<text class="consultation-card__notice-link">
					查看 >
				</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'consultationList',

	/*
	 * 与 healthDataCard 保持相同的跨端盒模型：
	 * 微信小程序端虚拟化自定义组件宿主节点，
	 * 模板第一层 view 直接参与页面布局。
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

	data() {
		return {
			activeIndex: 0
		};
	},

	computed: {
		tabs() {
			const config = this.dataConfig && this.dataConfig.tabsConfig;

			if (
				config &&
				Array.isArray(config.list) &&
				config.list.length
			) {
				return config.list;
			}

			return ['平台公告', '健康知识', '活动咨询'];
		},

		notices() {
			const config = this.dataConfig && this.dataConfig.noticeConfig;

			if (config && Array.isArray(config.list)) {
				return config.list;
			}

			return [];
		},

		boxStyle() {
			const config = this.dataConfig || {};

			const radius = this.numberValue(config.radiusConfig, 12);
			const marginTop = this.numberValue(config.mbConfig, 10);
			const horizontalMargin = this.numberValue(config.lrConfig, 10);
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
		},

		go(link) {
			if (!link) {
				return;
			}

			this.$util.navigateTo(link);
		}
	}
};
</script>

<style lang="scss" scoped>
.consultation-component {
	display: block;
	width: 100%;
	min-width: 0;
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

.consultation-card {
	display: block;
	width: auto;
	min-width: 0;
	max-width: none;
	box-sizing: border-box;
}

.consultation-card__tabs {
	display: flex;
	align-items: center;
	min-width: 0;
	padding-bottom: 14rpx;
	border-bottom: 1rpx solid #eef1f2;
	overflow: hidden;
}

.consultation-card__tab {
	position: relative;
	flex-shrink: 0;
	margin-right: 34rpx;
	padding-bottom: 12rpx;
	color: #747a80;
	font-size: 26rpx;
	line-height: 1.2;
	white-space: nowrap;
}

.consultation-card__tab:last-child {
	margin-right: 0;
}

.consultation-card__tab.active {
	color: #1fc8a5;
	font-weight: 600;
}

.consultation-card__tab.active::after {
	content: '';
	position: absolute;
	right: 0;
	bottom: 0;
	left: 0;
	height: 4rpx;
	border-radius: 4rpx;
	background: #1fc8a5;
}

.consultation-card__notice {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-width: 0;
	padding: 23rpx 0;
	border-bottom: 1rpx solid #eef1f2;
	box-sizing: border-box;
}

.consultation-card__notice:last-child {
	padding-bottom: 0;
	border-bottom: 0;
}

.consultation-card__notice-main {
	flex: 1;
	min-width: 0;
	margin-right: 20rpx;
}

.consultation-card__notice-title-row {
	display: flex;
	align-items: center;
	min-width: 0;
}

.consultation-card__notice-title {
	display: block;
	flex: 1;
	min-width: 0;
	color: #30343b;
	font-size: 27rpx;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.consultation-card__date {
	display: block;
	margin-top: 8rpx;
	color: #a7adb2;
	font-size: 21rpx;
	line-height: 1.2;
}

.consultation-card__badge {
	flex-shrink: 0;
	margin-left: 10rpx;
	padding: 2rpx 7rpx;
	border-radius: 4rpx;
	background: #ff5252;
	color: #ffffff;
	font-size: 18rpx;
}

.consultation-card__notice-link {
	flex-shrink: 0;
	color: #98a0a6;
	font-size: 22rpx;
	white-space: nowrap;
}
</style>
