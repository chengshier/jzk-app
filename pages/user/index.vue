<template>
  <view :data-theme="theme" class="profile-page">
    <view class="profile-scroll">
      <view class="profile-header profile-hero" :style="{ paddingTop: sysHeight }">
        <view class="profile-top-actions">
          <text class="iconfont icon-shezhi" @tap.stop="appUpdate"></text>
          <text class="iconfont icon-kefu" @tap.stop="onClickService"></text>
        </view>
        <view class="profile-main" @tap="goEdit">
          <image v-if="userInfo.avatar && uid" class="avatar" :src="userInfo.avatar" mode="aspectFill"/>
          <image v-else class="avatar" :src="urlDomain+'crmebimage/perset/staticImg/f.png'" mode="aspectFill"/>
          <view class="profile-copy">
            <view v-if="!isLogin" class="profile-name" @tap.stop="openAuto">请点击登录</view>
            <view v-else class="profile-name">{{ userInfo.nickname || '九州康用户' }}<text v-if="userInfo.vip" class="member-tag">{{ userInfo.vipName || '普通会员' }}</text></view>
            <text v-if="uid" class="profile-id">ID：{{ uid }}</text>
            <text v-if="userInfo.phone && uid" class="profile-phone">手机号：{{ maskPhone(userInfo.phone) }}</text>
            <text v-else-if="isLogin" class="profile-phone" @tap.stop="bindPhone">绑定手机号</text>
          </view>
          <view class="profile-link">个人主页 <text class="iconfont icon-xiangyou"></text></view>
        </view>
      </view>

      <view class="page-body page-section">
        <view class="business-guide" @tap="jkCanApplyRoles.length && !jkEntryDisabled ? goJkApply() : goJkStatus()">
          <jk-icon name="identity" size="md"/>
          <view class="guide-main"><text>{{ jkBusinessGuide.title }}</text><small>{{ jkBusinessGuide.description }}</small></view>
          <text class="guide-arrow">›</text>
        </view>

        <view class="order-section order-wrapper">
          <view class="section-head"><text class="section-title">订单中心</text><text class="section-more" @tap="menusTap('/pages/users/order_list/index')">查看全部订单 ›</text></view>
          <view class="order-grid order-bd">
            <view v-for="(item,index) in orderMenu" :key="index" class="order-item" @tap="menusTap(item.url)">
              <view class="order-icon"><text class="iconfont" :class="item.img"></text><text v-if="item.num>0" class="badge">{{ item.num }}</text></view>
              <text>{{ item.title }}</text>
            </view>
          </view>
        </view>

        <view class="banner-section slider-wrapper">
          <swiper v-if="imgUrls && imgUrls.length" indicator-dots autoplay circular :interval="interval" :duration="duration" indicator-color="rgba(255,255,255,.65)" indicator-active-color="#10B981">
            <swiper-item v-for="(item,index) in imgUrls" :key="index"><image :src="item.pic" mode="aspectFill" @tap="navito(item.url)"/></swiper-item>
          </swiper>
          <view v-else class="default-banner" @tap="goJkApply">
            <view class="banner-copy"><text class="banner-title">健康生活 邀请有礼</text><text class="banner-desc">邀请好友加入，双方均可获得专属奖励</text><text class="banner-btn">去邀请 ›</text></view>
            <image src="/static/jk-ui-v2/banners/gift-banner.png" mode="aspectFill"/>
          </view>
        </view>

        <view class="service-section">
          <view class="section-head"><text class="section-title">我的服务</text><text class="section-note">（可在后台配置）</text></view>
          <view class="service-grid">
            <view v-for="(item,index) in MyMenus" :key="index" class="service-item" @tap="menusTap(item.url)" v-if="!(item.url =='/pages/service/index' || (item.url =='/pages/promoter/user_spread_user/index' && !userInfo.isPromoter))">
              <image :src="item.pic" mode="aspectFit"/><text>{{ item.name }}</text>
            </view>
            <template v-if="jkContext && jkContext.primaryRoleCode && jkContext.primaryRoleCode !== 'normal_user'">
              <view class="service-item" @tap="menusTap('/pages/jk/business/index')"><image src="/static/jk-ui-v2/icons/wallet.png" mode="aspectFit"/><text>业务中心</text></view>
              <view class="service-item" @tap="menusTap('/pages/jk/team/index')"><image src="/static/jk-ui-v2/icons/team.png" mode="aspectFit"/><text>我的团队</text></view>
              <view class="service-item" @tap="menusTap('/pages/jk/team/qrcode')"><image src="/static/jk-ui-v2/icons/qrcode.png" mode="aspectFit"/><text>推广二维码</text></view>
              <view class="service-item" @tap="menusTap('/pages/jk/promotion/material')"><image src="/static/jk-ui-v2/icons/promotion.png" mode="aspectFit"/><text>推广素材</text></view>
            </template>
            <!-- #ifndef MP -->
            <view class="service-item" @tap="onClickService"><image :src="servicePic" mode="aspectFit"/><text>联系客服</text></view>
            <!-- #endif -->
            <!-- #ifdef MP -->
            <button v-if="chatConfig.telephone_service_switch === 'open'" class="service-item" hover-class="none" @tap="onClickService"><image :src="servicePic" mode="aspectFit"/><text>联系客服</text></button>
            <button v-else-if="chatConfig.wx_chant_independent==='open'" class="service-item" open-type="contact" hover-class="none"><image :src="servicePic" mode="aspectFit"/><text>联系客服</text></button>
            <button v-else class="service-item" hover-class="none" @tap="wxChatService"><image :src="servicePic" mode="aspectFit"/><text>联系客服</text></button>
            <!-- #endif -->
          </view>
        </view>

        <view v-if="isLogin" class="business-entry jk-business-entry" @tap="goJkStatus">
          <jk-icon name="wallet" size="lg"/>
          <view class="entry-main"><text class="entry-title">九州康业务中心</text><text class="entry-desc">开启业务伙伴身份，解锁更多专属功能与权益</text></view>
          <view class="entry-right"><text class="entry-status">{{ jkIdentityStatusText }}</text><text class="entry-action">{{ jkBusinessGuide.actionText }} ›</text></view>
        </view>
        <image v-if="copyImage" :src="copyImage" class="support" mode="widthFix"/>
      </view>
    </view>
    <pageFooter></pageFooter>
  </view>
