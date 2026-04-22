# API 与数据约定

## 接口分组建议

推荐按角色和能力分组，而不是按前端项目名硬拆三份重复接口：

- `/api/customer/*`
  - 面向 `customer-h5`
  - 例如预约提交、订单查询、FAQ、客服入口相关能力
- `/api/operator/*`
  - 面向 `admin-web` 与 `admin-h5`
  - 例如订单处理、估价确认、调度安排、附件上传、状态推进
- `/api/admin/*`
  - 面向系统配置和后台管理能力
  - 例如角色管理、基础配置、运营参数

这意味着 `admin-web` 与 `admin-h5` 默认共享同一套操作端业务接口，只在表现层和能力开口上区分，不为“设备不同”强行分出两套后端模型。

## 返回结构建议

推荐统一响应包裹结构：

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "requestId": "trace-id"
}
```

建议约定：

- `code = 0` 表示成功
- `message` 用于人类可读说明
- `data` 承载业务内容
- `requestId` 用于日志追踪和排障

## 核心数据对象

### `customer`
- 客户姓名
- 手机号
- 身份证或证件相关信息

### `vehicle`
- 车辆品牌
- 车辆型号
- 车牌号
- VIN / 车架号
- 整备质量
- 手续信息
- 车辆照片

### `scrap_order`
- 订单号
- 客户信息
- 车辆信息
- 来源渠道
- 当前状态
- 当前负责人
- 预约时间

### `valuation`
- 系统初估结果
- 人工确认估价
- 估价备注
- 操作人

### `pickup_task`
- 任务时间
- 地点
- 负责人
- 联系方式
- 执行备注

### `order_timeline`
- 时间点
- 状态
- 操作说明
- 操作人

### `attachment`
- 车辆照片
- 证件照片
- 现场凭证
- 回收证明
- 注销证明

### `operator_user`
- 管理员
- 客服 / 内勤
- 外勤 / 拖车 / 现场执行人员

## 统一订单状态

三端共享以下底层状态值：

- `submitted`
- `contacted`
- `quoted`
- `scheduled_pickup`
- `picked_up`
- `dismantling`
- `deregistration_processing`
- `completed`
- `cancelled`

界面展示时可以按角色转换成更友好的中文文案，但数据库、接口和共享类型层面应保持这组值一致。

## 一个重要边界

客户端展示进度时，优先依赖 `scrap_order.currentStatus` 和 `order_timeline`。不要让前端自己通过零散字段推导“当前到底走到哪一步”，否则三端很难长期保持一致。
