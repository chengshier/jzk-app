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
        <view class="section-head"><text>到账账户</text><text @tap="openAccountManager">管理账户</text></view>
        <view v-if="selectedAccount" class="selected-account" @tap="openAccountManager">
          <view class="bank-icon">卡</view>
          <view class="bank-main"><text>{{selectedAccount.bankName}}</text><small>{{selectedAccount.accountName}}　{{selectedAccount.bankAccountMask}}</small></view>
          <jk-status-tag v-if="selectedAccount.isDefault" text="默认" tone="success"/>
          <text class="arrow">›</text>
        </view>
        <view v-else class="empty-account" @tap="openAccountForm()"><text>＋ 添加本人银行卡</text><small>银行卡号由后端加密保存，提现申请只提交账户 ID</small></view>
      </view>

      <view class="card remark-card">
        <view class="section-head"><text>备注 <small>（选填）</small></text></view>
        <textarea v-model="remark" maxlength="50" placeholder="请输入备注信息（选填）"/>
        <text>{{remark.length}}/50</text>
      </view>

      <view class="tip-card">
        <jk-icon name="clock" size="sm"/>
        <view><text>温馨提示</text><small>提现申请提交后，预计 {{arrivalText}} 内到账；</small><small>提交后系统会保存本次收款账户快照，后续修改银行卡不会影响历史申请。</small><small v-if="subscriptionConfig.ready">点击提交时可自愿订阅本次提现状态提醒，拒绝授权不影响提现。</small></view>
      </view>

      <button class="primary-btn" :disabled="submitting||!validForm" @tap="submit">{{submitting?'提交中...':'提交申请'}}</button>
      <view class="agreement" @tap="agreed=!agreed"><view :class="{checked:agreed}">{{agreed?'✓':''}}</view><text>我已阅读并同意《提现服务协议》</text></view>
    </view>

    <view v-if="showManager" class="overlay" @tap="closeManager">
      <view class="sheet" @tap.stop>
        <view class="sheet-head"><text>提现账户</text><text @tap="closeManager">关闭</text></view>
        <view v-for="item in accounts" :key="item.id" :class="['account-row',{active:selectedId===item.id}]" @tap="selectAccount(item)">
          <view class="bank-icon">卡</view>
          <view class="bank-main"><text>{{item.bankName}}</text><small>{{item.accountName}}　{{item.bankAccountMask}}</small></view>
          <text v-if="item.isDefault" class="default-text">默认</text>
          <text class="more" @tap.stop="accountActions(item)">•••</text>
        </view>
        <jk-empty v-if="!accounts.length" text="暂无提现账户"/>
        <button class="add-account-btn" @tap="openAccountForm()">＋ 添加银行卡</button>
      </view>
    </view>

    <view v-if="showForm" class="overlay" @tap="closeAccountForm">
      <view class="sheet form-sheet" @tap.stop>
        <view class="sheet-head"><text>{{accountForm.id?'编辑银行卡':'添加银行卡'}}</text><text @tap="closeAccountForm">关闭</text></view>
        <view class="form-row"><text>收款人</text><input v-model.trim="accountForm.accountName" maxlength="30" placeholder="请输入银行卡开户姓名"/></view>
        <view class="form-row"><text>开户银行</text><input v-model.trim="accountForm.bankName" maxlength="50" placeholder="例如：中国工商银行"/></view>
        <view class="form-row"><text>银行卡号</text><input v-model="accountForm.bankAccount" type="number" maxlength="30" placeholder="请输入本人银行卡号"/></view>
        <view class="default-switch" @tap="accountForm.setDefault=!accountForm.setDefault"><view :class="{checked:accountForm.setDefault}">{{accountForm.setDefault?'✓':''}}</view><text>设为默认提现账户</text></view>
        <button class="primary-btn" :disabled="savingAccount||!validAccountForm" @tap="saveAccount">{{savingAccount?'保存中...':'保存账户'}}</button>
      </view>
    </view>
  </view>
