<template>
  <view class="identity-apply">
    <jk-page-nav title="身份申请填写" />
    <view class="apply-content">
      <view class="steps">
        <view class="step active"><text>1</text><view>填写信息</view></view>
        <view class="step-line"></view>
        <view class="step"><text>2</text><view>提交审核</view></view>
        <view class="step-line"></view>
        <view class="step"><text>3</text><view>审核结果</view></view>
      </view>

      <view class="section-title">基本信息</view>
      <view class="form-card">
        <picker mode="selector" :range="roleLabels" :value="roleIndex" @change="onRoleChange">
          <view class="field"><text class="field-label">申请身份</text><text class="field-value">{{ currentRoleLabel }}</text><text class="field-arrow">›</text></view>
        </picker>
        <view class="field"><text class="field-label">真实姓名</text><input v-model.trim="form.realName" class="field-input" placeholder="请输入真实姓名" maxlength="30" /></view>
        <view class="field"><text class="field-label">手机号码</text><input v-model.trim="form.mobile" class="field-input" type="number" placeholder="请输入手机号码" maxlength="11" /></view>
        <picker mode="multiSelector" :range="regionPickerLabels" :value="regionPickerIndexes" @columnchange="onRegionColumnChange" @change="onRegionChange">
          <view class="field"><text class="field-label">所属区域</text><text :class="['field-value',{placeholder:!form.regionName}]">{{ currentRegionLabel }}</text><text class="field-arrow">›</text></view>
        </picker>
      </view>

      <view class="section-title section-title--space">补充信息 <text>（选填）</text></view>
      <view class="form-card">
        <view class="field"><text class="field-label">推荐人</text><input v-model.trim="form.recommender" class="field-input" placeholder="请输入推荐人姓名或手机号" maxlength="50" /></view>
        <view class="textarea-wrap">
          <view class="textarea-label">申请说明 <text>（选填）</text></view>
          <textarea v-model="form.applyReason" class="reason-input" maxlength="200" placeholder="请简要说明申请该身份的原因及用途" />
          <text class="reason-count">{{ form.applyReason.length }}/200</text>
        </view>
      </view>

      <view class="section-title section-title--space">上传资料</view>
      <view class="upload-hint">请根据所选身份类型上传相关资料</view>
      <view class="upload-tabs">
        <text class="active">身份证</text><text>资质证明</text><text>其他证明材料</text>
      </view>
      <view class="upload-card">
        <view v-for="(url,index) in certificateUrls" :key="url" class="uploaded-file">
          <image :src="url" mode="aspectFill" @tap="previewCertificate(index)" />
          <text class="remove-file" @tap.stop="removeCertificate(index)">×</text>
        </view>
        <view v-if="certificateUrls.length < 3" class="upload-action" @tap="addCertificate">
          <image src="https://file.wit.cn/jzk/static/jk-ui-v2/icons/document.png" mode="aspectFit" />
          <text>{{ uploading ? '上传中...' : '点击上传身份证正反面' }}</text>
          <text class="upload-tip">支持 jpg/png，单张不超过10MB</text>
        </view>
      </view>
    </view>
    <jk-bottom-action><button class="submit-btn" :disabled="submitting || uploading" @tap="submitApply">{{ submitting ? '提交中...' : '提交申请' }}</button></jk-bottom-action>
  </view>
</template>

<script>
import { getJkIdentityRegionOptions, getJkPermissionContext, submitJkIdentityApply } from '@/api/jk.js';
import JkPageNav from '@/components/jk/jk-page-nav.vue';
import JkBottomAction from '@/components/jk/jk-bottom-action.vue';

const ROLE_NAME_MAP = {
  maker: '创客', partner: '合伙人', county_agent: '区县代', health_advisor: '健康顾问', city_agent: '市代', province_agent: '省代'
};

