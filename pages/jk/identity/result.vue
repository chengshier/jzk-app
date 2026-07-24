<template>
  <view :class="['result-page',{rejected}]">
    <jk-page-nav :title="rejected ? '审核拒绝' : '审核通过'" transparent />
    <view v-if="application.id" class="result-content">
      <view class="result-visual"><image :src="rejected ? '/static/jk-ui-v2/icons/error.png' : '/static/jk-ui-v2/icons/success.png'" mode="aspectFit"/></view>
      <text class="result-title">{{ rejected ? '审核未通过' : '审核通过' }}</text>
      <text class="result-desc">{{ rejected ? '很遗憾，您的业务身份申请未通过，请根据原因修改后重新提交申请。' : '感谢您的耐心等待，您的业务身份已生效，可正常使用相关服务。' }}</text>

      <view v-if="rejected" class="reason-card">
        <view class="card-title danger">拒绝原因</view>
        <view class="reason-box"><jk-icon name="error" size="sm"/><text>{{ application.rejectReason || '审核未通过，请联系平台客服了解详情。' }}</text></view>
      </view>
      <view v-if="rejected" class="info-card">
        <view class="card-title">审核信息</view>
        <view class="info-row"><jk-icon name="clock" size="sm"/><text>审核时间</text><strong>{{ formatTime(application.auditTime || application.updateTime) }}</strong></view>
        <view class="info-row"><jk-icon name="user" size="sm"/><text>审核人</text><strong>{{ application.auditorName || '平台审核' }}</strong></view>
      </view>
      <view v-else class="info-card success-card">
        <view class="info-row"><jk-icon name="user" size="sm"/><view><small>身份类型</small><strong>{{ application.applyRoleName || '-' }}</strong></view></view>
        <view class="info-row"><jk-icon name="location" size="sm"/><view><small>所属区域</small><strong>{{ application.regionName || application.regionCode || '-' }}</strong></view></view>
        <view class="info-row"><jk-icon name="calendar" size="sm"/><view><small>生效时间</small><strong>{{ formatTime(application.effectiveTime) }}</strong></view></view>
        <view class="info-row"><jk-icon name="identity" size="sm"/><view><small>有效期</small><strong>长期有效</strong></view></view>
      </view>
    </view>

    <view class="bottom-actions">
      <template v-if="rejected">
        <button class="danger-btn" @tap="reapply">重新申请</button>
        <button class="danger-outline" @tap="viewList">查看申请记录</button>
      </template>
      <template v-else>
        <button class="primary-btn" @tap="goBusiness">进入业务中心</button>
        <button class="text-btn" @tap="goDetail">查看身份详情</button>
      </template>
    </view>
  </view>
</template>
<script>
import { getJkIdentityApplyDetail, getJkIdentityApplyList } from '@/api/jk.js';
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import JkIcon from '@/components/jk/jk-icon.vue';
export default {
  components:{JkPageNav,JkIcon},
  data(){return{application:{}};},
  computed:{rejected(){return this.application.auditStatus==='REJECTED';}},
  onLoad(q){this.id=q.id;this.load();},
  methods:{
    load(){getJkIdentityApplyDetail(this.id).then(res=>{const data=res.data||res||{};this.application=data.application||data||{};}).catch(()=>this.loadFromList());},
    loadFromList(){getJkIdentityApplyList({page:1,limit:50}).then(res=>{const data=res.data||res||{};const rows=Array.isArray(data)?data:(data.list||data.records||[]);this.application=rows.find(item=>String(item.id)===String(this.id))||{};if(!this.application.id)this.$util.Tips({title:'申请记录不存在'});}).catch(err=>this.$util.Tips({title:err||'审核结果加载失败'}));},
    formatTime(v){return v?String(v).replace('T',' ').slice(0,16):'-';},
    reapply(){uni.redirectTo({url:'/pages/jk/identity/select'});},
    viewList(){uni.redirectTo({url:'/pages/jk/identity/applyList'});},
    goBusiness(){uni.redirectTo({url:'/pages/jk/business/index'});},
    goDetail(){uni.redirectTo({url:'/pages/jk/identity/detail'});}
  }
};
</script>
<style scoped>
.result-page{min-height:100vh;padding-bottom:190rpx;background:radial-gradient(circle at 50% 22%,#e4fff8 0,#f9fffd 35%,#fff 58%)}.result-page.rejected{background:radial-gradient(circle at 50% 22%,#fff0ed 0,#fff9f7 36%,#fff 60%)}.result-content{padding:38rpx 28rpx 40rpx;text-align:center}.result-visual{display:flex;align-items:center;justify-content:center;width:170rpx;height:170rpx;margin:0 auto 32rpx;border:20rpx solid #ddf9f2;border-radius:50%;background:#fff;box-shadow:0 16rpx 36rpx rgba(16,185,129,.16)}.result-visual image{width:146rpx;height:146rpx}.rejected .result-visual{border-color:#ffe0dc;box-shadow:0 16rpx 36rpx rgba(239,68,68,.13)}.result-title{display:block;color:#1d262d;font-size:43rpx;font-weight:800}.result-desc{display:block;margin:18rpx auto 0;max-width:600rpx;color:#727e85;font-size:25rpx;line-height:1.75}.info-card,.reason-card{margin-top:34rpx;padding:26rpx;border-radius:22rpx;background:#fff;box-shadow:0 8rpx 24rpx rgba(24,69,58,.055);text-align:left}.card-title{margin-bottom:14rpx;padding-left:14rpx;border-left:6rpx solid #10b981;color:#1f2937;font-size:29rpx;font-weight:700}.card-title.danger{border-color:#ef4444}.reason-box{display:flex;align-items:flex-start;gap:12rpx;padding:20rpx;border-radius:14rpx;background:#fff4f2;color:#4f4145;font-size:24rpx;line-height:1.7}.reason-box text{flex:1}.info-row{display:flex;align-items:center;min-height:80rpx;border-bottom:1rpx solid #edf1f0}.info-row:last-child{border-bottom:0}.info-row>text{margin-left:12rpx;color:#748087;font-size:25rpx}.info-row>strong{margin-left:auto;color:#273139;font-size:25rpx;font-weight:500}.success-card .info-row>view:last-child{display:flex;flex:1;flex-direction:column;margin-left:12rpx;gap:6rpx}.success-card small{color:#849096;font-size:21rpx}.success-card strong{color:#273139;font-size:26rpx;font-weight:600}.bottom-actions{position:fixed;z-index:30;right:0;bottom:0;left:0;display:flex;gap:18rpx;padding:18rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));background:rgba(255,255,255,.98)}.bottom-actions button{flex:1;height:86rpx;margin:0;border-radius:43rpx;font-size:28rpx;font-weight:600;line-height:86rpx}.bottom-actions button::after{border:0}.primary-btn{background:#10b981!important;color:#fff!important}.text-btn{border:0!important;background:#fff!important;color:#10a981!important}.danger-btn{background:#ff5b5e!important;color:#fff!important}.danger-outline{border:2rpx solid #ff5b5e!important;background:#fff!important;color:#ff5b5e!important}
</style>
