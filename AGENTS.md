# AGENTS.md

## Project Context
- Stack: `Vue 3 + Vite + TypeScript` frontends, `Koa + TypeScript + MySQL` backend
- Repo shape: `monorepo`
- Current apps: `apps/mobile`, `apps/backend`
- Planned app: `apps/admin-web`
- Current shared packages: `packages/shared-types`
- Planned shared packages: `packages/api-sdk`, `packages/shared-utils`
- Current stage: 首期工程已启动，当前真实落地以 `apps/mobile + apps/backend + packages/shared-types` 为准；`admin-web` 和更多共享层仍属于后续扩展
- Design references: `E:\web_work_-1\car\.temp\stitch_`
- Docs entry: `docs/README.md`
- Package manager target: `pnpm`

## Workspace Base Integration
- 公共 AGENTS 基线来源：`E:\web_work_-1\_workspace-base\agents\AGENTS-baseline.md`
- 本文件只维护 `car` 的项目专属差异、当前阶段边界和对公共基线的必要补充，不再把自己当成一份脱离工作区共享层的独立通用模板。
- 需要共享服务器事实、共享脚本、共享网络边界或跨项目运维规则时，优先看 `E:\web_work_-1\_workspace-base\ops\README.md`。
- 需要判断共享层和项目层怎么分工时，优先看 `E:\web_work_-1\_workspace-base\docs\how-projects-use-workspace-base.md`。

## Communication
- 默认使用中文。
- 先给结论，再补关键原因。
- 需求不明确时，先按最小可行方案推进，并说明关键假设。
- 说明文档、目录约定、设计备注默认写中文，除非明确面向英文读者。
- 解释问题时优先贴合当前项目阶段，不把成熟大项目的复杂流程机械搬过来。

## Execution Authorization
- 对低风险、可逆、局部闭环的改动默认直接执行，不反复确认。
- 当前项目启动期的低风险事项默认包括：文档补齐、目录骨架调整、前端/后端结构约定、接口命名建议、轻量规则收口。
- 若存在多个都可行的方案，默认选择“最贴近当前约束、最轻、最容易回滚”的方案。

## Escalation Rules
- 以下事项必须先确认：鉴权体系大改、支付、政府/车管所系统对接、数据迁移/批量修复/删除、生产部署入口、`.env`、对象存储实接、微信小程序正式技术路线切换。
- 涉及 `apps/mobile` 的客户侧是否迁移到 `uni-app` 时，若只是“预留边界”可直接推进；若要正式切换技术基座，必须先确认。
- `apps/mobile` 里的 `operator` 分区默认是移动执行补充端，不擅自扩成 `admin-web` 的完整镜像；若要改变这个边界，先确认。

## Core Engineering Rules

### Monorepo Boundary
- 默认按 `apps/*` 承载各端应用，按 `packages/*` 承载稳定共享能力。
- 当前以 `apps/mobile` 承载客户侧与移动执行分区；若后续确实需要 PC 重操作后台，再补 `apps/admin-web`。
- 两个以上应用真正共享、且边界稳定后，再抽到 `packages/*`；其余情况优先在应用内闭环。
- 当前共享层以 `packages/shared-types` 为主；`packages/api-sdk`、`packages/shared-utils` 只有在真实复用出现后再补。
- `packages/shared-utils` 只放平台无关、业务无关或弱业务耦合的纯函数，不把页面流程塞进去。

### Backend Source Of Truth
- `apps/backend` 是订单、估价、时间线、附件、角色权限的业务真相源。
- 三端共享同一套订单状态语义，不允许各端自己发明不同底层状态。
- 页面展示文案可以因角色不同而变化，但底层字段、状态和值域要统一。

### Frontend Strategy
- 当前推荐路线是先以 `apps/mobile` 承载客户侧与移动执行分区，统一使用 `Vue 3 + Vite + TypeScript`。
- `apps/mobile` 当前先以 H5 方式开发和联调；后续若确认要上微信小程序，再评估是否迁到 `uni-app`。
- `apps/mobile` 里的 `operator` 分区面向外勤、拖车、现场执行、拍照上传、快捷状态变更，不追求完整后台覆盖。
- `apps/admin-web` 保持桌面后台优先，但当前属于后续补充，不与首期移动闭环抢优先级。

