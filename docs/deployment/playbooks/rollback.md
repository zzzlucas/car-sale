# 通用回滚与备份手册

## 先记住一个原则

`car` 现在还在启动期，真正危险的不是“回滚动作复杂”，而是“这次远端写了什么根本没记”。所以当前回滚手册的核心，是先统一备份位置和记录口径。

## 推荐统一的备份位置

如果后续在 `cloud2026` 上执行远端写操作，默认优先使用：

- 项目目录：`/srv/apps/car-platform`
- 备份目录：`/srv/apps/car-platform/backups`

推荐备份文件命名：

- 后端：`backend-YYYYMMDD-HHmmss.tgz`
- H5：`mobile-h5-YYYYMMDD-HHmmss.tgz`
- 站点配置：`nginx-<site>-YYYYMMDD-HHmmss.conf`

## 当前应怎么做回滚准备

### 后端

第一次真实上云前，至少保证：

- 远端主目录固定
- 回滚包有统一备份目录
- 本轮会话记录里写清楚远端目录、运行方式和启动命令

### H5

每次发布前至少保留上一版 `dist` 的压缩包或远端站点备份，不要只覆盖不留底。

## 回滚前固定动作

1. 先看这轮部署记录或会话记录，确认改动范围。
2. 先列备份，再决定回哪个版本。
3. 回滚后至少补一次打开页面或探活验证。

## 推荐检查命令

### 列出后端备份

```powershell
ssh -i <SSH_KEY_PATH> <PREPROD_SSH_HOST> "ls -lt /srv/apps/car-platform/backups | head"
```

### 本地确认 H5 当前构建产物

```powershell
Get-ChildItem .\apps\mobile\dist
```

## 当前最实际的建议

- 在 `car` 真正进入第一轮远端部署前，先把备份目录和会话记录口径固定住
- 下一次任何远端写操作，都顺手在同轮文档里写下：
  - 改了哪个目录
  - 备份放哪
  - 怎么验证
  - 如果要回滚，回哪份备份

这样后面再让 AI 帮你部署或回滚，就不会又回到“临时猜路径”的状态。
