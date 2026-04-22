# 项目需求记录

## 项目定位

本项目服务于报废机动车回收企业的自营预约业务，目标是让客户通过前端完成预约和进度查询，同时让内勤与外勤在统一系统里完成处理和执行。

## 当前活跃需求

### [REQ-PRJ-20260422-01] 三端一后端 `monorepo`
- 状态：`accepted`
- 优先级：`P0`
- 决策：仓库按 `apps/customer-h5`、`apps/admin-web`、`apps/admin-h5`、`apps/backend` 组织，配合 `packages/shared-types`、`packages/api-sdk`、`packages/shared-utils`
- 原因：三端共享同一套业务对象与状态语义，拆仓会增加同步成本

### [REQ-PRJ-20260422-02] 客户端先 H5，后评估 `uni-app`
- 状态：`accepted`
- 优先级：`P0`
- 决策：`customer-h5` 首期先以 `Vue 3 + Vite + TypeScript` 做 H5，待业务模型稳定后再评估是否迁到 `uni-app`
- 原因：项目启动期更需要快速联调和快速收敛业务边界，暂不引入跨端运行时约束

### [REQ-PRJ-20260422-03] `v1` 范围收口
- 状态：`accepted`
- 优先级：`P0`
- 纳入范围：
  - 客户预约报废车
  - 后台接单、联系、报价、安排拖车
  - 移动运营端执行现场任务
  - 客户查看订单进度与联系客服
- 暂不纳入：
  - 在线支付
  - 政务/车管所自动对接
  - 多租户 SaaS
  - 复杂 CRM 和营销体系

### [REQ-PRJ-20260422-04] 统一状态口径
- 状态：`accepted`
- 优先级：`P0`
- 决策：三端统一使用以下底层订单状态值：
  - `submitted`
  - `contacted`
  - `quoted`
  - `scheduled_pickup`
  - `picked_up`
  - `dismantling`
  - `deregistration_processing`
  - `completed`
  - `cancelled`
- 原因：进度展示、后台管理、移动执行和后续统计都依赖一致口径

## 当前核心数据对象

- `customer`
- `vehicle`
- `scrap_order`
- `valuation`
- `pickup_task`
- `order_timeline`
- `attachment`
- `operator_user`

这些对象的更详细约定见 `../development/api-conventions.md`。
