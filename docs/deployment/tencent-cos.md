# 腾讯云 COS 接入约定

## 结论

`car` 项目可以复用现有腾讯云 COS 资源，但不建议把 `koa-rent` 的真实配置原样抄进仓库文档。更合适的做法是：

- 复用同一套接入方式和环境变量名
- 只在文档里写变量名、目录前缀和对象路径约定
- 真实密钥只放在本地环境变量或安全工具里
- 如果与别的项目共用 bucket，必须使用 `car-platform-*` 的独立前缀

## 推荐环境变量

后端或签名服务侧统一使用：

- `COS_REGION`
- `COS_BUCKET`
- `COS_APP_ID`
- `COS_SECRET_ID`
- `COS_SECRET_KEY`
- `COS_UPLOAD_PREFIX`

文档里可以说明这些变量的用途，但不要写真实值。

## 推荐目录前缀

如果当前想最快落地，沿用同一个腾讯云账号甚至同一个 bucket 都可以，但前缀必须和 `koa-rent` 明确区分。

推荐使用：

- 开发：`car-platform-dev/`
- 预发：`car-platform-preprod/`
- 生产：`car-platform-prod/`

不建议继续沿用：

- `rent-dev/`
- `rent-preprod-*`
- `rent-prod/`

## 对象路径建议

对象 key 建议在环境前缀后继续分业务目录，例如：

```text
car-platform-dev/orders/{orderId}/vehicle-photos/2026/04/{uuid}.jpg
car-platform-dev/orders/{orderId}/attachments/2026/04/{uuid}.pdf
car-platform-dev/customers/{customerId}/avatar/2026/04/{uuid}.png
car-platform-dev/operator-tasks/{taskId}/onsite-photos/2026/04/{uuid}.jpg
```

这样做有几个直接好处：

- 从路径一眼能看出对象属于哪个项目
- 后续清理、迁移、限权和排障更方便
- 即便共用 bucket，也不容易和其他项目串目录

## 文档落位原则

COS 相关信息默认分两层记录：

- 稳定约定写在本文件
- 单次远端改动、补签名、换前缀、改策略等操作，写进后续部署或运维记录

本文件适合记录：

- 用哪些环境变量
- 推荐什么前缀
- 对象路径怎么命名
- 哪些内容禁止写进仓库

不适合记录：

- 真实 `COS_SECRET_ID`
- 真实 `COS_SECRET_KEY`
- 临时签名值
- 带读写能力的控制台链接

## 给 `car` 项目的最小落地建议

如果你现在只是想让 `car` 也能尽快接入 COS，最小可行方案是：

1. 保持和 `koa-rent` 一样的变量名，减少接线心智负担。
2. 继续使用当前腾讯云账号或 bucket，但把 `COS_UPLOAD_PREFIX` 改成 `car-platform-dev/`。
3. 在 `car` 的本地 `.env` 或 IDE 运行配置里填真实值，不写进 `docs`。
4. 后端统一返回对象引用或最终 URL，不在数据库里长期存大体积 base64。

## 后续再升级时的建议

当 `car` 进入更稳定阶段后，再考虑以下增强：

- 给 `car` 单独开 bucket
- 给 `car` 单独配置 CAM 策略，只允许访问 `car-platform-*` 前缀
- 区分公开读和私有读的文件类型
- 补上传签名接口和对象引用规范
