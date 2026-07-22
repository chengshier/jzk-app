<template>
  <view class="jk-page"><jk-page-nav title="身份状态"></jk-page-nav>
    <view class="card">
      <view class="card-title">当前身份状态</view>
      <view class="status-row">
        <text class="label">主身份</text>
        <text class="value">{{ context.primaryRoleName || '普通用户' }}</text>
      </view>
      <view class="status-row">
        <text class="label">状态文案</text>
        <text class="value">{{ context.identityStatusText || '暂无生效身份' }}</text>
      </view>
      <view class="status-row">
        <text class="label">审核状态</text>
        <text class="value">{{ context.auditStatusText || auditStatusText(context.auditStatus) }}</text>
      </view>
      <view class="status-row" v-if="context.regionName || context.regionCode">
        <text class="label">所属区域</text>
        <text class="value">{{ context.regionName || '区域未配置' }}</text>
      </view>
      <view class="status-row">
        <text class="label">冻结状态</text>
        <text class="value">{{ context.freezeStatus ? '已冻结' : '正常' }}</text>
      </view>
      <view class="status-row" v-if="context.disabledReasonText || context.disableReason">
        <text class="label">禁用原因</text>
        <text class="value reason">{{ context.disabledReasonText || context.disableReason }}</text>
      </view>
    </view>

    <view class="card">
      <view class="card-title">业务身份</view>
      <view class="tag-list">
        <text class="tag" v-for="item in context.roles" :key="roleKey(item)">{{ roleName(item) }}</text>
      </view>
      <view class="empty" v-if="!context.roles || !context.roles.length">暂无业务身份</view>
    </view>

    <view class="card">
      <view class="card-title">可申请身份</view>
      <view class="tag-list">
        <text class="tag light" v-for="item in context.canApplyRoles" :key="roleKey(item)">{{ roleName(item) }}</text>
      </view>
      <view class="empty" v-if="!context.canApplyRoles || !context.canApplyRoles.length">当前没有可申请的新身份</view>
    </view>

    <view class="card">
      <view class="card-title">权限与数据范围</view>
      <view class="sub-title">权限点</view>
      <view class="tag-list">
        <text class="tag light" v-for="item in context.permissions" :key="item">{{ item }}</text>
      </view>
      <view class="empty" v-if="!context.permissions || !context.permissions.length">暂无业务权限点</view>
      <view class="sub-title">数据范围</view>
      <view class="scope-item" v-for="(item, index) in context.dataScopes" :key="index">
        {{ item.scopeTypeText || scopeName(item.scopeType) }}<text v-if="item.regionName || item.regionCode"> / {{ item.regionName || '区域未配置' }}</text>
      </view>
      <view class="empty" v-if="!context.dataScopes || !context.dataScopes.length">暂无业务数据范围</view>
    </view>

    <view class="card" v-if="canShowIncome">
      <view class="card-title">收益与提现</view>
      <view class="income-grid">
        <view :class="[\'income-entry\', { disabled: incomeDisabled }]" @click="goIncome('/pages/jk/commission/index')">我的收益</view>
        <view :class="[\'income-entry\', { disabled: incomeDisabled }]" @click="goIncome('/pages/jk/commission/list')">佣金明细</view>
        <view :class="[\'income-entry\', { disabled: incomeDisabled }]" @click="goIncome('/pages/jk/withdraw/list')">提现记录</view>
        <view :class="[\'income-entry\', { disabled: incomeDisabled }]" @click="goIncome('/pages/jk/withdraw/apply')">申请提现</view>
      </view>
      <view class="empty" v-if="incomeDisabled">{{ context.disabledReasonText || context.disableReason || '当前身份暂不可使用收益与提现功能' }}</view>
    </view>
    <view class="card tip-card">
      <view class="tip-title">第四阶段说明</view>
      <view class="tip-text">收益与提现入口仅对已生效的创客、合伙人、区县代展示；冻结身份由后端限制提现并提示原因。普通用户购买链路不受影响。</view>
    </view>

    <view class="btn-group">
      <button class="primary-btn" @click="goApply">提交身份申请</button>
      <button class="ghost-btn" @click="goList">查看申请记录</button>
    </view>
  </view>
