<template>
  <view class="jk-page"><jk-page-nav title="身份申请"></jk-page-nav>
    <view class="card">
      <view class="card-title">身份申请</view>
      <view class="desc">第一阶段仅提交身份申请与审核底座，证件附件、库存账户、佣金账户、推广码只保留后端占位，不进入真实业务闭环。</view>
    </view>

    <view class="card">
      <view class="form-item">
        <view class="label">申请身份</view>
        <picker :range="roleLabels" @change="onRoleChange" :value="roleIndex">
          <view class="picker">{{ currentRoleLabel }}</view>
        </picker>
      </view>
      <view class="form-item">
        <view class="label">姓名</view>
        <input v-model="form.realName" placeholder="请输入姓名" />
      </view>
      <view class="form-item">
        <view class="label">手机号</view>
        <input v-model="form.mobile" type="number" placeholder="请输入手机号" />
      </view>
      <view class="form-item">
        <view class="label">所属区域</view>
        <picker :range="regionLabels" @change="onRegionChange" :value="regionIndex">
          <view class="picker">{{ currentRegionLabel }}</view>
        </picker>
      </view>
      <view class="form-item textarea-item">
        <view class="label">申请原因</view>
        <textarea v-model="form.applyReason" maxlength="300" placeholder="请输入申请原因，便于后台审核"></textarea>
      </view>
    </view>

    <view class="card">
      <view class="sub-title">当前可申请身份</view>
      <view class="tag-list">
        <text class="tag" v-for="item in roleOptions" :key="item.code">{{ item.name }}</text>
      </view>
      <view class="empty" v-if="!roleOptions.length">当前没有可申请身份，请先查看审核结果或联系管理员。</view>
    </view>

    <button class="primary-btn" :disabled="submitting || !roleOptions.length" @click="submitApply">提交申请</button>
  </view>
</template>

<script>
import { getJkIdentityRegionOptions, getJkPermissionContext, submitJkIdentityApply } from '@/api/jk.js';
import JkPageNav from '@/components/jk/jk-page-nav.vue';

