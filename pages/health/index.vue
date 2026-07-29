<template>
  <view class="health-page">
    <jk-page-nav title="健康中心" />
    <view class="page-content">
      <view class="privacy-tip">健康数据仅本人和已获得有效授权的人员可查看，所有敏感访问都会记录日志。</view>

      <view class="latest-card">
        <view>
          <text class="label">最近血糖</text>
          <view v-if="dashboard.latestGlucose" class="glucose-line"><text class="value">{{dashboard.latestGlucose.numericValue}}</text><text class="unit">{{dashboard.latestGlucose.unit||'mmol/L'}}</text></view>
          <text v-else class="empty-inline">暂无血糖数据</text>
          <text v-if="dashboard.latestGlucose" class="meta">{{dashboard.latestGlucose.measuredAt}} · {{dashboard.latestGlucose.periodCode||'未标记时段'}} · {{sourceText(dashboard.latestGlucose)}}</text>
        </view>
        <view class="risk" :class="riskClass">{{latestGlucoseRiskText}}</view>
      </view>

      <view class="stats-card">
        <view><strong>{{dashboard.todayRecordCount||0}}</strong><text>今日记录</text></view>
        <view><strong>{{dashboard.activeAlertCount||0}}</strong><text>待处理提醒</text></view>
        <view @tap="go('/pages/jk/health/device')"><strong class="device-status">准备中</strong><text>设备接入</text></view>
      </view>

      <view class="section-card">
        <view class="section-title">健康记录</view>
        <view class="action-grid">
          <view v-for="item in recordActions" :key="item.url" @tap="go(item.url)"><view class="action-icon">{{item.icon}}</view><text>{{item.name}}</text></view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">分析与隐私</view>
        <view class="action-grid">
          <view v-for="item in manageActions" :key="item.url" @tap="go(item.url)"><view class="action-icon light">{{item.icon}}</view><text>{{item.name}}</text></view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-head"><text class="section-title">最近记录</text><text class="more" @tap="go('/pages/jk/health/dataList')">全部 ›</text></view>
        <view v-for="item in recentRecords" :key="item.id" class="record-row">
          <view><text class="record-title">{{item.dataTypeText||item.dataType}}</text><text class="record-time">{{item.measuredAt}} · {{sourceText(item)}}</text></view>
          <text class="record-value">{{recordValue(item)}}</text>
        </view>
        <jk-empty v-if="!recentRecords.length" text="暂无健康记录" />
      </view>
    </view>
  </view>
</template>

<script>
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import JkEmpty from '@/components/jk/jk-empty.vue';
import { getHealthDashboard } from '@/api/health.js';
import { getJkPermissionContext } from '@/api/jk.js';
export default{
  components:{JkPageNav,JkEmpty},
  data(){return{dashboard:{},permissions:[],recordActions:[{name:'记录血糖',icon:'糖',url:'/pages/jk/health/glucose'},{name:'记录饮食',icon:'食',url:'/pages/jk/health/diet'},{name:'记录运动',icon:'动',url:'/pages/jk/health/exercise'},{name:'记录用药',icon:'药',url:'/pages/jk/health/medicine'}]}},
  computed:{
    canViewAuthorized(){return this.permissions.indexOf('health.data.view.authorized')>-1;},
    manageActions(){const items=[{name:'血糖趋势',icon:'趋',url:'/pages/jk/health/trend'},{name:'健康报告',icon:'报',url:'/pages/jk/report/index?mode=healthReport'},{name:'异常提醒',icon:'醒',url:'/pages/jk/health/alerts'},{name:'健康档案',icon:'档',url:'/pages/jk/health/profile'},{name:'授权管理',icon:'权',url:'/pages/jk/health/authorization'},{name:'设备接入',icon:'备',url:'/pages/jk/health/device'}];if(this.canViewAuthorized)items.push({name:'授权用户',icon:'访',url:'/pages/jk/health/authorizedOwners'});return items;},
    latestGlucoseRiskText(){return(this.dashboard.latestGlucose&&this.dashboard.latestGlucose.riskLevelText)||'正常';},
    recentRecords(){return this.dashboard.recentRecords||[];},
    riskClass(){const level=this.dashboard.latestGlucose&&this.dashboard.latestGlucose.riskLevel;return level==='HIGH'?'high':(level==='MEDIUM'?'medium':'normal');}
  },
  onShow(){this.load();},
  methods:{
    value(res){return res&&res.data?res.data:(res||{});},
    load(){getHealthDashboard().then(res=>{this.dashboard=this.value(res)}).catch(()=>{this.dashboard={}});getJkPermissionContext().then(res=>{this.permissions=this.value(res).permissions||[]}).catch(()=>{this.permissions=[]});},
    go(url){uni.navigateTo({url});},
    sourceText(item){const source=item.sourceType||item.dataSource||item.source;return{MANUAL_USER:'本人手工录入',MANUAL_ADMIN:'管理员录入',DEVICE_SYNC:'设备同步',MANUAL:'手工录入',DEVICE:'设备同步'}[source]||'手工录入';},
    recordValue(item){if(item.numericValue!=null)return item.numericValue+(item.unit||'');try{const detail=JSON.parse(item.detail||'{}');return detail.content||detail.remark||'--';}catch(e){return'--';}}
  }
};
</script>

