# 文档导航

当前仓库还在启动期，这里的文档主要回答三件事：

- 这个项目准备怎么建
- 当前已经落地的移动端、后台前端、后端和共享层各自负责什么
- 后续协作时哪些约定要保持一致

## 推荐阅读顺序
- 想先看项目协作边界：`../AGENTS.md`
- 想看工作区共享基座怎么与项目协作：`E:\web_work_-1\_workspace-base\docs\how-projects-use-workspace-base.md`
- 想看共享运维事实和共享脚本入口：`E:\web_work_-1\_workspace-base\ops\README.md`
- 想看整体结构：`architecture/overview.md`
- 想看目录骨架：`architecture/monorepo-layout.md`
- 想看前端路线：`architecture/frontend-strategy.md`
- 想看客户主链路：`product/customer-journey.md`
- 想看后台与移动运营分工：`product/admin-roles-and-workflows.md`
- 想看当前需求决策：`requirements/project.md`
- 想看开发约定：`development/workflow.md`
- 想看接口口径：`development/api-conventions.md`
- 想看 `cloud2026` 与远端 MySQL 约定：`deployment/cloud2026.md`
- 想看腾讯云 COS 接入约定：`deployment/tencent-cos.md`

## 目录说明
- `architecture/`：解释为什么这样分端、这样分目录、这样选技术路线
- `product/`：解释客户、内勤、外勤三类角色如何使用系统
- `requirements/`：记录当前项目的活跃需求与重要决策
- `development/`：记录开发协作约定、接口与共享边界
- `testing/`：记录当前阶段的最小验证基线
- `deployment/`：为后续环境与部署文档预留统一入口
- `superpowers/`：设计与实现计划文档

## 当前阅读提醒
- 当前真实落地基线已经包含 `apps/mobile`、`apps/admin-web`、`apps/backend`、`packages/shared-types`。
- 当前阶段默认优先保证 `apps/mobile` 与 `apps/admin-web` 都能直接联到同一个 backend 闭环，再根据业务稳定度决定是否把客户侧迁到 `uni-app`。
- 工作区级共享运维、共享模板和跨项目协作边界已经收口到 `E:\web_work_-1\_workspace-base\`，本仓 docs 继续只维护 `car` 自己的业务、开发和部署文档。