const ROLE_NAME_MAP = {
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
      roleOptions: [],
      roleIndex: 0,
      regionOptions: [],
      regionIndex: 0,
      submitting: false,
      form: {
        realName: '',
        mobile: '',
        regionCode: '',
        applyReason: ''
      }
    };
  },
  computed: {
    roleLabels() {
      return this.roleOptions.map(item => item.name);
    },
    currentRoleLabel() {
      return this.roleLabels.length ? this.roleLabels[this.roleIndex] : '暂无可申请身份';
    },
    regionLabels() {
      return this.regionOptions.map(item => item.regionName);
    },
    currentRegionLabel() {
      return this.regionOptions.length ? this.regionOptions[this.regionIndex].regionName : '请选择区域（选填）';
    }
  },
  onLoad() {
    this.loadContext();
    this.loadRegions();
  },
  methods: {
    loadContext() {
      getJkPermissionContext().then(res => {
        const canApplyRoles = (res.data && res.data.canApplyRoles) || [];
        this.roleOptions = canApplyRoles.map(code => ({
          code,
          name: ROLE_NAME_MAP[code] || code
        }));
        if (this.roleIndex >= this.roleOptions.length) {
          this.roleIndex = 0;
        }
      }).catch(err => {
        this.$util.Tips({ title: err });
      });
    },
    loadRegions() {
      getJkIdentityRegionOptions().then(res => {
        const rows = (res.data || res || []).map(item => ({
          regionCode: item.regionCode,
          regionName: item.regionName
        })).filter(item => item.regionCode && item.regionName);
        this.regionOptions = [{ regionCode: '', regionName: '不指定区域（选填）' }].concat(rows);
        const matchIndex = rows.findIndex(item => item.regionCode === this.form.regionCode);
        this.regionIndex = matchIndex >= 0 ? (matchIndex + 1) : 0;
      }).catch(() => {
        this.regionOptions = [{ regionCode: '', regionName: '不指定区域（选填）' }];
        this.regionIndex = 0;
      });
    },
    onRoleChange(event) {
      this.roleIndex = Number(event.detail.value || 0);
    },
    onRegionChange(event) {
      const index = Number(event.detail.value || 0);
      this.regionIndex = index;
      const currentRegion = this.regionOptions[index];
      this.form.regionCode = currentRegion ? currentRegion.regionCode : '';
    },
    buildRequestNo() {
      return `jk_apply_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    },
    submitApply() {
      if (!this.roleOptions.length) {
        this.$util.Tips({ title: '当前没有可申请身份' });
        return;
      }
      if (!this.form.applyReason) {
        this.$util.Tips({ title: '请填写申请原因' });
        return;
      }
      if (this.regionOptions.length && this.form.regionCode === '') {
        const currentRegion = this.regionOptions[this.regionIndex];
        this.form.regionCode = currentRegion ? currentRegion.regionCode : '';
      }
      const currentRole = this.roleOptions[this.roleIndex];
      const payload = {
        requestNo: this.buildRequestNo(),
        applyRoleCode: currentRole.code,
        realName: this.form.realName,
        mobile: this.form.mobile,
        regionCode: this.form.regionCode,
        applyReason: this.form.applyReason,
        certificateFiles: ''
      };
      this.submitting = true;
      submitJkIdentityApply(payload).then(() => {
        this.$util.Tips({ title: '申请已提交' });
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/jk/identity/applyList'
          });
        }, 500);
      }).catch(err => {
        this.$util.Tips({ title: err });
      }).finally(() => {
        this.submitting = false;
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
}
.card-title {
  margin-bottom: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}
.desc,
.empty {
  font-size: 24rpx;
  line-height: 1.7;
  color: #6b7280;
}
.form-item {
  margin-bottom: 24rpx;
}
.label,
.sub-title {
  margin-bottom: 14rpx;
  font-size: 26rpx;
  color: #374151;
}
.picker,
input,
textarea {
  width: 100%;
  padding: 22rpx 24rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  font-size: 26rpx;
  box-sizing: border-box;
}
.textarea-item textarea {
  min-height: 220rpx;
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
.primary-btn {
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 999rpx;
  background: #1f7a5b;
  color: #ffffff;
  font-size: 28rpx;
}
.primary-btn[disabled] {
  opacity: 0.6;
}

/* UI1.1 identity application page */
.jk-page{min-height:100vh;padding:0 22rpx 150rpx;background:linear-gradient(180deg,#54cdbb 0,#bde9e2 230rpx,#f6f8f7 480rpx)}.jk-page .card{margin:20rpx 0;padding:28rpx;border-radius:24rpx;background:#fff;box-shadow:0 12rpx 30rpx rgba(34,99,88,.07)}.jk-page .card:first-child{margin-top:0;padding-top:44rpx;background:linear-gradient(135deg,#f5fffc,#fff)}.jk-page .card-title{padding-left:18rpx;border-left:7rpx solid #28c6a5;color:#303638;font-size:34rpx;font-weight:700}.jk-page .desc{color:#80908d;line-height:1.8}.jk-page .form-item{margin-bottom:25rpx}.jk-page .label,.jk-page .sub-title{color:#343a3c;font-size:28rpx;font-weight:600}.jk-page .picker,.jk-page input,.jk-page textarea{border:1rpx solid #e3eeeb;background:#f7fbfa;color:#343a3c;font-size:27rpx}.jk-page .picker{position:relative}.jk-page .picker:after{position:absolute;right:22rpx;content:'›';color:#22be9d;font-size:38rpx}.jk-page .tag{border:1rpx solid #a6e4d7;background:#f2fcf8;color:#15aa88}.jk-page .primary-btn{height:86rpx;line-height:86rpx;background:#28c6a5;color:#fff;font-size:31rpx;font-weight:700;box-shadow:0 12rpx 20rpx rgba(40,198,165,.22)}

/* Identity application design system. */
.jk-page{min-height:100vh;padding:32rpx 24rpx 148rpx;background:#F5F7FA!important}.jk-page .card{margin:0 0 24rpx;padding:32rpx;border:0!important;border-radius:20rpx;background:#FFF!important;box-shadow:0 4rpx 16rpx rgba(0,0,0,.04)!important}.jk-page .card:first-child{padding-top:32rpx}.jk-page .card-title{margin-bottom:20rpx;padding:0;border:0;color:#333;font-size:34rpx;font-weight:600}.jk-page .desc,.jk-page .empty{color:#999;font-size:25rpx;line-height:1.8}.jk-page .form-item{margin-bottom:30rpx}.jk-page .label,.jk-page .sub-title{margin-bottom:16rpx;color:#333;font-size:28rpx;font-weight:600}.jk-page .picker,.jk-page input,.jk-page textarea{border:0!important;border-radius:16rpx;background:#F8FAFC;color:#333;font-size:27rpx}.jk-page .textarea-item textarea{min-height:230rpx}.jk-page .tag-list{display:flex;flex-wrap:wrap;gap:16rpx}.jk-page .tag{display:flex;align-items:center;height:48rpx;margin:0;padding:0 22rpx;border:0!important;border-radius:24rpx;background:rgba(40,198,165,.10)!important;color:#159E80;font-size:24rpx;box-sizing:border-box}.jk-page .primary-btn{height:88rpx;margin:8rpx 0 0;border:0!important;border-radius:44rpx;background:#28C6A5;color:#FFF;line-height:88rpx;font-size:30rpx;font-weight:600;box-shadow:0 4rpx 16rpx rgba(40,198,165,.18)}
</style>