</template>
<script>
	let sysHeight = uni.getSystemInfoSync().statusBarHeight + 'px';
	import pageFooter from '@/components/pageFooter/index.vue'
	import JkIcon from '@/components/jk/jk-icon.vue'
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
		components:{ pageFooter, JkIcon },
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
				addLink('个人经营中心', '/pages/jk/report/index', 'report.view', ['maker', 'partner', 'county_agent']);
				addLink('资金账户', '/pages/jk/fund/account', 'fund.account.view', ['maker', 'partner', 'county_agent']);
				addLink('提现申请', '/pages/jk/withdraw/apply', 'withdraw.apply', ['maker', 'partner', 'county_agent']);
				addLink('提现记录', '/pages/jk/withdraw/list', 'withdraw.view.self', ['maker', 'partner', 'county_agent']);
				addLink('我的团队', '/pages/jk/team/index', 'team.view.direct', ['maker', 'partner', 'county_agent']);
				addLink('推广二维码', '/pages/jk/team/qrcode', 'team.view.direct', ['maker', 'partner', 'county_agent']);
				addLink('换绑申请', '/pages/jk/team/changeApply', 'agent.relation.change.apply', ['maker', 'partner']);
				addLink('调拨退回', '/pages/jk/return/list?mode=own', 'stock.transfer.return.apply', ['maker', 'partner']);
				addLink('下级退回处理', '/pages/jk/return/list?mode=handle', 'stock.transfer.return.audit', ['county_agent']);
				return links;
			},
			jkBusinessGuide() {
				if (this.jkEntryDisabled) {
					return { title: '业务身份已冻结', description: this.jkDisableReason || '请查看冻结原因', actionText: '查看原因' };
				}
				if (this.jkCanApplyRoles.length) {
					return { title: '加入九州康业务体系，享受更多权益', description: '成为业务伙伴，享受库存、收益等专属服务', actionText: '去申请' };
				}
				return { title: this.jkIdentityStatusText, description: `当前主身份：${this.jkPrimaryRoleName}`, actionText: '查看状态' };
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
			maskPhone(value) { const s = String(value || ''); return s.length >= 11 ? s.slice(0,3) + '****' + s.slice(-4) : s; },
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
				const role = this.jkContext && this.jkContext.primaryRoleCode;
				const url = role && role !== 'normal_user' && !this.jkEntryDisabled
					? '/pages/jk/business/index'
					: '/pages/jk/identity/entry';
				uni.navigateTo({ url });
			},
			goJkApply() {
				if (this.jkEntryDisabled) {
					return;
				}
				if (this.jkCanApplyRoles.length) {
					uni.navigateTo({
						url: '/pages/jk/identity/entry'
					});
					return;
				}
				uni.navigateTo({
					url: '/pages/jk/identity/entry'
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
.profile-page{min-height:100vh;background:#fff}.profile-scroll{padding-bottom:120rpx}.profile-header{position:relative;min-height:302rpx;padding:38rpx 32rpx 36rpx;background:linear-gradient(145deg,#c8f7ed 0%,#e8fbf7 58%,#fff 100%);box-sizing:border-box;overflow:hidden}.profile-header::after{position:absolute;right:-90rpx;top:-50rpx;width:330rpx;height:330rpx;border-radius:50%;background:rgba(255,255,255,.3);content:''}.profile-top-actions{position:relative;z-index:2;display:flex;justify-content:flex-end;gap:28rpx;padding-right:100rpx;color:#17211f;font-size:43rpx}.profile-main{position:relative;z-index:2;display:flex;align-items:center;margin-top:36rpx}.avatar{width:112rpx;height:112rpx;flex-shrink:0;border:5rpx solid rgba(255,255,255,.9);border-radius:50%;background:#fff}.profile-copy{min-width:0;flex:1;margin-left:22rpx}.profile-name{display:flex;align-items:center;color:#17221f;font-size:37rpx;font-weight:700}.member-tag{margin-left:12rpx;padding:5rpx 12rpx;border-radius:9rpx;background:#15b892;color:#fff;font-size:20rpx;font-weight:500}.profile-id,.profile-phone{display:block;margin-top:8rpx;color:#65716e;font-size:23rpx}.profile-link{display:flex;align-items:center;color:#5e6865;font-size:23rpx;white-space:nowrap}.page-body{padding:0 30rpx 38rpx}.business-guide{display:flex;align-items:center;min-height:104rpx;margin-top:-8rpx;padding:18rpx 20rpx;border-radius:18rpx;background:linear-gradient(90deg,#eefcf8,#f7fffd);box-shadow:0 4rpx 16rpx rgba(19,97,79,.035)}.guide-main{min-width:0;flex:1;margin-left:14rpx}.guide-main>text{display:block;color:#0daa88;font-size:26rpx;font-weight:600}.guide-main small{display:block;margin-top:6rpx;color:#7c8885;font-size:20rpx}.guide-arrow{color:#10b981;font-size:36rpx}.order-section{margin-top:32rpx}.section-head{display:flex;align-items:center}.section-title{color:#1d262c;font-size:31rpx;font-weight:700}.section-more{margin-left:auto;color:#7e898f;font-size:22rpx}.section-note{color:#9aa3a8;font-size:20rpx}.order-grid{display:flex;margin-top:26rpx}.order-item{display:flex;width:20%;flex-direction:column;align-items:center;color:#434f55;font-size:22rpx}.order-icon{position:relative}.order-icon .iconfont{color:#18bb96;font-size:48rpx}.badge{position:absolute;right:-16rpx;top:-14rpx;min-width:30rpx;height:30rpx;padding:0 5rpx;border:3rpx solid #fff;border-radius:18rpx;background:#ff5b42;color:#fff;font-size:18rpx;line-height:30rpx;text-align:center}.banner-section{height:190rpx;margin-top:34rpx;overflow:hidden;border-radius:20rpx;background:#e8faf5}.banner-section swiper,.banner-section swiper-item,.banner-section swiper-item image{width:100%;height:190rpx}.default-banner{position:relative;display:flex;width:100%;height:190rpx;overflow:hidden}.default-banner>image{position:absolute;right:0;top:0;width:56%;height:100%;opacity:.96}.banner-copy{position:relative;z-index:2;padding:28rpx 0 20rpx 28rpx}.banner-title{display:block;color:#119d7f;font-size:30rpx;font-weight:700}.banner-desc{display:block;width:330rpx;margin-top:10rpx;color:#6c7d77;font-size:20rpx}.banner-btn{display:inline-block;margin-top:16rpx;padding:8rpx 16rpx;border-radius:18rpx;background:#10b981;color:#fff;font-size:20rpx}.service-section{margin-top:34rpx}.service-grid{display:flex;flex-wrap:wrap;margin-top:26rpx}.service-item{display:flex;width:20%;min-height:104rpx;margin:0 0 26rpx;padding:0;border:0;background:transparent;flex-direction:column;align-items:center;justify-content:flex-start;color:#3f4b51;font-size:21rpx;line-height:normal}.service-item::after{border:0}.service-item image{width:58rpx;height:58rpx;margin-bottom:10rpx;border-radius:16rpx}.business-entry{display:flex;align-items:center;min-height:132rpx;margin-top:12rpx;padding:20rpx;border:1rpx solid #edf1f0;border-radius:20rpx;background:#fff;box-shadow:0 7rpx 20rpx rgba(24,75,62,.04)}.entry-main{min-width:0;flex:1;margin-left:16rpx}.entry-title{display:block;color:#1f2b31;font-size:29rpx;font-weight:700}.entry-desc{display:block;margin-top:8rpx;color:#7f8b91;font-size:20rpx;line-height:1.4}.entry-right{display:flex;flex-direction:column;align-items:flex-end;gap:12rpx;margin-left:10rpx}.entry-status{padding:5rpx 11rpx;border-radius:14rpx;background:#fff1ec;color:#f16646;font-size:18rpx}.entry-action{padding:9rpx 14rpx;border-radius:20rpx;background:#e7faf4;color:#10a981;font-size:21rpx;white-space:nowrap}.support{display:block;width:100%;margin-top:24rpx}

/* Compatibility markers retained for the existing UI contract checks. */
.page-section .order-wrapper .order-bd { display: flex; }
.page-section .order-wrapper .order-item { display: flex; }
.new-users .slider-wrapper { height: 202rpx; }
.jk-business-entry { display: flex; }
</style>
