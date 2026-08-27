const assert = require('assert');
const fs = require('fs');
const path = require('path');

const trendPage = fs.readFileSync(
  path.join(__dirname, '..', 'pages', 'jk', 'health', 'trend.vue'),
  'utf8'
);
const chartWrapper = fs.readFileSync(
  path.join(__dirname, '..', 'components', 'glucose-ucharts.vue'),
  'utf8'
);
const healthHomePage = fs.readFileSync(
  path.join(__dirname, '..', 'pages', 'health', 'index.vue'),
  'utf8'
);

assert.match(trendPage, /import GlucoseUCharts from '@\/components\/glucose-ucharts\.vue';/, '趋势详情页必须复用 qiun-data-charts 的包装组件');
assert.match(trendPage, /<glucose-u-charts[\s\S]*?:records="rows"/, '趋势详情页必须把接口记录数组传给图表组件');
assert.match(trendPage, /<glucose-u-charts[\s\S]*?mode="detail"/, '趋势详情页必须启用详情图表模式');
assert.match(trendPage, /<glucose-u-charts[\s\S]*?:range-type="range"/, '趋势详情页必须传递组件支持的 DAY/WEEK/MONTH 范围值');
assert.match(chartWrapper, /<qiun-data-charts[\s\S]*?:style="chartStyle"/, 'qiun-data-charts 必须在自身标签上获得确定的绘制尺寸');
assert.match(chartWrapper, /chartStyle\(\)\s*\{[\s\S]*?return\s+'width:100%;height:'/,'小程序的 style 属性必须接收 CSS 字符串，不能接收样式对象');
assert.match(healthHomePage, /chartRows\(\)[\s\S]*?valid\.slice\(-40\)/, '首页今日曲线必须只展示最近约两小时的 40 个 CGM 点');
assert.match(healthHomePage, /<glucose-u-charts[\s\S]*?:records="chartRows"/, '首页标签名必须与 GlucoseUCharts 的 Vue 注册名匹配');
assert.match(chartWrapper, /:ontouch="true"/, '微信 Canvas 必须走触摸绘制分支，保证首页和详情页都能稳定渲染折线');
assert.match(chartWrapper, /:tooltipShow="true"[\s\S]*?:ontap="true"[\s\S]*?:openmouse="true"/, '图表必须显式开启点按和浏览器悬浮提示');
assert.match(chartWrapper, /:onmovetip="mode === 'detail'"/, '仅详情页在触摸移动和松开时触发 qiun 提示，首页避免与 tap 事件重复绘制');
assert.match(chartWrapper, /\.guc\s*\{[\s\S]*?height:\s*100%/, '小程序图表包装层必须继承父容器高度，避免 canvas 与下方内容重叠');
assert.match(trendPage, /\.trend-canvas\s*\{[\s\S]*?height:\s*382rpx/, '详情页必须为图表和可拖动时间轴预留完整高度');
assert.match(chartWrapper, /chartOpts\(\)\s*\{\s*const detail = this\.mode === 'detail'/, '图表配置必须定义详情页状态，不能因未定义变量而中断渲染');
assert.match(chartWrapper, /dataPointShape:\s*true/, '血糖曲线必须绘制实心数据点');
assert.match(chartWrapper, /dataPointShapeType:\s*'solid'/, '常规数据点必须为实心样式');
assert.match(chartWrapper, /activeType:\s*'solid'/, '点按曲线后的高亮数据点必须为实心样式');
assert.match(chartWrapper, /line:\s*\{[\s\S]*?width:\s*3/, '血糖曲线必须使用足够清晰的线宽');
assert.match(chartWrapper, /labelCount:\s*4/, 'x 轴必须限制为四个时间标签，避免重叠');
assert.match(chartWrapper, /<slider[\s\S]*?@changing="onTimelineChanging"/, '详情页超过默认窗口时必须提供真正可拖动的时间滑块');
assert.match(chartWrapper, /visibleRows\(\)[\s\S]*?\.slice\(start, start \+ this\.itemCount\)/, '拖动时间滑块后，图表必须只渲染对应的两小时窗口');
assert.match(chartWrapper, /onTimelineChanging\(event\)[\s\S]*?this\.timelineStart\s*=/, '时间滑块拖动时必须实时更新图表窗口');
