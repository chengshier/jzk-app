<template>
  <view class="identity-detail-page">
    <jk-page-nav title="身份详情" />
    <view class="detail-content">
      <view class="hero-card">
        <view class="avatar"><image src="/static/jk-ui-v2/icons/user.png" mode="aspectFit"/></view>
        <view class="hero-main"><view><text class="role-name">{{ roleName }}</text><jk-status-tag :text="statusText" :tone="context.freezeStatus?'danger':'success'"/></view><text>{{ context.regionName || context.regionCode || '暂未绑定区域' }}</text><text>有效期：{{ context.expireTime ? formatDate(context.expireTime) : '长期有效' }}</text></view>
        <image class="watermark" src="/static/jk-ui-v2/illustrations/identity-hero.png" mode="aspectFit"/>
      </view>
      <view class="card">
        <view class="section-title">身份信息</view>
        <view class="row"><text>身份类型</text><strong>{{ roleName }}</strong></view><view class="row"><text>所属区域</text><strong>{{ context.regionName || context.regionCode || '-' }}</strong></view><view class="row"><text>有效期</text><strong>{{ context.expireTime ? formatDate(context.expireTime) : '长期有效' }}</strong></view><view class="row"><text>开通时间</text><strong>{{ formatTime(context.effectiveTime) }}</strong></view><view class="row"><text>审核时间</text><strong>{{ formatTime(context.auditTime || context.updateTime) }}</strong></view>
      </view>
      <view class="card"><view class="section-title">权限能力</view><view v-for="item in permissions" :key="item" class="permission-row"><text class="check">✓</text><text>{{ permissionName(item) }}</text></view><jk-empty v-if="!permissions.length" text="暂无权限能力"/></view>
      <button class="primary-btn" @tap="goBusiness">进入业务中心</button>
    </view>
  </view>
</template>
<script>
import {getJkPermissionContext} from '@/api/jk.js';import JkPageNav from '@/components/jk/jk-page-nav.vue';import JkStatusTag from '@/components/jk/jk-status-tag.vue';import JkEmpty from '@/components/jk/jk-empty.vue';
const ROLE={normal_user:'普通用户',maker:'创客',partner:'合伙人',county_agent:'区县代',health_advisor:'健康顾问',city_agent:'市代',province_agent:'省代'};
const PERMISSION_NAME={'stock.platform.order':'平台订货','stock.transfer.audit':'调拨审核','stock.apply':'调拨申请','stock.view.self':'库存管理','stock.flow.view':'库存流水','commission.view.self':'收益查看','fund.account.view':'资金账户','withdraw.apply':'提现申请','team.view.direct':'团队管理'};
export default{components:{JkPageNav,JkStatusTag,JkEmpty},data(){return{context:{permissions:[]}}},computed:{roleName(){return this.context.primaryRoleName||ROLE[this.context.primaryRoleCode]||'普通用户'},statusText(){return this.context.freezeStatus?'身份冻结':'身份正常'},permissions(){return this.context.permissions||[]}},onShow(){getJkPermissionContext().then(r=>this.context=Object.assign({permissions:[]},r.data||r||{})).catch(()=>{})},methods:{formatTime(v){return v?String(v).replace('T',' ').slice(0,19):'-'},formatDate(v){return v?String(v).slice(0,10):'长期有效'},permissionName(code){return PERMISSION_NAME[code]||code},goBusiness(){if(this.context.freezeStatus)return this.$util.Tips({title:this.context.disabledReasonText||'身份已冻结'});uni.navigateTo({url:'/pages/jk/business/index'})}}};
</script>
<style scoped>
.identity-detail-page{min-height:100vh;background:#f7f9f9}.detail-content{padding:18rpx 22rpx 40rpx}.hero-card{position:relative;display:flex;align-items:center;min-height:174rpx;overflow:hidden;padding:26rpx;border-radius:22rpx;background:linear-gradient(135deg,#ddfaf2,#f5fffc)}.avatar{display:flex;align-items:center;justify-content:center;width:96rpx;height:96rpx;border-radius:50%;background:#fff}.avatar image{width:78rpx;height:78rpx}.hero-main{position:relative;z-index:2;flex:1;margin-left:18rpx}.hero-main>view{display:flex;align-items:center;gap:12rpx}.role-name{color:#1f2a30;font-size:32rpx;font-weight:700}.hero-main>text{display:block;margin-top:8rpx;color:#718188;font-size:22rpx}.watermark{position:absolute;right:-28rpx;bottom:-58rpx;width:220rpx;height:220rpx;opacity:.15}.card{margin-top:18rpx;padding:22rpx 24rpx;border-radius:22rpx;background:#fff;box-shadow:0 7rpx 20rpx rgba(24,67,57,.04)}.section-title{margin-bottom:8rpx;color:#1f2937;font-size:29rpx;font-weight:700}.row,.permission-row{display:flex;align-items:center;min-height:74rpx;border-bottom:1rpx solid #edf1f0}.row:last-child,.permission-row:last-child{border-bottom:0}.row text{color:#758188;font-size:24rpx}.row strong{margin-left:auto;color:#263139;font-size:24rpx;font-weight:500}.permission-row{color:#3b484e;font-size:24rpx}.check{display:flex;align-items:center;justify-content:center;width:28rpx;height:28rpx;margin-right:14rpx;border-radius:50%;background:#10b981;color:#fff;font-size:18rpx}.primary-btn{height:88rpx;margin-top:24rpx;border-radius:44rpx;background:#10b981;color:#fff;line-height:88rpx;font-size:29rpx}
</style>
