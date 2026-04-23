# 项目需求记录

## 项目定位

本项目服务于报废机动车回收企业的自营预约业务，目标是让客户通过前端完成预约和进度查询，同时让内勤与外勤在统一系统里完成处理和执行。

## 当前活跃需求

### [REQ-PRJ-20260422-01] 当前先以 `mobile + backend + shared-types` 收口的 `monorepo`
- 状态：`accepted`
- 优先级：`P0`
- 决策：当前仓库先以 `apps/mobile`、`apps/backend`、`packages/shared-types` 作为真实落地基线；`apps/admin-web`、`packages/api-sdk`、`packages/shared-utils` 保留为后续扩展，而不是一开始就补齐空壳
- 原因：当前最需要的是移动端客户主链路、移动执行补充流程和后端协议同步跑通；先把真实运行骨架收口，会比维护多套未落地目录更省认知负担

### [REQ-PRJ-20260422-02] `apps/mobile` 客户侧先 H5，后评估 `uni-app`
- 状态：`accepted`
- 优先级：`P0`
- 决策：`apps/mobile` 首期先以 `Vue 3 + Vite + TypeScript` 做 H5，并在其中承载客户侧主链路；待业务模型稳定后再评估是否把客户侧迁到 `uni-app`
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

### [REQ-PRJ-20260423-05] 腾讯云 COS 采用独立前缀的项目级命名空间
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `car` 项目可复用现有腾讯云账号或同一个 COS bucket，但文档只记录变量名和接入约定，不记录真实密钥
  - 若与其他项目共用 bucket，必须使用 `car-platform-*` 这类独立前缀，例如 `car-platform-dev/`、`car-platform-preprod/`、`car-platform-prod/`
  - 项目文档里只保留 `COS_REGION`、`COS_BUCKET`、`COS_APP_ID`、`COS_UPLOAD_PREFIX` 等配置项名称，`COS_SECRET_ID`、`COS_SECRET_KEY` 只通过本地环境变量或安全工具分发
- 原因：这样能在不增加接入阻力的前提下，避免对象路径与 `koa-rent` 等项目混淆，也避免把真实敏感信息泄漏到仓库文档

### [REQ-PRJ-20260423-06] `car` 的提交策略与 `koa-rent` 保持同口径
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `car` 项目的 `Commit Workflow` 默认与 `koa-rent` 对齐，继续采用“可归因改动即自动提交”策略
  - 同一需求下的多文件联动不因文件数量自动升级为人工确认
  - 工作区存在外部改动时，默认只精确暂存并提交本轮可归因文件或 hunk，不使用会放大范围的提交方式
  - 仅在高风险链路、提交范围无法清晰归因、或外部改动与本轮变更严重交织时，才先确认提交策略
- 原因：这样能让两个项目的协作体验保持一致，减少代理在不同仓库之间切换时的判断分叉，也能降低把无关脏改动误混进提交的风险

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
