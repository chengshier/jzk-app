<template>
	<view class="page" :data-theme="theme" :style="{'background-image': `url(${backBg})`}">
		<view class="system-height" :style="{height:statusBarHeight}"></view>
		<!-- #ifdef MP -->
		<view class="title-bar" style="height: 43px;">
			<view class="icon" @click="back" v-if="!isHome">
				<image :src="urlDomain+'crmebimage/perset/usersImg/left.png'"></image>
			</view>
			<view class="icon" @click="home" v-else>
				<image :src="urlDomain+'crmebimage/perset/usersImg/home.png'"></image>
			</view>
			账户登录
		</view>
		<!-- #endif -->
		<view class="wechat_login">
			<view class="img acea-row row-center">
				<image :src="mobileLoginLogo" mode="widthFix" class="image"></image>
			</view>
			<view class="company">{{companyName}}</view>
			<!-- #ifdef MP -->
			<view class="login-switch">
				<view class="login-switch__item" :class="{ 'is-active': loginMode === 'wechat' }" @click="switchLoginMode('wechat')">微信登录</view>
				<view class="login-switch__item" :class="{ 'is-active': loginMode === 'account' }" @click="switchLoginMode('account')">账号登录</view>
			</view>
			<!-- #endif -->
			<view class="btn-wrapper">
				<!-- #ifdef H5 -->
				<button hover-class="none" @click="wechatLogin" class="btn1 bg-color"><text
						class='iconfont icon-weixin2'></text>立即登录</button>
				<!-- #endif -->
				<!-- #ifdef MP -->
				<view v-if="loginMode === 'wechat'">
					<button v-if="wxLogin" hover-class="none"
						@click="getUserProfile" class="btn1 bg-color">立即登录</button>
					<view v-else>
						<button v-if="routinePhoneVerification == 1 || routinePhoneVerification.length===3" hover-class="none"
							@click="onUserPhone" class="btn1 bg-color"><text
								class='iconfont'></text>一键绑定手机号</button>
						<button v-if="routinePhoneVerification == 2 || routinePhoneVerification.length===3" hover-class="none"
							@click="onUserPhone('isPhone')" class="btn2">手动绑定手机号</button>
					</view>
				</view>
				<view v-else class="wechat-login__account-form">
					<view class="wechat-login__field">
						<input v-model.trim="account" class="wechat-login__input" type="text" placeholder="请输入账号" maxlength="16" />
					</view>
					<view class="wechat-login__field">
						<input v-model="password" class="wechat-login__input" type="text" password placeholder="请输入密码" maxlength="18" />
					</view>
					<button hover-class="none" @click="submitAccountLogin" class="btn1 bg-color">账号密码登录</button>
					<button hover-class="none" @click="switchLoginMode('wechat')" class="btn2">返回微信登录</button>
				</view>
				<!-- #endif -->
			</view>
		</view>
		<block v-if="isUp">
			<mobileLogin :isUp="isUp" :loginConfig="loginConfig" @close="maskClose" :authKey="authKey" @wechatPhone="wechatPhone"></mobileLogin>
		</block>
		<atModel v-if="isPhoneBox" :userPhoneType="true" :isPhoneBox="isPhoneBox" :authKey="authKey"
			:content="getPhoneContent" @closeModel="bindPhoneClose" @confirmModel="confirmModel"></atModel>
	</view>
</template>

