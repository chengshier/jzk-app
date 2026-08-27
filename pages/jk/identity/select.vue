<template>
  <view class="identity-select">
    <jk-page-nav title="选择申请身份" />
    <view class="select-content">
      <view class="select-head">
        <jk-icon name="identity" size="lg" />
        <view>
          <text class="head-title">选择一个身份开始申请</text>
          <text class="head-desc">根据您的业务角色选择合适的身份，享受专属权益</text>
        </view>
      </view>

      <view v-for="role in displayRoles" :key="role.code" :class="['role-card',{selected:selectedRoleCode===role.code,current:role.current,disabled:role.disabled}]" @tap="chooseRole(role)">
        <view :class="['role-avatar','role-avatar--'+role.code]">
          <image src="https://file.wit.cn/jzk/static/jk-ui-v2/icons/user.png" mode="aspectFit" />
        </view>
        <view class="role-main">
          <view class="role-title-row">
            <text class="role-name">{{ role.name }}</text>
            <jk-status-tag v-if="role.current" text="当前身份" tone="muted" />
          </view>
          <text class="role-desc">{{ role.desc }}</text>
          <view class="role-tags">
            <text v-for="tag in role.tags" :key="tag">{{ tag }}</text>
          </view>
        </view>
        <view v-if="!role.current" :class="['radio',{active:selectedRoleCode===role.code}]">
          <text v-if="selectedRoleCode===role.code">✓</text>
        </view>
      </view>

      <view class="hint-row"><image src="https://file.wit.cn/jzk/static/jk-ui-v2/icons/info.png" mode="aspectFit"/><text>不同身份拥有不同的功能权限与权益，请根据实际角色选择。</text></view>
    </view>
    <jk-bottom-action><button class="primary-btn" :disabled="!selectedRoleCode" @tap="continueApply">下一步</button></jk-bottom-action>
  </view>
</template>

<script>
import { getJkPermissionContext } from '@/api/jk.js';
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import JkIcon from '@/components/jk/jk-icon.vue';
import JkStatusTag from '@/components/jk/jk-status-tag.vue';
import JkBottomAction from '@/components/jk/jk-bottom-action.vue';

const ROLE_META = {
  maker: { name:'创客', desc:'推广产品，获取收益', tags:['推广收益','团队发展','专属素材'] },
  partner: { name:'合伙人', desc:'团队运营，扩大业务共同收益', tags:['区域管理','团队收益','分红权益'] },
  county_agent: { name:'区县代', desc:'负责区域内业务管理与下级服务', tags:['库存管理','调拨审核','平台订货'] },
  normal_user: { name:'普通用户', desc:'购买产品，享受健康服务', tags:['购物消费','健康管理','会员权益'] },
  health_advisor: { name:'健康顾问', desc:'为用户提供健康咨询与服务', tags:['健康服务','客户管理'] },
  city_agent: { name:'市代', desc:'负责市级区域业务运营管理', tags:['区域运营','团队协作'] },
  province_agent: { name:'省代', desc:'负责省级区域业务统筹管理', tags:['省级运营','区域统筹'] }
};
const DEFAULT_ORDER = ['maker','partner','county_agent','normal_user','health_advisor','city_agent','province_agent'];

