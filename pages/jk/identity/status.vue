<template>
  <view class="status-page">
    <jk-page-nav title="身份状态" />
    <view class="page-content">
      <view class="identity-hero">
        <view class="identity-avatar"><image src="/static/jk-ui-v2/icons/user.png" mode="aspectFit"/></view>
        <view class="identity-main">
          <view class="identity-title"><text>{{ roleName }}</text><jk-status-tag :text="identityStatusText" :tone="statusTone"/></view>
          <text class="identity-region">{{ context.regionName || context.regionCode || '暂未绑定区域' }}</text>
          <text class="identity-valid">有效期：{{ context.expireTime ? formatDate(context.expireTime) : '长期有效' }}</text>
        </view>
        <image class="hero-watermark" src="/static/jk-ui-v2/illustrations/identity-hero.png" mode="aspectFit"/>
      </view>

      <view class="card">
        <view class="card-title"><jk-icon name="document" size="sm"/><text>身份信息</text></view>
        <view class="info-row" @tap="goDetail"><text>身份类型</text><strong>{{ roleName }}</strong><text class="arrow">›</text></view>
        <view class="info-row"><text>所属区域</text><strong>{{ context.regionName || context.regionCode || '-' }}</strong><text class="arrow"></text></view>
        <view class="info-row"><text>有效期</text><strong>{{ context.expireTime ? formatDate(context.expireTime) : '长期有效' }}</strong><text class="arrow"></text></view>
        <view class="info-row"><text>开通时间</text><strong>{{ formatTime(context.effectiveTime) }}</strong><text class="arrow"></text></view>
        <view class="info-row"><text>审核时间</text><strong>{{ formatTime(context.auditTime || context.updateTime) }}</strong><text class="arrow"></text></view>
      </view>

      <view class="card">
        <view class="card-title"><jk-icon name="identity" size="sm"/><text>权限能力</text></view>
        <view v-for="item in permissionItems" :key="item.code" class="permission-row">
          <text class="check">✓</text><text>{{ item.name }}</text><text class="permission-arrow">›</text>
        </view>
        <jk-empty v-if="!permissionItems.length" text="当前身份暂无业务权限" />
      </view>

      <view class="card">
        <view class="card-title"><jk-icon name="stock" size="sm"/><text>业务入口</text></view>
        <view class="business-grid">
          <view v-for="item in businessLinks" :key="item.name" @tap="go(item.url)">
            <jk-icon :name="item.icon" size="lg"/><text>{{ item.name }}</text>
          </view>
        </view>
      </view>
      <view class="service-tip"><image src="/static/jk-ui-v2/icons/info.png" mode="aspectFit"/><text>如身份信息有误，请联系平台客服</text></view>
    </view>
    <view class="status-tabbar">
      <view @tap="switchHome"><jk-icon name="home" size="sm"/><text>首页</text></view>
      <view @tap="go('/pages/jk/stock/index')"><jk-icon name="stock" size="sm"/><text>库存</text></view>
      <view @tap="go('/pages/jk/trade/list?mode=order')"><jk-icon name="document" size="sm"/><text>订单</text></view>
      <view @tap="go('/pages/jk/commission/index')"><jk-icon name="money" size="sm"/><text>收益</text></view>
      <view class="active" @tap="switchUser"><jk-icon name="user" size="sm"/><text>我的</text></view>
    </view>
  </view>