<script>
	const app = getApp();
	let statusBarHeight = uni.getSystemInfoSync().statusBarHeight + 'px';
	import mobileLogin from '@/components/login_mobile/index.vue'
	import atModel from '@/components/accredit/index.vue'
	import {
		mapGetters
	} from "vuex";
	import {
		getUserPhone
	} from '@/api/public';
	import {
		BACK_URL,
		LOGO_URL,
		EXPIRES_TIME,
		USER_INFO,
		STATE_R_KEY
	} from '@/config/cache';
	import {
		HTTP_REQUEST_URL
	} from '@/config/app';
	import {
		getUserInfo,
		loginH5,
		spread
	} from '@/api/user.js'
	import Routine from '@/libs/routine';
	import wechat from "@/libs/wechat";
	import { Debounce } from '@/utils/validate.js'
	export default {
		data() {
			return {
				urlDomain: this.$Cache.get("imgHost"),
				isUp: false, // 绑定手机号手动输入弹窗
				phone: '',
				statusBarHeight: statusBarHeight,
				isHome: false,
				isPhoneBox: false, //授权手机号弹窗
				code: '',
				authKey: '',
				options: '',
				userInfo: {},
				codeNum: 0,
				pageStyle: {}, //背景图
				theme: app.globalData.theme,
				// urlDomain: this.$GLOBAL.urlDomain,
				backBg: '', //背景图片
				getPhoneContent: '申请获取您的手机号用于注册，完成后可使用商城更多功能',
				wxCode: '', //小程序code值
				companyName: app.globalData.companyName, //公司名称
				routinePhoneVerification: app.globalData.routinePhoneVerification, //小程序手机号校验类型（多选）1微信小程序验证 2短信验证
				loginConfig: '' ,//小程序绑定手机号，isPhone其他手机号绑定
				wxLogin: true ,//登录显示
				loginMode: 'wechat',
				account: '',
				password: '',
				mobileLoginLogo: app.globalData.mobileLoginLogo // 登录页logo
			}
		},
		components: {
			mobileLogin,
			atModel
		},
		onLoad(options) {
			//背景图片
			switch (app.globalData.theme) {
				case 'theme1':
					this.backBg = `${this.urlDomain}crmebimage/perset/usersImg/wxbj1.png`;
					break;
				case 'theme2':
					this.backBg = `${this.urlDomain}crmebimage/perset/usersImg/wxbj2.png`;
					break;
				case 'theme3':
					this.backBg = `${this.urlDomain}crmebimage/perset/usersImg/wxbj3.png`;
					break;
				case 'theme4':
					this.backBg = `${this.urlDomain}crmebimage/perset/usersImg/wxbj4.png`;
					break;
				case 'theme5':
					this.backBg = `${this.urlDomain}crmebimage/perset/usersImg/wxbj5.png`;
					break;
				case 'theme6':
					this.backBg = `${this.urlDomain}crmebimage/perset/usersImg/wxbj3.png`;
					break;
			}

			let that = this
			// #ifdef H5
			document.body.addEventListener("focusout", () => {
				setTimeout(() => {
					const scrollHeight = document.documentElement.scrollTop || document.body.scrollTop ||
						0;
					window.scrollTo(0, Math.max(scrollHeight - 1, 0));
				}, 100);
			});
			const {
				code,
				state,
				scope
			} = options;
			this.options = options
			// 获取确认授权code
			this.code = code || ''
			//if(!code) location.replace(decodeURIComponent(decodeURIComponent(option.query.back_url)));
			if (code && this.options.scope !== 'snsapi_base') {
				let spread = app.globalData.spread ? app.globalData.spread : 0;
				//公众号授权登录回调 wechatAuth(code, Cache.get("spread"), loginType)
				wechat.auth(code, spread).then(res => {
					if (res.type === 'register') {
						this.authKey = res.key;
						this.isUp = true
					}
					if (res.type === 'login') {
						this.$store.commit('LOGIN', {
							token: res.token
						});
						this.$store.commit("SETUID", res.uid);
						this.getUserInfo();
						//this.wechatPhone();
						//location.replace(decodeURIComponent(decodeURIComponent(option.query.back_url)));
					}
				}).catch(error => {});
			}
			// #endif
			let pages = getCurrentPages();
			// let prePage = pages[pages.length - 2];
			// if (prePage.route == 'pages/order_addcart/order_addcart') {
			// 	this.isHome = true
			// } else {
			// 	this.isHome = false
			// }

		},
		methods: {

			switchLoginMode(mode) {
				this.loginMode = mode;
			},
			submitAccountLogin: Debounce(function() {
				if (!this.account) return this.$util.Tips({
					title: '请填写账号'
				});
				if (!/^[\w\d]{5,16}$/i.test(this.account)) return this.$util.Tips({
					title: '请输入正确的账号'
				});
				if (!this.password) return this.$util.Tips({
					title: '请填写密码'
				});
				uni.showLoading({
					title: '登录中'
				});
				loginH5({
					account: this.account,
					password: this.password,
					spread_spid: this.$Cache.get('spread')
				}).then(({ data }) => {
					this.$store.commit('LOGIN', {
						token: data.token
					});
					this.getUserInfo(data);
				}).catch(err => {
					uni.hideLoading();
					this.$util.Tips({
						title: err
					});
				});
			}),

			//绑定手机号弹窗回调
			confirmModel() {
				this.isPhoneBox = false;
				this.isUp = true
			},
			back() {
				uni.navigateBack();
			},
			home() {
				uni.switchTab({
					url: '/pages/index/index'
				})
			},
			modelCancel() {
				this.isPhoneBox = false;
			},
			// 弹窗关闭
			maskClose() {
				// this.isUp = false  //点击模态框会关闭登录弹框，防止用户误触而关闭
			},
			bindPhoneClose(data) {
				if (data.isStatus) {
					this.isPhoneBox = false
					this.$util.Tips({
						title: '登录成功',
						icon: 'success'
					}, {
						tab: 3
					})
				} else {
					this.isPhoneBox = false
				}

			},
			// #ifdef MP
			/**
			 * 获取个人用户信息
			 */
			getUserInfo: function(loginData) {
				let that = this;
				if (loginData && loginData.uid) {
					that.$store.commit('SETUID', loginData.uid);
				}
				getUserInfo().then(res => {
					uni.hideLoading();
					that.userInfo = res.data
					that.$store.commit("UPDATE_USERINFO", res.data);
					let backUrl = that.$Cache.get(BACK_URL) || '/pages/index/index';
					if (backUrl.indexOf('/pages/users/login/index') !== -1 || backUrl.indexOf('/pages/users/wechat_login/index') !== -1) {
						backUrl = '/pages/index/index';
					}
					uni.reLaunch({
						url: backUrl
					});
				});
			},
			//绑定手机号
			onUserPhone(type) {
				this.loginConfig = type;
				//如果是其他手机号绑定，调整页面。否则授权本机手机号登录
				if (this.loginConfig === 'isPhone') {
					uni.navigateTo({
						url: `/pages/users/app_login/index?code=${this.wxCode}&authKey=${this.authKey}`
					})
				} else {
					this.isPhoneBox = true
				}
			},
			//wx小程序立即登录
			getUserProfile() {
				let self = this;
				uni.showLoading({
					title: '正在登录中'
				});
				const hostSDKVersion = uni.getSystemInfoSync().hostSDKVersion; //小程序基础库版本号
				if (Routine.compareVersion(hostSDKVersion, '2.21.2') >= 0) {
					Routine.getCode()
						.then(code => {
							let userInfo = {};
							userInfo.code = code;
							userInfo.spread_spid = app.globalData.spread; //获取推广人ID
							userInfo.avatar = '';
							userInfo.nickName = '微信用户';
							userInfo.type = 'routine'
							self.getWxUser(code, userInfo);
						})
						.catch(res => {
							uni.hideLoading();
						});
				} else {
					Routine.getUserProfile().then(res => {
							Routine.getCode()
								.then(code => {
									let userInfo = res.userInfo;
									userInfo.code = code;
									userInfo.spread_spid = app.globalData.spread; //获取推广人ID
									userInfo.avatar = userInfo.userInfo.avatarUrl;
									userInfo.city = userInfo.userInfo.city;
									userInfo.country = userInfo.userInfo.country;
									userInfo.nickName = userInfo.userInfo.nickName;
									userInfo.province = userInfo.userInfo.province;
									userInfo.sex = userInfo.userInfo.gender;
									userInfo.type = 'routine'
									self.getWxUser(code, userInfo);
								})
								.catch(res => {
									uni.hideLoading();
								});
						})
						.catch(res => {
							uni.hideLoading();
						});
				}
			},
			// 登录调用方法
			getWxUser(code, userInfo) {
				this.wxCode = code;
				let self = this;
				Routine.authUserInfo(userInfo.code, userInfo)
					.then(res => {
						self.authKey = res.data.key;
						if (res.data.type === 'register') {
							uni.hideLoading();
							self.wxLogin = false;
						}
						if (res.data.type === 'login') {
							uni.hideLoading();
							self.$store.commit('LOGIN', {
								token: res.data.token
							});
							self.$store.commit("SETUID", res.data.uid);
							self.getUserInfo();
							if (app.globalData.spread) {
								spread(app.globalData.spread).then(res => {}) //登录成功后读取spread绑定分销关系
							}
							self.$util.Tips({
								title: res,
								icon: 'success'
							}, {
								tab: 3
							})
						}
					})
					.catch(res => {
						uni.hideLoading();
						uni.showToast({
							title: res,
							icon: 'none',
							duration: 2000
						});
					});
			},
			// #endif
			// #ifdef H5
			// 获取url后面的参数
			getQueryString(name) {
				var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
				var reg_rewrite = new RegExp("(^|/)" + name + "/([^/]*)(/|$)", "i");
				var r = window.location.search.substr(1).match(reg);
				var q = window.location.pathname.substr(1).match(reg_rewrite);
				if (r != null) {
					return unescape(r[2]);
				} else if (q != null) {
					return unescape(q[2]);
				} else {
					return null;
				}
			},
			// 公众号登录
			wechatLogin() {
				if (!this.code && this.options.scope !== 'snsapi_base') {
					this.$wechat.oAuth('snsapi_userinfo', '/pages/users/wechat_login/index');
				} else {
					// if (this.authKey) {
					// 	this.isUp = true;
					// }
					this.isUp = true;
				}
			},
			// 输入手机号后的回调
			wechatPhone() {
				this.$Cache.clear('snsapiKey');
				if (this.options.back_url) {
					let url = uni.getStorageSync('snRouter');
					url = url.indexOf('/pages/index/index') != -1 ? '/' : url;
					if (url.indexOf('/pages/users/wechat_login/index') !== -1) {
						url = '/';
					}
					if (!url) {
						url = '/pages/index/index';
					}
					this.isUp = false
					uni.showToast({
						title: '登录成功',
						icon: 'none'
					})
					setTimeout(res => {
						location.href = url
					}, 800)
				} else {
					uni.navigateBack()
				}
			}
			// #endif
		}
	}
