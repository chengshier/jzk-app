<template><view class="jk-icon" :class="['jk-icon--' + size]"><image :src="src" mode="aspectFit" /></view></template>
<script>
export default { props:{ name:{type:String,default:'identity'}, size:{type:String,default:'md'} }, computed:{ src(){return 'https://file.wit.cn/jzk/static/jk-ui-v2/icons/' + this.name + '.png';} } };
</script>
<style scoped>
.jk-icon{display:flex;align-items:center;justify-content:center;flex-shrink:0}.jk-icon image{width:100%;height:100%}.jk-icon--sm{width:46rpx;height:46rpx}.jk-icon--md{width:64rpx;height:64rpx}.jk-icon--lg{width:84rpx;height:84rpx}.jk-icon--xl{width:104rpx;height:104rpx}
</style>
