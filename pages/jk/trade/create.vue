<template>
  <view class="create-page">
    <jk-page-nav :title="isTransfer ? '调拨申请' : '创建订货单'" />
    <view class="create-content">
      <template v-if="!isTransfer">
        <view class="steps"><view class="step active"><text>1</text><small>选择商品</small></view><view class="step-line"></view><view class="step"><text>2</text><small>确认订单</small></view><view class="step-line"></view><view class="step"><text>3</text><small>提交成功</small></view></view>
        <view class="search-row"><image src="/static/jk-ui-v2/icons/search.png"/><input v-model="keyword" placeholder="搜索商品名称/规格/条码" @confirm="loadCatalog"/><view class="filter-btn" @tap="showFilter">筛选 <image src="/static/jk-ui-v2/icons/filter.png"/></view></view>
        <view class="category-tabs"><text v-for="item in categories" :key="item" :class="{active:category===item}" @tap="category=item">{{ item }}</text></view>
      </template>

      <template v-else>
        <view class="receiver-type">
          <view :class="{active:receiverType==='subordinate'}" @tap="receiverType='subordinate'"><jk-icon name="transfer" size="md"/><view><text>调拨给下级</text><small>调拨给下级伙伴</small></view><text class="receiver-check">✓</text></view>
          <view :class="{active:receiverType==='partner'}" @tap="receiverType='partner'"><jk-icon name="user" size="md"/><view><text>调拨给创客或合伙人</text><small>调拨给创客或合伙人团队</small></view><text class="receiver-check">✓</text></view>
        </view>
        <view class="form-card"><view class="form-title"><text class="title-dot"></text>接收方</view><picker v-if="receiverOptions.length" mode="selector" :range="receiverLabels" :value="receiverIndex" @change="receiverIndex=Number($event.detail.value)"><view class="form-row"><text>接收方</text><strong>{{ receiverLabels[receiverIndex] || '请选择接收方' }}</strong><text class="arrow">›</text></view></picker><view v-else class="form-row"><text>接收方</text><strong>由系统按所属关系确定</strong><text class="arrow"></text></view></view>
        <view class="section-head"><view><text class="title-dot"></text><text class="section-title">调拨商品</text></view><text>已选 {{ selectedCount }} 种商品</text></view>
      </template>

      <view class="catalog-list">
        <view v-for="item in displayCatalog" :key="keyOf(item)" class="product-row">
          <image class="product-image" :src="productImage(item)" mode="aspectFill"/>
          <view class="product-main"><text class="product-name">{{ productName(item) }}</text><text class="product-spec">规格：{{ productSpec(item) }}</text><text class="product-stock">库存：{{ visibleStock(item) }}</text><text v-if="!isTransfer" class="product-price">¥{{ item.price && item.price.amount ? item.price.amount : '0.00' }}</text></view>
          <view class="counter"><text @tap="change(item,-1)">−</text><strong>{{ quantities[keyOf(item)] || 0 }}</strong><text @tap="change(item,1)">＋</text></view>
        </view>
        <jk-empty v-if="loaded && !displayCatalog.length" text="暂无可选商品"/>
      </view>

      <template v-if="isTransfer">
        <view class="form-card remark-card"><view class="form-title"><text class="title-dot"></text>备注 <small>（选填）</small></view><textarea v-model="remark" maxlength="200" placeholder="请填写备注信息，如调拨原因、用途等"/><text class="count">{{ remark.length }}/200</text></view>
        <view class="form-card upload-section"><view class="form-title"><text class="title-dot"></text>上传凭证 <small>（选填）</small></view><text class="upload-desc">如调拨需要，可上传协议、内部审批单等</text><payment-voucher-upload v-model="voucherUrl"/></view>
        <view class="transfer-tip"><image src="/static/jk-ui-v2/icons/info.png"/><text>预计占用库存：待审核通过后冻结库存</text></view>
      </template>
    </view>

    <view v-if="!isTransfer" class="order-bottom"><view><text>已选 <strong>{{ selectedCount }}</strong> 种商品</text><text>合计 <b>¥{{ totalAmount }}</b></text></view><button :disabled="!selectedCount||loading" @tap="submit">下一步</button></view>
    <jk-bottom-action v-else><button class="submit-btn" :disabled="!selectedCount||loading" @tap="submit">提交申请</button></jk-bottom-action>
  </view>
</template>

