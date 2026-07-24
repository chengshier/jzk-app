<template><text :class="['jk-status-tag', 'jk-status-tag--' + tone]">{{ text }}</text></template>
<script>
export default { props:{ text:{type:String,default:''}, tone:{type:String,default:'success'} } };
</script>
<style scoped>
.jk-status-tag{display:inline-flex;align-items:center;justify-content:center;min-height:36rpx;padding:0 14rpx;border-radius:999rpx;font-size:21rpx;line-height:36rpx;white-space:nowrap}
.jk-status-tag--success{background:#e5faf3;color:#10a981}.jk-status-tag--warning{background:#fff3df;color:#ed9414}.jk-status-tag--danger{background:#ffebe8;color:#ef5b4c}.jk-status-tag--info{background:#eaf3ff;color:#4387ea}.jk-status-tag--muted{background:#eef1f2;color:#8c969b}
</style>
