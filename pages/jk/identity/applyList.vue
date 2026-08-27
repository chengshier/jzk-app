<template>
  <view class="records-page">
    <jk-page-nav title="申请记录" />
    <view class="filter-bar">
      <view v-for="item in filters" :key="item.value" :class="['filter-item',{active:activeFilter===item.value}]" @tap="activeFilter=item.value">{{ item.label }}<text v-if="item.value===''">⌄</text></view>
    </view>
    <view class="records-list">
      <view v-for="item in filteredList" :key="item.id" class="record-row" @tap="openDetail(item)">
        <view :class="['record-icon',item.statusClass]"><image src="https://file.wit.cn/jzk/static/jk-ui-v2/icons/user.png" mode="aspectFit"/></view>
        <view class="record-main">
          <view class="record-head"><text class="role-name">{{ item.roleDisplayName }}</text><jk-status-tag :text="item.statusDisplayText" :tone="item.statusTone"/></view>
          <text class="record-meta">申请时间：{{ formatTime(item.createTime) }}</text>
          <text class="record-meta">申请编号：{{ item.applyNo || '-' }}</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <jk-empty v-if="loaded && !filteredList.length" :text="'暂无' + activeFilterLabel + '申请记录'"/>
      <view v-if="filteredList.length" class="no-more">没有更多了</view>
    </view>
  </view>
</template>

<script>
import { getJkIdentityApplyList } from '@/api/jk.js';
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import JkStatusTag from '@/components/jk/jk-status-tag.vue';
import JkEmpty from '@/components/jk/jk-empty.vue';
const ROLE_NAME_MAP = { normal_user:'普通用户', maker:'创客', partner:'合伙人', county_agent:'区县代', health_advisor:'健康顾问', city_agent:'市代', province_agent:'省代' };
export default {
  components:{ JkPageNav, JkStatusTag, JkEmpty },
  data(){ return { list:[], loaded:false, activeFilter:'', filters:[{label:'全部',value:''},{label:'审核中',value:'PENDING'},{label:'已通过',value:'APPROVED'},{label:'已拒绝',value:'REJECTED'}] }; },
  computed:{
    filteredList(){ return this.activeFilter ? this.list.filter(item => item.auditStatus===this.activeFilter || (this.activeFilter==='APPROVED' && ['EFFECTIVE','ACTIVE'].includes(item.auditStatus))) : this.list; },
    activeFilterLabel(){ const current=this.filters.find(item=>item.value===this.activeFilter); return current && current.value ? current.label : ''; }
  },
  onShow(){ this.loadList(); },
  methods:{
    loadList(){
      getJkIdentityApplyList({page:1,limit:50}).then(res => {
        const data=res.data||res||{}; const rows=Array.isArray(data)?data:(data.list||data.records||[]);
        this.list=rows.map(item=>Object.assign({},item,{roleDisplayName:this.roleName(item),statusDisplayText:this.statusText(item),statusClass:this.statusClass(item),statusTone:this.statusTone(item)}));
      }).catch(err=>this.$util.Tips({title:err||'申请记录加载失败'})).finally(()=>{this.loaded=true;});
    },
    roleName(item){ return item.applyRoleName||ROLE_NAME_MAP[item.applyRoleCode]||item.applyRoleCode||'业务身份'; },
    statusText(item){ return item.auditStatusText||item.statusText||({PENDING:'审核中',APPROVED:'已通过',EFFECTIVE:'已通过',ACTIVE:'已通过',REJECTED:'已拒绝',FROZEN:'已冻结'}[item.auditStatus]||'审核中'); },
    statusClass(item){ if(item.auditStatus==='REJECTED')return'rejected'; if(['APPROVED','EFFECTIVE','ACTIVE'].includes(item.auditStatus))return'approved'; if(item.auditStatus==='FROZEN')return'frozen'; return'pending'; },
    statusTone(item){ if(item.auditStatus==='REJECTED')return'danger'; if(['APPROVED','EFFECTIVE','ACTIVE'].includes(item.auditStatus))return'success'; if(item.auditStatus==='FROZEN')return'muted'; return'warning'; },
    formatTime(value){ return value?String(value).replace('T',' ').slice(0,19):'-'; },
    openDetail(item){ uni.navigateTo({url:'/pages/jk/identity/applyDetail?id='+item.id}); }
  }
};
</script>

<style scoped>
.records-page{min-height:100vh;background:#fff}.filter-bar{display:flex;gap:36rpx;padding:22rpx 32rpx 10rpx;border-bottom:1rpx solid #edf1f0}.filter-item{position:relative;padding:14rpx 2rpx 18rpx;color:#748087;font-size:26rpx}.filter-item.active{color:#10b981;font-weight:700}.filter-item.active::after{position:absolute;right:0;bottom:0;left:0;height:5rpx;border-radius:3rpx;background:#10b981;content:''}.filter-item text{margin-left:4rpx}.records-list{padding:0 28rpx}.record-row{display:flex;align-items:center;min-height:142rpx;border-bottom:1rpx solid #edf1f0}.record-icon{display:flex;align-items:center;justify-content:center;width:82rpx;height:82rpx;flex-shrink:0;border-radius:50%;background:#e5faf4}.record-icon image{width:68rpx;height:68rpx}.record-icon.rejected{background:#ffebe7}.record-icon.rejected image{filter:hue-rotate(130deg) saturate(1.5)}.record-icon.approved{background:#e5faf4}.record-icon.pending{background:#f0faf7}.record-main{min-width:0;flex:1;margin-left:18rpx}.record-head{display:flex;align-items:center;gap:12rpx}.role-name{color:#202b31;font-size:29rpx;font-weight:700}.record-meta{display:block;margin-top:8rpx;color:#7d8990;font-size:22rpx}.arrow{color:#9aa4aa;font-size:38rpx}.no-more{padding:28rpx 0;color:#9ba5aa;text-align:center;font-size:22rpx}
</style>
