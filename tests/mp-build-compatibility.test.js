const assert = require('assert');
const fs = require('fs');
const path = require('path');

const parser = fs.readFileSync(
  path.join(__dirname, '..', 'components', 'jyf-parser', 'libs', 'MpHtmlParser.js'),
  'utf8'
);
const cssHandler = fs.readFileSync(
  path.join(__dirname, '..', 'components', 'jyf-parser', 'libs', 'CssHandler.js'),
  'utf8'
);

assert.match(
  parser,
  /getName\(val\)\s*\{\s*return this\.xml \? val : val\.toLowerCase\(\);\s*\}/,
  '小程序生产编译必须使用标准类方法实现标签名规范化'
);
assert.doesNotMatch(
  parser,
  /^\s*(getName|isClose|section|siblings)\s*=\s*/m,
  'HTML 解析器不能使用 class 属性，避免小程序生产编译失败'
);
assert.doesNotMatch(
  cssHandler,
  /^\s*(getStyle|section|isLetter)\s*=\s*/m,
  'CSS 解析器不能使用 class 属性，避免小程序生产编译失败'
);