</template>

<script>
import { getJkPermissionContext } from '@/api/jk.js';
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import { jkAuditStatusText, jkScopeTypeText } from '@/utils/jk-display.js';

const ROLE_NAME_MAP = {
  normal_user: '普通用户',
  maker: '创客',
  partner: '合伙人',
  county_agent: '区县代',
  health_advisor: '健康顾问',
  city_agent: '市代',
  province_agent: '省代'
};

export default { components: { JkPageNav },
  data() {
    return {
      context: {
        roles: [],
        canApplyRoles: [],
        permissions: [],
        dataScopes: []
      }
    };
  },
  onShow() {
    this.loadContext();
  },
  computed: {
    canShowIncome() { return ["maker", "partner", "county_agent"].indexOf(this.context.primaryRoleCode) >= 0; },
    incomeDisabled() { return !!this.context.freezeStatus || (this.context.permissions || []).indexOf("commission.view.self") < 0; }
  },
  methods: {
    loadContext() {
      getJkPermissionContext().then(res => {
        const data = res.data || {};
        this.context = Object.assign({
          roles: [],
          canApplyRoles: [],
          permissions: [],
          dataScopes: [],
          roleNameMap: {}
        }, data);
      }).catch(err => {
        this.$util.Tips({ title: err });
      });
    },
    roleKey(item) {
      if (item && typeof item === 'object') {
        return item.roleCode || item.code || item.id || JSON.stringify(item);
      }
      return item;
    },
    roleName(item) {
      if (item && typeof item === 'object') {
        return item.roleName || this.roleName(item.roleCode || item.code || item.id);
      }
      const roleNameMap = (this.context && this.context.roleNameMap) || {};
      return roleNameMap[item] || ROLE_NAME_MAP[item] || item;
    },
    auditStatusText(status) { return jkAuditStatusText(status); },
    scopeName(scope) { return jkScopeTypeText(scope); },
    goApply() {
      uni.navigateTo({
        url: '/pages/jk/identity/apply'
      });
    },
    goIncome(url) { if (this.incomeDisabled) { return this.$util.Tips({ title: this.context.disabledReasonText || this.context.disableReason || "当前身份暂无收益权限" }); } uni.navigateTo({ url: url }); },    goList() {
      uni.navigateTo({
        url: '/pages/jk/identity/applyList'
      });
    }
  }
};
</script>

<style lang="scss">
.jk-page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f6f7fb;
}
.card {
  margin-bottom: 24rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(31, 35, 41, 0.06);
}
.card-title {
  margin-bottom: 20rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}
