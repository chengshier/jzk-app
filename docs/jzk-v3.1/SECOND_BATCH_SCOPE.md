# 九州康 JZK V3.1 第二批小程序端

本分支基于第一批分支，新增线下销售、我的业绩、经营收益和平台佣金分账展示。

为避免新增页面文件存在但未注册，本批次将新业务作为 `pages/jk/trade/list` 的明确模式接入现有已注册路由：

- `mode=offlineSale`
- `mode=offlineSaleCreate`
- `mode=offlineSaleDetail&id=...`
- `mode=performance`
- `mode=operationProfit`

线下销售确认后真实扣减本人库存；匿名或高风险销售进入后台审核。经营收益不进入提现账户，平台佣金仅来自已发布规则。
