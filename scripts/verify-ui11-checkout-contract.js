const fs = require('fs');
const path = require('path');

const required = {
  'pages/order_addcart/order_addcart.vue': [
    'ui11-cart-settlement',
    'getPreOrder',
    'subOrder',
    'ui11-cart-total'
  ],
  'pages/order/order_confirm/index.vue': [
    'ui11-confirm-address',
    'ui11-confirm-payment',
    'ui11-confirm-summary'
  ],
  'pages/goods/goods_details/index.vue': [
    'ui11-detail-evaluation',
    'ui11-detail-recommend'
  ]
};

const missing = [];
Object.entries(required).forEach(([file, tokens]) => {
  const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  tokens.forEach((token) => {
    if (!content.includes(token)) missing.push(`${file}: ${token}`);
  });
});

if (missing.length) {
  console.error(missing.join('\n'));
  process.exit(1);
}

console.log('UI1.1 cart, checkout, and product detail contracts are present');
