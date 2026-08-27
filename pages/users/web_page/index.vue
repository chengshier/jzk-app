<template>
	<web-view class="web-view" :webview-styles="webviewStyles" :src="url" :style="{width: windowW + 'px', height: windowH + 'px'}" @message="onWebMessage"></web-view>
</template>

<script>
	import {
		mapGetters
	} from "vuex";
	export default {
		//computed: mapGetters(['chatUrl']),
		data() {
			return {
				windowH: 0,
				windowW: 0,
				webviewStyles: {
					progress: {
						color: 'transparent'
					}
				},
				url: ''
			}
		},
		onLoad(option) {
			if(option.webUel) this.url = decodeURIComponent(option.webUel);
			// 蚂蚁智能客服场景参数
			if(option.tntInstId) this.url += `?tntInstId=${option.tntInstId}`;
			if(option.scene) this.url += `&scene=${option.scene}`;
			uni.setNavigationBarTitle({
				title: option.title ? decodeURIComponent(option.title) : ''
			})
			try {
				const res = uni.getSystemInfoSync();
				this.windowW = res.windowWidth;
				this.windowH = res.windowHeight;
			} catch (e) {
				// error
			}
		},
		methods: {
			// 接收 web-view 内 H5 通过 uni.postMessage 发来的消息（App 端）
			onWebMessage(e) {
				const list = (e && e.detail && e.detail.data) || [];
				const msg = list.length ? list[list.length - 1] : {};
				if (msg && msg.action === 'launchNative' && msg.page) {
					uni.redirectTo({ url: msg.page });
				}
			}
		}
	}
</script>
