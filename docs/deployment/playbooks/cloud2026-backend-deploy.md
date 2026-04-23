# `cloud2026` 后端部署手册

## 适用场景

- 准备把 `apps/backend` 部署到 `cloud2026`
- 判断当前是否已经具备“可安全上云”的最低条件
- 统一第一次真实部署时的目录、备份和验证口径

## 当前已确认的基线

- 目标主机：`cloud2026` / `cloud-panel-2026`
- SSH：`ssh -i C:/Users/Lucas/.ssh/id_ed25519 ubuntu@124.222.31.238`
- 推荐远端工作区目录：`/srv/apps/car-platform/app`
- 推荐备份目录：`/srv/apps/car-platform/backups`
- 推荐远端环境文件：`/srv/apps/car-platform/app/apps/backend/.env.production.local`
- 开发数据库：`cloud2026` 上的 `1Panel MySQL`
- 开发库口径：`car_platform`
- 本地构建命令：`pnpm build:backend`
- 生产运行方式：`pm2` 单进程
- `pm2` 服务名：`car-platform-backend`
- 生产默认端口：`8120`
- HTTP 最小探活：`http://127.0.0.1:8120/app/content/support`

共享主机事实和 SSH 入口继续看 `E:\web_work_-1\_workspace-base\ops`；本页只回答 `car` 后端自己怎么部署到 `cloud2026`。

## 先看这两个关键提醒

### 1. 当前仓库还没有“可直接上云的一键部署脚本”

也就是说，这份手册当前更像“标准化手工部署路径 + 上线前检查表”，不是“现在闭眼执行就一定能过”的脚本代替品。

### 2. 当前还有一个明确边界

- `apps/backend/docker-compose.yml` 仍然是本地数据库模板，不作为 `cloud2026` 业务进程的正式运行入口。

结论很简单：

- 当前已经可以把 `cloud2026 + pm2 + env-driven prod config` 当成正式运行基线
- 但不要再误把本地 `docker-compose.yml` 当作云上业务进程入口

## 当前推荐标准路径

### 远端目录约定

`car` 是 `pnpm workspace`，远端不能只保留一个裸 `apps/backend` 目录；至少要有：

- 仓库工作区根：`/srv/apps/car-platform/app`
- 备份目录：`/srv/apps/car-platform/backups`
- 生产环境文件：`/srv/apps/car-platform/app/apps/backend/.env.production.local`

后续真实远端操作默认沿用这套路径，不再每次临时改目录。

### 运行方式建议

当前正式运行方式已经收口为：

- `pm2` 单进程
- `apps/backend/ecosystem.config.cjs`
- `apps/backend/.env.production.local` 或等价进程环境变量
- `NODE_ENV=prod`

这样做的好处：

- 和现有仓库结构最贴近
- 不需要再引入第二套运行平台
- 后续要继续脚本化时，直接围绕 `pm2:start / pm2:restart / pm2:stop` 展开就行

## 真正部署前的最小检查

1. 本地先确认后端能构建：

```powershell
pnpm build:backend
```

2. 确认远端已经准备好 `apps/backend/.env.production.local`，而不是继续依赖模板默认值。
3. 确认你准备使用的数据库口径是 `car_platform`，而不是模板里的 `cool`。
4. 确认 `COS_*` 变量只从本地环境变量或安全工具提供，不写入仓库文档。
5. 登录 `cloud2026`，确认目标目录存在或准备创建：

```powershell
ssh -i C:/Users/Lucas/.ssh/id_ed25519 ubuntu@124.222.31.238
sudo mkdir -p /srv/apps/car-platform/app
sudo mkdir -p /srv/apps/car-platform/backups
```

推荐直接以 `apps/backend/.env.production.example` 为模板，在远端创建：

```text
/srv/apps/car-platform/app/apps/backend/.env.production.local
```

## 当前建议的部署动作顺序

### 1. 先同步代码和依赖

同步方式可以是 `git pull`、`scp` 或后续脚本，但标准目标统一是：

- 远端拿到工作区根目录
- 远端拿到 `apps/backend`
- 远端拿到 `packages/shared-types`
- 远端拿到根 `package.json` / `pnpm-lock.yaml` / `pnpm-workspace.yaml`

### 2. 再在远端安装依赖并构建

如果远端已有完整仓库副本，最小动作至少包括：

```bash
cd /srv/apps/car-platform/app
pnpm install --frozen-lockfile
pnpm build:backend
```

### 3. 再启动或重启服务

首次启动：

```bash
cd /srv/apps/car-platform/app
pnpm --filter @car/backend pm2:start
```

代码更新后重启：

```bash
cd /srv/apps/car-platform/app
pnpm --filter @car/backend pm2:restart
```

如果需要下线：

```bash
cd /srv/apps/car-platform/app
pnpm --filter @car/backend pm2:stop
```

## 最低验证

- 本地构建通过：`pnpm build:backend`
- 远端进程在跑：`pm2 ls`
- 进程名应显示为：`car-platform-backend`
- 后端端口可探活：

```bash
curl -fsS http://127.0.0.1:8120/app/content/support
```

- 如果本轮涉及 COS 或上传，还要确认环境变量没有继续指向别的项目前缀

## 本页当前最重要的结论

- `cloud2026` 已经可以作为 `car` 的正式 backend 宿主来规划
- 生产配置已经收口为“环境变量 / `.env.production.local` 驱动”，不再依赖模板数据库默认值
- 正式运行方式已经收口为 `pm2` 单进程，服务名是 `car-platform-backend`
- 本地 `docker-compose.yml` 继续只看作开发模板，不再当作正式云上运行入口

## 关联文档

- 主机与数据库现状： [../cloud2026.md](../cloud2026.md)
- COS 变量和前缀约定： [../tencent-cos.md](../tencent-cos.md)
- 通用回滚入口： [rollback.md](rollback.md)
