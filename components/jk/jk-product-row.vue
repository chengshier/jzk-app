<template>
  <view class="jk-product-row" @tap="$emit('tap')">
    <image class="jk-product-row__image" :src="imageSrc" mode="aspectFill" />
    <view class="jk-product-row__main">
      <text class="jk-product-row__name">{{ item.productName || item.storeName || '商品已删除' }}</text>
      <text class="jk-product-row__spec">{{ specText }}</text>
      <slot></slot>
    </view>
    <slot name="right"></slot>
  </view>
</template>
<script>
export default {
  props:{item:{type:Object,default:()=>({})},fallback:{type:String,default:'https://file.wit.cn/jzk/static/jk-ui-v2/products/glucose-paper.png'}},
  computed:{imageSrc(){return this.item.productImage||this.item.image||this.item.pic||this.fallback;},specText(){return this.item.skuText||this.item.skuName||this.item.spec||this.item.unitName||'默认规格';}}
};
</script>
<style scoped>
.jk-product-row{display:flex;align-items:center;min-height:126rpx;padding:18rpx 0;border-bottom:1rpx solid #edf1f0}.jk-product-row:last-child{border-bottom:0}.jk-product-row__image{width:106rpx;height:106rpx;flex-shrink:0;border:1rpx solid #e8efec;border-radius:14rpx;background:#f6f9f8}.jk-product-row__main{min-width:0;flex:1;margin-left:18rpx}.jk-product-row__name{display:block;overflow:hidden;color:#222f35;font-size:27rpx;font-weight:600;text-overflow:ellipsis;white-space:nowrap}.jk-product-row__spec{display:block;margin-top:8rpx;color:#8b969c;font-size:22rpx}
</style>
