# 部署文档

## 当前可用内容

这个目录现在开始记录“已经确认过的部署资源”和“本项目推荐采用的部署约定”，避免后续每次接数据库、配端口、连远端时重新翻别的仓库。

## 先看共享层还是项目层

- 想确认共享服务器事实、SSH 别名、共享脚本、跨项目公网边界时，先看：
  - `E:\web_work_-1\_workspace-base\ops\README.md`
  - `E:\web_work_-1\_workspace-base\ops\docs\operations\project-server-map.md`
- 想确认 `car` 自己的数据库、对象存储、后续部署约定时，再看本目录。

当前已补充：

- `cloud2026` 服务器资源信息
- `cloud2026` 当前端口与已运行容器
- 本项目在 `cloud2026` 上使用 `1Panel` 数据库服务的推荐方式
- 本地开发直连远端 `MySQL 3306` 的约定
- 腾讯云 COS 的变量约定、目录前缀和文档落位方式
- 项目级部署 `playbooks` 入口与当前回滚口径

## 推荐阅读

- 想先搞清 `car` 主要依赖哪台共享主机、共享层和项目层怎么分工：`E:\web_work_-1\_workspace-base\ops\docs\operations\project-server-map.md`
- 想确认 `cloud2026` 的 SSH、目录和端口基线：`cloud2026.md`
- 想确认腾讯云 COS 怎么配、目录前缀怎么避混：`tencent-cos.md`
- 想直接看项目级部署/回滚手册：`playbooks/README.md`
- 想看 `cloud2026` 后端部署前检查：`playbooks/cloud2026-backend-deploy.md`
- 想看 H5 构建与发布口径：`playbooks/h5-release.md`
- 想看通用回滚与备份约定：`playbooks/rollback.md`

## 当前约定

- 本项目开发环境数据库优先使用 `cloud2026` 上的 `1Panel MySQL` 服务
- 数据库实例由 `1Panel` 负责创建和可视化管理
- 本地联调默认直接连接 `cloud2026:3306`
- 后端本地配置默认以 `cloud2026` 的开发库为目标，不再默认走 SSH 隧道
- SSH 登录只保留给远端运维、查看 `1Panel` 状态或服务器巡检，不作为本项目日常联调前置步骤

## 后续还要补充的内容

- `apps/admin-web` 的发布步骤
- 后续小程序构建与发布记录
- 域名、反向代理与 HTTPS 接入说明

其中：

- 如果属于 `car` 自己怎么部署、怎么回滚，继续留在本目录和 `playbooks/`
- 如果属于共享主机、共享公网边界或跨项目运维规则，统一回 `_workspace-base/ops`
