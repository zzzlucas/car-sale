# cloud2026 资源与 MySQL 约定

> 核验时间：`2026-04-22`。以下信息基于本地 `_workspace-base/ops` 共享运维文档，并通过 SSH 只读核验远端现状后整理。

## 资源概览

- 资源主名：`cloud-panel-2026`
- 兼容叫法：`cloud2026`、`cloud-238`
- SSH 用户：`ubuntu`
- 公网 IP：`124.222.31.238`
- 系统：`Ubuntu 24.04.4 LTS`
- Docker：`29.4.0`
- 1Panel：`v2.1.8`
- SSH 方式：

```powershell
ssh -i C:/Users/Lucas/.ssh/id_ed25519 ubuntu@124.222.31.238
```

这里保留 SSH 信息只是为了远端运维与只读核验；本项目日常开发联调不依赖 SSH 隧道。

如果需要共享服务器事实、SSH 别名、共享脚本或跨项目运维规则，优先继续看 `E:\web_work_-1\_workspace-base\ops\README.md` 与 `E:\web_work_-1\_workspace-base\ops\docs\operations\project-server-map.md`；本页只继续维护 `car` 自己的资源与数据库约定。

## 当前已确认的远端状态

### 当前监听端口

- `22`：SSH
- `80`：Nginx
- `443`：Nginx
- `7001`：`frps`
- `7501`：`frps` 本地监听
- `8090`：`1panel-core`
- `8100`：`koa-rent-preprod-c`
- `8110`：`read-node-backend`
- `8111`：`read-find-backend`
- `13308`：`koa-rent-preprod-c-mysql`，仅绑定 `127.0.0.1`

### 当前已运行容器

- `read-node-backend`：`0.0.0.0:8110 -> 8090`
- `read-find-backend`：`0.0.0.0:8111 -> 8090`
- `koa-rent-preprod-c`：`0.0.0.0:8100 -> 8090`
- `koa-rent-preprod-c-mysql`：`127.0.0.1:13308 -> 3306`
- `koa-rent-cloud2026-frps`
- `koa-rent-cloud2026-frpc-b2-visitor`

### 当前目录习惯

远端已经在用 `/srv/apps` 作为项目级 Docker Compose 工作目录，当前已确认存在：

- `/srv/apps/koa-quickstart-node`
- `/srv/apps/koa-quickstart-find`
- `/srv/apps/koa-rent-preprod-c`
- `/srv/apps/koa-rent-public-edge`

这说明本项目后续如果要把数据库或后端放到 `cloud2026`，继续沿用 `/srv/apps/<project>` 的目录习惯最自然。

## 本项目推荐约定

### 1. 开发环境优先使用 1Panel 数据库服务

当前推荐做法：

- MySQL 服务本身交给 `1Panel` 管理
- 数据库、用户、密码通过 `1Panel -> 数据库 -> MySQL` 页面创建
- 本地开发机不再要求常驻安装 MySQL
- 本地联调默认直接连接远端 `3306`

这样更符合“开发环境简洁直观”的目标：

- 数据库状态直接在面板可见
- 重启、查看连接信息、创建库和用户都更顺手
- 不需要再为本项目单独维护一份远端 `docker-compose.yml`
- 不需要再额外记住 SSH 隧道这层操作

### 2. 当前远端现状

`2026-04-22` 只读核验时，远端已经存在 `1Panel` 管理的 MySQL 容器：

- 容器名：`1Panel-mysql-La6p`
- 镜像：`mysql:8.4.9`
- 当前端口：`0.0.0.0:3306 -> 3306`

同时机器上还有另一个项目自管 MySQL：

- `koa-rent-preprod-c-mysql`
- `127.0.0.1:13308 -> 3306`

这说明 `cloud2026` 现在同时存在“1Panel 管理型数据库”和“项目自管 compose 数据库”两种模式，而本项目当前明确选择前者。

### 3. 推荐的创建方式

建议在 `1Panel` 中直接创建：

- 数据库名：`car_platform`
- 用户名：`car_platform`
- 单独的开发密码
- 描述：可写成 `car dev`

### 4. 本地访问策略

当前项目已经按“直连公网 `3306`”的开发方式验证通过，本地后端可直接使用：

- Host：`124.222.31.238`
- Port：`3306`
- Database：`car_platform`
- Username：`car_platform`

当前已完成的实际动作：

- 已在 `1Panel MySQL` 中创建 `car_platform` 数据库
- 已创建专用开发用户 `car_platform`
- 已验证本机可直接连 `124.222.31.238:3306`
- 已验证 `apps/backend` 可在该数据库上启动并返回接口

## 本地开发如何连接远端 MySQL

本地开发默认直接连：

- Host：`124.222.31.238`
- Port：`3306`
- Database：`car_platform`
- Username：`car_platform`

密码不写入仓库文档，保留在本地开发环境变量中。

PowerShell 下本地启动后端的最小示例：

```powershell
$env:DB_PASSWORD='<开发库密码>'
pnpm dev:backend
```

如果使用 IDE 运行配置，也只需要额外注入 `DB_PASSWORD`，其余库地址默认值已经指向 `cloud2026:3306`。

## 对本项目代码的影响

当前仓库里的 `apps/backend/src/config/config.local.ts` 已调整为默认走直连 `cloud2026:3306` 配置。

当前默认值为：

- host：`124.222.31.238`
- port：`3306`
- username：`car_platform`
- database：`car_platform`

如有需要，仍可通过环境变量覆盖：

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`

## 安全提醒

- 不在仓库文档里记录真实数据库密码
- 当前开发环境已经选择直连公网 `3306`，因此更要避免把 root 账号用于日常开发
- 建议持续使用专用开发账号，不把 root 密码写进代码或文档
- 如果需要看 `1Panel` 的当前账号信息，远端执行 `sudo 1pctl user-info`
- 如果后续要继续长期直连公网数据库，建议再补访问白名单、防火墙或其他额外保护
