<template>
  <view class="jk-timeline">
    <view v-for="(step,index) in steps" :key="index" class="jk-timeline__item">
      <view class="jk-timeline__track" v-if="index < steps.length - 1" :class="{done: step.done && steps[index+1] && steps[index+1].done}"></view>
      <view :class="['jk-timeline__dot',{done:step.done,current:step.current,danger:step.danger}]">{{ step.done ? '✓' : index + 1 }}</view>
      <text class="jk-timeline__title">{{ step.title }}</text>
      <text class="jk-timeline__time">{{ step.time || '待处理' }}</text>
    </view>
  </view>
</template>
<script>export default { props:{steps:{type:Array,default:()=>[]}} };</script>
<style scoped>
.jk-timeline{display:flex;width:100%}.jk-timeline__item{position:relative;flex:1;min-width:0;text-align:center}.jk-timeline__track{position:absolute;top:22rpx;left:58%;width:84%;height:3rpx;background:#d9e7e3}.jk-timeline__track.done{background:#20bd97}.jk-timeline__dot{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;width:44rpx;height:44rpx;margin:0 auto 12rpx;border:3rpx solid #cfd9d6;border-radius:50%;background:#fff;color:#a0aaa7;font-size:22rpx}.jk-timeline__dot.done{border-color:#1fbd96;color:#17b68f}.jk-timeline__dot.current{background:#19bb94;color:#fff;box-shadow:0 0 0 8rpx #def8f1}.jk-timeline__dot.danger{border-color:#ef5c4f;background:#ef5c4f;color:#fff;box-shadow:0 0 0 8rpx #ffebe8}.jk-timeline__title{display:block;overflow:hidden;color:#39464b;font-size:22rpx;text-overflow:ellipsis;white-space:nowrap}.jk-timeline__time{display:block;margin-top:6rpx;overflow:hidden;color:#95a0a5;font-size:18rpx;text-overflow:ellipsis;white-space:nowrap}
</style>