.status-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
  font-size: 26rpx;
  color: #4b5563;
}
.label {
  color: #6b7280;
}
.value {
  max-width: 420rpx;
  text-align: right;
  color: #111827;
}
.reason {
  color: #d9485f;
}
.sub-title {
  margin: 18rpx 0 12rpx;
  font-size: 26rpx;
  color: #374151;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
}
.tag {
  margin: 0 14rpx 14rpx 0;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: #eef2ff;
  color: #334155;
  font-size: 24rpx;
}
.tag.light {
  background: #f4f6f8;
}
.scope-item,
.empty,
.tip-text {
  font-size: 24rpx;
  line-height: 1.7;
  color: #6b7280;
}
.tip-card {
  background: linear-gradient(135deg, #f8fafc, #eef6ff);
}
.tip-title {
  margin-bottom: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
}
.btn-group {
  padding-bottom: 24rpx;
}
.primary-btn,
.ghost-btn {
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
}
.primary-btn {
  margin-bottom: 20rpx;
  background: #1f7a5b;
  color: #ffffff;
}
.ghost-btn {
  background: #ffffff;
  color: #1f7a5b;
  border: 2rpx solid #d6e9df;
}

/* UI1.1 identity status page */
.jk-page{min-height:100vh;padding:0 22rpx 150rpx;background:linear-gradient(180deg,#54cdbb 0,#bde9e2 250rpx,#f6f8f7 500rpx)}.jk-page .card{margin:20rpx 0;padding:28rpx;border-radius:24rpx;background:#fff;box-shadow:0 12rpx 30rpx rgba(34,99,88,.07)}.jk-page .card:first-child{margin-top:0;padding-top:46rpx}.jk-page .card-title{padding-left:18rpx;border-left:7rpx solid #28c6a5;color:#303638;font-size:34rpx;font-weight:700}.jk-page .status-row{min-height:62rpx;margin:0;padding:0 0 0 18rpx;border-bottom:1rpx solid #eef2f1;align-items:center}.jk-page .status-row:last-child{border-bottom:0}.jk-page .label{color:#98a0a2;font-size:26rpx}.jk-page .value{color:#343a3c;font-size:27rpx;font-weight:600}.jk-page .tag{border:1rpx solid #9ce2d4;background:#f4fcf9;color:#14a985}.jk-page .tag.light{background:#f2faf7}.jk-page .sub-title{color:#303638;font-weight:600}.jk-page .tip-card{background:linear-gradient(135deg,#ebfaf6,#f8fffd)}.jk-page .tip-title{color:#159f7f}.jk-page .btn-group{display:flex;gap:18rpx;padding:18rpx 0 0}.jk-page .primary-btn,.jk-page .ghost-btn{flex:1;margin:0;height:82rpx;line-height:82rpx;font-size:29rpx;font-weight:700}.jk-page .primary-btn{background:#28c6a5}.jk-page .ghost-btn{border:1rpx solid #78d9c5;background:#fff;color:#16af8d}

/* Identity design system: neutral canvas, white cards, semantic green only. */
.jk-page{min-height:100vh;padding:32rpx 24rpx 148rpx;background:#F5F7FA!important}.jk-page .card{margin:0 0 24rpx;padding:32rpx;border:0!important;border-radius:20rpx;background:#FFF!important;box-shadow:0 4rpx 16rpx rgba(0,0,0,.04)!important}.jk-page .card:first-child{margin-top:0;padding-top:32rpx}.jk-page .card-title{margin-bottom:28rpx;padding:0;border:0;color:#333;font-size:34rpx;font-weight:600}.jk-page .status-row{min-height:72rpx;margin:0 0 12rpx;padding:0 20rpx;border:0!important;border-radius:14rpx;background:#F8FAFC;box-sizing:border-box}.jk-page .status-row:last-child{margin-bottom:0}.jk-page .label{color:#999;font-size:26rpx}.jk-page .value{color:#333;font-size:27rpx;font-weight:600}.jk-page .reason{color:#D96A6A}.jk-page .sub-title{margin:28rpx 0 16rpx;color:#333;font-size:28rpx;font-weight:600}.jk-page .tag-list{display:flex;flex-wrap:wrap;gap:16rpx}.jk-page .tag{display:flex;align-items:center;height:48rpx;margin:0;padding:0 22rpx;border:0!important;border-radius:24rpx;background:rgba(40,198,165,.10)!important;color:#159E80;font-size:24rpx;box-sizing:border-box}.jk-page .tag.light{background:#F1F4F3!important;color:#687572}.jk-page .scope-item,.jk-page .empty,.jk-page .tip-text{color:#999;font-size:25rpx;line-height:1.8}.jk-page .tip-card{background:#FFF!important}.jk-page .tip-title{margin-bottom:14rpx;color:#333;font-size:28rpx;font-weight:600}.jk-page .btn-group{display:flex;flex-wrap:wrap;gap:16rpx;padding:8rpx 0 0}.jk-page .primary-btn,.jk-page .ghost-btn{flex:1;min-width:260rpx;height:88rpx;margin:0;border:0!important;border-radius:44rpx;line-height:88rpx;font-size:30rpx;font-weight:600}.jk-page .primary-btn{background:#28C6A5;color:#FFF}.jk-page .ghost-btn{background:rgba(40,198,165,.10);color:#159E80}

.income-grid{display:grid;grid-template-columns:1fr 1fr;gap:16rpx}.income-entry{padding:24rpx 16rpx;border-radius:16rpx;background:#f4fcf9;color:#159f7f;text-align:center;font-size:26rpx;font-weight:600}.income-entry.disabled{background:#f2f4f5;color:#9aa2a5}
</style>
