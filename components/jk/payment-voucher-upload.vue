<template>
  <view class="voucher">
    <view v-if="value" class="preview" @click="preview">
      <image :src="value" mode="aspectFill" />
      <text>点击预览</text>
    </view>
    <view v-else class="pick" @click="choose">上传付款凭证</view>
    <view v-if="uploading" class="hint">正在上传…</view>
  </view>
</template>

<script>
export default {
  props: { value: { type: String, default: '' } },
  data() {
    return { uploading: false };
  },
  methods: {
    choose() {
      this.uploading = true;
      this.$util.uploadImageOne(
        { url: 'upload/image', name: 'multipart', model: 'user', pid: 7 },
        res => {
          this.uploading = false;
          const data = typeof res === 'string' ? JSON.parse(res) : res;
          const url = (data.data && data.data.url) || (data.data && data.data.path) || data.url || data.path;
          if (url) {
            this.$emit('input', url);
            this.$emit('success', url);
            return;
          }
          this.$util.Tips({ title: '上传结果缺少图片地址' });
        },
        () => {
          this.uploading = false;
          this.$util.Tips({ title: '凭证上传失败' });
        }
      );
    },
    preview() {
      uni.previewImage({ urls: [this.value], current: this.value });
    }
  }
};
</script>

<style scoped>
.voucher { margin: 16rpx 0; }
.pick { border: 2rpx dashed #62cfa4; border-radius: 16rpx; padding: 36rpx; text-align: center; color: #1f9b72; background: #f1fbf6; }
.preview { display: flex; align-items: center; gap: 18rpx; color: #1f7a5b; }
.preview image { width: 120rpx; height: 120rpx; border-radius: 12rpx; }
.hint { color: #78918b; font-size: 24rpx; }
</style>