<template>
  <view class="entry-page">
    <jk-page-nav title="身份申请入口" />
    <view class="entry-content">
      <view class="hero-card">
        <view class="hero-copy">
          <text class="hero-title">加入九州康业务体系\n解锁更多专属权益</text>
          <text class="hero-desc">选择合适的业务身份，享受专属功能与服务支持，助力业务高效开展。</text>
          <text class="hero-link" @tap="openIdentityHelp">了解更多权益 ›</text>
        </view>
        <image class="hero-image" src="/static/jk-ui-v2/banners/identity-banner.png" mode="aspectFill" />
      </view>

      <view class="section-card">
        <view class="section-title">当前状态</view>
        <view class="status-row" @tap="goStatus">
          <jk-icon name="identity" size="lg" />
          <view class="status-main">
            <text class="status-label">当前身份</text>
            <text class="status-name">{{ primaryRoleName }}</text>
            <jk-status-tag :text="statusText" :tone="statusTone" />
          </view>
          <text class="arrow">›</text>
        </view>
      </view>

      <view class="section-card quick-card">
        <view class="section-title">快速入口</view>
        <view class="quick-row" @tap="goRecords">
          <jk-icon name="document" size="md" />
          <view class="quick-main">
            <text class="quick-name">申请记录</text>
            <text class="quick-desc">查看我的身份申请记录与审批状态</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="quick-row" @tap="openIdentityHelp">
          <jk-icon name="info" size="md" />
          <view class="quick-main">
            <text class="quick-name">身份说明</text>
            <text class="quick-desc">了解各类身份的权益与申请要求</text>
          </view>
          <text class="arrow">›</text>
        </view>
      </view>
    </view>

    <jk-bottom-action>
      <button class="primary-btn" @tap="goApply">
        <image src="/static/jk-ui-v2/icons/user.png" mode="aspectFit" />
        {{ canApply ? '申请新的业务身份' : actionText }}
      </button>
    </jk-bottom-action>
  </view>
</template>

<script>
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import JkIcon from '@/components/jk/jk-icon.vue';
import JkStatusTag from '@/components/jk/jk-status-tag.vue';
import JkBottomAction from '@/components/jk/jk-bottom-action.vue';
import { getJkPermissionContext } from '@/api/jk.js';

const ROLE_NAME_MAP = {
  normal_user: '普通用户', maker: '创客', partner: '合伙人', county_agent: '区县代',
  health_advisor: '健康顾问', city_agent: '市代', province_agent: '省代'
};

export default {
  components: { JkPageNav, JkIcon, JkStatusTag, JkBottomAction },
  data() { return { context: { canApplyRoles: [] } }; },
  computed: {
    primaryRoleName() { return this.context.primaryRoleName || ROLE_NAME_MAP[this.context.primaryRoleCode] || '普通用户'; },
    statusText() {
      if (this.context.freezeStatus) return '身份已冻结';
      const status = this.context.auditStatus || this.context.identityStatus;
      if (status === 'PENDING') return '审核中';
      if (status === 'REJECTED') return '审核未通过';
      if (this.context.primaryRoleCode && this.context.primaryRoleCode !== 'normal_user') return '身份正常';
      return this.context.identityStatusText || '暂未开通业务身份';
    },
    statusTone() {
      if (this.context.freezeStatus || this.context.auditStatus === 'REJECTED') return 'danger';
      if (this.context.auditStatus === 'PENDING') return 'warning';
      if (this.context.primaryRoleCode && this.context.primaryRoleCode !== 'normal_user') return 'success';
      return 'muted';
    },
    canApply() { return !this.context.freezeStatus && (this.context.canApplyRoles || []).length > 0; },
    actionText() {
      if (this.context.freezeStatus) return '查看冻结原因';
      if (this.context.auditStatus === 'PENDING') return '查看审核进度';
      if (this.context.auditStatus === 'REJECTED') return '重新申请业务身份';
      return '查看身份状态';
    }
  },
  onShow() { this.load(); },
  methods: {
    load() {
      getJkPermissionContext().then(res => { this.context = Object.assign({ canApplyRoles: [] }, res.data || res || {}); }).catch(() => {});
    },
    goApply() {
      if (this.canApply || this.context.auditStatus === 'REJECTED') return uni.navigateTo({ url: '/pages/jk/identity/select' });
      this.goStatus();
    },
    goStatus() { uni.navigateTo({ url: '/pages/jk/identity/status' }); },
    goRecords() { uni.navigateTo({ url: '/pages/jk/identity/applyList' }); },
    openIdentityHelp() { uni.showToast({ title: '身份说明由平台业务规则配置', icon: 'none' }); }
  }
};
</script>

<style scoped>
.entry-page{min-height:100vh;padding-bottom:132rpx;background:#f7f9f9}.entry-content{padding:20rpx 24rpx 40rpx}
.hero-card{position:relative;display:flex;align-items:center;height:348rpx;overflow:hidden;border-radius:24rpx;background:linear-gradient(135deg,#e5fbf5,#f7fffd)}.hero-copy{position:relative;z-index:2;flex:1;padding:32rpx 0 30rpx 32rpx}.hero-title{display:block;color:#1d2a31;font-size:36rpx;font-weight:700;line-height:1.45;white-space:pre-line}.hero-desc{display:block;width:360rpx;margin-top:18rpx;color:#6d7c83;font-size:23rpx;line-height:1.65}.hero-link{display:block;margin-top:24rpx;color:#0fae88;font-size:24rpx;font-weight:600}.hero-image{position:absolute;right:-72rpx;bottom:-18rpx;width:390rpx;height:330rpx;opacity:.95}
.section-card{margin-top:24rpx;padding:28rpx;border-radius:22rpx;background:#fff;box-shadow:0 8rpx 24rpx rgba(22,74,60,.045)}.section-title{color:#1f2937;font-size:31rpx;font-weight:700}.status-row{display:flex;align-items:center;margin-top:24rpx;padding-top:8rpx}.status-main{display:flex;min-width:0;flex:1;flex-direction:column;gap:8rpx;margin-left:20rpx}.status-label{color:#8a949a;font-size:22rpx}.status-name{color:#1d2930;font-size:32rpx;font-weight:700}.status-main ::v-deep .jk-status-tag{align-self:flex-start}.arrow{color:#9da7ac;font-size:42rpx;font-family:Arial,sans-serif}
.quick-card{padding-bottom:10rpx}.quick-row{display:flex;align-items:center;min-height:118rpx;border-bottom:1rpx solid #edf1f0}.quick-row:last-child{border-bottom:0}.quick-main{min-width:0;flex:1;margin-left:18rpx}.quick-name{display:block;color:#253139;font-size:28rpx;font-weight:600}.quick-desc{display:block;margin-top:9rpx;color:#89949a;font-size:22rpx}.primary-btn{display:flex!important;align-items:center;justify-content:center;border:0!important;background:linear-gradient(90deg,#13b98f,#06ac81)!important;color:#fff!important}.primary-btn image{width:42rpx;height:42rpx;margin-right:12rpx;filter:brightness(0) invert(1)}
</style>
