# 项目需求记录

## 项目定位

本项目服务于报废机动车回收企业的自营预约业务，目标是让客户通过前端完成预约和进度查询，同时让内勤与外勤在统一系统里完成处理和执行。

## 当前活跃需求

### [REQ-PRJ-20260423-10] 域名规划采用“共享 DNS 边界 + 项目级 domain planning”两层分工
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - 阿里云 DNS 这类共享域名管理能力，其边界、权限留存原则和 TTL / 切换规则统一写到 `E:\web_work_-1\_workspace-base\ops`
  - `car` 项目仓库只负责记录自己的域名规划、未来切流步骤和回滚线索
  - `car` 当前阶段优先采用 `car.<domain>` + `admin.car.<domain>` 两个前端入口，并优先通过各自同域 `/api` 反代同一个 backend，不急着单独暴露 `api` 子域名
  - 真实阿里云账号密码、`AccessKey`、`RAM` 密钥不写入仓库文档，只记录变量名和获取路径
- 原因：如果把 DNS 管理能力完全写在项目仓库里，后续多个项目一多就会重复维护；反过来如果把某个项目具体用哪个域名、这次怎么切也都塞到共享层，项目侧又会失去可执行入口。拆成“共享 DNS 边界 + 项目级 domain planning”两层后，后面让 AI 帮忙部署、配域名、切流会更稳，也更不容易误把真实密钥写进仓库。

### [REQ-PRJ-20260423-09] `docs/deployment/` 增加项目级 playbooks 层，收口部署、回滚与当前阻塞项
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `car` 的 `docs/deployment/` 下新增 `playbooks/` 目录，作为项目级部署和回滚手册入口
  - 共享主机事实、共享脚本与跨项目运维规则继续看 `E:\web_work_-1\_workspace-base\ops`
  - `cloud2026-backend-deploy.md` 需要明确写出当前真正可执行的步骤，以及 `config.prod.ts`、本地模板 `docker-compose.yml` 还不能直接当正式部署基线的风险
  - `h5-release.md` 需要明确 `apps/mobile/dist` 是唯一发布产物，且正式发布前必须显式设置 `VITE_API_BASE_URL`
- 原因：当前仓库已经有 `cloud2026`、COS 和开发联调约定，但缺少“真正准备发布时先看哪页”的项目级入口，导致后续让 AI 协助部署时很容易误把本地模板或别的项目经验当成 `car` 的正式路径。补一层 `playbooks` 后，可以把共享层、项目层和当前阻塞项一次说清楚，开发体验会稳很多。

### [REQ-PRJ-20260423-11] 客户侧地图能力先走 backend 代理 + 高德 Key 池，不在前端直出 Key
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `apps/mobile` 首期只落“地址搜索建议 + 经纬度回填”，不直接上完整嵌入地图页
  - 客户侧地图请求统一走 `apps/backend` 代理接口，不在前端直出高德 Key
  - 高德 Key 池通过 `AMAP_WEB_SERVICE_KEYS` 注入，并兼容单 Key 配置 `AMAP_WEB_SERVICE_KEY`
  - backend 侧按池内顺序尝试 Key；遇到额度、鉴权或网络异常时切下一个 Key 兜底
- 原因：当前项目还处于低成本验证阶段，优先保证预约页地址搜索能闭环，同时把 Key 暴露面和后续替换成本压到最低。

### [REQ-PRJ-20260422-01] 当前以 `mobile + admin-web + backend + shared-types` 作为真实落地基线
- 状态：`accepted`
- 优先级：`P0`
- 决策：当前仓库以 `apps/mobile`、`apps/admin-web`、`apps/backend`、`packages/shared-types` 作为真实落地基线；`packages/api-sdk`、`packages/shared-utils` 继续保留为后续扩展
- 原因：客户 H5 主链路与后台订单处理链路都已经进入真实联调阶段，`admin-web` 不再只是预留目录，而是承担 PC 侧登录、订单查询、详情查看和状态流转的实际入口

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
  - `COS_BUCKET` 允许写桶名称本体并配套 `COS_APP_ID`，也兼容直接写带 `-AppId` 后缀的完整 bucket 名称
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

### [REQ-PRJ-20260423-07] `apps/admin-web` 先落地轻量后台壳子，不额外引入完整后台框架迁移
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `apps/admin-web` 当前采用轻量 `Vue 3 + Vite + TypeScript` 应用，直接对接 `apps/backend` 现有 cool-admin 登录、权限和订单接口
  - 首期只承载后台登录、业务菜单、报废预约单列表、详情查看和状态流转
  - 暂不在本轮扩展系统管理、角色管理、配置中心等额外后台模块
- 原因：用户当前最需要的是先看到后台和 H5 的真实闭环，而不是再引入一套更重的后台脚手架改造成本；先让 PC 处理台可用，再按实际业务扩页更稳妥

### [REQ-PRJ-20260423-08] `car` 的根 `AGENTS.md` 显式接入 `_workspace-base`
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `car` 的公共 AGENTS 基线来源统一指向 `E:\web_work_-1\_workspace-base\agents\AGENTS-baseline.md`
  - 根 `AGENTS.md` 继续只维护 `car` 的项目专属差异、当前阶段边界和必要补充，不再暗含自己是一份独立完整模板
  - 涉及共享服务器事实、共享脚本、共享网络边界与跨项目运维规则时，优先参考 `E:\web_work_-1\_workspace-base\ops`
  - 项目仓库仍负责 `car` 自己的业务代码、部署记录、回滚线索与项目专属文档
- 原因：工作区已经把共享运维和共享模板收口到 `_workspace-base`，如果项目根 `AGENTS.md` 不显式接入，AI 在 `car` 里仍然容易只围着本仓自转，不知道什么时候该去看共享基座。显式声明后更有利于后续部署、COS、云资源和协作规则复用，也能减少项目边界跑偏。

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
