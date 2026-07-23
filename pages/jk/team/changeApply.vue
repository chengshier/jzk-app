<template>
  <view class="page">
    <view class="notice">存在未完成调拨、库存余额、待结算佣金或处理中提现时不能换绑。审核通过只影响后续新业务，历史订单归属保持不变。当前 V1 仅允许搜索并选择同区域的有效创客、合伙人或区县代。</view>
    <view class="card">
      <text class="label">搜索目标上级</text>
      <view class="search"><input v-model="keyword" placeholder="输入姓名、手机号或用户ID" /><button size="mini" :disabled="searching" @click="search">搜索</button></view>
      <view v-for="x in options" :key="x.value" :class="['option', selected && selected.value === x.value ? 'selected' : '']" @click="selected=x">
        <text>{{ x.label }}</text><text class="muted">{{ x.regionCode || '区域未配置' }}</text>
      </view>
      <view v-if="searched && !options.length" class="empty">没有找到同区域有效上级</view>
      <view v-if="selected" class="selected-box">已选择：{{ selected.label }}</view>
      <text class="label">换绑原因</text>
      <textarea v-model="form.applyReason" placeholder="请说明换绑原因" />
      <button type="primary" :disabled="submitting" @click="submit">提交审核</button>
    </view>
  </view>
</template>
<script>
import { getJkEligibleParentOptions, applyJkRelationChange } from '@/api/jk.js'
export default {
  data() { return { keyword: '', options: [], selected: null, searched: false, searching: false, form: { applyReason: '' }, submitting: false } },
  methods: {
    search() { if (!this.keyword.trim()) return this.$util.Tips({ title: '请输入搜索内容' }); this.searching = true; getJkEligibleParentOptions({ keyword: this.keyword.trim(), limit: 20 }).then(r => { this.options = r.data || r || []; this.searched = true }).finally(() => { this.searching = false }) },
    submit() { if (!this.selected) return this.$util.Tips({ title: '请选择目标上级' }); if (!this.form.applyReason.trim()) return this.$util.Tips({ title: '请填写换绑原因' }); this.submitting = true; applyJkRelationChange({ requestNo: 'REL-' + Date.now(), targetParentUserId: Number(this.selected.value), applyReason: this.form.applyReason.trim() }).then(() => { this.$util.Tips({ title: '换绑申请已提交', icon: 'success' }, { tab: 5, url: '/pages/jk/team/changeList' }) }).finally(() => { this.submitting = false }) }
  }
}
</script>
<style scoped>
.page{min-height:100vh;background:#f3f8f6;padding:24rpx}.notice,.card{padding:26rpx;border-radius:20rpx;background:#fff}.notice{margin-bottom:20rpx;background:#fff8e8;color:#936a20;line-height:1.7}.label{display:block;margin:20rpx 0 12rpx;color:#315c4e;font-weight:600}.search{display:flex;gap:12rpx}.search input{flex:1}.search button{width:150rpx;margin:0}input,textarea{box-sizing:border-box;padding:22rpx;border-radius:14rpx;background:#f4f7f6}textarea{width:100%;height:180rpx}.option{display:flex;justify-content:space-between;margin-top:12rpx;padding:20rpx;border:2rpx solid transparent;border-radius:14rpx;background:#f4f7f6}.option.selected{border-color:#20b486;background:#edf9f5}.selected-box{margin-top:16rpx;padding:18rpx;border-radius:12rpx;background:#e9f8f2;color:#168663}.muted{color:#91a39c}.empty{text-align:center;padding:30rpx;color:#9aaba5}button[type=primary]{margin-top:32rpx}
</style>