### Product Scope Guardrail
- `v1` 聚焦“客户预约报废车 -> 后台处理 -> 外勤执行 -> 客户看进度”的闭环。
- 默认不主动扩到在线支付、多租户 SaaS、复杂 CRM、营销裂变、政务系统自动对接。
- 若新增能力明显增加学习成本或角色复杂度，先判断收益是否值得。

### Documentation Rules
- `AGENTS.md` 只放硬边界、默认策略和升级条件，不堆长篇背景说明。
- 结构、产品、需求、开发约定分别写入 `docs/architecture`、`docs/product`、`docs/requirements`、`docs/development`。
- 重要持续性决策同步记录到 `docs/requirements/project.md`，并在 `docs/requirements/index.md` 建索引。
- 若仓库现状已从“目标形态”演进到真实实现，优先把根文档改成“现状 + 未来预留”，不要继续让中央文档停留在过期目标图。

### Port Reuse & Service Health
- 启动调试前先检查目标端口是否已有本项目服务在运行，能复用就先复用，不重复起实例。
- 仅在端口进程不是本项目、环境不一致、热更新失效或服务异常时，才重启或重新启动。
- 涉及前后端联调时，先做一次最小探活，再进入页面或接口排查，减少无效折腾。

### Config & Secret Safety
- 数据库、对象存储、短信、微信等敏感配置只写变量名、路径和使用方式，不把真实密钥写进仓库文档。
- 若多个项目共用同一云资源，文档必须明确“项目级目录前缀 / 命名空间”，避免对象路径互相混淆。
- 可以记录 `COS_REGION`、`COS_BUCKET`、`COS_UPLOAD_PREFIX` 这类配置项名称；`COS_SECRET_ID`、`COS_SECRET_KEY`、数据库密码等真实值只保留在本地环境变量或安全工具里。

### Windows Text Safety
- 仓库文档默认使用 `UTF-8`。
- 修改中文文档时，优先用小块补丁，不做无意义整文件重写。
- 发现乱码时优先回到可靠来源恢复，再做最小增量修改，不手猜内容。

## Validation Baseline
- 文档改动至少检查路径、文件名、术语和相互引用是否一致。
- 当前已存在的工作区脚本应优先复用，例如 `pnpm dev:mobile`、`pnpm build:mobile`、`pnpm typecheck:mobile`、`pnpm dev:backend`、`pnpm build:backend`、`pnpm typecheck:backend`、`pnpm typecheck:shared-types`。
- 当前还没有统一的 `pnpm dev`、`pnpm build`、`pnpm test`，不要假装这些入口已经建立。
- 未验证项必须明确标注“未验证”。

## Requirement Records
- 影响后续协作方式、目录边界、技术路线、状态口径的决策，记录到 `docs/requirements/project.md`。
- 对象存储目录前缀、共享云资源命名空间、验证入口变更等会持续影响协作的约定，也应记录到 `docs/requirements/project.md`。
- `docs/requirements/index.md` 只保留轻量索引，避免把索引写成大段正文。

## Commit Workflow
- 默认采用“可归因改动即自动提交”策略：只要本轮改动服务于同一需求、范围可解释（允许多文件），代理应直接执行 git add + git commit，无需二次确认。
- 对“同一需求下的多文件联动”（如组件 + hook + API 透传）视为单目的改动，不再因“文件数 > 1”自动升级为人工确认。
- 当工作区存在“不是当前代理本轮产生的变更”时，默认忽略其提交范围：不回退、不顺手整理、不混入本次提交；仅暂存并提交自己本轮可归因的改动。
- 若外部变更与本轮改动位于同一文件或相邻逻辑，优先使用按文件或 hunk 的精确暂存；禁止用会放大提交范围的笼统方式（如 `git commit -a`）误混他人改动。
- 仅在以下情况先与用户确认提交策略：高风险链路（鉴权、支付、租约流转、租户隔离、密钥路由/fallback）、提交范围无法清晰归因、外部变更与本轮改动已交织到无法安全拆分、或工作区存在明显混合改动且无法安全拆分。
- 当 git status 显示工作区干净，且最近提交已包含本次改动语义时，视为“已提交完成”，不重复提交。

## Output Requirements
- 回复包含：修改文件、核心改动、验证方式、风险与后续建议。
- 若本轮改动已完成提交，不再重复给 commit 建议。
- 若本轮有实际文件改动但未提交，回复末尾提供 1 条中文 commit 信息建议。
- 若当前目录不是 git 仓库，应如实说明，不能假装已经提交。
