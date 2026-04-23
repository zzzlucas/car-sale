# H5 发布手册

## 适用场景

- 发布 `apps/mobile` 的 H5 客户端
- 先做本地构建、产物检查和发布前验证
- 给后续“上传到云服务器 / 对象存储 / Nginx 站点”统一产物口径

## 当前已确认的基线

- H5 应用目录：`apps/mobile`
- 构建命令：`pnpm build:mobile`
- 构建产物目录：`apps/mobile/dist`
- H5 API 地址来自：`VITE_API_BASE_URL`
- 如果未显式设置 `VITE_API_BASE_URL`，当前默认会回退到 `http://127.0.0.1:8001`

最后这一点非常关键：真正发 H5 前，不能让产物继续带着 `127.0.0.1:8001`。

## 发布前检查

1. 先确认这次 H5 对接的是哪一个后端地址。
2. 显式设置 `VITE_API_BASE_URL` 再构建，不要依赖本地默认值。
3. 如果本轮涉及浏览器直传 COS，确认 bucket 已补好 CORS。

## 推荐构建方式

PowerShell 下最小示例：

```powershell
$env:VITE_API_BASE_URL='https://<你的后端地址>'
pnpm build:mobile
```

构建完成后，产物统一以 `apps/mobile/dist` 为准；后续无论发到哪种静态站，都以这个目录为唯一发布产物，不在远端现场二次构建。

## 产物检查

### 检查 dist 是否已生成

```powershell
Test-Path .\apps\mobile\dist
```

### 检查产物里有没有残留本地 API 地址

```powershell
rg -n "127.0.0.1:8001" .\apps\mobile\dist
```

如果还能搜到，就不要继续发布。

## 当前推荐发布口径

- 先把 `apps/mobile/dist` 当成唯一上线产物
- 远端发布路径、Nginx 站点名和 HTTPS 域名一旦固定，再补回这份手册，不另开第二份“正式发布版”
- 本轮如果只是先交付测试包或给云端静态站上传，至少也要记录：
  - 发布到哪
  - 用的 API 地址是什么
  - 是否涉及 COS 直传

## 最低验证

- H5 首页能打开
- 关键 API 不再指向 `127.0.0.1:8001`
- 如果本轮有上传图片，浏览器侧上传链路至少做一次真实验证

## 关联文档

- COS 约定： [../tencent-cos.md](/e:/web_work_-1/car/docs/deployment/tencent-cos.md)
- 通用回滚入口： [rollback.md](/e:/web_work_-1/car/docs/deployment/playbooks/rollback.md)
