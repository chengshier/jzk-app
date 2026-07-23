<template>
  <view class="identity-apply">
    <jk-page-nav title="身份申请填写"></jk-page-nav>
    <view class="steps">
      <view class="step active"><text>1</text><view>填写信息</view></view>
      <view class="step-line"></view>
      <view class="step"><text>2</text><view>提交审核</view></view>
      <view class="step-line"></view>
      <view class="step"><text>3</text><view>审核结果</view></view>
    </view>

    <view class="section-title">基本信息</view>
    <view class="form-card">
      <view class="field">
        <text class="field-label">申请身份</text>
        <picker :range="roleLabels" :value="roleIndex" @change="onRoleChange">
          <view class="field-value picker-value">{{ currentRoleLabel }}</view>
        </picker>
      </view>
      <view class="field">
        <text class="field-label">真实姓名</text>
        <input v-model.trim="form.realName" class="field-input" maxlength="30" placeholder="请输入真实姓名" />
      </view>
      <view class="field">
        <text class="field-label">手机号码</text>
        <input v-model.trim="form.mobile" class="field-input" type="number" maxlength="11" placeholder="请输入手机号码" />
      </view>
      <view class="field">
        <text class="field-label">所属区域</text>
        <picker mode="multiSelector" :range="regionPickerLabels" :value="regionPickerIndexes" @columnchange="onRegionColumnChange" @change="onRegionChange">
          <view class="field-value picker-value">{{ currentRegionLabel }}</view>
        </picker>
      </view>
    </view>

    <view class="section-title">补充信息 <text>（选填）</text></view>
    <view class="form-card">
      <view class="field recommender-field">
        <text class="field-label">推荐人</text>
        <input v-model.trim="form.recommender" class="field-input" maxlength="50" placeholder="请输入推荐人姓名或手机号" />
      </view>
      <view class="reason-label">申请说明 <text>（选填）</text></view>
      <textarea v-model="form.applyReason" class="reason-input" maxlength="200" placeholder="请简要说明申请该身份的原因及用途"></textarea>
      <view class="reason-count">{{ form.applyReason.length }}/200</view>
    </view>

    <view class="section-title">上传资料</view>
    <view class="upload-hint">请上传身份证或与申请身份相关的证明材料</view>
    <view class="upload-card">
      <view v-for="(url, index) in certificateUrls" :key="url" class="uploaded-file">
        <image :src="url" mode="aspectFill" @click="previewCertificate(index)"></image>
        <text class="remove-file" @click="removeCertificate(index)">×</text>
      </view>
      <view v-if="certificateUrls.length < 6" class="upload-action" @click="addCertificate">
        <text class="upload-plus">+</text>
        <text>{{ uploading ? '上传中...' : '点击上传证明材料' }}</text>
        <text class="upload-tip">支持 jpg/png，单张不超过10MB</text>
      </view>
    </view>

    <view class="submit-wrap">
      <button class="submit-btn" :disabled="submitting || uploading || !roleOptions.length" @click="submitApply">
        {{ submitting ? '提交中...' : '提交申请' }}
      </button>
    </view>
  </view>
</template>

<script>
import { getJkIdentityRegionOptions, getJkPermissionContext, submitJkIdentityApply } from '@/api/jk.js';
import JkPageNav from '@/components/jk/jk-page-nav.vue';

const ROLE_NAME_MAP = {
  maker: '创客', partner: '合伙人', county_agent: '区县代', health_advisor: '健康顾问', city_agent: '市代', province_agent: '省代'
};

