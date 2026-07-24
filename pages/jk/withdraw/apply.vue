<template>
  <view class="withdraw-page">
    <jk-page-nav title="提现申请"/>
    <view class="withdraw-content">
      <view class="available-card">
        <view><text>可用金额（元）</text><strong>{{money(account.availableAmount)}}</strong><small>总余额 {{money(totalBalance)}} 元 ›</small></view>
        <image src="/static/jk-ui-v2/illustrations/finance-hero.png" mode="aspectFit"/>
      </view>

      <view class="card amount-card">
        <view class="section-head"><text>提现金额（元）</text><text @tap="fillAll">全部提现</text></view>
        <view class="amount-input"><text>¥</text><input v-model="amount" type="digit" placeholder="请输入提现金额"/></view>
        <small>最低提现金额为 {{money(minimumAmount)}} 元，提现金额需为 {{money(stepAmount)}} 的整数倍</small>
      </view>

      <view class="card account-card">
        <view class="section-head"><text>到账账户</text><small>银行卡信息将由后端生成提现快照</small></view>
        <view class="form-row"><text>收款人</text><input v-model.trim="accountName" maxlength="30" placeholder="请输入银行卡开户姓名"/></view>
        <view class="form-row"><text>开户银行</text><input v-model.trim="bankName" maxlength="50" placeholder="例如：中国工商银行"/></view>
        <view class="form-row"><text>银行卡号</text><input v-model="bankAccount" type="number" maxlength="30" placeholder="请输入本人银行卡号"/></view>
      </view>

      <view class="card remark-card">
        <view class="section-head"><text>备注 <small>（选填）</small></text></view>
        <textarea v-model="remark" maxlength="50" placeholder="请输入备注信息（选填）"/>
        <text>{{remark.length}}/50</text>
      </view>

      <view class="tip-card">
        <jk-icon name="clock" size="sm"/>
        <view><text>温馨提示</text><small>提现申请提交后，预计 {{arrivalText}} 内到账；</small><small>请确认收款姓名和银行卡号真实有效，提交后将作为本次申请的不可变快照。</small></view>
      </view>

      <button class="primary-btn" :disabled="submitting||!validForm" @tap="submit">{{submitting?'提交中...':'提交申请'}}</button>
      <view class="agreement" @tap="agreed=!agreed"><view :class="{checked:agreed}">{{agreed?'✓':''}}</view><text>我已阅读并同意《提现服务协议》</text></view>
    </view>
  </view>
</template>
<script>
import JkPageNav from'@/components/jk/jk-page-nav.vue';
import JkIcon from'@/components/jk/jk-icon.vue';
import{getJkFundAccount,getJkWithdrawConfig,applyJkWithdraw}from'@/api/jk.js';