<script>
import JkPageNav from '@/components/jk/jk-page-nav.vue';import JkIcon from '@/components/jk/jk-icon.vue';import JkEmpty from '@/components/jk/jk-empty.vue';import JkBottomAction from '@/components/jk/jk-bottom-action.vue';import paymentVoucherUpload from '@/components/jk/payment-voucher-upload.vue';
import { getJkProductCatalog, createJkPlatformOrder, createJkStockTransfer, getJkTeamSummary } from '@/api/jk.js';
export default {
  components:{JkPageNav,JkIcon,JkEmpty,JkBottomAction,paymentVoucherUpload},
  data(){return{mode:'order',catalog:[],quantities:{},keyword:'',category:'全部',categories:['全部','血糖仪','试纸','耗材','消毒用品'],loading:false,loaded:false,receiverType:'subordinate',receiverOptions:[],receiverIndex:0,remark:'',voucherUrl:''};},
  computed:{
    isTransfer(){return this.mode==='transfer';},
    selected(){return this.catalog.filter(x=>Number(this.quantities[this.keyOf(x)]||0)>0);},selectedCount(){return this.selected.length;},
    totalAmount(){return this.selected.reduce((sum,x)=>sum+Number(x.price&&x.price.amount||0)*Number(this.quantities[this.keyOf(x)]||0),0).toFixed(2);},
    receiverLabels(){return this.receiverOptions.map(item=>item.userName||item.nickname||item.name||('用户'+(item.userId||item.id||'')));},
    displayCatalog(){const key=(this.keyword||'').trim().toLowerCase();return this.catalog.filter(item=>{const text=[this.productName(item),this.productSpec(item),item.skuCode,item.barCode].join(' ').toLowerCase();return !key||text.includes(key);});}
  },
  onLoad(query){this.mode=query.mode==='transfer'?'transfer':'order';this.loadCatalog();if(this.isTransfer)this.loadReceivers();},
  methods:{
    loadCatalog(){getJkProductCatalog(this.keyword).then(r=>{const d=r.data||r||[];this.catalog=Array.isArray(d)?d:(d.list||d.records||[]);}).catch(e=>this.$util.Tips({title:e||'商品目录加载失败'})).finally(()=>{this.loaded=true;});},
    loadReceivers(){getJkTeamSummary().then(r=>{const d=r.data||r||{};this.receiverOptions=d.directTeam||d.members||[];}).catch(()=>{this.receiverOptions=[];});},
    keyOf(item){return String(item.skuId||item.productId||((item.product||{}).id)||Math.random());},productName(item){return item.productName||(item.product&&item.product.storeName)||item.storeName||'商品已删除';},productSpec(item){return item.skuText||item.skuName||(item.product&&(item.product.skuText||item.product.skuName))||'默认规格';},
    productImage(item){return item.productImage||item.image||(item.product&&(item.product.image||item.product.pic))||'/static/jk-ui-v2/products/glucose-paper.png';},visibleStock(item){const v=item.stock&&(item.stock.visibleQty!==undefined?item.stock.visibleQty:item.stock.availableQty);return v===null||v===undefined?'充足':v;},
    change(item,delta){const key=this.keyOf(item);let n=Number(this.quantities[key]||0)+delta;let max=item.stock&&(item.stock.visibleQty!==undefined?item.stock.visibleQty:item.stock.availableQty);if(n<0)n=0;if(max!==null&&max!==undefined&&Number(max)>=0&&n>Number(max))n=Number(max);this.$set(this.quantities,key,n);},
    submit(){if(!this.selectedCount)return this.$util.Tips({title:'请选择商品'});this.loading=true;const items=this.selected.map(x=>({productId:x.productId||((x.product||{}).id),skuId:x.skuId,quantity:Number(this.quantities[this.keyOf(x)])}));const requestNo=(this.isTransfer?'TRANSFER_':'ORDER_')+Date.now();
      if(this.isTransfer){const receiver=this.receiverOptions[this.receiverIndex]||{};const payload={requestNo,items,remark:this.remark};if(this.voucherUrl)payload.voucherUrl=this.voucherUrl;if(receiver.userId||receiver.id)payload.receiverUserId=receiver.userId||receiver.id;createJkStockTransfer(payload).then(r=>{const p=r.data||r||{};this.$util.Tips({title:'调拨申请已提交'});if(p.id)uni.redirectTo({url:'/pages/jk/trade/detail?mode=transfer&id='+p.id});else uni.navigateBack();}).catch(e=>this.$util.Tips({title:e||'提交失败'})).finally(()=>{this.loading=false;});}
      else{createJkPlatformOrder({requestNo,items}).then(r=>{const p=r.data||r||{};this.$util.Tips({title:'订货单已提交'});if(p.id)uni.redirectTo({url:'/pages/jk/trade/detail?mode=order&id='+p.id});}).catch(e=>this.$util.Tips({title:e||'提交失败'})).finally(()=>{this.loading=false;});}},
    showFilter(){uni.showToast({title:'商品分类可通过接口扩展',icon:'none'});}
  }
};
</script>