export default {
  components: { JkPageNav },
  data() {
    return {
      roleOptions: [], roleIndex: 0, regionOptions: [], regionPickerColumns: [[], [], []], regionPickerIndexes: [0, 0, 0],
      submitting: false, uploading: false,
      // Keep this id for the page lifecycle so a retry is deduplicated by the server.
      requestNo: `jk_apply_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      certificateUrls: [],
      form: { realName: '', mobile: '', regionCode: '', regionName: '', recommender: '', applyReason: '' }
    };
  },
  computed: {
    roleLabels() { return this.roleOptions.map(item => item.name); },
    currentRoleLabel() { return this.roleLabels[this.roleIndex] || '暂无可申请身份'; },
    regionPickerLabels() { return this.regionPickerColumns.map(column => column.map(item => item.regionName)); },
    currentRegionLabel() { return this.form.regionName || '请选择省 / 市 / 区'; }
  },
  onLoad(query) {
    this.requestedRoleCode = query.roleCode || '';
    this.loadContext();
    this.loadRegions();
  },
  methods: {
    loadContext() {
      getJkPermissionContext().then(res => {
        const context = res.data || res || {};
        this.roleOptions = (context.canApplyRoles || []).map(code => ({ code, name: ROLE_NAME_MAP[code] || code }));
        const matched = this.roleOptions.findIndex(item => item.code === this.requestedRoleCode);
        this.roleIndex = matched >= 0 ? matched : 0;
      }).catch(err => this.$util.Tips({ title: err || '身份信息加载失败' }));
    },
    loadRegions() {
      getJkIdentityRegionOptions().then(res => {
        const rows = (res.data || res || []).map(item => ({ regionCode: item.regionCode, regionName: item.regionName, parentRegionCode: item.parentRegionCode || '', regionLevel: Number(item.regionLevel || 0) }))
          .filter(item => item.regionCode && item.regionName);
        this.regionOptions = rows;
        this.initRegionPicker();
      }).catch(() => { this.regionOptions = []; });
    },
    onRoleChange(event) { this.roleIndex = Number(event.detail.value || 0); },
    initRegionPicker() {
      const codes = {};
      this.regionOptions.forEach(item => { codes[item.regionCode] = true; });
      const roots = this.regionOptions.filter(item => !item.parentRegionCode || !codes[item.parentRegionCode]);
      this.regionPickerColumns = [roots, [], []];
      this.regionPickerIndexes = [0, 0, 0];
      this.syncRegionPicker();
    },
    regionChildren(parentCode) { return this.regionOptions.filter(item => item.parentRegionCode === parentCode); },
    syncRegionPicker() {
      const provinces = this.regionPickerColumns[0] || [];
      const province = provinces[this.regionPickerIndexes[0]];
      const cities = province ? this.regionChildren(province.regionCode) : [];
      if (this.regionPickerIndexes[1] >= cities.length) this.regionPickerIndexes.splice(1, 1, 0);
      const city = cities[this.regionPickerIndexes[1]];
      const districts = city ? this.regionChildren(city.regionCode) : [];
      if (this.regionPickerIndexes[2] >= districts.length) this.regionPickerIndexes.splice(2, 1, 0);
      this.regionPickerColumns.splice(1, 1, cities.length ? cities : (province ? [province] : []));
      this.regionPickerColumns.splice(2, 1, districts.length ? districts : (city ? [city] : (province ? [province] : [])));
    },
    onRegionColumnChange(event) {
      const column = Number(event.detail.column);
      const value = Number(event.detail.value);
      this.regionPickerIndexes.splice(column, 1, value);
      if (column < 2) this.regionPickerIndexes.splice(column + 1, 1, 0);
      if (column < 1) this.regionPickerIndexes.splice(column + 2, 1, 0);
      this.syncRegionPicker();
    },
    onRegionChange(event) {
      this.regionPickerIndexes = event.detail.value.map(item => Number(item));
      const columns = this.regionPickerColumns;
      const selected = columns[2][this.regionPickerIndexes[2]] || columns[1][this.regionPickerIndexes[1]] || columns[0][this.regionPickerIndexes[0]];
      this.form.regionCode = selected ? selected.regionCode : '';
      this.form.regionName = columns.map((column, index) => (column[this.regionPickerIndexes[index]] || {}).regionName).filter(Boolean).filter((name, index, names) => !index || name !== names[index - 1]).join(' / ');
    },
    addCertificate() {
      if (this.uploading) return;
      this.uploading = true;
      this.$util.uploadImageOne(
        { url: 'upload/image', name: 'multipart', model: 'user', pid: 7 },
        res => {
          const data = typeof res === 'string' ? JSON.parse(res) : res;
          const url = (data.data && (data.data.url || data.data.path)) || data.url || data.path;
          if (url) this.certificateUrls.push(url);
          else this.$util.Tips({ title: '上传失败，请重试' });
          this.uploading = false;
        },
        () => { this.uploading = false; }
      );
    },
    previewCertificate(index) { uni.previewImage({ current: this.certificateUrls[index], urls: this.certificateUrls }); },
    removeCertificate(index) { this.certificateUrls.splice(index, 1); },
    validate() {
      if (!this.roleOptions[this.roleIndex]) return '当前没有可申请身份';
      if (!this.form.realName) return '请填写真实姓名';
      if (!this.form.mobile || !/^1\d{10}$/.test(this.form.mobile)) return '请填写正确的手机号码';
      if (!this.form.regionCode) return '请选择所属区域';
      if (!this.certificateUrls.length) return '请上传证明材料';
      return '';
    },
    submitApply() {
      const error = this.validate();
      if (error) return this.$util.Tips({ title: error });
      const role = this.roleOptions[this.roleIndex];
      this.submitting = true;
      submitJkIdentityApply({
        requestNo: this.requestNo,
        applyRoleCode: role.code,
        realName: this.form.realName,
        mobile: this.form.mobile,
        regionCode: this.form.regionCode,
        // The backend has no recommender lookup endpoint, so preserve the typed value for auditors without fabricating parentUserId.
        applyReason: this.buildApplyReason(),
        certificateFiles: JSON.stringify(this.certificateUrls)
      }).then(res => {
        const record = res.data || res || {};
        uni.redirectTo({
          url: `/pages/jk/identity/success?roleName=${encodeURIComponent(record.applyRoleName || role.name)}&applyNo=${encodeURIComponent(record.applyNo || '')}&createTime=${encodeURIComponent(record.createTime || '')}&applicantName=${encodeURIComponent(record.applicantName || this.form.realName)}`
        });
      }).catch(err => this.$util.Tips({ title: err || '提交失败，请稍后重试' })).finally(() => { this.submitting = false; });
    },
    buildApplyReason() {
      const reason = this.form.applyReason.trim();
      const recommender = this.form.recommender.trim();
      if (!recommender) return reason;
      return `${reason}${reason ? '\n' : ''}推荐人：${recommender}`;
    }
  }
};
</script>

<style lang="scss">
.identity-apply { min-height: 100vh; padding: 0 32rpx 148rpx; background: #fff; box-sizing: border-box; }
.steps { display: flex; align-items: flex-start; padding: 30rpx 20rpx 38rpx; }
.step { width: 128rpx; color: #9aa0ad; text-align: center; font-size: 25rpx; }
.step text { display: block; width: 54rpx; height: 54rpx; margin: 0 auto 16rpx; border-radius: 50%; background: #afb4c0; color: #fff; line-height: 54rpx; font-size: 30rpx; }
.step.active { color: #08b996; font-weight: 600; }.step.active text { background: #08b996; }.step-line { flex: 1; height: 1rpx; margin-top: 27rpx; background: #d8dce3; }
.section-title { margin: 18rpx 0 16rpx; padding-left: 18rpx; border-left: 7rpx solid #08b996; color: #202633; font-size: 34rpx; font-weight: 700; }.section-title text, .reason-label text { color: #9aa0ad; font-size: 25rpx; font-weight: 400; }
.form-card { overflow: hidden; border-radius: 16rpx; background: #fff; }.field { display: flex; align-items: center; min-height: 102rpx; border-bottom: 1rpx solid #edf0f3; }.field-label { width: 170rpx; color: #303743; font-size: 29rpx; }.field-input, .field-value { flex: 1; color: #303743; font-size: 29rpx; }.field-input { height: 86rpx; }.field-value { padding: 28rpx 40rpx 28rpx 0; }.picker-value { position: relative; }.picker-value:after { position: absolute; right: 0; content: '›'; color: #7e8795; font-size: 42rpx; line-height: 29rpx; }.reason-label { padding: 26rpx 0 18rpx; color: #303743; font-size: 29rpx; }.reason-input { width: 100%; height: 200rpx; padding: 22rpx; border: 1rpx solid #e7eaee; border-radius: 14rpx; background: #fafbfc; color: #303743; font-size: 27rpx; box-sizing: border-box; }.reason-count { margin-top: -38rpx; padding-right: 18rpx; color: #9aa0ad; text-align: right; font-size: 24rpx; }
.upload-hint { margin-bottom: 18rpx; color: #7d8592; font-size: 25rpx; }.upload-card { display: flex; flex-wrap: wrap; gap: 16rpx; min-height: 188rpx; padding: 22rpx; border: 2rpx dashed #dce3e8; border-radius: 16rpx; box-sizing: border-box; }.upload-action { display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; min-width: 280rpx; color: #47515d; font-size: 27rpx; }.upload-plus { margin-bottom: 10rpx; color: #08b996; font-size: 64rpx; line-height: 58rpx; }.upload-tip { margin-top: 10rpx; color: #9aa0ad; font-size: 22rpx; }.uploaded-file { position: relative; width: 140rpx; height: 140rpx; }.uploaded-file image { width: 140rpx; height: 140rpx; border-radius: 10rpx; }.remove-file { position: absolute; top: -12rpx; right: -12rpx; width: 34rpx; height: 34rpx; border-radius: 50%; background: #ff5c5c; color: #fff; line-height: 31rpx; text-align: center; font-size: 30rpx; }
.submit-wrap { position: fixed; right: 0; bottom: 0; left: 0; z-index: 10; padding: 22rpx 32rpx calc(22rpx + env(safe-area-inset-bottom)); background: rgba(255,255,255,.96); }.submit-btn { height: 92rpx; border-radius: 46rpx; background: #08b996; color: #fff; line-height: 92rpx; font-size: 34rpx; font-weight: 700; }.submit-btn[disabled] { opacity: .58; }
</style>
