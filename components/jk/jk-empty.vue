<template><view class="jk-empty"><image src="/static/jk-ui-v2/icons/document.png" mode="aspectFit"/><text>{{ text }}</text></view></template>
<script>export default { props:{ text:{type:String,default:'暂无数据'} } };</script>
<style scoped>.jk-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100rpx 0;color:#9aa4aa;font-size:25rpx}.jk-empty image{width:86rpx;height:86rpx;margin-bottom:18rpx;opacity:.72}</style>