</script>
<style lang="scss">
	page {
		background: #fff;
		height: 100%;
	}
</style>
<style lang="scss" scoped>
	.icon-weixin2{
		margin-right: 10rpx;
	}
	.company {
		font-size: 40rpx;
		color: #333;
		text-align: center;
		font-weight: 500;
		margin: 32rpx 0 48rpx 0;
	}

	.login-switch {
		display: flex;
		margin: 0 66rpx 32rpx;
		padding: 8rpx;
		border-radius: 999rpx;
		background: #f3f6f8;
		gap: 8rpx;
	}

	.login-switch__item {
		flex: 1;
		height: 68rpx;
		line-height: 68rpx;
		border-radius: 999rpx;
		text-align: center;
		font-size: 28rpx;
		color: #7b8794;
	}

	.login-switch__item.is-active {
		background: #fff;
		color: #333;
		font-weight: 600;
		box-shadow: 0 8rpx 20rpx rgba(31, 39, 61, 0.08);
	}

	.page {
		background: #fff;
		height: 100%;
		background-size: contain;
		background-repeat: no-repeat;
	}

	.wechat_login {
		padding-top: 238rpx;

		.img .image {
			width: 152rpx;
			height: 152rpx;
		}

		.btn-wrapper {
			margin-top: 32rpx;
			padding: 0 66rpx;

			button {
				width: 100%;
				height: 86rpx;
				line-height: 84rpx;
				margin-bottom: 32rpx;
				border-radius: 120rpx;
				font-size: 32rpx;

				&.btn1 {
					color: #fff;
				}

				&.btn2 {
					color: #666666;
					border: 2px solid #E4E4E4;
				}
			}
		}

		.wechat-login__account-form {
			padding-top: 8rpx;
		}

		.wechat-login__field {
			display: flex;
			align-items: center;
			height: 96rpx;
			padding: 0 28rpx;
			margin-bottom: 24rpx;
			border-radius: 24rpx;
			background: #fff;
			box-shadow: 0 12rpx 32rpx rgba(31, 39, 61, 0.08);
		}

		.wechat-login__input {
			width: 100%;
			font-size: 30rpx;
			color: #333;
		}
	}

	.title-bar {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 36rpx;
	}

	.icon {
		position: absolute;
		left: 30rpx;
		top: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 86rpx;
		height: 86rpx;

		image {
			width: 50rpx;
			height: 50rpx;
		}
	}
</style>