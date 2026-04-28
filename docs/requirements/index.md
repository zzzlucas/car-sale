# 需求索引

> 仅保留当前仍需持续参考的轻量入口。

## 单行格式
`- [REQ-ID] | title | scope:project | priority:P0/P1/P2 | status:* | tags:a,b,c | updated:YYYY-MM-DD`

## Active
- [REQ-PRJ-20260426-15] | 客户侧 AI 客服正式接入必须走 backend 代理并先以非流式闭环落地 | scope:project | priority:P1 | status:accepted | tags:ai,customer-support,backend,mobile,siliconflow,workspace-packages | updated:2026-04-28
- [REQ-PRJ-20260424-14] | `car` 图片抠图批处理默认收口为 `openclaw + CPU-only rembg + Tailscale` | scope:project | priority:P1 | status:accepted | tags:image,rembg,openclaw,tailscale,ops | updated:2026-04-24
- [REQ-PRJ-20260423-12] | `car` 后端正式运行方式收口为 `cloud2026 + pm2 + env-driven prod config` | scope:project | priority:P1 | status:accepted | tags:deployment,backend,pm2,config,cloud2026 | updated:2026-04-23
- [REQ-PRJ-20260423-11] | 客户侧地图能力先走 backend 代理 + 高德 Key 池，不在前端直出 Key | scope:project | priority:P1 | status:accepted | tags:map,amap,key-pool,backend,mobile | updated:2026-04-23
- [REQ-PRJ-20260423-10] | 域名规划采用“共享 DNS 边界 + 项目级 domain planning”两层分工 | scope:project | priority:P1 | status:accepted | tags:domain,dns,deployment,docs,workspace-base | updated:2026-04-23
- [REQ-PRJ-20260423-09] | `docs/deployment/` 增加项目级 playbooks 层，收口部署、回滚与当前阻塞项 | scope:project | priority:P1 | status:accepted | tags:deployment,ops,docs,runbook,workspace-base | updated:2026-04-23
- [REQ-PRJ-20260422-01] | 当前以 `mobile + admin-web + backend + shared-types` 作为真实落地基线 | scope:project | priority:P0 | status:accepted | tags:monorepo,architecture,frontend,backend,docs | updated:2026-04-23
- [REQ-PRJ-20260422-02] | `apps/mobile` 客户侧首期先用 H5，后续再评估 `uni-app` | scope:project | priority:P0 | status:accepted | tags:mobile,h5,uni-app,frontend,strategy | updated:2026-04-23
- [REQ-PRJ-20260422-03] | `v1` 聚焦客户预约、后台处理、移动执行闭环，不扩到支付和政务直连 | scope:project | priority:P0 | status:accepted | tags:v1,scope,product,backend,operations | updated:2026-04-22
- [REQ-PRJ-20260422-04] | 三端统一订单状态语义与核心数据对象口径 | scope:project | priority:P0 | status:accepted | tags:status,shared-types,api,consistency | updated:2026-04-22
- [REQ-PRJ-20260423-05] | 腾讯云 COS 采用 `car-platform-*` 独立前缀并且文档不记录真实密钥 | scope:project | priority:P1 | status:accepted | tags:cos,storage,security,docs,deployment | updated:2026-04-23
- [REQ-PRJ-20260423-06] | `car` 的 `Commit Workflow` 与 `koa-rent` 保持同口径 | scope:project | priority:P1 | status:accepted | tags:agents,commit,workflow,collaboration,docs | updated:2026-04-23
- [REQ-PRJ-20260423-08] | `car` 的根 `AGENTS.md` 显式接入 `_workspace-base` 共享基座 | scope:project | priority:P1 | status:accepted | tags:agents,workspace-base,docs,collaboration,ops | updated:2026-04-23
- [REQ-PRJ-20260423-07] | `apps/admin-web` 先以轻量后台壳子接入现有 cool-admin 接口闭环 | scope:project | priority:P1 | status:accepted | tags:admin-web,frontend,backend,cool-admin,scope | updated:2026-04-23

## Archived
- 暂无
