<template>
	<!-- 新闻播报 -->
	<view>
		<view v-if="itemNew.length && isUi11" class="ui11-reminder" :style="[boxStyle]" @click="moreTab(itemNew[0].chiild[1].val)">
			<view class="ui11-reminder__brand"><image :src="logoConfig"></image></view>
			<text class="ui11-reminder__message line1" :style="{ color: textColor }">{{ itemNew[0].chiild[0].val }}</text>
			<text class="ui11-reminder__arrow iconfont icon-xiangyou"></text>
		</view>
		<view v-else-if="itemNew.length" class='news acea-row row-middle' :style="[boxStyle]">
			<view class='pictrue skeleton-rect'>
				<image :src='logoConfig'></image>
			</view>
			<view class='swiperTxt skeleton-rect'>
				<view class="acea-row row-between-wrapper" v-if="direction" @click="moreTab(itemNew[0].chiild[1].val)">
					<uniNoticeBar scrollable="true" showGetMore="true" background-color="rgba(255,255,255,0)" :color="textColor"
						moreColor="#888" :speed='50' single="true" :text="itemNew[0].chiild[0].val"></uniNoticeBar>
					<view class="iconfont icon-xiangyou"></view>
				</view>
				<swiper v-else :indicator-dots="indicatorDots" :autoplay="autoplay" interval="2500" :duration="duration"
					vertical="true" circular="true">
					<block v-for="(item,index) in itemNew" :key='index'>
						<swiper-item catchtouchmove='catchTouchMove'>
							<view @click="moreTab(item.chiild[1].val)" class='acea-row row-between-wrapper'
								hover-class='none'>
								<view class='text acea-row row-between-wrapper' :style="[txtStyle]">
									<view class='newsTitle line1' :style="{color:textColor}">
										{{item.chiild[0].val}}
									</view>
								</view>
							</view>
						</swiper-item>
					</block>
				</swiper>
				<view v-if="!direction" class='iconfont icon-xiangyou'></view>
			</view>
		</view>
	</view>
</template>

<script>
	// +----------------------------------------------------------------------
	// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
	// +----------------------------------------------------------------------
	// | Copyright (c) 2016~2025 https://www.crmeb.com All rights reserved.
	// +----------------------------------------------------------------------
	// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
	// +----------------------------------------------------------------------
	// | Author: CRMEB Team <admin@crmeb.com>
	// +----------------------------------------------------------------------
	import uniNoticeBar from '@/components/uniNoticeBar/uni-notice-bar.vue';
	export default {
		components: {
			uniNoticeBar
		},
		name: 'news',
		props: {
			dataConfig: {
				type: Object,
				default: () => {}
			},
			isSortType: {
				type: String | Number,
				default: 0
			}
		},
		data() {
			return {
				indicatorDots: false,
				autoplay: true,
				duration: 500,
			};
		},
		computed: {
			isUi11() {
				return this.dataConfig.ui11StyleConfig && this.dataConfig.ui11StyleConfig.tabVal === 1;
			},
			//文本列表
			itemNew() {
				return this.dataConfig.listConfig.list
			},
			//图标设置
			logoConfig() {
				return this.dataConfig.logoConfig.url
			},
			//文本滚动方向
			direction() {
				return this.dataConfig.directionConfig.tabVal
			},
			//最外层盒子的样式
			boxStyle() {
				return {
					borderRadius: this.dataConfig.bgStyle.val * 2 + 'rpx',
					background: `linear-gradient(${this.dataConfig.bgColor.color[0].item}, ${this.dataConfig.bgColor.color[1].item})`,
					margin: this.dataConfig.mbConfig.val * 2 + 'rpx' + ' ' + this.dataConfig.lrConfig.val * 2 + 'rpx' +
						' ' + 0,
					padding: this.dataConfig.upConfig.val * 2 + 'rpx' + ' ' + '20rpx' + ' ' + this.dataConfig.downConfig
						.val * 2 + 'rpx',
					color: this.dataConfig.textColor.color[0].item
				}
			},
			//文字位置
			txtStyle() {
				let txtStyle = this.dataConfig.textPosition.tabVal;
				if (txtStyle == 0) {
					return {
						'text-align': 'left'
					}
				} else if (txtStyle == 1) {
					return {
						'text-align': 'center'
					}
				} else {
					return {
						'text-align': 'right'
					}
				}
			},
			//文字颜色
			textColor() {
				return this.dataConfig.textColor.color[0].item
			},
		},
		methods: {
			moreTab(url) {
				this.$util.navigateTo(url);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.news {
		display: flex;
		align-items: center;
		flex-wrap: nowrap;
		box-shadow: 0 10rpx 30rpx #f5f5f5;
	}

	.news .pictrue {
		width: 130rpx;
		height: 36rpx;
		border-right: 1rpx solid #ddd;
		padding-right: 23rpx;
		box-sizing: content-box;
	}

	.news .pictrue image {
		width: 100%;
		height: 100%;
	}

	.news .swiperTxt {
		width: 536rpx;
		height: 78rpx;
		line-height: 78rpx;
		overflow: hidden;
		margin-left: 22rpx;
		position: relative;
		.icon-xiangyou{
			position: absolute;
			right: 0;
			top: 0;
		}
	}

	.news .swiperTxt .text {
		width: 89%;
	}

	.news .swiperTxt .text .label {
		font-size: 20rpx;
		color: #ff4c48;
		width: 64rpx;
		height: 30rpx;
		border-radius: 40rpx;
		text-align: center;
		line-height: 28rpx;
		border: 2rpx solid #ff4947;
	}

	.news .swiperTxt .text .newsTitle {
		width: 100%;
		font-size: 24rpx;
		color: #666;
	}

	.news .swiperTxt .iconfont {
		font-size: 28rpx;
		color: #888;
	}

	.news .swiperTxt swiper {
		height: 100%;
	}
	.news.ui11-news {
		box-shadow: none;
	}

	.news.ui11-news .pictrue {
		width: 88rpx;
		height: 30rpx;
		padding-right: 14rpx;
	}

	.news.ui11-news .swiperTxt {
		width: auto;
		flex: 1;
		height: 64rpx;
		line-height: 64rpx;
		margin-left: 14rpx;
	}

	.news.ui11-news .swiperTxt .text .newsTitle {
		font-size: 24rpx;
	}
	.ui11-reminder { display:flex; align-items:center; min-height:96rpx; padding:8rpx 0; box-sizing:border-box; }
	.ui11-reminder__brand { flex:none; width:170rpx; height:36rpx; padding-right:20rpx; border-right:1rpx solid #dfe5e3; }
	.ui11-reminder__brand image { display:block; width:100%; height:100%; }
	.ui11-reminder__message { align-self:stretch; display:flex; align-items:center; flex:1; min-width:0; min-height:48rpx; padding:0 20rpx; font-size:28rpx; font-weight:500; line-height:44rpx; }
	.ui11-reminder__arrow { flex:none; color:#9aa0a5; font-size:28rpx; }
</style>
