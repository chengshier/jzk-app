<template>
  <view class="material-page">
    <jk-page-nav title="推广素材"/>
    <view class="tabs">
      <text v-for="item in tabs" :key="item.value" :class="{active:active===item.value}" @tap="changeTab(item.value)">{{item.label}}</text>
    </view>
    <view class="material-content">
      <view v-for="item in materials" :key="item.id" class="material-card">
        <image v-if="item.imageUrl" class="material-image" :src="item.imageUrl" mode="aspectFill"/>
        <view class="material-main">
          <view class="title-row"><text>{{item.title}}</text><jk-status-tag :text="typeText(item.type)" tone="success"/></view>
          <text class="description">{{item.description||'暂无素材说明'}}</text>
          <view v-if="item.copyText" class="copy-box"><text>{{item.copyText}}</text></view>
          <view class="actions">
            <button v-if="item.copyText" class="outline-btn" @tap="copyText(item)"><jk-icon name="document" size="sm"/>复制文案</button>
            <button v-if="item.imageUrl" class="primary-btn" @tap="saveImage(item)"><jk-icon name="promotion" size="sm"/>保存图片</button>
          </view>
        </view>
      </view>
      <jk-empty v-if="loaded&&!materials.length" text="后台暂未发布可用推广素材"/>
      <view v-if="!loaded" class="loading-tip">素材加载中...</view>
    </view>
  </view>
</template>
<script>
import JkPageNav from'@/components/jk/jk-page-nav.vue';
import JkIcon from'@/components/jk/jk-icon.vue';
import JkStatusTag from'@/components/jk/jk-status-tag.vue';
import JkEmpty from'@/components/jk/jk-empty.vue';
import{getJkPromotionMaterials}from'@/api/jk.js';

export default{
  components:{JkPageNav,JkIcon,JkStatusTag,JkEmpty},
  data(){return{active:'',materials:[],loaded:false,tabs:[{label:'全部',value:''},{label:'文案',value:'copy'},{label:'商品',value:'product'},{label:'健康',value:'health'},{label:'海报',value:'poster'}]}},
  onShow(){this.load()},
  methods:{
    load(){this.loaded=false;getJkPromotionMaterials(this.active?{type:this.active}:{}).then(res=>{const data=res.data||res||[];this.materials=Array.isArray(data)?data:(data.list||[])}).catch(()=>{this.materials=[]}).finally(()=>{this.loaded=true})},
    changeTab(value){this.active=value;this.load()},
    typeText(type){return{copy:'推广文案',product:'商品素材',health:'健康知识',poster:'推广海报'}[type]||'推广素材'},
    copyText(item){uni.setClipboardData({data:item.copyText||'',success:()=>uni.showToast({title:'文案已复制'})})},
    saveImage(item){
      if(!item.imageUrl)return;
      uni.showLoading({title:'保存中'});
      uni.downloadFile({url:item.imageUrl,success:res=>{
        if(res.statusCode!==200){uni.showToast({title:'图片下载失败',icon:'none'});return}
        uni.saveImageToPhotosAlbum({filePath:res.tempFilePath,success:()=>uni.showToast({title:'已保存到相册'}),fail:err=>{
          const message=String(err&&err.errMsg||'');
          if(message.includes('auth deny')||message.includes('authorize'))uni.showModal({title:'需要相册权限',content:'请在小程序设置中开启保存到相册权限。',confirmText:'去设置',success:r=>{if(r.confirm)uni.openSetting({})}});
          else uni.showToast({title:'保存失败',icon:'none'})
        }})
      },fail:()=>uni.showToast({title:'图片下载失败',icon:'none'}),complete:()=>uni.hideLoading()})
    }
  }
};
</script>
<style scoped>
.material-page{min-height:100vh;background:#f7f9f9}.tabs{display:flex;overflow-x:auto;padding:12rpx 22rpx;background:#fff;white-space:nowrap}.tabs text{position:relative;padding:15rpx 22rpx;color:#718087;font-size:22rpx}.tabs text.active{color:#10b981;font-weight:700}.tabs text.active::after{position:absolute;right:28%;bottom:0;left:28%;height:4rpx;border-radius:2rpx;background:#10b981;content:''}.material-content{padding:4rpx 22rpx 36rpx}.material-card{overflow:hidden;margin-top:18rpx;border-radius:20rpx;background:#fff;box-shadow:0 7rpx 22rpx rgba(24,68,58,.045)}.material-image{width:100%;height:290rpx;background:#eef4f2}.material-main{padding:20rpx}.title-row{display:flex;align-items:center;justify-content:space-between}.title-row>text{color:#1f2937;font-size:27rpx;font-weight:700}.description{display:block;margin-top:9rpx;color:#76838a;font-size:21rpx;line-height:1.6}.copy-box{margin-top:14rpx;padding:16rpx;border-radius:13rpx;background:#f5f9f8}.copy-box text{color:#405057;font-size:21rpx;line-height:1.7}.actions{display:flex;gap:12rpx;margin-top:17rpx}.actions button{display:flex;flex:1;align-items:center;justify-content:center;height:66rpx;margin:0;border-radius:33rpx;font-size:22rpx;line-height:66rpx}.actions button::after{border:0}.outline-btn{border:2rpx solid #10b981!important;background:#fff!important;color:#10a981!important}.primary-btn{background:#10b981!important;color:#fff!important}.loading-tip{padding:80rpx 0;color:#9aa4a9;text-align:center;font-size:22rpx}
</style>
