# 测试与验证基线

## 当前阶段说明

当前仓库已经进入首期工程初始化阶段，当前验证重点变成两层：

- 工作区、共享类型、移动端、后端的构建与类型检查是否可通过
- 移动端客户主链路和后端客户接口是否具备最小可运行形态

## 当前最小验证方式

### 当前推荐命令
- `pnpm install`
- `pnpm typecheck:shared-types`
- `pnpm typecheck:mobile`
- `pnpm build:mobile`
- `pnpm typecheck:backend`
- `pnpm build:backend`

### 本地运行
- `pnpm dev:mobile`
- `pnpm dev:backend`

PowerShell 下如果要真实连开发库启动后端，补一个密码环境变量即可：

```powershell
$env:DB_PASSWORD='<开发库密码>'
pnpm dev:backend
```

也可以在仓库根目录放一个未纳入版本控制的 `.env.local`，例如：

```dotenv
DB_PASSWORD=<开发库密码>
```

当前 `apps/backend` 本地配置会自动读取仓库根目录与 `apps/backend` 目录下的 `.env` / `.env.local`；如果同时设置了进程环境变量，则以进程环境变量为准。

### 客户侧手工冒烟
- 打开 `/customer`，确认首页可见且“立即估价 / 预约回收”可点击
- 进入 `/customer/valuation`，填写最小表单并提交
- 提交后应跳转到 `/customer/progress/:orderId`
- 打开 `/customer/me`，应能看到示例订单列表
- 打开 `/customer/guide` 与 `/customer/support`，应能看到内容页

### 当前环境提醒
- 当前开发环境默认假设：数据库使用 `cloud2026` 上的 `1Panel MySQL`
- 本地启动 `apps/backend` 时，默认使用 `127.0.0.1:3306`；如需直连远端开发库，真实 host 从本机 `.env.local` 或 `_workspace-base` 运维文档注入
- 当前开发库为 `car_platform`
- SSH 仅用于远端运维与查看服务器状态，不是本地联调必需步骤
- 本地若未提供开发密码或远端数据库不可达，当前只能完成 `typecheck/build`，无法验证后端真实启动

## 后续工程初始化后的验证目标

后续建议继续收口到更统一的工作区入口，例如：

- `pnpm dev`
- `pnpm build`
- `pnpm test`

等 `admin-web` 和更完整的 `operator` 流程进入实现阶段，再补充跨端联调、接口回归和自动化测试。

## 当前状态

- 自动化测试：未建立
- `shared-types` typecheck：已建立
- `apps/mobile` typecheck / build：已建立
- `apps/backend` typecheck / build：已建立
- 后端真实启动验证：已完成（直连 `cloud2026:3306`，`/app/content/service-guide` 返回 `200`）
