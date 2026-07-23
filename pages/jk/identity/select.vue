<template>
  <view class="identity-select">
    <jk-page-nav title="选择申请身份"></jk-page-nav>
    <view class="select-hero">
      <view class="hero-icon">♢</view>
      <view><view class="hero-title">选择一个身份开始申请</view><view class="hero-desc">根据您的业务角色选择合适的身份，享受专属权益</view></view>
    </view>
    <view v-if="currentRole.code" class="current-role-card">
      <view class="role-icon" :class="currentRole.code">{{ currentRole.icon }}</view>
      <view class="role-content"><view class="current-caption">当前身份</view><view class="role-name">{{ currentRole.name }}</view><view class="role-desc">{{ currentRole.desc }}</view></view>
      <view class="current-tag">当前身份</view>
    </view>
    <view v-if="canApplyRoles.length" class="apply-caption">可申请的新身份</view>
    <view v-if="canApplyRoles.length" class="role-list">
      <view v-for="role in canApplyRoles" :key="role.code" :class="['role-card', { selected: selectedRoleCode === role.code }]" @click="selectedRoleCode = role.code">
        <view class="role-icon" :class="role.code">{{ role.icon }}</view>
        <view class="role-content"><view class="role-name">{{ role.name }}</view><view class="role-desc">{{ role.desc }}</view><view class="benefits"><text v-for="tag in role.tags" :key="tag">{{ tag }}</text></view></view>
        <view class="radio"><text v-if="selectedRoleCode === role.code">✓</text></view>
      </view>
    </view>
    <view v-if="currentRole.code !== 'normal_user'" class="base-role-card">
      <view class="role-icon normal_user">普</view>
      <view class="role-content"><view class="role-name">普通用户</view><view class="role-desc">购买产品，享受健康服务</view><view class="benefits"><text>购物消费</text><text>健康管理</text><text>会员权益</text></view></view>
      <view class="base-tag">基础身份</view>
    </view>
    <view v-else-if="loaded" class="empty-card">当前没有可申请的新身份，请查看申请记录或联系管理员。</view>
    <view class="select-note">不同身份拥有不同的功能权限与权益，请根据实际角色选择。</view>
    <button class="primary-btn" :disabled="!selectedRoleCode" @click="continueApply">下一步</button>
  </view>
</template>

<script>
import { getJkPermissionContext } from '@/api/jk.js';
import JkPageNav from '@/components/jk/jk-page-nav.vue';

const ROLE_META = {
  maker: { name: '创客', desc: '推广产品，获取收益', tags: ['推广收益', '团队发展', '专属素材'], icon: '创' },
  normal_user: { name: '普通用户', desc: '购买产品，享受健康服务', tags: ['购物消费', '健康管理', '会员权益'], icon: '普' },
  partner: { name: '合伙人', desc: '团队运营，扩大业务共同收益', tags: ['区域管理', '团队收益', '分红权益'], icon: '合' },
  county_agent: { name: '区县代', desc: '负责区域内业务管理与下级服务', tags: ['库存管理', '调拨审核', '平台订货'], icon: '代' },
  health_advisor: { name: '健康顾问', desc: '为用户提供健康咨询与服务', tags: ['健康服务', '客户管理'], icon: '健' },
  city_agent: { name: '市代', desc: '负责市级区域业务运营管理', tags: ['区域运营', '团队协作'], icon: '市' },
  province_agent: { name: '省代', desc: '负责省级区域业务统筹管理', tags: ['省级运营', '区域统筹'], icon: '省' }
};

export default {
  components: { JkPageNav },
  data() { return { canApplyRoles: [], currentRole: {}, selectedRoleCode: '', loaded: false }; },
  onShow() { this.loadPermissionContext(); },
  methods: {
    loadPermissionContext() {
      getJkPermissionContext().then(res => {
        const context = res.data || res || {};
        const roles = context.canApplyRoles || [];
        const primaryCode = context.primaryRoleCode || '';
        const primaryMeta = ROLE_META[primaryCode] || {};
        this.currentRole = primaryCode ? Object.assign({
          code: primaryCode,
          name: context.primaryRoleName || primaryCode,
          desc: context.identityStatusText || '当前已生效身份',
          tags: [],
          icon: '身'
        }, primaryMeta, {
          name: context.primaryRoleName || primaryMeta.name || primaryCode,
          desc: context.identityStatusText || primaryMeta.desc || '当前已生效身份'
        }) : {};
        this.canApplyRoles = roles.map(item => {
          const code = typeof item === 'object' ? (item.roleCode || item.code) : item;
          return Object.assign({ code, name: code, desc: '申请开通业务身份', tags: [], icon: '身' }, ROLE_META[code] || {});
        }).filter(role => role.code && role.code !== primaryCode);
        if (!this.canApplyRoles.some(role => role.code === this.selectedRoleCode)) this.selectedRoleCode = this.canApplyRoles.length ? this.canApplyRoles[0].code : '';
      }).catch(err => this.$util.Tips({ title: err || '身份信息加载失败' })).finally(() => { this.loaded = true; });
    },
    continueApply() { if (this.selectedRoleCode) uni.navigateTo({ url: '/pages/jk/identity/apply?roleCode=' + encodeURIComponent(this.selectedRoleCode) }); }
  }
};
</script>

