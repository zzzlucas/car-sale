# `cloud2026` 预发布部署记录（`name10.lucasishere.top`）

## 目标

- 时间：`2026-04-24`
- 环境：`cloud2026` / `cloud-panel-2026`
- 域名：`https://name10.lucasishere.top`
- 本轮目标：把当前 `car` 工作区发布到同域预发布入口

## 本轮实际落点

- 前端根站点：`https://name10.lucasishere.top/`
  - 当前入口资源：`/assets/index-C3dlUkJj.js`
- 后台前端：`https://name10.lucasishere.top/admin/`
  - 当前入口资源：`/admin/assets/index-DCExsjn1.js`
- 后端 API：`https://name10.lucasishere.top/api/`
  - 反代到：`127.0.0.1:8120`
- `pm2` 服务名：`car-platform-backend`

## 本轮远端动作

- 代码工作区：`/srv/apps/car-platform/app`
- 静态站点目录：`/srv/nginx/name10.lucasishere.top`
- 远端依赖：重建了工作区 `node_modules`
- 后端重启方式：`pnpm --filter @car/backend pm2:restart`
- H5 构建参数：`VITE_API_BASE_URL=/api`
- admin 构建参数：
  - `VITE_APP_BASE_PATH=/admin/`
  - `VITE_API_BASE_URL=/api`

## 本轮备份

- 源码备份：`/srv/apps/car-platform/backups/source-20260424-001107.tgz`
- 站点备份：`/srv/apps/car-platform/backups/site-20260424-001107.tgz`

## 验证结果

- `pm2 ls` 显示 `car-platform-backend` 为 `online`
- `curl http://127.0.0.1:8120/app/content/support` 返回 `200`
- `curl https://name10.lucasishere.top/api/app/content/support` 返回 `200`
- 根站点和 `/admin/` 页面都已切到本轮产物入口

## 已确认问题

- 后端重启后立刻探活可能会出现几秒的空窗，建议发布脚本后续补一个短等待或轮询。
- 当前后端启动仍会触及 `config.local`，所以远端 `apps/backend/.env.local` 不能随手删；否则 `DB_PASSWORD` 缺失会导致进程启动失败。

## 回滚线索

- 如需回滚静态站点，优先恢复 `site-20260424-001107.tgz`
- 如需回滚工作区源码，优先恢复 `source-20260424-001107.tgz`
- 回滚后至少重新验证：
  - `https://name10.lucasishere.top/`
  - `https://name10.lucasishere.top/admin/`
  - `https://name10.lucasishere.top/api/app/content/support`