</template>
<script>
import { getJkPermissionContext } from '@/api/jk.js';
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import JkIcon from '@/components/jk/jk-icon.vue';
import JkStatusTag from '@/components/jk/jk-status-tag.vue';
import JkEmpty from '@/components/jk/jk-empty.vue';
const ROLE={normal_user:'普通用户',maker:'创客',partner:'合伙人',county_agent:'区县代',health_advisor:'健康顾问',city_agent:'市代',province_agent:'省代'};
const PERMISSIONS={
  'stock.platform.order':'平台订货','stock.transfer.audit':'调拨审核','stock.apply':'调拨申请','stock.view.self':'库存管理','stock.flow.view':'库存流水',
  'commission.view.self':'收益查看','fund.account.view':'资金账户','withdraw.apply':'提现申请','team.view.direct':'团队管理','product.trade.view':'商品业务查看'
};
export default {
  components:{JkPageNav,JkIcon,JkStatusTag,JkEmpty},
  data(){return{context:{permissions:[],canApplyRoles:[]}};},
  computed:{
    roleName(){return this.context.primaryRoleName||ROLE[this.context.primaryRoleCode]||'普通用户';},
    identityStatusText(){if(this.context.freezeStatus)return'身份冻结';if(this.context.primaryRoleCode&&this.context.primaryRoleCode!=='normal_user')return'身份正常';return this.context.identityStatusText||'未开通';},
    statusTone(){return this.context.freezeStatus?'danger':(this.context.primaryRoleCode&&this.context.primaryRoleCode!=='normal_user'?'success':'muted');},
    permissionItems(){return(this.context.permissions||[]).filter(code=>PERMISSIONS[code]).map(code=>({code,name:PERMISSIONS[code]}));},
    businessLinks(){
      const role=this.context.primaryRoleCode; const links=[];
      if(role==='county_agent')links.push({name:'平台订货',icon:'order',url:'/pages/jk/trade/list?mode=order'},{name:'下级调拨',icon:'transfer',url:'/pages/jk/trade/list?mode=handleTransfer'});
      if(['maker','partner'].includes(role))links.push({name:'我的调拨',icon:'transfer',url:'/pages/jk/trade/list?mode=transfer'});
      if(['maker','partner','county_agent'].includes(role))links.push({name:'我的库存',icon:'stock',url:'/pages/jk/stock/index'},{name:'收益中心',icon:'money',url:'/pages/jk/commission/index'});
      return links.slice(0,4);
    }
  },
  onShow(){this.load();},
  methods:{
    load(){getJkPermissionContext().then(res=>{this.context=Object.assign({permissions:[],canApplyRoles:[]},res.data||res||{});}).catch(err=>this.$util.Tips({title:err||'身份状态加载失败'}));},
    formatTime(v){return v?String(v).replace('T',' ').slice(0,19):'-';},formatDate(v){return v?String(v).slice(0,10):'长期有效';},
    go(url){if(this.context.freezeStatus)return this.$util.Tips({title:this.context.disabledReasonText||'当前身份已冻结'});uni.navigateTo({url});},
    goDetail(){uni.navigateTo({url:'/pages/jk/identity/detail'});},switchHome(){uni.switchTab({url:'/pages/index/index'});},switchUser(){uni.switchTab({url:'/pages/user/index'});}
  }
};
</script>
<style scoped>
.status-page{min-height:100vh;padding-bottom:126rpx;background:#f7f9f9}.page-content{padding:18rpx 22rpx 32rpx}.identity-hero{position:relative;display:flex;align-items:center;min-height:164rpx;overflow:hidden;padding:24rpx;border-radius:22rpx;background:linear-gradient(135deg,#dffaf3,#f3fffb)}.identity-avatar{display:flex;align-items:center;justify-content:center;width:92rpx;height:92rpx;flex-shrink:0;border-radius:50%;background:#fff}.identity-avatar image{width:76rpx;height:76rpx}.identity-main{position:relative;z-index:2;flex:1;margin-left:18rpx}.identity-title{display:flex;align-items:center;gap:12rpx}.identity-title>text{color:#1d2930;font-size:31rpx;font-weight:700}.identity-region,.identity-valid{display:block;margin-top:8rpx;color:#6e7e85;font-size:22rpx}.hero-watermark{position:absolute;right:-35rpx;bottom:-60rpx;width:220rpx;height:220rpx;opacity:.16}.card{margin-top:18rpx;padding:22rpx 24rpx;border-radius:22rpx;background:#fff;box-shadow:0 7rpx 20rpx rgba(24,67,57,.04)}.card-title{display:flex;align-items:center;gap:10rpx;margin-bottom:10rpx;color:#1f2937;font-size:29rpx;font-weight:700}.info-row{display:flex;align-items:center;min-height:76rpx;border-bottom:1rpx solid #edf1f0}.info-row:last-child{border-bottom:0}.info-row>text:first-child{color:#748087;font-size:24rpx}.info-row strong{flex:1;color:#263139;text-align:right;font-size:24rpx;font-weight:500}.arrow{width:28rpx;margin-left:8rpx;color:#9fa9ae;font-size:32rpx}.permission-row{display:flex;align-items:center;min-height:72rpx;border-bottom:1rpx solid #edf1f0;color:#38464c;font-size:24rpx}.permission-row:last-child{border-bottom:0}.check{display:flex;align-items:center;justify-content:center;width:28rpx;height:28rpx;margin-right:14rpx;border-radius:50%;background:#10b981;color:#fff;font-size:18rpx}.permission-arrow{margin-left:auto;color:#a1aaaf;font-size:32rpx}.business-grid{display:flex;flex-wrap:wrap;padding-top:8rpx}.business-grid>view{display:flex;width:25%;flex-direction:column;align-items:center;gap:8rpx;color:#4e5b61;font-size:21rpx}.service-tip{display:flex;align-items:center;gap:10rpx;margin-top:18rpx;padding:16rpx 20rpx;border-radius:14rpx;background:#eafaf6;color:#6f8d85;font-size:22rpx}.service-tip image{width:28rpx;height:28rpx}.status-tabbar{position:fixed;z-index:50;right:0;bottom:0;left:0;display:flex;height:106rpx;padding-bottom:env(safe-area-inset-bottom);border-top:1rpx solid #edf0ef;background:#fff}.status-tabbar>view{display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;gap:4rpx;color:#808b91;font-size:20rpx}.status-tabbar .active{color:#10b981}
</style>