<style lang="scss">
.identity-select { min-height: 100vh; padding: 0 32rpx 150rpx; background: linear-gradient(180deg, #ebfffb 0, #fff 310rpx); box-sizing: border-box; }.select-hero { display: flex; align-items: center; padding: 44rpx 0 38rpx; }.hero-icon { display: flex; align-items: center; justify-content: center; width: 100rpx; height: 100rpx; margin-right: 26rpx; border-radius: 50%; background: #dff8f2; color: #08b996; font-size: 64rpx; }.hero-title { margin-bottom: 12rpx; color: #171e2a; font-size: 35rpx; font-weight: 700; }.hero-desc { color: #7c8593; font-size: 26rpx; line-height: 1.6; }.current-role-card, .base-role-card { display: flex; align-items: center; min-height: 150rpx; margin-bottom: 34rpx; padding: 20rpx; border: 2rpx solid #d5eee8; border-radius: 18rpx; background: #f7fffc; }.base-role-card { border-color: #e5eaf0; background: #fafbfd; }.current-caption, .apply-caption { margin-bottom: 8rpx; color: #08a98c; font-size: 23rpx; }.current-tag, .base-tag { padding: 8rpx 14rpx; border-radius: 10rpx; background: #dff7f0; color: #08a98c; font-size: 22rpx; }.base-tag { background: #eef1f5; color: #88919d; }.apply-caption { margin: 0 0 10rpx 6rpx; color: #202633; font-size: 30rpx; font-weight: 700; }.role-card { display: flex; align-items: center; min-height: 178rpx; padding: 24rpx 18rpx; border-bottom: 1rpx solid #eef0f2; }.role-card.selected { margin: 8rpx -10rpx; border: 2rpx solid #c6efe6; border-radius: 18rpx; background: #f6fffc; }.role-icon { display: flex; align-items: center; justify-content: center; width: 92rpx; height: 92rpx; margin-right: 24rpx; border-radius: 50%; background: #e2f9f2; color: #08b996; font-size: 36rpx; font-weight: 700; }.role-icon.normal_user { background: #e8f1ff; color: #438cf2; }.role-icon.partner { background: #fff1d8; color: #f39a16; }.role-icon.city_agent, .role-icon.province_agent { background: #e7f0ff; color: #3988ef; }.role-content { flex: 1; }.role-name { margin-bottom: 8rpx; color: #202633; font-size: 34rpx; font-weight: 700; }.role-desc { color: #727b88; font-size: 27rpx; }.benefits { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 14rpx; }.benefits text { padding: 5rpx 12rpx; border-radius: 8rpx; background: #e8faf5; color: #139e83; font-size: 22rpx; }.radio { display: flex; align-items: center; justify-content: center; width: 40rpx; height: 40rpx; margin-left: 14rpx; border: 2rpx solid #d2d7df; border-radius: 50%; color: #fff; font-size: 26rpx; }.selected .radio { border-color: #08b996; background: #08b996; }.empty-card { padding: 34rpx; border-radius: 18rpx; background: #fff; color: #7c8593; text-align: center; font-size: 27rpx; }.select-note { margin: 44rpx 0 120rpx; color: #89919e; font-size: 25rpx; line-height: 1.7; }.select-note:before { content: 'i'; display: inline-block; width: 27rpx; height: 27rpx; margin-right: 12rpx; border: 2rpx solid #08b996; border-radius: 50%; color: #08b996; line-height: 27rpx; text-align: center; font-size: 21rpx; }.primary-btn { position: fixed; right: 32rpx; bottom: calc(28rpx + env(safe-area-inset-bottom)); left: 32rpx; height: 92rpx; border-radius: 46rpx; background: #08b996; color: #fff; line-height: 92rpx; font-size: 34rpx; font-weight: 700; }.primary-btn[disabled] { opacity: .55; }
</style>