export default {
  components: { JkPageNav, JkBottomAction },
  data() {
    return {
      roleOptions: [], roleIndex: 0, regionOptions: [], regionPickerColumns: [[], [], []], regionPickerIndexes: [0, 0, 0],
      submitting: false, uploading: false,
      // Keep this id for the page lifecycle so a retry is deduplicated by the server.
      requestNo: `jk_apply_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      certificateUrls: [],
      form: { realName: '', mobile: '', regionCode: '', regionName: '', recommender: '', applyReason: '' },
      promotionInviterUserId: null
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
    // 推广码仅暂存邀请上下文；提交申请时落 parentUserId，审核通过前绝不建立关系。
    const promotion = uni.getStorageSync('jk_promotion_context') || {};
    this.promotionInviterUserId = promotion.type === 'IDENTITY_PROMOTION' ? promotion.inviterUserId : null;
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
        parentUserId: this.promotionInviterUserId,
        // 手填推荐人仅供审核员参考，不能伪造上下级 ID。
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

<style scoped>
.identity-apply{min-height:100vh;padding-bottom:132rpx;background:#fff}.apply-content{padding:0 28rpx 36rpx}.steps{display:flex;align-items:flex-start;padding:28rpx 18rpx 34rpx}.step{width:122rpx;color:#9aa2a8;text-align:center;font-size:22rpx}.step text{display:flex;align-items:center;justify-content:center;width:44rpx;height:44rpx;margin:0 auto 12rpx;border-radius:50%;background:#9fa7ad;color:#fff;font-size:23rpx}.step.active{color:#10b981;font-weight:600}.step.active text{background:#10b981}.step-line{flex:1;height:2rpx;margin-top:22rpx;background:#dce3e2}
.section-title{margin:10rpx 0 12rpx;padding-left:14rpx;border-left:6rpx solid #10b981;color:#1f2937;font-size:30rpx;font-weight:700}.section-title text{color:#9aa3a9;font-size:22rpx;font-weight:400}.section-title--space{margin-top:34rpx}.form-card{border-radius:18rpx;background:#fff}.field{display:flex;align-items:center;min-height:92rpx;border-bottom:1rpx solid #ecefef}.field-label{width:160rpx;color:#303a40;font-size:27rpx}.field-input,.field-value{min-width:0;flex:1;color:#2a343a;font-size:27rpx}.field-input{height:82rpx}.field-value{text-align:right}.field-value.placeholder{color:#a7afb3}.field-arrow{margin-left:10rpx;color:#899399;font-size:38rpx}.textarea-wrap{position:relative;padding:24rpx 0}.textarea-label{margin-bottom:16rpx;color:#303a40;font-size:27rpx}.textarea-label text{color:#9ca5aa;font-size:22rpx}.reason-input{width:100%;height:180rpx;padding:18rpx;border:1rpx solid #e6ebea;border-radius:14rpx;background:#f9fbfa;color:#303a40;font-size:25rpx;box-sizing:border-box}.reason-count{position:absolute;right:14rpx;bottom:34rpx;color:#a1a9ad;font-size:20rpx}
.upload-hint{margin-bottom:14rpx;color:#7d898f;font-size:22rpx}.upload-tabs{display:flex;margin-bottom:14rpx;border-radius:12rpx;background:#f5f7f7}.upload-tabs text{flex:1;padding:16rpx 8rpx;color:#77838a;text-align:center;font-size:22rpx}.upload-tabs .active{border-bottom:3rpx solid #10b981;color:#10a981}.upload-card{display:flex;flex-wrap:wrap;gap:14rpx;min-height:190rpx;padding:18rpx;border:2rpx dashed #dfe6e4;border-radius:16rpx;box-sizing:border-box}.upload-action{display:flex;min-width:260rpx;flex:1;flex-direction:column;align-items:center;justify-content:center;color:#4f5b61;font-size:24rpx}.upload-action image{width:70rpx;height:70rpx;margin-bottom:10rpx}.upload-tip{margin-top:8rpx;color:#9ca5aa;font-size:20rpx}.uploaded-file{position:relative;width:145rpx;height:145rpx}.uploaded-file image{width:145rpx;height:145rpx;border-radius:10rpx}.remove-file{position:absolute;top:-10rpx;right:-10rpx;display:flex;align-items:center;justify-content:center;width:34rpx;height:34rpx;border-radius:50%;background:#ef4444;color:#fff;font-size:26rpx}.submit-btn{border:0!important;background:linear-gradient(90deg,#12b98f,#08ad82)!important;color:#fff!important}.submit-btn[disabled]{opacity:.58}
</style>
