# 公开 GitHub 快照处理约定

本页用于需要把 `car` 仓库链接提交给外部活动、供应商或评审时使用，例如申请模型 token、技术评估或项目展示。

## 结论

公开 GitHub 仓库只放代码、文档和 env 模板，不放任何真实 `.env` 文件。

当前私有开发协作仍然可以按项目既有口径追求开箱即跑；但一旦仓库、分支或压缩包会发给外部，就切换到本页规则。

## 必须排除

以下文件不得进入公开 GitHub：

- `.env`
- `.env.local`
- `.env.preprod`
- `.env.production.local`
- `apps/**/.env`
- `apps/**/.env.local`
- `apps/**/.env.preprod`
- `apps/**/.env.production.local`

这些文件可能包含数据库密码、地图 Key、COS Secret、AI provider Key、短信或微信测试配置。即使属于非生产环境，公开场景也默认按敏感信息处理。

## 可以保留

公开仓库可以保留以下模板：

- `.env.example`
- `apps/**/.env.example`
- `apps/**/.env.*.example`
- 文档里的变量名、用途说明和占位值

模板只能写 `change-me`、`<真实值>`、`<开发库密码>` 这类占位符，不写真实 key、真实密码或可直接调用的 token。

私有开发仓库可以继续保留 `E:\web_work_-1\_workspace-base` 这类 agent 寻路入口；公开快照不应包含服务器 IP、SSH 用户、私钥路径、Tailscale 地址、真实预发布域名和内部中转站域名。

## 推荐流程

1. 先确认本地真实 env 已留存，不要删除本机文件。
2. 用 `.gitignore` 排除真实 env，只跟踪 example 模板。
3. 若真实 env 曾经进入 Git 历史，不要直接公开原仓库历史。
4. 优先新建一个干净公开仓库，使用无历史快照或 orphan 分支提交。
5. 公开前检查 `git ls-files "*.env*"`，结果应只包含 example 模板。

## 已公开后的处理

如果真实 key、密码或 token 已经推到公开 GitHub，应默认认为已泄露，并尽快轮换：

- AI provider key
- COS `SecretId` / `SecretKey`
- 数据库密码
- 地图服务 key

轮换完成前，不要把公开仓库链接继续提交给外部评审。
