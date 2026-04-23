# `cloud2026` 后端部署手册

## 适用场景

- 准备把 `apps/backend` 部署到 `cloud2026`
- 判断当前是否已经具备“可安全上云”的最低条件
- 统一第一次真实部署时的目录、备份和验证口径

## 当前已确认的基线

- 目标主机：`cloud2026` / `cloud-panel-2026`
- SSH：`ssh -i C:/Users/Lucas/.ssh/id_ed25519 ubuntu@124.222.31.238`
- 推荐项目目录：`/srv/apps/car-platform/backend`
- 开发数据库：`cloud2026` 上的 `1Panel MySQL`
- 开发库口径：`car_platform`
- 本地构建命令：`pnpm build:backend`
- 后端运行端口默认来自 `apps/backend/src/config/config.default.ts`，当前为 `8001`

共享主机事实和 SSH 入口继续看 `E:\web_work_-1\_workspace-base\ops`；本页只回答 `car` 后端自己怎么部署到 `cloud2026`。

## 先看这两个关键提醒

### 1. 当前仓库还没有“可直接上云的一键部署脚本”

也就是说，这份手册当前更像“标准化手工部署路径 + 上线前检查表”，不是“现在闭眼执行就一定能过”的脚本代替品。

### 2. 当前有两个必须显式注意的风险

- `apps/backend/docker-compose.yml` 目前是本地数据库模板，不是 `cloud2026` 的正式部署文件。
- `apps/backend/src/config/config.prod.ts` 仍保留模板默认值：`127.0.0.1 / root / cool / 123456`；如果不先收口这层配置，不能把它当成 `cloud2026 + car_platform` 的正式配置直接用。

结论很简单：

- 可以用这份手册统一部署方向、目录和验证口径
- 但第一次真实上云前，必须先处理生产配置和运行方式，不要误把本地模板当成正式部署基线

## 当前推荐标准路径

### 远端目录约定

- 项目主目录：`/srv/apps/car-platform/backend`
- 备份目录：`/srv/apps/car-platform/backups`

后续真实远端操作默认沿用这两个目录，不再每次临时选新位置。

### 运行方式建议

当前更推荐先收口为“一种运行方式”，不要同时维护：

- 一套本地模板 `docker-compose`
- 一套远端临时 `pm2`
- 一套 1Panel 里的手工进程

在补齐一键部署脚本前，更建议先选一条简单路径，例如：

- `pm2` 单进程

原因不是它最完美，而是仓库里已经有 `apps/backend/package.json` 的 `pm2:start` / `pm2:stop` 入口，后续继续脚本化更顺。

## 真正部署前的最小检查

1. 本地先确认后端能构建：

```powershell
pnpm build:backend
```

2. 确认你准备使用的数据库口径是 `car_platform`，而不是模板里的 `cool`。
3. 确认 `COS_*` 变量只从本地环境变量或安全工具提供，不写入仓库文档。
4. 登录 `cloud2026`，确认目标目录存在或准备创建：

```powershell
ssh -i C:/Users/Lucas/.ssh/id_ed25519 ubuntu@124.222.31.238
sudo mkdir -p /srv/apps/car-platform/backend
sudo mkdir -p /srv/apps/car-platform/backups
```

## 当前建议的部署动作顺序

### 1. 先解决生产配置口径

在第一次真实上云前，至少要满足其中一个条件：

- `config.prod.ts` 已显式改成读取 `DB_*`、COS 相关变量和真实生产端口
- 或者补了一套明确只给 `cloud2026` 使用的生产环境配置文件，并且文档已经同步到本目录

如果这一步没做，就先停，不要继续假部署。

### 2. 再同步代码和依赖

同步方式可以是 `git pull`、`scp` 或后续脚本，但标准目标统一是：

- 远端拿到 `apps/backend`
- 远端拿到 `packages/shared-types`
- 远端拿到根 `package.json` / `pnpm-lock.yaml` / `pnpm-workspace.yaml`

### 3. 再在远端安装依赖并构建

如果远端已有完整仓库副本，最小动作至少包括：

```bash
pnpm install --frozen-lockfile
pnpm build:backend
```

### 4. 再启动或重启服务

如果最终采用 `pm2` 单进程路径，统一从仓库脚本启动，不要手写另一套命令：

```bash
pnpm --filter @car/backend pm2:start
```

如果已经有同名进程，先明确是 `restart` 还是 `stop + start`，并在本轮会话记录里写清楚。

## 最低验证

- 本地构建通过：`pnpm build:backend`
- 远端进程在跑：`pm2 ls` 或等价进程列表
- 后端端口可探活：至少对目标端口或健康检查地址做一次只读请求
- 如果本轮涉及 COS 或上传，还要确认环境变量没有继续指向别的项目前缀

## 本页当前最重要的结论

- `cloud2026` 已经可以作为 `car` 的共享部署宿主来规划
- 但 `config.prod.ts` 和本地模板 `docker-compose.yml` 还不能直接代表正式部署基线
- 所以下一次真正准备上云时，先回来处理这两个点，再按这份手册的目录、备份和验证口径执行

## 关联文档

- 主机与数据库现状： [../cloud2026.md](/e:/web_work_-1/car/docs/deployment/cloud2026.md)
- COS 变量和前缀约定： [../tencent-cos.md](/e:/web_work_-1/car/docs/deployment/tencent-cos.md)
- 通用回滚入口： [rollback.md](/e:/web_work_-1/car/docs/deployment/playbooks/rollback.md)
