const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.resolve(__dirname, '../pages/goods/goods_details/index.vue'), 'utf8');

assert(source.includes('isPlatformOrderOutOfStock: function()'), 'missing county platform-order stock helper');
assert(source.includes("this.jkTradeView.tradeIdentity === 'county_agent' && this.jkTradeView.disabledReason === 'OUT_OF_STOCK'"), 'OUT_OF_STOCK must only affect county platform orders');
assert(source.includes("title: '当前商品暂无库存'"), 'county platform order must show the stock-unavailable toast');
assert(source.includes(':class="getTradeBuildButtonClass()"'), 'trade button must use its availability class');
assert(source.includes('retail-quantity-hint'), 'missing retail quantity selection hint');
assert(source.includes('已选 {{attr.productSelect.cart_num}} 件，请选择购买方式'), 'retail quantity hint text is missing');
assert(!source.includes('retail-quantity-hint" v-if="showTradeBuildButton()"'), 'retail quantity hint must not render for role orders');

console.log('goods detail action contract passed');