<style scoped>
.health-page{min-height:100vh;background:#f7f9f9}.page-content{padding:18rpx 22rpx 36rpx}.privacy-tip{padding:18rpx 22rpx;border-radius:16rpx;background:#edf9f6;color:#638078;font-size:21rpx;line-height:1.6}.latest-card{display:flex;align-items:flex-start;justify-content:space-between;margin-top:18rpx;padding:30rpx;border-radius:22rpx;background:linear-gradient(145deg,#fff,#effaf7);box-shadow:0 8rpx 24rpx rgba(25,104,85,.05)}.label{display:block;color:#788983;font-size:23rpx}.glucose-line{display:flex;align-items:baseline;margin-top:8rpx}.value{color:#18b796;font-size:70rpx;font-weight:700}.unit{margin-left:8rpx;color:#788983;font-size:22rpx}.meta{display:block;margin-top:8rpx;color:#909d98;font-size:20rpx}.empty-inline{display:block;margin-top:28rpx;color:#9ba5a2;font-size:25rpx}.risk{padding:10rpx 18rpx;border-radius:999rpx;font-size:21rpx}.normal{background:#e3f8f2;color:#119878}.medium{background:#fff3d9;color:#bd7e0d}.high{background:#ffe7e7;color:#d33}.stats-card{display:flex;margin-top:18rpx;padding:24rpx 8rpx;border-radius:20rpx;background:#fff}.stats-card view{display:flex;flex:1;flex-direction:column;align-items:center;border-right:1rpx solid #edf1f0}.stats-card view:last-child{border-right:0}.stats-card strong{color:#26352f;font-size:34rpx}.stats-card text{margin-top:7rpx;color:#85928d;font-size:21rpx}.stats-card .device-status{color:#c58a1c;font-size:25rpx}.section-card{margin-top:18rpx;padding:24rpx;border-radius:20rpx;background:#fff}.section-head{display:flex;align-items:center;justify-content:space-between}.section-title{color:#26352f;font-size:29rpx;font-weight:700}.more{color:#8b9792;font-size:21rpx}.action-grid{display:flex;flex-wrap:wrap;margin-top:18rpx}.action-grid>view{display:flex;width:25%;flex-direction:column;align-items:center;margin-bottom:24rpx;color:#52615b;font-size:21rpx}.action-icon{display:flex;align-items:center;justify-content:center;width:72rpx;height:72rpx;margin-bottom:9rpx;border-radius:20rpx;background:#dff7f0;color:#16a783;font-size:25rpx;font-weight:700}.action-icon.light{background:#eef5ff;color:#5586c7}.record-row{display:flex;align-items:center;justify-content:space-between;min-height:92rpx;border-bottom:1rpx solid #edf1f0}.record-title,.record-time{display:block}.record-title{color:#34433e;font-size:24rpx;font-weight:600}.record-time{margin-top:6rpx;color:#919d99;font-size:19rpx}.record-value{color:#1eaa89;font-size:25rpx;font-weight:700}
</style>
