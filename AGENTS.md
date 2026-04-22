# AGENTS.md

## Project Context
- Stack: `Vue 3 + Vite + TypeScript` frontends, `Koa + TypeScript + MySQL` backend
- Repo shape: `monorepo`
- Target apps: `apps/customer-h5`, `apps/admin-web`, `apps/admin-h5`, `apps/backend`
- Target shared packages: `packages/shared-types`, `packages/api-sdk`, `packages/shared-utils`
- Current stage: 文档先行的启动期，很多结构还是“目标形态”，不是现状已建成
- Design references: `E:\web_work_-1\car\.temp\stitch_`
- Docs entry: `docs/README.md`
- Package manager target: `pnpm`

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
- 涉及 `customer-h5` 是否迁移到 `uni-app` 时，若只是“预留边界”可直接推进；若要正式切换技术基座，必须先确认。
- `admin-h5` 默认是移动执行补充端，不擅自扩成 `admin-web` 的完整镜像；若要改变这个边界，先确认。

## Core Engineering Rules

### Monorepo Boundary
- 默认按 `apps/*` 承载各端应用，按 `packages/*` 承载稳定共享能力。
- 两个以上应用真正共享、且边界稳定后，再抽到 `packages/*`；其余情况优先在应用内闭环。
- `packages/shared-utils` 只放平台无关、业务无关或弱业务耦合的纯函数，不把页面流程塞进去。

### Backend Source Of Truth
- `apps/backend` 是订单、估价、时间线、附件、角色权限的业务真相源。
- 三端共享同一套订单状态语义，不允许各端自己发明不同底层状态。
- 页面展示文案可以因角色不同而变化，但底层字段、状态和值域要统一。

### Frontend Strategy
- 当前推荐路线是三端都先用 `Vue 3 + Vite + TypeScript`。
- `customer-h5` 先编译为 H5 配合开发，后续若确认要上微信小程序，再评估 `uni-app`。
- `admin-web` 保持桌面后台优先。
- `admin-h5` 面向外勤、拖车、现场执行、拍照上传、快捷状态变更，不追求完整后台覆盖。

### Product Scope Guardrail
- `v1` 聚焦“客户预约报废车 -> 后台处理 -> 外勤执行 -> 客户看进度”的闭环。
- 默认不主动扩到在线支付、多租户 SaaS、复杂 CRM、营销裂变、政务系统自动对接。
- 若新增能力明显增加学习成本或角色复杂度，先判断收益是否值得。

### Documentation Rules
- `AGENTS.md` 只放硬边界、默认策略和升级条件，不堆长篇背景说明。
- 结构、产品、需求、开发约定分别写入 `docs/architecture`、`docs/product`、`docs/requirements`、`docs/development`。
- 重要持续性决策同步记录到 `docs/requirements/project.md`，并在 `docs/requirements/index.md` 建索引。

### Windows Text Safety
- 仓库文档默认使用 `UTF-8`。
- 修改中文文档时，优先用小块补丁，不做无意义整文件重写。
- 发现乱码时优先回到可靠来源恢复，再做最小增量修改，不手猜内容。

## Validation Baseline
- 文档改动至少检查路径、文件名、术语和相互引用是否一致。
- 当前仓库尚未完成脚手架初始化，不假装 `pnpm dev`、`pnpm build`、`pnpm test` 已可直接运行。
- 等应用初始化后，默认把验证入口收口到工作区级命令，例如 `pnpm dev`、`pnpm build`、`pnpm test`。
- 未验证项必须明确标注“未验证”。

## Requirement Records
- 影响后续协作方式、目录边界、技术路线、状态口径的决策，记录到 `docs/requirements/project.md`。
- `docs/requirements/index.md` 只保留轻量索引，避免把索引写成大段正文。

## Output Requirements
- 回复包含：修改文件、核心改动、验证方式、风险与后续建议。
- 若本轮有实际文件改动但未提交，回复末尾提供 1 条中文 commit 信息建议。
- 若当前目录不是 git 仓库，应如实说明，不能假装已经提交。
