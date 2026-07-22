<template>
	<view :data-theme="theme">
		<view class="new-users copy-data">
			<view class="mid" style="flex:1;overflow: hidden;">
				<scroll-view scroll-y="true">
					<view class="bg"></view>
					<view class="head pad30">
						<view class="user-card">
							<view class="user-info" @click="goEdit()">
								<image class="avatar" :src='userInfo.avatar' v-if="userInfo.avatar && uid"></image>
								<image v-else class="avatar" :src="urlDomain+'crmebimage/perset/staticImg/f.png'" mode=""></image>
								<view class="info">
									<view class="name" v-if="!isLogin" @tap="openAuto">
										请点击登录
									</view>
									<view class="name" v-if="userInfo && uid">
										{{userInfo && userInfo.nickname && uid ? userInfo.nickname : ''}}
										<view class="vip" v-if="userInfo.vip">
											<image :src="userInfo.vipIcon" alt=""></image>
										<view style="margin-left: 10rpx;" class="vip-txt">{{userInfo.vipName|| ''}}
										</view>
									</view>
									</view>
									<view class="num" v-if="userInfo && userInfo.phone && uid">
										<view class="num-txt">{{userInfo.phone}}</view>
										<view class="icon">
											<image :src="urlDomain+'crmebimage/perset/staticImg/edit.png'" mode=""></image>
										</view>
									</view>
									<view class="phone" v-if="!userInfo.phone && isLogin" @tap.stop="bindPhone">绑定手机号</view>
									<!-- #ifdef APP-PLUS -->
									<text class="iconfont icon-shezhi app_set" @click.stop="appUpdate()"></text>
									<!-- #endif -->
								</view>
							</view>
							<view class="num-wrapper">
								<view class="num-item" @click="goMenuPage('/pages/users/user_money/index')">
									<text class="num">{{userInfo.nowMoney && uid ? userInfo.nowMoney:0}}</text>
									<view class="txt">余额</view>
								</view>
								<view class="num-item" @click="goMenuPage('/pages/users/user_integral/index')">
									<text class="num">{{userInfo.integral && uid ? userInfo.integral: 0}}</text>
									<view class="txt">积分</view>
								</view>
								<view class="num-item" @click="goMenuPage('/pages/users/user_coupon/index')">
									<text class="num">{{userInfo.couponCount && uid ? userInfo.couponCount : 0}}</text>
									<view class="txt">优惠券</view>
								</view>
								<view class="num-item" @click="goMenuPage('/pages/users/user_goods_collection/index')">
									<text class="num">{{userInfo.collectCount && uid ? userInfo.collectCount : 0}}</text>
									<view class="txt">收藏</view>
								</view>
							</view>
						</view>
						<view class="order-wrapper">
							<view class="order-hd flex">
								<view class="left">订单中心</view>
								<view class="right flex" @click="menusTap('/pages/users/order_list/index')">查看全部
									<text class="iconfont icon-xiangyou"></text> 
								</view>
							</view>
							<view class="order-bd">
								<block v-for="(item,index) in orderMenu" :key="index">
									<view class="order-item" @click="menusTap(item.url)"> 
										<view class="pic">
											<text class="iconfont pic_status" :class="item.img"></text>
											<text class="order-status-num" v-if="item.num > 0">{{ item.num }}</text>
										</view>
										<view class="txt">{{item.title}}</view>
									</view>
								</block>
							</view>
						</view>
					</view>
					<view class="contenBox" id="pageIndex">
						<!-- 轮播 -->
						<view class="slider-wrapper" @click.native="bindEdit('userBanner')" v-if="imgUrls != null && imgUrls.length > 0">
							<swiper v-if="imgUrls.length>0" indicator-dots="true" :autoplay="autoplay" :circular="circular" :interval="interval"
								:duration="duration" indicator-color="rgba(255,255,255,0.6)" indicator-active-color="#fff">
								<block v-for="(item,index) in imgUrls" :key="index">
									<swiper-item class="borRadius14">
										<image :src="item.pic" class="slide-image" @click="navito(item.url)"></image>
									</swiper-item>
								</block>
							</swiper>
						</view>
						<!-- 会员菜单 -->
						<view class="user-menus" style="margin-top: 20rpx;" @click.native="bindEdit('userMenus')">
							<view class="menu-title">我的服务</view>
							<view class="list-box">
								<block v-for="(item,index) in MyMenus" :key="index">
									<view class="item" @click="menusTap(item.url)"
										v-if="!(item.url =='/pages/service/index' || (item.url =='/pages/promoter/user_spread_user/index' && !userInfo.isPromoter))">
										<image :src="item.pic"></image>
										<text>{{item.name}}</text>
									</view>
								</block>
								<!-- #ifndef MP -->
								<view class="item" @click="onClickService">
									<image :src="servicePic"></image>
									<text>联系客服</text>
								</view>
								<!-- #endif -->
								<!-- #ifdef MP -->
								<!--  v-if="chatConfig.telephone_service_switch" -->
								<button class="item" hover-class='none' @click="onClickService" v-if="chatConfig.telephone_service_switch === 'open'">
									<image :src="servicePic"></image>
									<text>联系客服</text>
								</button>
								<template v-else>
									<button class="item" open-type='contact' hover-class='none' v-if="chatConfig.wx_chant_independent==='open'">
										<image :src="servicePic"></image>
										<text>联系客服</text>
									</button>
									<button class="item" hover-class='none' @click="wxChatService"  v-else>
										<image :src="servicePic"></image>
										<text>联系客服</text>
									</button>
								</template>
								<!-- #endif -->
							</view>
						</view>
						<view class="jk-identity-card" v-if="isLogin">
							<view class="identity-head">
								<view class="identity-title">九州康身份中心</view>
								<view class="identity-status">{{ jkIdentityStatusText }}</view>
							</view>
							<view class="identity-role">当前主身份：{{ jkPrimaryRoleName }}</view>
							<view class="identity-reason" v-if="jkDisableReason">原因：{{ jkDisableReason }}</view>
							<view class="identity-tag-list" v-if="jkRoles.length">
								<text class="identity-tag" v-for="item in jkRoles" :key="item">{{ getJkRoleName(item) }}</text>
							</view>
							<view class="identity-action-row">
								<view class="identity-btn primary" @click="goJkStatus">查看状态</view>
								<view class="identity-btn" @click="goJkApplyList">申请记录</view>
								<view class="identity-btn disabled" v-if="jkEntryDisabled">入口已停用</view>
								<view class="identity-btn primary" v-else @click="goJkApply">{{ jkCanApplyRoles.length ? '申请新身份' : '身份入口' }}</view>
							</view>
							<view class="jk-business-links" v-if="jkBusinessLinks.length"><view v-for="item in jkBusinessLinks" :key="item.url" :class="['identity-btn', item.disabled ? 'disabled' : '']" @click="goJkBusiness(item)">{{ item.name }}</view></view>
