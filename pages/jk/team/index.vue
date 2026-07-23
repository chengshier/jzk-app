<template>
  <view class="page">
    <view class="hero"><text class="title">我的团队</text><text class="sub">关系变化只影响审核通过后的新业务，历史订单归属保持不变</text></view>
    <view class="card"><view class="head">我的上级</view><view v-if="data.currentRelation" class="member"><text>{{data.currentRelation.parentName||'平台渠道'}}</text><text class="muted">{{data.currentRelation.parentPhone||'无直属上级手机号'}}</text></view><view v-else class="empty">当前归属平台渠道</view></view>
    <view class="actions"><button type="primary" @click="go('/pages/jk/team/qrcode')">推广二维码</button><button @click="go('/pages/jk/team/changeApply')">申请换绑</button><button @click="go('/pages/jk/team/changeList')">换绑记录</button></view>
    <view class="card"><view class="head">直属团队（{{data.directTeamCount||0}}）</view><view v-for="item in data.directTeam||[]" :key="item.id" class="member"><view><text>{{item.userName||'用户'+item.userId}}</text><text class="muted">{{item.userPhone||'--'}}</text></view><text class="muted">{{item.bindSource||item.relationType||'绑定'}}</text></view><view v-if="!(data.directTeam||[]).length" class="empty">暂无直属团队成员</view></view>
    <view class="card"><view class="head">我的关系历史</view><view v-for="item in data.relationHistory||[]" :key="item.id" class="member"><view><text>{{item.parentName||'平台渠道'}}</text><text class="muted">{{item.effectiveTime||'--'}} 至 {{item.expireTime||'当前'}}</text></view><text :class="item.status?'active':'muted'">{{item.status?'有效':'历史'}}</text></view><view v-if="!(data.relationHistory||[]).length" class="empty">暂无关系历史</view></view>
  </view>
</template>
<script>
import { getJkTeamSummary } from '@/api/jk.js'
export default {data(){return{data:{}}},onShow(){this.load()},methods:{load(){getJkTeamSummary().then(r=>this.data=r.data||r||{}).catch(()=>this.data={})},go(url){uni.navigateTo({url})}}}
</script>
<style scoped>.page{min-height:100vh;background:#f3f8f6;padding:24rpx}.hero{padding:24rpx 8rpx}.title{display:block;font-size:38rpx;font-weight:700;color:#166e54}.sub,.muted{display:block;margin-top:8rpx;font-size:24rpx;color:#849a92}.card{margin-bottom:18rpx;padding:26rpx;border-radius:20rpx;background:#fff}.head{margin-bottom:18rpx;font-size:30rpx;font-weight:650;color:#28594a}.member{display:flex;justify-content:space-between;align-items:center;padding:18rpx 0;border-bottom:1rpx solid #edf2f0}.member:last-child{border:0}.active{color:#16a575}.empty{text-align:center;color:#9aaba5;padding:36rpx}.actions{display:flex;gap:12rpx;margin-bottom:18rpx}.actions button{flex:1;margin:0;font-size:25rpx}</style>
