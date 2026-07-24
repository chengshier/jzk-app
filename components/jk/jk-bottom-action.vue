<template><view class="jk-bottom-action"><slot></slot></view></template>
<script>export default {};</script>
<style scoped>.jk-bottom-action{position:fixed;z-index:40;right:0;bottom:0;left:0;display:flex;gap:18rpx;padding:18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));background:rgba(255,255,255,.97);box-shadow:0 -8rpx 28rpx rgba(30,63,54,.06)}.jk-bottom-action ::v-deep button{flex:1;height:86rpx;margin:0;border-radius:43rpx;font-size:29rpx;font-weight:600;line-height:86rpx}.jk-bottom-action ::v-deep button::after{border:0}</style>
