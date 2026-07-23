<template>
  <view class="page">
    <view class="hero">
      <view class="title">健康中心</view>
      <view class="sub">健康数据仅本人和获得授权的健康顾问可查看</view>
    </view>

    <view class="card latest">
      <view>
        <text class="label">最近血糖</text>
        <view v-if="dashboard.latestGlucose">
          <text class="value">{{ dashboard.latestGlucose.numericValue }}</text>
          <text class="unit">{{ dashboard.latestGlucose.unit || 'mmol/L' }}</text>
          <view class="time">
            {{ dashboard.latestGlucose.measuredAt }} · {{ dashboard.latestGlucose.periodCode || '未标记时段' }}
          </view>
        </view>
        <view v-else class="empty">暂无血糖数据</view>
      </view>
      <view class="risk" :class="riskClass">{{ latestGlucoseRiskText }}</view>
    </view>

    <view class="card stats">
      <view>
        <text class="stat-value">{{ dashboard.todayRecordCount || 0 }}</text>
        <text>今日记录</text>
      </view>
      <view>
        <text class="stat-value">{{ dashboard.activeAlertCount || 0 }}</text>
        <text>待处理预警</text>
      </view>
      <view>
        <text class="stat-value">{{ dashboard.boundDeviceCount || 0 }}</text>
        <text>绑定设备</text>
      </view>
    </view>

    <view class="grid">
      <navigator url="/pages/jk/health/glucose">记录血糖</navigator>
      <navigator url="/pages/jk/health/diet">记录饮食</navigator>
      <navigator url="/pages/jk/health/exercise">记录运动</navigator>
      <navigator url="/pages/jk/health/medicine">记录用药</navigator>
      <navigator url="/pages/jk/health/dataList">全部数据</navigator>
      <navigator url="/pages/jk/health/trend">血糖趋势</navigator>
      <navigator url="/pages/jk/health/alerts">异常提醒</navigator>
      <navigator url="/pages/jk/health/device">设备管理</navigator>
      <navigator url="/pages/jk/health/profile">健康档案</navigator>
      <navigator url="/pages/jk/health/authorization">授权管理</navigator>
      <navigator v-if="canViewAuthorized" url="/pages/jk/health/authorizedOwners">授权用户</navigator>
    </view>

    <view class="card recent">
      <view class="section-title">最近记录</view>
      <view v-for="item in recentRecords" :key="item.id" class="record">
        <view>
          <text class="record-title">{{ item.dataTypeText || item.dataType }}</text>
          <text class="record-time">{{ item.measuredAt }}</text>
        </view>
        <text class="record-value">{{ recordValue(item) }}</text>
      </view>
      <view v-if="!recentRecords.length" class="empty">暂无记录</view>
    </view>
  </view>
</template>

<script>
import { getHealthDashboard } from '@/api/health.js';
import { getJkPermissionContext } from '@/api/jk.js';

export default {
  data() {
    return {
      dashboard: {},
      permissions: []
    };
  },
  computed: {
    canViewAuthorized() {
      return this.permissions.indexOf('health.data.view.authorized') > -1;
    },
    latestGlucoseRiskText() {
      return (this.dashboard.latestGlucose && this.dashboard.latestGlucose.riskLevelText) || '正常';
    },
    recentRecords() {
      return this.dashboard.recentRecords || [];
    },
    riskClass() {
      const level = this.dashboard.latestGlucose && this.dashboard.latestGlucose.riskLevel;
      if (level === 'HIGH') {
        return 'high';
      }
      if (level === 'MEDIUM') {
        return 'medium';
      }
      return 'normal';
    }
  },
  onShow() {
    this.load();
  },
  methods: {
    value(res) {
      return res && res.data ? res.data : (res || {});
    },
    load() {
      getHealthDashboard().then(res => {
        this.dashboard = this.value(res);
      }).catch(() => {
        this.dashboard = {};
      });

      getJkPermissionContext().then(res => {
        const data = this.value(res);
        this.permissions = data.permissions || [];
      }).catch(() => {
        this.permissions = [];
      });
    },
    recordValue(item) {
      if (item.numericValue != null) {
        return item.numericValue + (item.unit || '');
      }
      return this.summary(item);
    },
    summary(item) {
      try {
        const detail = JSON.parse(item.detail || '{}');
        return detail.content || detail.remark || '';
      } catch (error) {
        return '';
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 28rpx;
  background: #f5f7f7;
}

.hero {
  padding: 40rpx 12rpx 26rpx;
}

.title {
  font-size: 44rpx;
  font-weight: 700;
}

.sub {
  margin-top: 12rpx;
  color: #7d8585;
  font-size: 25rpx;
}

.card {
  margin-bottom: 22rpx;
  padding: 28rpx;
  background: #fff;
  border-radius: 24rpx;
}

.latest {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.label {
  color: #899;
  font-size: 26rpx;
}

.value {
  font-size: 76rpx;
  font-weight: 700;
  color: #1ab99a;
}

.unit {
  margin-left: 10rpx;
  color: #899;
}

.time {
  font-size: 23rpx;
  color: #999;
}

.empty {
  padding: 28rpx 0;
  text-align: center;
  color: #aaa;
}

.risk {
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
}

.normal {
  background: #e7f8f4;
  color: #119d83;
}

.medium {
  background: #fff3d9;
  color: #c58511;
}

.high {
  background: #ffe7e7;
  color: #d33;
}

.stats {
  display: flex;
  margin-top: 0;
}

.stats view {
  flex: 1;
  text-align: center;
}

.stats text {
  display: block;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #111827;
}

.stats view text:last-child {
  font-size: 23rpx;
  color: #999;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-bottom: 22rpx;
}

.grid navigator {
  padding: 28rpx 8rpx;
  background: #fff;
  border-radius: 18rpx;
  text-align: center;
  font-size: 25rpx;
}

.section-title {
  margin-bottom: 15rpx;
  font-size: 31rpx;
  font-weight: 600;
}

.record {
  display: flex;
  justify-content: space-between;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #eee;
}

.record-title,
.record-time,
.record-value {
  display: block;
}

.record-time {
  color: #999;
  font-size: 22rpx;
}
</style>
