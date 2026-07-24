<template>
  <view class="voucher-upload">
    <view v-if="value" class="preview" @tap="preview">
      <image :src="value" mode="aspectFill" />
      <view><text>付款凭证已上传</text><small>点击预览，重新上传可先删除当前凭证</small></view>
      <text class="remove" @tap.stop="remove">×</text>
    </view>
    <view v-else class="pick" @tap="choose">
      <image src="/static/jk-ui-v2/icons/document.png" mode="aspectFit" />
      <text>{{ uploading ? '正在上传…' : '点击上传付款凭证' }}</text>
      <small>支持 JPG/PNG 格式，单张不超过 10MB</small>
    </view>
  </view>
</template>
<script>
export default {
  props:{value:{type:String,default:''}},
  data(){return{uploading:false};},
  methods:{
    choose(){if(this.uploading)return;this.uploading=true;this.$util.uploadImageOne({url:'upload/image',name:'multipart',model:'user',pid:7},res=>{this.uploading=false;const data=typeof res==='string'?JSON.parse(res):res;const url=(data.data&&(data.data.url||data.data.path))||data.url||data.path;if(url){this.$emit('input',url);this.$emit('success',url);return;}this.$util.Tips({title:'上传结果缺少图片地址'});},()=>{this.uploading=false;this.$util.Tips({title:'凭证上传失败'});});},
    preview(){uni.previewImage({urls:[this.value],current:this.value});},remove(){this.$emit('input','');this.$emit('remove');}
  }
};
</script>
<style scoped>
.voucher-upload{width:100%}.pick{display:flex;min-height:190rpx;flex-direction:column;align-items:center;justify-content:center;border:2rpx dashed #cfe6df;border-radius:14rpx;background:#fbfdfc;color:#415058}.pick image{width:76rpx;height:76rpx;margin-bottom:9rpx}.pick text{font-size:23rpx}.pick small{margin-top:7rpx;color:#9aa4a9;font-size:18rpx}.preview{position:relative;display:flex;align-items:center;padding:14rpx;border-radius:14rpx;background:#f5fbf9}.preview image{width:116rpx;height:116rpx;border-radius:11rpx}.preview>view{display:flex;flex:1;flex-direction:column;gap:7rpx;margin-left:12rpx}.preview text{color:#273239;font-size:22rpx}.preview small{color:#869298;font-size:18rpx}.remove{display:flex;align-items:center;justify-content:center;width:34rpx;height:34rpx;border-radius:50%;background:#ef5b4c!important;color:#fff!important;font-size:25rpx}
</style>