<view class="identity-tip">业务入口按当前身份和权限展示。</view>
						</view>
						<image :src="copyImage" alt="" class='support'></image>
					</view>
				</scroll-view>
			</view>
		</view>
		<pageFooter></pageFooter>
	</view>
</template>
<script>
	let sysHeight = uni.getSystemInfoSync().statusBarHeight + 'px';
	import pageFooter from '@/components/pageFooter/index.vue'
	import Cache from '@/utils/cache';
	import {goPage} from '@/libs/iframe.js'
	import {BACK_URL} from '@/config/cache';
	import {getMenuList, copyrightApi} from '@/api/user.js';
	import { getJkPermissionContext } from '@/api/jk.js';
	import {orderData} from '@/api/order.js';
	import {getCity, tokenIsExistApi} from '@/api/api.js';
	import {toLogin} from '@/libs/login.js';
	import {mapGetters} from "vuex";
	import {
		getCityList
	} from "@/utils";
	// #ifdef H5
	import Auth from '@/libs/wechat';
	// #endif
	import {getShare} from '@/api/public.js';
	import {setThemeColor} from '@/utils/setTheme.js'
	import animationType from '@/utils/animationType.js'
	const app = getApp();
	export default {
		components:{
					pageFooter
		},
		computed: {
			...mapGetters(['isLogin', 'chatUrl', 'uid', 'bottomNavigationIsCustom']),
			jkRoles() {
				return (this.jkContext && this.jkContext.roles) || [];
			},
			jkCanApplyRoles() {
				return (this.jkContext && this.jkContext.canApplyRoles) || [];
			},
			jkPrimaryRoleName() {
				return (this.jkContext && this.jkContext.primaryRoleName) || '普通用户';
			},
			jkIdentityStatusText() {
				return (this.jkContext && (this.jkContext.identityStatusText || this.jkContext.auditStatusText)) || '未开通业务身份';
			},
			jkDisableReason() {
				return (this.jkContext && (this.jkContext.disabledReasonText || this.jkContext.disableReason)) || '';
			},
			jkEntryDisabled() { return !!(this.jkContext && this.jkContext.freezeStatus); },
			jkBusinessLinks() {
				const context = this.jkContext || {};
				const permissions = context.permissions || [];
				const role = context.primaryRoleCode;
				const disabled = !!context.freezeStatus;
				const links = [];
				const addLink = (name, url, permission, roles) => {
					if (permission && permissions.indexOf(permission) === -1) return;
					if (roles && roles.length && roles.indexOf(role) === -1) return;
					if (!links.find(item => item.url === url)) {
						links.push({ name, url, disabled });
					}
				};
				addLink('向平台订货记录', '/pages/jk/trade/list?mode=order', 'stock.platform.order', ['county_agent']);
				addLink('下级调拨处理', '/pages/jk/trade/list?mode=handleTransfer', 'stock.transfer.audit', ['county_agent']);
				addLink('我的调拨', '/pages/jk/trade/list?mode=transfer', 'stock.apply', ['maker', 'partner']);
				addLink('我的库存', '/pages/jk/stock/index', 'stock.view.self', ['maker', 'partner', 'county_agent']);
				addLink('库存流水', '/pages/jk/stock/flow', 'stock.flow.view', ['maker', 'partner', 'county_agent']);
				addLink('收益中心', '/pages/jk/commission/index', 'commission.view.self', ['maker', 'partner', 'county_agent']);
				addLink('资金账户', '/pages/jk/fund/account', 'fund.account.view', ['maker', 'partner', 'county_agent']);
				addLink('提现申请', '/pages/jk/withdraw/apply', 'withdraw.apply', ['maker', 'partner', 'county_agent']);
				addLink('提现记录', '/pages/jk/withdraw/list', 'withdraw.view.self', ['maker', 'partner', 'county_agent']);
				return links;
			}
		},
		data() {
			return {
				urlDomain: this.$Cache.get("imgHost"),
				orderMenu: [
					{img: 'icon-daifukuan',title: '待付款',url: '/pages/users/order_list/index?status=0',num: 0},
					{img: 'icon-daifahuo',title: '待发货',url: '/pages/users/order_list/index?status=1',num: 0},
					{img: 'icon-daishouhuo',title: '待收货',url: '/pages/users/order_list/index?status=2',num: 0},
					{img: 'icon-daipingjia',title: '待评价',url: '/pages/users/order_list/index?status=3',num: 0},
					{img: 'icon-a-shouhoutuikuan',title: '售后/退款',url: '/pages/users/user_return_list/index',num: 0},
				],
				imgUrls: [],
				userMenu: [],
				autoplay: true,
				circular: true,
				interval: 3000,
				duration: 500,
				isAuto: false, //没有授权的不会自动授权
				isShowAuth: false, //是否隐藏授权
				orderStatusNum: {},
				MyMenus: [],
				wechatUrl: [],
				servicePic: `${this.$Cache.get("imgHost")}crmebimage/perset/staticImg/customer.png`,
				sysHeight: sysHeight,
				// #ifdef MP
				pageHeight: '100%',
				// #endif
				// #ifdef H5 || APP-PLUS
				pageHeight: app.globalData.windowHeight,
				// #endif
				// #ifdef H5
				isWeixin: Auth.isWeixin(),
				//#endif
				configApi: {}, //分享类容配置
				theme: '',
				bgColor:'#e93323',
				chatConfig:{
					consumer_hotline:'',
					telephone_service_switch:'close',
					wx_chant_independent:'open'
				} ,//客服配置
				userInfo: {},
				copyImage: '',//版权图片
				jkContext: null
			}
		},
		onLoad() {
			app.globalData.theme = this.$Cache.get('theme')
			if(app.globalData.isIframe){
				setTimeout(()=>{
					let active;
					document.getElementById('pageIndex').children.forEach(dom=>{
						dom.addEventListener('click', (e)=>{
							e.stopPropagation();
							e.preventDefault();
							if(dom === active) return;
							dom.classList.add('borderShow');
							active && active.classList.remove('borderShow');
							active = dom;
						})
					})
				});
			}
			let that = this;
			// #ifdef H5 || APP-PLUS
			that.$set(that, 'pageHeight', app.globalData.windowHeight);
			// #endif
			that.$set(that, 'MyMenus', app.globalData.MyMenus);
			that.$set(that,'chatConfig',Cache.getItem('chatConfig'));
			// #ifdef H5
			that.shareApi();
			// #endif
			that.bgColor = setThemeColor();
			 // #ifdef APP-PLUS
			setTimeout(()=>{
			 	uni.setNavigationBarColor({
			 		frontColor: '#ffffff',
			 		backgroundColor:that.bgColor,   
			 	});
			 },500)
			 // #endif
			 // #ifdef MP
			 uni.setNavigationBarColor({
			 	frontColor: '#ffffff',
			 	backgroundColor:that.bgColor,   
			 });
			 // #endif
		},
		onShow: function() {
			this.getMyMenus();
			this.getTokenIsExist();
			this.copyrightImage();
			this.loadJkPermissionContext();
			this.theme = this.$Cache.get('theme')
			app.globalData.theme = this.$Cache.get('theme')
			if (!this.$Cache.getItem('cityList')) getCityList();
			!this.$store.state.app.bottomNavigationIsCustom&&uni.showTabBar();
			// #ifdef H5
			let that = this;
			uni.getSystemInfo({
				success: function(res) {
					that.pageHeight = res.windowHeight + 'px'
				}
			});
			// #endif
			// #ifdef MP
			let  query  = uni.createSelectorQuery(); 
			let dom = query.select('.new-users');
			// #endif
		},
		methods: {
			loadJkPermissionContext() {
				if (!this.isLogin) {
					this.jkContext = null;
					return;
				}
				getJkPermissionContext().then(res => {
					this.jkContext = res.data || null;
				}).catch(() => {
					this.jkContext = null;
				});
			},
			getJkRoleName(code) {
				const roleNameMap = (this.jkContext && this.jkContext.roleNameMap) || {};
				const roleMap = {
					normal_user: '普通用户',
					maker: '创客',
					partner: '合伙人',
					county_agent: '区县代',
					health_advisor: '健康顾问',
					city_agent: '市代',
					province_agent: '省代'
				};
				return roleNameMap[code] || roleMap[code] || code;
			},
			goJkBusiness(item) { if (item.disabled) return this.$util.Tips({ title: this.jkDisableReason || '当前身份不可使用' }); uni.navigateTo({url:item.url}); },
			goJkStatus() {
				uni.navigateTo({
					url: '/pages/jk/identity/status'
				});
			},
			goJkApply() {
				if (this.jkEntryDisabled) {
					return;
				}
				if (this.jkCanApplyRoles.length) {
					uni.navigateTo({
						url: '/pages/jk/identity/apply'
					});
					return;
				}
				uni.navigateTo({
					url: '/pages/jk/identity/status'
				});
			},
			goJkApplyList() {
				uni.navigateTo({
					url: '/pages/jk/identity/applyList'
				});
			},
			//校验token是否有效,true为有效，false为无效
			getTokenIsExist() {
				tokenIsExistApi().then(res => {
					let tokenIsExist = res.data;
					if (this.isLogin && tokenIsExist) {
						this.getOrderData();
						this.$store.dispatch('USERINFO').then(res => {
							this.userInfo = res;
						});
					}else{
						this.$store.commit("LOGOUT");
						this.$store.commit('UPDATE_LOGIN', '');
						this.$store.commit('UPDATE_USERINFO', {});
					}
				})
			},
			//获取授权图片
			copyrightImage() {
				copyrightApi().then(res => {
					if (res.data) {
						this.copyImage = res.data.companyImage;
					} else {
						this.copyImage = `${this.urlDomain}crmebimage/perset/staticImg/support.png`;
					}
				}).catch(err => {
					return this.$util.Tips({
						title: err
					})
				});
			},
			bindEdit(name) {
				if (app.globalData.isIframe) {
					window.parent.postMessage(
						{
							name: name
						},
						'*'
					);
					return;
				}
			},
			menusTap(url) {
				if (!this.isLogin) {
					this.openAuto(); 
				}else{
					goPage().then(res => {
						uni.navigateTo({
							animationType: animationType.type,
							animationDuration: animationType.duration,
							url: url
						})
					})
				}
			},
			navito(url) {
				if(url.indexOf("http") !== -1){
					// #ifdef H5
					location.href = url
					// #endif
					// #ifdef APP-PLUS || MP
					uni.navigateTo({
						url: '/pages/users/web_page/index?webUel=' + url
					})
					// #endif
				}else{
					if(['/pages/goods_cate/goods_cate','/pages/order_addcart/order_addcart','/pages/user/index'].indexOf(url) == -1){
						uni.navigateTo({
							url:url
						})
					}else{
						uni.switchTab({
							url:url
						})
					}
				}
			},
            onClickService() {
				if(this.chatConfig.telephone_service_switch === 'open'){
					uni.makePhoneCall({
					    phoneNumber: this.chatConfig.consumer_hotline //仅为示例
					});
				}else{
					// #ifdef APP-PLUS
					uni.navigateTo({
						animationType: animationType.type,
						animationDuration: animationType.duration,
						url: '/pages/users/web_page/index?webUel=' + this.chatUrl + '&title=客服'
					})
					// #endif
					// #ifndef APP-PLUS
					if (!app.globalData.isIframe) {
						location.href = this.chatUrl;
					}else{
						return false
					}
					// #endif
				}
			},
			wxChatService(){
				let chatUrlArr = this.chatUrl.split('?')
				uni.navigateTo({
					url:`/pages/users/web_page/index?webUel=${chatUrlArr[0]}&title=客服&${chatUrlArr[1]}`
				})
			},
			getOrderData() {
				let that = this;
				orderData().then(res => {
					that.orderMenu.forEach((item, index) => {
						switch (item.title) {
							case '待付款':
								item.num = res.data.unPaidCount
								break
							case '待发货':
								item.num = res.data.unShippedCount
								break
							case '待收货':
								item.num = res.data.receivedCount
								break
							case '待评价':
								item.num = res.data.evaluatedCount
								break
							case '售后/退款':
								item.num = res.data.refundCount
								break
						}
					})
					that.$set(that, 'orderMenu', that.orderMenu);
				})
			},
			// 打开授权
			openAuto() {
				Cache.set(BACK_URL, '')
				toLogin();
			},
			// 绑定手机
			bindPhone() {
				uni.navigateTo({
					animationType: animationType.type,
					animationDuration: animationType.duration,
					url: '/pages/users/app_login/index'
				})
			},
			/**
			 * 
			 * 获取个人中心图标
			 */
			getMyMenus: function() {
				let that = this;
				// if (this.MyMenus.length) return;
				getMenuList().then(res => {
					that.$set(that, 'MyMenus', res.data.routine_my_menus);
					that.wechatUrl = res.data.routine_my_menus.filter((item) => {
						return item.url.indexOf('service') !== -1
					})
					res.data.routine_my_menus.map((item) => {
						if (item.url.indexOf('service') !== -1) that.servicePic = item.pic
					})
					// that.imgUrls = res.data.routine_my_banner
					if(res.data.routine_my_banner){
						that.imgUrls = res.data.routine_my_banner
					}
				}).catch(err=>{
					console.log(err);
				});
			},
			// 编辑页面
			goEdit() {
				if (this.isLogin == false) {
					this.openAuto();
				} else {
					uni.navigateTo({
						animationType: animationType.type,
						animationDuration: animationType.duration,
						url: '/pages/infos/user_info/index'
					})
				}
			},
			goMenuPage(url) {
				if (this.isLogin) {
					uni.navigateTo({
						animationType: animationType.type,
						animationDuration: animationType.duration,
						url
					})
				} else {
					this.openAuto()
				}
			},
			appUpdate(){
				uni.navigateTo({
					url:'/pages/users/app_update/app_update',
					animationType: animationType.type,
					animationDuration: animationType.duration,
				})
			},
			shareApi: function() {
				getShare().then(res => {
					this.$set(this, 'configApi', res.data);
					// #ifdef H5
					this.setOpenShare(res.data);
					// #endif
				})
			},
			// 微信分享；
			setOpenShare: function(data) {
				let that = this;
				if (that.$wechat.isWeixin()) {
					let configAppMessage = {
						desc: data.synopsis,
						title: data.title,
						link: location.href,
						imgUrl: data.img
					};
					that.$wechat.wechatEvevt(["updateAppMessageShareData", "updateTimelineShareData"],
						configAppMessage);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	page,
	body {
		height: 100%;
	}
	.mp-header{
		@include main_bg_color(theme);
	}
	.bg {
		position: absolute;
		left: 0;
		top: 0;
		width:100%;
		height: 420rpx;
		background-image: url('../../static/images/user_bg.png');
		background-repeat: no-repeat;
		background-size: 100% 100%;
	}
	.contenBox {
		padding: 0 30rpx 100rpx 30rpx;
	}

	.support {
		width: 219rpx;
		height: 74rpx;
		margin: 54rpx auto;
		display: block;
	}

	.new-users {
		display: flex;
		flex-direction: column;
		height: 100%;

		.sys-head {
			position: relative;
			width: 100%;
			background: linear-gradient(90deg, $bg-star1 0%, $bg-end1 100%);

			.sys-title {
				z-index: 10;
				position: relative;
				height: 43px;
				text-align: center;
				line-height: 43px;
				font-size: 36rpx;
				color: #FFFFFF;
			}
		}

		.head {
			@include index-gradient(theme);
			.user-card {
				position: relative;
				width: 100%;
				margin: 0 auto;
				padding: 35rpx 0 30rpx 0;
				.user-info {
					z-index: 20;
					position: relative;
					display: flex;

					.avatar {
						width: 120rpx;
						height: 120rpx;
						border-radius: 50%;
					}

					.info {
						flex: 1;
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						margin-left: 20rpx;
						padding: 15rpx 0;
						position: relative;

						.name {
							display: flex;
							align-items: center;
							color: #fff;
							font-size: 31rpx;

							.vip {
								display: flex;
								align-items: center;
								padding: 6rpx 20rpx;
								background: rgba(0, 0, 0, 0.2);
								border-radius: 18px;
								font-size: 20rpx;
								margin-left: 12rpx;

								image {
									width: 27rpx;
									height: 27rpx;
								}
							}
						}
						.app_set{
							position: absolute;
							font-size: 36rpx;
							color: #fff;
							top: 40rpx;
							right: 20rpx;
						}

						.num {
							display: flex;
							align-items: center;
							font-size: 26rpx;
							color: rgba(255, 255, 255, 0.6);

							image {
								width: 22rpx;
								height: 23rpx;
								margin-left: 20rpx;
							}
						}
					}
				}

				.num-wrapper {
					z-index: 30;
					position: relative;
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin-top: 30rpx;
					color: #fff;

					.num-item {
						width: 33.33%;
						text-align: center;

						.num {
							font-size: 42rpx;
							font-weight: bold;
						}

						.txt {
							margin-top: 10rpx;
							font-size: 26rpx;
							color: rgba(255, 255, 255, 0.6);
						}
					}
				}

				.sign {
					z-index: 200;
					position: absolute;
					right: -12rpx;
					top: 80rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					width: 120rpx;
					height: 60rpx;
					background: linear-gradient(90deg, rgba(255, 225, 87, 1) 0%, rgba(238, 193, 15, 1) 100%);
					border-radius: 29rpx 4rpx 4rpx 29rpx;
					color: #282828;
					font-size: 28rpx;
					font-weight: bold;
				}
			}

			.order-wrapper {
				background-color: #fff;
				border-radius: 14rpx;
				padding: 30rpx 16rpx;
				position: relative;
				z-index: 11;
                
				.order-hd {
					justify-content: space-between;
					font-size: 30rpx;
					color: #282828;
					margin-bottom: 40rpx;
					padding: 0 16rpx;

					.left {
						color: #282828;
						font-size: 30rpx;
						font-weight: 600;
					}

					.right {
						align-items: center;
						color: #666666;
						font-size: 26rpx;

						.icon-xiangyou {
							margin-left: 5rpx;
							font-size: 24rpx;
						}
					}
				}

				.order-bd {
					display: flex;
					justify-content: space-between;
					padding: 0;

					.order-item {
						display: flex;
						flex-direction: column;
						justify-content: center;
						align-items: center;

						.pic {
							position: relative;
							text-align: center;

							image {
								width: 48rpx;
								height: 48rpx;
							}
						}

						.txt {
							margin-top: 15rpx;
							font-size: 26rpx;
							color: #454545;
						}
					}
				}
			}
		}

		.slider-wrapper {
			margin: 20rpx 0;
			height: 138rpx;

			swiper,
			swiper-item {
				height: 100%;
			}

			image {
				width: 100%;
				height: 100%;
			}
		}

		.user-menus {
			background-color: #fff;
			border-radius: 14rpx;

			.menu-title {
				padding: 30rpx 30rpx 40rpx;
				font-size: 30rpx;
				color: #282828;
				font-weight: 600;
			}

			.list-box {
				display: flex;
				flex-wrap: wrap;
				padding: 0;
			}

			.item {
				position: relative;
				display: flex;
				align-items: center;
				justify-content: space-between;
				flex-direction: column;
				width: 25%;
				margin-bottom: 47rpx;
				font-size: 26rpx;
				color: #333333;

				image {
					width: 52rpx;
					height: 52rpx;
					margin-bottom: 18rpx;
				}


				&:last-child::before {
					display: none;
				}
			}

			button {
				font-size: 28rpx;
			}
		}

		.jk-identity-card {
			margin: 20rpx 0;
			padding: 28rpx;
			border-radius: 14rpx;
			background: linear-gradient(135deg, #f7fbf9, #edf7f2);
			.identity-head {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 16rpx;
			}
			.identity-title {
				font-size: 30rpx;
				font-weight: 600;
				color: #1f2937;
			}
			.identity-status {
				font-size: 22rpx;
				color: #1f7a5b;
				background: rgba(31, 122, 91, 0.08);
				padding: 8rpx 16rpx;
				border-radius: 999rpx;
			}
			.identity-role,
			.identity-reason,
			.identity-tip {
				font-size: 24rpx;
				line-height: 1.7;
				color: #4b5563;
			}
			.identity-reason {
				margin-top: 8rpx;
				color: #b45309;
			}
			.identity-tag-list {
				display: flex;
				flex-wrap: wrap;
				margin-top: 16rpx;
			}
			.identity-tag {
				margin-right: 12rpx;
				margin-bottom: 12rpx;
				padding: 8rpx 16rpx;
				border-radius: 999rpx;
				font-size: 22rpx;
				background: #ffffff;
				color: #1f2937;
			}
			.identity-action-row {
				display: flex;
				flex-wrap: wrap;
				margin-top: 20rpx;
			}
			.identity-btn {
				margin-right: 16rpx;
				margin-bottom: 16rpx;
				padding: 14rpx 24rpx;
				border-radius: 999rpx;
				background: #ffffff;
				font-size: 24rpx;
				color: #1f7a5b;
			}
			.identity-btn.primary {
				background: #1f7a5b;
				color: #ffffff;
			}
			.identity-btn.disabled {
				background: #e5e7eb;
				color: #6b7280;
			}
			.identity-tip {
				margin-top: 6rpx;
			}
		}
		.phone {
			color: #fff;
		}
		.pic_status{
			font-size: 43rpx;
			@include main_color(theme);
		}
		.order-status-num {
			min-width: 13rpx;
			background-color: #fff;
			@include main_color(theme);
			border-radius: 15px;
			position: absolute;
			right: -14rpx;
			top: -15rpx;
			font-size: 20rpx;
			padding: 0 8rpx;
			@include coupons_border_color(theme);
		}
		
	}
	.sub_btn{
		width: 690rpx;
		height: 86rpx;
		line-height: 86rpx;
		margin-top: 60rpx;
		background: $theme-color;
		border-radius: 43rpx;
		color: #fff;
		font-size: 28rpx;
		text-align: center;
	}

/* ui1.1 visual override */
.user { min-height: 100vh; background: #f7f8fa; }
.user .header { border-radius: 0 0 34rpx 34rpx; background: linear-gradient(180deg, #2fc7ad, #9fe0d6); }
.user .wrapper, .user .user-menus, .user .order-status { margin-right: 22rpx; margin-left: 22rpx; border-radius: 22rpx; background: #fff; box-shadow: 0 8rpx 20rpx rgba(33,45,44,.025); }
.user .user-menus .item { min-height: 100rpx; }

/* UI1.1 identity entry card in the profile page */
.jk-identity-card{margin:22rpx 0!important;padding:28rpx!important;border-radius:24rpx!important;background:linear-gradient(135deg,#e7faf5,#fafffd)!important;box-shadow:0 10rpx 26rpx rgba(28,127,106,.08)}.jk-identity-card .identity-title{color:#303638!important;font-size:32rpx!important;font-weight:700!important}.jk-identity-card .identity-status{background:#d9f5ed!important;color:#119878!important;font-weight:600}.jk-identity-card .identity-role,.jk-identity-card .identity-tip{color:#71817e!important}.jk-identity-card .identity-tag{border:1rpx solid #a5e3d5;background:#fff!important;color:#159e80!important}.jk-identity-card .identity-action-row{gap:14rpx}.jk-identity-card .identity-btn{margin:0!important;padding:14rpx 22rpx!important;border:1rpx solid #a5e3d5;background:#fff!important;color:#159e80!important;font-weight:600}.jk-identity-card .identity-btn.primary{border-color:#28c6a5!important;background:#28c6a5!important;color:#fff!important}.jk-identity-card .jk-business-links{display:flex;flex-wrap:wrap;gap:14rpx;margin-top:2rpx}.jk-identity-card .jk-business-links .identity-btn{flex:0 0 auto}.jk-identity-card .identity-btn.disabled{border-color:#e5e8e7!important;background:#eef1f0!important;color:#9ba4a2!important}

/* Profile identity entry aligned with identity design system. */
.jk-identity-card{margin:24rpx 0!important;padding:32rpx!important;border:0!important;border-radius:20rpx!important;background:#FFF!important;box-shadow:0 4rpx 16rpx rgba(0,0,0,.04)!important}.jk-identity-card .identity-head{margin-bottom:20rpx}.jk-identity-card .identity-title{color:#333!important;font-size:32rpx!important;font-weight:600!important}.jk-identity-card .identity-status{display:flex;align-items:center;height:48rpx;padding:0 18rpx;border-radius:24rpx;background:rgba(40,198,165,.10)!important;color:#159E80!important;font-size:24rpx!important;font-weight:600}.jk-identity-card .identity-role,.jk-identity-card .identity-tip{color:#999!important;font-size:25rpx!important}.jk-identity-card .identity-tag-list,.jk-identity-card .identity-action-row,.jk-identity-card .jk-business-links{display:flex;flex-wrap:wrap;gap:16rpx}.jk-identity-card .identity-tag{display:flex;align-items:center;height:48rpx;margin:0!important;padding:0 20rpx;border:0!important;border-radius:24rpx;background:rgba(40,198,165,.10)!important;color:#159E80!important;font-size:24rpx!important}.jk-identity-card .identity-action-row{margin-top:24rpx!important}.jk-identity-card .identity-btn{display:flex;align-items:center;justify-content:center;min-height:48rpx;margin:0!important;padding:0 22rpx!important;border:0!important;border-radius:24rpx!important;background:#F1F4F3!important;color:#687572!important;font-size:24rpx!important;font-weight:600}.jk-identity-card .identity-btn.primary{background:#28C6A5!important;color:#FFF!important}.jk-identity-card .identity-btn.disabled{background:#EEF1F3!important;color:#9AA3A8!important}
</style>
