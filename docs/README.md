# 文档导航

当前仓库还在启动期，这里的文档主要回答三件事：

- 这个项目准备怎么建
- 三端一后端各自负责什么
- 后续协作时哪些约定要保持一致

## 推荐阅读顺序
- 想先看项目协作边界：`../AGENTS.md`
- 想看整体结构：`architecture/overview.md`
- 想看目录骨架：`architecture/monorepo-layout.md`
- 想看前端路线：`architecture/frontend-strategy.md`
- 想看客户主链路：`product/customer-journey.md`
- 想看后台与移动运营分工：`product/admin-roles-and-workflows.md`
- 想看当前需求决策：`requirements/project.md`
- 想看开发约定：`development/workflow.md`
- 想看接口口径：`development/api-conventions.md`
- 想看 `cloud2026` 与远端 MySQL 约定：`deployment/cloud2026.md`

## 目录说明
- `architecture/`：解释为什么这样分端、这样分目录、这样选技术路线
- `product/`：解释客户、内勤、外勤三类角色如何使用系统
- `requirements/`：记录当前项目的活跃需求与重要决策
- `development/`：记录开发协作约定、接口与共享边界
- `testing/`：记录当前阶段的最小验证基线
- `deployment/`：为后续环境与部署文档预留统一入口
- `superpowers/`：设计与实现计划文档

## 当前阅读提醒
- 当前很多文档描述的是“目标结构”和“推荐约定”，不是现状已经完成的工程。
- 当前阶段默认先服务 H5 开发与联调，再根据业务稳定度决定是否把 `customer-h5` 迁到 `uni-app`。