<style scoped>
.create-page{min-height:100vh;padding-bottom:132rpx;background:#fff}.create-content{padding:0 22rpx 36rpx}.steps{display:flex;align-items:flex-start;padding:24rpx 22rpx 28rpx}.step{width:110rpx;color:#99a3a8;text-align:center;font-size:21rpx}.step text{display:flex;align-items:center;justify-content:center;width:42rpx;height:42rpx;margin:0 auto 10rpx;border-radius:50%;background:#9ba4aa;color:#fff}.step.active{color:#10b981;font-weight:600}.step.active text{background:#10b981}.step-line{flex:1;height:2rpx;margin-top:21rpx;background:#dbe2e1}.search-row{display:flex;align-items:center;height:70rpx;border-radius:35rpx;background:#f6f8f8}.search-row>image{width:36rpx;height:36rpx;margin-left:18rpx}.search-row input{flex:1;height:70rpx;padding:0 12rpx;font-size:23rpx}.filter-btn{display:flex;align-items:center;height:52rpx;padding:0 16rpx;border-left:1rpx solid #e2e6e5;color:#68767d;font-size:22rpx}.filter-btn image{width:34rpx;height:34rpx;margin-left:5rpx}.category-tabs{display:flex;border-bottom:1rpx solid #edf1f0}.category-tabs text{position:relative;flex:1;padding:19rpx 0;color:#7a868c;text-align:center;font-size:21rpx}.category-tabs .active{color:#10b981}.category-tabs .active::after{position:absolute;right:33%;bottom:0;left:33%;height:4rpx;background:#10b981;content:''}.product-row{display:flex;align-items:center;min-height:154rpx;border-bottom:1rpx solid #edf1f0}.product-image{width:116rpx;height:116rpx;flex-shrink:0;border-radius:14rpx;background:#f5f8f7}.product-main{display:flex;min-width:0;flex:1;flex-direction:column;gap:6rpx;margin-left:16rpx}.product-name{overflow:hidden;color:#202c32;font-size:26rpx;font-weight:700;text-overflow:ellipsis;white-space:nowrap}.product-spec{color:#7d8990;font-size:21rpx}.product-stock{color:#10b981;font-size:21rpx}.product-price{color:#ff6a43;font-size:25rpx;font-weight:600}.counter{display:flex;align-items:center;gap:12rpx}.counter text{display:flex;align-items:center;justify-content:center;width:42rpx;height:42rpx;border-radius:50%;background:#e7faf4;color:#10b981;font-size:29rpx}.counter strong{min-width:36rpx;color:#263139;text-align:center;font-size:23rpx}.receiver-type{display:flex;gap:14rpx;margin-top:16rpx}.receiver-type>view{position:relative;display:flex;flex:1;align-items:center;min-height:92rpx;padding:14rpx;border:2rpx solid #edf1f0;border-radius:16rpx}.receiver-type>view.active{border-color:#aee9da;background:#f3fffb}.receiver-type>view>view:nth-child(2){display:flex;flex:1;flex-direction:column;margin-left:8rpx}.receiver-type text{color:#263239;font-size:22rpx;font-weight:600}.receiver-type small{margin-top:4rpx;color:#8a959b;font-size:17rpx}.receiver-check{color:#10b981;opacity:0}.receiver-type .active .receiver-check{opacity:1}.form-card{margin-top:18rpx;padding:20rpx;border:1rpx solid #edf1f0;border-radius:18rpx}.form-title{display:flex;align-items:center;color:#273239;font-size:26rpx;font-weight:700}.form-title small{color:#9aa3a8;font-size:20rpx;font-weight:400}.title-dot{display:inline-block;width:6rpx;height:26rpx;margin-right:10rpx;border-radius:3rpx;background:#10b981}.form-row{display:flex;align-items:center;min-height:76rpx;margin-top:8rpx}.form-row>text:first-child{color:#69777e;font-size:23rpx}.form-row strong{flex:1;color:#7c898f;text-align:right;font-size:23rpx;font-weight:400}.arrow{margin-left:8rpx;color:#9aa4aa;font-size:34rpx}.section-head{display:flex;align-items:center;justify-content:space-between;margin:24rpx 0 4rpx}.section-head>view{display:flex;align-items:center}.section-title{color:#263239;font-size:27rpx;font-weight:700}.section-head>text{color:#89949a;font-size:21rpx}.remark-card{position:relative}.remark-card textarea{width:100%;height:150rpx;margin-top:14rpx;padding:16rpx;border-radius:12rpx;background:#f8faf9;font-size:23rpx;box-sizing:border-box}.count{position:absolute;right:32rpx;bottom:28rpx;color:#a0a9ad;font-size:19rpx}.upload-desc{display:block;margin:9rpx 0 13rpx;color:#879299;font-size:20rpx}.transfer-tip{display:flex;align-items:center;gap:8rpx;margin-top:16rpx;padding:13rpx 16rpx;border-radius:10rpx;background:#eafaf6;color:#709087;font-size:20rpx}.transfer-tip image{width:28rpx;height:28rpx}.order-bottom{position:fixed;z-index:40;right:0;bottom:0;left:0;display:flex;align-items:center;justify-content:space-between;padding:16rpx 22rpx calc(16rpx + env(safe-area-inset-bottom));background:#fff;box-shadow:0 -6rpx 20rpx rgba(25,64,54,.06)}.order-bottom>view{display:flex;flex-direction:column;gap:4rpx;color:#5d6a70;font-size:21rpx}.order-bottom strong{color:#10b981}.order-bottom b{color:#ff6543;font-size:29rpx}.order-bottom button{width:230rpx;height:76rpx;margin:0;border-radius:38rpx;background:#10b981;color:#fff;line-height:76rpx;font-size:27rpx}.submit-btn{border:0!important;background:#10b981!important;color:#fff!important}.submit-btn[disabled],.order-bottom button[disabled]{opacity:.5}
</style>
