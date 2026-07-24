<template>
  <view class="detail-page">
    <jk-page-nav title="申请详情" />
    <view v-if="application.id" class="detail-content">
      <view class="timeline-card"><jk-timeline :steps="steps"/></view>
      <view class="card">
        <view class="card-title">申请信息</view>
        <view class="info-row"><text>申请身份</text><strong>{{ application.applyRoleName || '-' }}</strong></view>
        <view class="info-row"><text>申请人</text><strong>{{ application.applicantName || application.userNickname || '-' }}</strong></view>
        <view class="info-row"><text>手机号码</text><strong>{{ maskPhone(application.applicantPhone) }}</strong></view>
        <view class="info-row"><text>所属区域</text><strong>{{ application.regionName || application.regionCode || '-' }}</strong></view>
        <view class="info-row"><text>推荐人</text><strong>{{ recommenderText || '-' }}</strong></view>
        <view class="info-row reason-row"><text>申请说明</text><strong>{{ reasonText || '-' }}</strong></view>
      </view>
      <view v-if="files.length" class="card">
        <view class="card-title">申请资料</view>
        <view class="file-list">
          <view v-for="(url,index) in files" :key="url" class="file-item" @tap="preview(url)">
            <image :src="url" mode="aspectFill"/><text>{{ index===0?'身份证正面':index===1?'身份证反面':'业务申请表' }}</text><small>{{ fileExt(url) }}</small><view class="file-check">✓</view>
          </view>
        </view>
      </view>
      <view v-if="application.auditStatus==='REJECTED'" class="reject-card"><text>拒绝原因</text><strong>{{ application.rejectReason || '审核未通过，请联系平台客服了解详情。' }}</strong></view>
      <button v-if="isFinished" class="result-btn" @tap="goResult">查看审核结果</button>
    </view>
  </view>
</template>
<script>
import { getJkIdentityApplyDetail, getJkIdentityApplyList } from '@/api/jk.js';
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import JkTimeline from '@/components/jk/jk-timeline.vue';
export default {
  components:{JkPageNav,JkTimeline},
  data(){return{application:{},auditLogs:[]};},
  computed:{
    files(){try{const rows=JSON.parse(this.application.certificateFiles||'[]');return Array.isArray(rows)?rows:[];}catch(e){return(this.application.certificateFiles||'').split(',').filter(Boolean);}},
    recommenderText(){const match=(this.application.applyReason||'').match(/(?:^|\n)推荐人：([^\n]*)$/);return match?match[1].trim():'';},
    reasonText(){return(this.application.applyReason||'').replace(/(?:^|\n)推荐人：[^\n]*$/,'').trim();},
    isFinished(){return['EFFECTIVE','APPROVED','ACTIVE','REJECTED','FROZEN'].includes(this.application.auditStatus);},
    steps(){
      const logs=this.auditLogs||[]; const reviewOne=logs.length>1?logs[0]:null; const reviewTwo=logs.length>2?logs[1]:null; const resultLog=this.isFinished&&logs.length?logs[logs.length-1]:null;
      return [
        {title:'提交申请',time:this.shortTime(this.application.createTime),done:!!this.application.createTime},
        {title:'区县代初审',time:reviewOne?this.shortTime(reviewOne.createTime):'',done:!!reviewOne},
        {title:'平台复审',time:reviewTwo?this.shortTime(reviewTwo.createTime):'',done:!!reviewTwo},
        {title:'审核结果',time:resultLog?this.shortTime(resultLog.createTime):'',done:!!resultLog,current:!!resultLog,danger:this.application.auditStatus==='REJECTED'}
      ];
    }
  },
  onLoad(q){this.id=q.id;this.loadDetail();},
  methods:{
    loadDetail(){getJkIdentityApplyDetail(this.id).then(res=>{const data=res.data||res||{};this.application=data.application||{};this.auditLogs=data.auditLogs||[];}).catch(()=>this.loadFromList());},
    loadFromList(){getJkIdentityApplyList({page:1,limit:50}).then(res=>{const data=res.data||res||{};const rows=Array.isArray(data)?data:(data.list||data.records||[]);this.application=rows.find(item=>String(item.id)===String(this.id))||{};if(!this.application.id)this.$util.Tips({title:'申请记录不存在'});}).catch(err=>this.$util.Tips({title:err||'详情加载失败'}));},
    shortTime(v){return v?String(v).replace('T',' ').slice(5,16):'';},
    maskPhone(v){if(!v)return'-';const s=String(v);return s.length>=11?s.slice(0,3)+'****'+s.slice(-4):s;},
    fileExt(url){const ext=String(url).split('?')[0].split('.').pop();return(ext||'FILE').toUpperCase();},
    preview(url){uni.previewImage({current:url,urls:this.files});},
    goResult(){uni.navigateTo({url:'/pages/jk/identity/result?id='+this.application.id});}
  }
};
</script>
<style scoped>
.detail-page{min-height:100vh;background:#f7f9f9}.detail-content{padding:18rpx 24rpx 40rpx}.timeline-card,.card,.reject-card{margin-bottom:20rpx;padding:28rpx;border-radius:22rpx;background:#fff;box-shadow:0 8rpx 24rpx rgba(24,71,60,.05)}.timeline-card{padding:30rpx 14rpx}.card-title{margin-bottom:14rpx;color:#1f2937;font-size:30rpx;font-weight:700}.info-row{display:flex;align-items:center;justify-content:space-between;min-height:82rpx;border-bottom:1rpx solid #edf1f0}.info-row:last-child{border-bottom:0}.info-row text{color:#7b878d;font-size:25rpx}.info-row strong{max-width:430rpx;color:#263139;text-align:right;font-size:25rpx;font-weight:500}.reason-row{align-items:flex-start;padding:20rpx 0}.reason-row strong{line-height:1.6}.file-list{display:flex;gap:16rpx}.file-item{position:relative;display:flex;width:30%;flex-direction:column;align-items:center;padding:12rpx;border-radius:14rpx;background:#f8fbfa;box-sizing:border-box}.file-item image{width:100%;height:130rpx;border-radius:10rpx;background:#eef4f2}.file-item text{margin-top:10rpx;color:#58666d;font-size:21rpx}.file-item small{margin-top:5rpx;color:#9aa4a9;font-size:18rpx}.file-check{position:absolute;right:5rpx;top:5rpx;display:flex;align-items:center;justify-content:center;width:26rpx;height:26rpx;border-radius:50%;background:#10b981;color:#fff;font-size:18rpx}.reject-card{display:flex;flex-direction:column;gap:12rpx;background:#fff5f3;color:#ef5b4c}.reject-card text{font-size:28rpx;font-weight:700}.reject-card strong{color:#544247;font-size:24rpx;font-weight:400;line-height:1.7}.result-btn{height:88rpx;border-radius:44rpx;background:#10b981;color:#fff;font-size:29rpx;line-height:88rpx}
</style>
