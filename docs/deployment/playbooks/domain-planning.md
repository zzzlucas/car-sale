# 域名规划手册

## 当前状态

- `car` 预期部署到 `cloud2026`
- 域名还没有正式配置
- 这一步当前更适合先做“域名规划”，而不是直接做“DNS 切流手册”

## 先看共享层还是项目层

- 想确认阿里云 DNS 这类共享能力该写哪、真实权限怎么留：
  - 先看 `E:\web_work_-1\_workspace-base\ops\docs\network\aliyun-dns.md`
- 想确认 `car` 自己到底准备用哪个域名、H5 / admin / API 怎么拆：
  - 看本页

## 推荐方案

当前更推荐：

- 客户 H5：`car.<你的主域名>`
- 后台前端：`admin.car.<你的主域名>`
- 后端 API：不优先单独暴露 `api.car.<你的主域名>`，而是优先通过前端同域入口反代：
  - `https://car.<你的主域名>/api`
  - `https://admin.car.<你的主域名>/api`

这样做的好处：

- DNS 记录更少
- 浏览器同域心智更简单
- 后续鉴权、Cookie、跨域问题更少
- Nginx 层也更容易统一收口到 `cloud2026`

## 为什么不优先单独暴露 `api` 子域名

当然可以做：

- `car.<domain>`
- `admin.car.<domain>`
- `api.car.<domain>`

但在当前阶段，这会多引入一层：

- 额外的 DNS 记录
- 额外的 CORS / Cookie / 前端环境变量判断
- 额外的公网暴露面

如果当前主要目标只是尽快把 H5、后台和同一个 backend 收口到 `cloud2026`，优先用 `/api` 反代更省心。

## 当前推荐的入口拆分

### 入口 1：客户 H5

- 域名：`car.<你的主域名>`
- 用途：客户预约、进度查询、上传资料、联系客服
- 推荐：
  - `/` 给 `apps/mobile`
  - `/api` 反代到后端

### 入口 2：后台前端

- 域名：`admin.car.<你的主域名>`
- 用途：后台登录、查单、详情、状态流转
- 推荐：
  - `/` 给 `apps/admin-web`
  - `/api` 反代到同一个后端

## 上线前要先确认的事情

1. `cloud2026` 上后端已经有稳定运行方式。
2. `apps/mobile` 和 `apps/admin-web` 都已经有明确构建产物与发布路径。
3. HTTPS 证书准备好。
4. Nginx 反向代理口径已经确定。
5. 再去加阿里云 DNS 记录。

顺序不要反过来。不要先加 DNS，再回头补部署。

## 当前不建议的做法

- 还没确定前端产物和 Nginx 路径，就先把域名解析过去
- 直接把真实阿里云权限写进项目仓库
- 现在就拍脑袋定三四个子域名，后面再删

## 当前最省心的推进顺序

1. 先把 `car` 后端在 `cloud2026` 的正式运行方式收口
2. 再固定 H5 和 admin 的发布路径
3. 再按本页加两条域名规划
4. 最后才做 DNS 解析和 HTTPS 接入

## 后续文档怎么接

- 这页负责“域名怎么规划”
- 等域名确定并真的准备上线后，再补一页：
  - `domain-cutover.md`

那一页再写：

- 具体 DNS 记录
- TTL
- 切换时间
- 验证步骤
- 回滚线索

## 相关入口

- 共享阿里云 DNS 规则： [aliyun-dns.md](/e:/web_work_-1/_workspace-base/ops/docs/network/aliyun-dns.md)
- `cloud2026` 后端部署： [cloud2026-backend-deploy.md](/e:/web_work_-1/car/docs/deployment/playbooks/cloud2026-backend-deploy.md)
- H5 构建与发布： [h5-release.md](/e:/web_work_-1/car/docs/deployment/playbooks/h5-release.md)
- 通用回滚约定： [rollback.md](/e:/web_work_-1/car/docs/deployment/playbooks/rollback.md)