export default {
  components:{ JkPageNav, JkIcon, JkStatusTag, JkBottomAction },
  data(){ return { available:[], primaryCode:'', primaryName:'', selectedRoleCode:'', loaded:false }; },
  computed:{
    currentRole(){ return Object.assign({ code:this.primaryCode }, ROLE_META[this.primaryCode] || {}); },
    displayRoles(){
      const codes = [];
      DEFAULT_ORDER.forEach(code => { if (code === this.primaryCode || this.available.indexOf(code) > -1 || code === 'normal_user') codes.push(code); });
      return codes.map(code => Object.assign({ code, name:code, desc:'申请开通业务身份', tags:[] }, ROLE_META[code] || {}, { current:code===this.primaryCode, disabled:code===this.primaryCode || (code==='normal_user' && this.primaryCode!=='normal_user') }));
    }
  },
  onShow(){ this.load(); },
  methods:{
    load(){
      getJkPermissionContext().then(res => {
        const context = res.data || res || {};
        this.primaryCode = context.primaryRoleCode || 'normal_user';
        this.primaryName = context.primaryRoleName || '';
        this.available = (context.canApplyRoles || []).map(item => typeof item === 'object' ? (item.roleCode || item.code) : item).filter(Boolean);
        if (!this.available.includes(this.selectedRoleCode)) this.selectedRoleCode = this.available[0] || '';
      }).catch(err => this.$util.Tips({ title:err || '身份信息加载失败' })).finally(() => { this.loaded = true; });
    },
    chooseRole(role){ if (!role.current && !role.disabled && this.available.indexOf(role.code) > -1) this.selectedRoleCode = role.code; },
    continueApply(){ if (this.selectedRoleCode) uni.navigateTo({ url:'/pages/jk/identity/apply?roleCode=' + encodeURIComponent(this.selectedRoleCode) }); }
  }
};
</script>

<style scoped>
.identity-select{min-height:100vh;padding-bottom:130rpx;background:linear-gradient(180deg,#eafcf8 0,#fff 310rpx)}.select-content{padding:18rpx 28rpx 40rpx}.select-head{display:flex;align-items:center;padding:18rpx 8rpx 28rpx}.select-head>view:last-child{margin-left:18rpx}.head-title{display:block;color:#1e2930;font-size:31rpx;font-weight:700}.head-desc{display:block;margin-top:10rpx;color:#79868d;font-size:23rpx}
.role-card{display:flex;align-items:center;min-height:154rpx;margin-bottom:14rpx;padding:20rpx;border:2rpx solid transparent;border-radius:20rpx;background:#fff;box-shadow:0 4rpx 16rpx rgba(31,70,61,.035)}.role-card.selected{border-color:#bfeee1;background:#f4fffb}.role-card.current,.role-card.disabled{opacity:.72}.role-avatar{display:flex;align-items:center;justify-content:center;width:86rpx;height:86rpx;flex-shrink:0;border-radius:50%;background:#e5faf4}.role-avatar image{width:70rpx;height:70rpx}.role-avatar--partner{background:#fff1dc}.role-avatar--partner image{filter:hue-rotate(330deg) saturate(1.7)}.role-avatar--county_agent{background:#dcfaf2}.role-avatar--normal_user{background:#eaf2ff}.role-avatar--normal_user image{filter:hue-rotate(80deg)}.role-main{min-width:0;flex:1;margin-left:18rpx}.role-title-row{display:flex;align-items:center;gap:12rpx}.role-name{color:#202b31;font-size:30rpx;font-weight:700}.role-desc{display:block;margin-top:7rpx;color:#7a878e;font-size:23rpx}.role-tags{display:flex;flex-wrap:wrap;gap:10rpx;margin-top:12rpx}.role-tags text{padding:5rpx 10rpx;border-radius:7rpx;background:#e9faf5;color:#149f80;font-size:20rpx}.radio{display:flex;align-items:center;justify-content:center;width:38rpx;height:38rpx;margin-left:12rpx;border:2rpx solid #cfd7da;border-radius:50%;color:#fff;font-size:23rpx}.radio.active{border-color:#10b981;background:#10b981}.hint-row{display:flex;align-items:flex-start;margin:28rpx 8rpx 10rpx;color:#879299;font-size:22rpx;line-height:1.65}.hint-row image{width:28rpx;height:28rpx;flex-shrink:0;margin:4rpx 10rpx 0 0}.primary-btn{border:0!important;background:linear-gradient(90deg,#12b98f,#08ad82)!important;color:#fff!important}.primary-btn[disabled]{opacity:.48}
</style>
