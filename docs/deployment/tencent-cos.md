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

## 当前推荐接线

车辆估价图片上传，默认采用“前端直传 COS，后端只签发票据并存对象引用”的方式：

1. 客户端先请求 `POST /app/valuation-orders/photos/upload-ticket`
2. 后端返回带签名的 `PUT` 上传地址、请求头和 `cos://...` 对象引用
3. 客户端直接把文件 `PUT` 到 COS
4. 提交订单时只把 `cos://...` 引用写入 `vehiclePhotos`
5. 后端返回订单详情或进度时，再把对象引用转换为可预览 URL

这样做的好处是：

- 后端不再中转图片二进制，链路更轻
- 数据库里只存轻量引用，不混入大字段
- 同一个对象引用后续可以按权限策略切换为签名读或公开读

## COS CORS 提醒

如果前端要直接从浏览器上传到 COS，bucket 侧还需要补齐 CORS；否则本地联调时即使签名接口正常，浏览器也可能因为跨域直接失败。

建议至少放行：

- 方法：`PUT`、`GET`、`HEAD`、`OPTIONS`
- 请求头：`Content-Type`
- 来源：当前移动端开发域名和后续正式域名

如果后续改成更多自定义头，也要同步更新 COS 的允许请求头配置。

## 后续再升级时的建议

当 `car` 进入更稳定阶段后，再考虑以下增强：

- 给 `car` 单独开 bucket
- 给 `car` 单独配置 CAM 策略，只允许访问 `car-platform-*` 前缀
- 区分公开读和私有读的文件类型
- 补上传签名接口和对象引用规范