export default{
  components:{JkPageNav,JkIcon},
  data(){return{account:{},config:{},amount:'',accountName:'',bankName:'',bankAccount:'',remark:'',agreed:true,submitting:false}},
  computed:{
    totalBalance(){return this.account.totalAmount||Number(this.account.availableAmount||0)+Number(this.account.frozenAmount||0)+Number(this.account.withdrawingAmount||0)},
    minimumAmount(){const value=this.config.minimumAmount!==undefined?this.config.minimumAmount:(this.config.minAmount!==undefined?this.config.minAmount:this.config.minWithdrawAmount);return Number(value||0)},
    stepAmount(){return Number(this.config.stepAmount||1)},
    normalizedBankAccount(){return String(this.bankAccount||'').replace(/[\s-]/g,'')},
    validAmount(){const n=Number(this.amount);if(!n||n<=0||n>Number(this.account.availableAmount||0)||n<this.minimumAmount)return false;const step=this.stepAmount;return step<=0||Math.abs(n/step-Math.round(n/step))<0.000001},
    validForm(){return this.agreed&&this.validAmount&&!!this.accountName&&!!this.bankName&&/^\d{8,30}$/.test(this.normalizedBankAccount)},
    arrivalText(){return this.config.arrivalTimeText||'1-2个工作日'}
  },
  onShow(){this.load()},
  methods:{
    load(){getJkFundAccount().then(r=>this.account=r.data||r||{}).catch(()=>this.account={});getJkWithdrawConfig().then(r=>this.config=r.data||r||{}).catch(()=>this.config={})},
    money(v){const n=Number(v||0);return Number.isNaN(n)?String(v||'0.00'):n.toFixed(2)},
    fillAll(){const available=Number(this.account.availableAmount||0);const step=this.stepAmount>0?this.stepAmount:1;this.amount=this.money(Math.floor(available/step)*step)},
    submit(){
      if(!this.agreed)return this.$util.Tips({title:'请先同意提现服务协议'});
      if(!this.validAmount)return this.$util.Tips({title:'提现金额不符合最低金额或步进要求'});
      if(!this.accountName)return this.$util.Tips({title:'请填写收款人姓名'});
      if(!this.bankName)return this.$util.Tips({title:'请填写开户银行'});
      if(!/^\d{8,30}$/.test(this.normalizedBankAccount))return this.$util.Tips({title:'请填写有效银行卡号'});
      this.submitting=true;
      applyJkWithdraw({
        amount:String(this.amount),
        requestNo:'WD'+Date.now(),
        accountType:'BANK',
        accountName:this.accountName,
        bankName:this.bankName,
        bankAccount:this.normalizedBankAccount,
        remark:this.remark
      }).then(()=>{
        uni.showToast({title:'申请已提交'});
        setTimeout(()=>uni.redirectTo({url:'/pages/jk/withdraw/list'}),500)
      }).catch(e=>this.$util.Tips({title:e||'提现申请提交失败'})).finally(()=>this.submitting=false)
    }
  }
};
</script>
<style scoped>
.withdraw-page{min-height:100vh;background:#f7f9f9}.withdraw-content{padding:14rpx 22rpx 38rpx}.available-card{position:relative;display:flex;align-items:center;min-height:170rpx;overflow:hidden;padding:24rpx;border-radius:20rpx;background:linear-gradient(135deg,#e8faf6,#f8fffd)}.available-card>view{position:relative;z-index:2}.available-card text{display:block;color:#718087;font-size:21rpx}.available-card strong{display:block;margin-top:8rpx;color:#10b981;font-size:42rpx}.available-card small{display:block;margin-top:8rpx;color:#56aa92;font-size:19rpx}.available-card image{position:absolute;right:-18rpx;width:210rpx;height:210rpx;opacity:.5}.card{margin-top:16rpx;padding:22rpx;border-radius:19rpx;background:#fff}.section-head{display:flex;align-items:center;justify-content:space-between}.section-head>text:first-child{color:#1f2937;font-size:26rpx;font-weight:700}.section-head>text:last-child{color:#10b981;font-size:20rpx}.section-head>small{color:#8b969c;font-size:18rpx}.section-head small{color:#9aa3a8;font-size:18rpx;font-weight:400}.amount-input{display:flex;align-items:center;height:92rpx;border-bottom:1rpx solid #edf1f0}.amount-input>text{color:#263139;font-size:38rpx}.amount-input input{flex:1;height:80rpx;margin-left:8rpx;font-size:35rpx}.amount-card>small{display:block;margin-top:12rpx;color:#8b969c;font-size:18rpx}.form-row{display:flex;align-items:center;min-height:78rpx;border-bottom:1rpx solid #edf1f0}.form-row:last-child{border-bottom:0}.form-row>text{width:132rpx;color:#66747a;font-size:22rpx}.form-row input{flex:1;height:76rpx;color:#273239;text-align:right;font-size:22rpx}.remark-card{position:relative}.remark-card textarea{width:100%;height:120rpx;margin-top:12rpx;padding:15rpx;border-radius:12rpx;background:#f8faf9;font-size:22rpx;box-sizing:border-box}.remark-card>text{position:absolute;right:34rpx;bottom:32rpx;color:#9fa8ac;font-size:17rpx}.tip-card{display:flex;align-items:flex-start;gap:10rpx;margin-top:16rpx;padding:18rpx;border-radius:15rpx;background:#f3f8f6}.tip-card>view{display:flex;flex:1;flex-direction:column;gap:5rpx}.tip-card text{color:#496159;font-size:21rpx}.tip-card small{color:#7d8d87;font-size:18rpx}.primary-btn{height:80rpx;margin-top:18rpx;border-radius:40rpx;background:#10b981;color:#fff;font-size:27rpx;line-height:80rpx}.primary-btn[disabled]{opacity:.5}.agreement{display:flex;align-items:center;justify-content:center;gap:8rpx;margin-top:14rpx;color:#7b888e;font-size:18rpx}.agreement>view{display:flex;align-items:center;justify-content:center;width:24rpx;height:24rpx;border:2rpx solid #bec8c6;border-radius:50%;font-size:16rpx}.agreement>view.checked{border-color:#10b981;background:#10b981;color:#fff}.agreement text{color:#10a981}
</style>