</template>
<script>
import JkPageNav from'@/components/jk/jk-page-nav.vue';
import JkIcon from'@/components/jk/jk-icon.vue';
import JkStatusTag from'@/components/jk/jk-status-tag.vue';
import JkEmpty from'@/components/jk/jk-empty.vue';
import{getJkFundAccount,getJkWithdrawConfig,getJkWithdrawPayeeAccounts,saveJkWithdrawPayeeAccount,setDefaultJkWithdrawPayeeAccount,deleteJkWithdrawPayeeAccount,applyJkWithdraw}from'@/api/jk.js';
import{getJkSubscriptionConfig}from'@/api/jkV31.js';

export default{
  components:{JkPageNav,JkIcon,JkStatusTag,JkEmpty},
  data(){return{account:{},config:{},subscriptionConfig:{ready:false,templateIds:[]},accounts:[],selectedId:null,amount:'',remark:'',agreed:true,submitting:false,showManager:false,showForm:false,savingAccount:false,accountForm:{id:null,accountName:'',bankName:'',bankAccount:'',setDefault:false}}},
  computed:{
    totalBalance(){return this.account.totalAmount||Number(this.account.availableAmount||0)+Number(this.account.frozenAmount||0)+Number(this.account.withdrawingAmount||0)},
    minimumAmount(){const value=this.config.minimumAmount!==undefined?this.config.minimumAmount:(this.config.minAmount!==undefined?this.config.minAmount:this.config.minWithdrawAmount);return Number(value||0)},
    stepAmount(){return Number(this.config.stepAmount||1)},
    selectedAccount(){return this.accounts.find(x=>x.id===this.selectedId)||null},
    validAmount(){const n=Number(this.amount);if(!n||n<=0||n>Number(this.account.availableAmount||0)||n<this.minimumAmount)return false;const step=this.stepAmount;return step<=0||Math.abs(n/step-Math.round(n/step))<0.000001},
    validForm(){return this.agreed&&this.validAmount&&!!this.selectedId},
    validAccountForm(){const card=String(this.accountForm.bankAccount||'').replace(/[\s-]/g,'');return!!this.accountForm.accountName&&!!this.accountForm.bankName&&/^\d{8,30}$/.test(card)},
    arrivalText(){return this.config.arrivalTimeText||'1-2个工作日'}
  },
  onShow(){this.load()},
  methods:{
    load(){getJkFundAccount().then(r=>this.account=r.data||r||{}).catch(()=>this.account={});getJkWithdrawConfig().then(r=>this.config=r.data||r||{}).catch(()=>this.config={});getJkSubscriptionConfig('WITHDRAW').then(r=>this.subscriptionConfig=r.data||r||{ready:false,templateIds:[]}).catch(()=>this.subscriptionConfig={ready:false,templateIds:[]});this.loadAccounts()},
    loadAccounts(){return getJkWithdrawPayeeAccounts().then(r=>{this.accounts=r.data||r||[];const selected=this.accounts.find(x=>x.id===this.selectedId)||this.accounts.find(x=>x.isDefault)||this.accounts[0];this.selectedId=selected?selected.id:null}).catch(()=>{this.accounts=[];this.selectedId=null})},
    money(v){const n=Number(v||0);return Number.isNaN(n)?String(v||'0.00'):n.toFixed(2)},
    fillAll(){const available=Number(this.account.availableAmount||0);const step=this.stepAmount>0?this.stepAmount:1;this.amount=this.money(Math.floor(available/step)*step)},
    openAccountManager(){this.showManager=true},closeManager(){this.showManager=false},
    selectAccount(item){this.selectedId=item.id;this.showManager=false},
    openAccountForm(item){this.showManager=false;this.accountForm=item?{id:item.id,accountName:item.accountName||'',bankName:item.bankName||'',bankAccount:'',setDefault:!!item.isDefault}:{id:null,accountName:'',bankName:'',bankAccount:'',setDefault:!this.accounts.length};this.showForm=true},
    closeAccountForm(){this.showForm=false},
    saveAccount(){if(!this.validAccountForm)return this.$util.Tips({title:'请完整填写有效银行卡信息'});this.savingAccount=true;saveJkWithdrawPayeeAccount({id:this.accountForm.id||undefined,accountType:'BANK',accountName:this.accountForm.accountName,bankName:this.accountForm.bankName,bankAccount:String(this.accountForm.bankAccount).replace(/[\s-]/g,''),setDefault:this.accountForm.setDefault}).then(r=>{const saved=r.data||r||{};this.selectedId=saved.id;this.showForm=false;return this.loadAccounts()}).then(()=>uni.showToast({title:'账户已保存'})).catch(e=>this.$util.Tips({title:e||'保存失败'})).finally(()=>this.savingAccount=false)},
    accountActions(item){uni.showActionSheet({itemList:[item.isDefault?'当前已是默认账户':'设为默认账户','删除账户'],success:res=>{if(res.tapIndex===0&&!item.isDefault){setDefaultJkWithdrawPayeeAccount(item.id).then(()=>this.loadAccounts())}if(res.tapIndex===1){uni.showModal({title:'删除账户',content:'确认删除该提现账户？历史提现记录不受影响。',success:r=>{if(r.confirm)deleteJkWithdrawPayeeAccount(item.id).then(()=>this.loadAccounts())}})}}})},
    submit(){if(!this.agreed)return this.$util.Tips({title:'请先同意提现服务协议'});if(!this.validAmount)return this.$util.Tips({title:'提现金额不符合最低金额或步进要求'});if(!this.selectedId)return this.$util.Tips({title:'请选择提现收款账户'});if(this.submitting)return;this.submitting=true;this.requestWithdrawSubscribe().then(()=>this.doSubmit()).catch(()=>this.doSubmit())},
    requestWithdrawSubscribe(){const ids=((this.subscriptionConfig&&this.subscriptionConfig.templateIds)||[]).filter(Boolean).slice(0,1);if(!this.subscriptionConfig.ready||!ids.length)return Promise.resolve(null);return new Promise(resolve=>{
      // #ifdef MP-WEIXIN
      if(typeof wx==='undefined'||typeof wx.requestSubscribeMessage!=='function')return resolve(null);
      wx.requestSubscribeMessage({tmplIds:ids,success:resolve,fail:error=>{console.warn('提现订阅授权失败',error);resolve(null)}});
      // #endif
      // #ifndef MP-WEIXIN
      resolve(null);
      // #endif
    })},
    doSubmit(){applyJkWithdraw({amount:String(this.amount),requestNo:'WD'+Date.now(),payeeAccountId:this.selectedId,remark:this.remark}).then(()=>{uni.showToast({title:'申请已提交'});setTimeout(()=>uni.redirectTo({url:'/pages/jk/withdraw/list'}),500)}).catch(e=>this.$util.Tips({title:e||'提现申请提交失败'})).finally(()=>this.submitting=false)}
  }
};
</script>
<style scoped>
.withdraw-page{min-height:100vh;background:#f7f9f9}.withdraw-content{padding:14rpx 22rpx 38rpx}.available-card{position:relative;display:flex;align-items:center;min-height:170rpx;overflow:hidden;padding:24rpx;border-radius:20rpx;background:linear-gradient(135deg,#e8faf6,#f8fffd)}.available-card>view{position:relative;z-index:2}.available-card text{display:block;color:#718087;font-size:21rpx}.available-card strong{display:block;margin-top:8rpx;color:#10b981;font-size:42rpx}.available-card small{display:block;margin-top:8rpx;color:#56aa92;font-size:19rpx}.available-card image{position:absolute;right:-18rpx;width:210rpx;height:210rpx;opacity:.5}.card{margin-top:16rpx;padding:22rpx;border-radius:19rpx;background:#fff}.section-head{display:flex;align-items:center;justify-content:space-between}.section-head>text:first-child{color:#1f2937;font-size:26rpx;font-weight:700}.section-head>text:last-child{color:#10b981;font-size:20rpx}.section-head small{color:#9aa3a8;font-size:18rpx;font-weight:400}.amount-input{display:flex;align-items:center;height:92rpx;border-bottom:1rpx solid #edf1f0}.amount-input>text{color:#263139;font-size:38rpx}.amount-input input{flex:1;height:80rpx;margin-left:8rpx;font-size:35rpx}.amount-card>small{display:block;margin-top:12rpx;color:#8b969c;font-size:18rpx}.selected-account,.account-row{display:flex;align-items:center;min-height:92rpx;margin-top:14rpx}.bank-icon{display:flex;align-items:center;justify-content:center;width:62rpx;height:62rpx;flex-shrink:0;border-radius:16rpx;background:#e8faf5;color:#10a981;font-size:23rpx;font-weight:700}.bank-main{display:flex;min-width:0;flex:1;flex-direction:column;gap:5rpx;margin-left:14rpx}.bank-main text{color:#263139;font-size:23rpx;font-weight:600}.bank-main small{color:#7f8b91;font-size:19rpx}.arrow{margin-left:10rpx;color:#9ca6aa;font-size:32rpx}.empty-account{display:flex;min-height:112rpx;flex-direction:column;align-items:center;justify-content:center;margin-top:14rpx;border:2rpx dashed #cde8e1;border-radius:15rpx;color:#10a981}.empty-account text{font-size:24rpx}.empty-account small{margin-top:8rpx;color:#8b969c;font-size:18rpx}.remark-card{position:relative}.remark-card textarea{width:100%;height:120rpx;margin-top:12rpx;padding:15rpx;border-radius:12rpx;background:#f8faf9;font-size:22rpx;box-sizing:border-box}.remark-card>text{position:absolute;right:34rpx;bottom:32rpx;color:#9fa8ac;font-size:17rpx}.tip-card{display:flex;align-items:flex-start;gap:10rpx;margin-top:16rpx;padding:18rpx;border-radius:15rpx;background:#f3f8f6}.tip-card>view{display:flex;flex:1;flex-direction:column;gap:5rpx}.tip-card text{color:#496159;font-size:21rpx}.tip-card small{color:#7d8d87;font-size:18rpx}.primary-btn{height:80rpx;margin-top:18rpx;border-radius:40rpx;background:#10b981;color:#fff;font-size:27rpx;line-height:80rpx}.primary-btn[disabled]{opacity:.5}.agreement{display:flex;align-items:center;justify-content:center;gap:8rpx;margin-top:14rpx;color:#7b888e;font-size:18rpx}.agreement>view,.default-switch>view{display:flex;align-items:center;justify-content:center;width:24rpx;height:24rpx;border:2rpx solid #bec8c6;border-radius:50%;font-size:16rpx}.agreement>view.checked,.default-switch>view.checked{border-color:#10b981;background:#10b981;color:#fff}.agreement text{color:#10a981}.overlay{position:fixed;z-index:100;top:0;right:0;bottom:0;left:0;background:rgba(20,32,29,.42)}.sheet{position:absolute;right:0;bottom:0;left:0;max-height:72vh;overflow-y:auto;padding:24rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));border-radius:28rpx 28rpx 0 0;background:#fff}.sheet-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16rpx}.sheet-head text:first-child{color:#1f2937;font-size:29rpx;font-weight:700}.sheet-head text:last-child{color:#7c898f;font-size:22rpx}.account-row{padding:10rpx 4rpx;border-bottom:1rpx solid #edf1f0}.account-row.active{background:#f4fcf9}.default-text{margin-right:12rpx;color:#10a981;font-size:19rpx}.more{padding:18rpx;color:#7e8a90;font-size:24rpx}.add-account-btn{height:76rpx;margin-top:20rpx;border:2rpx solid #b9eade;border-radius:38rpx;background:#fff;color:#10a981;font-size:24rpx;line-height:76rpx}.add-account-btn::after{border:0}.form-sheet{max-height:82vh}.form-row{display:flex;align-items:center;min-height:82rpx;border-bottom:1rpx solid #edf1f0}.form-row>text{width:130rpx;color:#65737a;font-size:22rpx}.form-row input{flex:1;height:80rpx;text-align:right;font-size:22rpx}.default-switch{display:flex;align-items:center;gap:10rpx;margin-top:20rpx;color:#53636a;font-size:21rpx}
</style>
