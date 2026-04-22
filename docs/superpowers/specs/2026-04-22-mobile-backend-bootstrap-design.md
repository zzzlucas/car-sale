# 移动端与后端首期建设设计

## 背景

当前仓库已经完成项目级文档骨架，但真正的工程实现还未开始。结合现有设计稿、业务目标和技术取舍，首期实现将不再按 `customer-h5` 与 `admin-h5` 拆成两个独立移动应用，而是统一收口为一个移动端应用：

- `apps/mobile`
  - 当前以 `Vue 3 + TypeScript + Vite` 作为 H5 形态开发
  - 内部分为 `customer` 和 `operator` 两个角色分区
  - 后续可作为统一移动端基座演进到小程序
- `apps/backend`
  - 使用 `cool-admin-midway`
  - 提供客户侧真实接口，并为移动运营端能力预留接口边界
- `apps/admin-web`
  - 后续接入 `cool-admin-vue`
  - 不纳入本轮实现

本轮目标不是一次性把整个平台全部做完，而是优先跑通“客户预约报废车 -> 查看进度”的主链路，同时把移动运营端和后台体系的技术边界固定下来，减少后续返工。

## 目标

本轮设计需要支撑以下目标：

1. 初始化 `apps/mobile`，完成客户侧页面、路由、主题和 service 层。
2. 统一移动端工程结构，为 `operator` 分区预留入口和布局。
3. 初始化 `apps/backend`，提供客户侧真实 API。
4. 预埋手机号 + 验证码登录的后端结构，但当前前台仍以游客态 + 示例订单查询跑通主链路。
5. 建立 `packages/shared-types`，统一订单状态、核心 DTO 和内容接口类型。
6. 保持 `apps/admin-web` 的技术路线清晰，但不展开实现。

## 非目标

本轮明确不做以下事情：

- 不实现完整 `admin-web`
- 不展开完整 `operator` 业务页
- 不接真实短信服务
- 不接在线支付
- 不接车管所或政务系统
- 不落地完整权限后台
- 不在本轮实现多租户 SaaS 能力

## 应用结构决策

## 1. 使用 `apps/mobile` 而不是 `apps/mobile-h5`

目录命名使用 `apps/mobile`，原因如下：

- 当前是 H5，不代表未来永远只输出 H5
- 后续目标明确包含小程序方向
- 若目录名写死为 `mobile-h5`，未来迁移时语义会变得别扭
- `mobile` 更适合承载“当前 H5 开发、后续可跨端演进”的长期定位

## 2. `apps/mobile` 内部分区，而不是拆双应用

移动端应用内部按角色分区：

- `customer`
  - 面向客户
  - 负责首页、估价预约、进度查询、流程说明、我的、客服
- `operator`
  - 面向移动运营/外勤
  - 负责待办任务、快查订单、电话联系、拍照上传、快捷状态推进

不把它们拆成两个独立移动应用，原因如下：

- 两类角色会共享大量移动端能力，如安全区、上传、状态卡片、电话拨号、地图跳转
- 统一应用更利于后续小程序演进
- 当前项目处于启动期，拆双应用会增加路由、构建、共享层和后续同步成本

但两者必须保持严格的入口、导航和权限边界，不允许在页面层面“自然混住”。

## 3. 后端使用 `cool-admin-midway`

`apps/backend` 使用 `cool-admin-midway` 的主要原因：

- 适合中后台、管理模型、上传、用户、角色、菜单、扩展模块的长期演进
- 比纯手搭 Koa 更快拿到后台基础设施
- 未来与 `apps/admin-web` 使用 `cool-admin-vue` 更容易保持风格和能力兼容

本轮虽然主要服务移动端客户侧接口，但后端仍按未来可接后台管理的方式组织。

## 4. `apps/admin-web` 技术路线锁定但暂缓

`apps/admin-web` 后续使用 `cool-admin-vue`，但本轮只在设计和目录规划层面保留其位置，不投入页面建设。这样可以避免本轮工作被 PC 后台分散注意力。

## 首期仓库结构

本轮落地以以下目标结构为准：

```text
apps/
  mobile/
  backend/
packages/
  shared-types/
  api-sdk/
  shared-utils/
docs/
```

其中：

- `apps/mobile` 本轮真实实现
- `apps/backend` 本轮真实实现
- `packages/shared-types` 本轮真实实现
- `packages/api-sdk` 与 `packages/shared-utils` 若实现过程确有必要则一并初始化，否则至少保持目录规划一致

## `apps/mobile` 结构设计

推荐结构如下：

```text
apps/mobile/
  src/
    app/
      router/
      layouts/
      providers/
    modules/
      customer/
      operator/
      common/
    services/
    stores/
    styles/
    utils/
```

### `app/router`

负责统一路由注册，至少包含：

- `/customer`
- `/customer/valuation`
- `/customer/progress/:orderId`
- `/customer/guide`
- `/customer/me`
- `/customer/support`
- `/operator`

### `app/layouts`

负责按角色拆布局：

- `customer` 布局偏品牌展示和服务流程
- `operator` 布局偏任务视图和快捷操作

### `modules/customer`

首期完整实现，页面来源与设计稿映射如下：

- 首页：`.temp/stitch_/_7/code.html`
- 车辆估价评估：`.temp/stitch_/_2/code.html`
- 订单进度追踪：`.temp/stitch_/_3/code.html`
- 报废流程指南：`.temp/stitch_/_4/code.html`
- 我的：`.temp/stitch_/_5/code.html`
- 在线客服：`.temp/stitch_/_6/code.html`

### `modules/operator`

本轮仅预留：

- 路由组
- 布局
- 1 个占位首页

不在本轮实现完整业务页，但代码结构上必须预留未来扩展位置。

### `modules/common`

放移动端通用能力，例如：

- 状态标签
- 订单卡片
- 空态组件
- 底部导航
- 通用表单块
- 上传入口

## `apps/mobile` 页面与交互范围

### 客户侧页面

#### 1. 首页

展示品牌主张、服务优势、流程简介、FAQ 入口和主 CTA，主要承担客户信任建立与引流到估价页。

#### 2. 车辆估价评估页

实现真实的前端状态流：

- 车辆类型
- 品牌型号
- 是否保留车牌
- 车辆整备质量
- 后续可扩展的照片与资料步骤

本轮允许按首版设计稿先完成第一阶段表单与提交流程，不强行补完复杂多步骤上传。

#### 3. 订单进度页

展示：

- 当前状态卡
- 时间线
- 车辆信息
- 联系客服入口

页面数据需要能够同时兼容：

- 示例订单查询
- 后续真实登录后按客户身份查询

#### 4. 流程说明页

展示平台服务流程、材料说明与 FAQ。

#### 5. 我的

当前先以游客态为主，展示：

- 示例订单入口
- 我的预约列表
- 报废进度入口
- 地址管理占位
- 常见问题和客服入口

#### 6. 在线客服

当前先做帮助入口和联系方式展示，不接真实 IM。

### 移动端能力要求

- 支持移动安全区
- 有统一的主题变量和颜色体系
- 表单、按钮、卡片和底部导航风格与设计稿保持一致
- 页面间跳转完整可用
- 支持真实 API 与 mock fallback 切换

## `apps/backend` 首期范围

## 1. 面向客户侧的接口

首期接口收口如下：

- `POST /app/valuation-orders`
  - 提交车辆估价/预约
- `GET /app/valuation-orders/:id`
  - 获取订单详情
- `GET /app/valuation-orders/:id/progress`
  - 获取订单进度和时间线
- `GET /app/me/valuation-orders`
  - 获取我的预约列表
- `GET /app/content/service-guide`
  - 获取流程说明内容
- `GET /app/content/faqs`
  - 获取常见问题
- `GET /app/content/support`
  - 获取客服与帮助内容

## 2. 面向 `operator` 的预留接口

本轮只预留一个轻量入口：

- `GET /operator/dashboard`

用途仅为后续占位页联调，不在本轮展开完整业务流。

## 3. 手机号 + 验证码登录预埋

后端预埋以下接口或等价结构：

- `POST /auth/mobile/send-code`
- `POST /auth/mobile/login`

但当前阶段：

- 不接真实短信渠道
- 可以返回开发态验证码或模拟通过
- `apps/mobile` 客户侧主链路不强依赖真实登录才能跑通

这样既能为未来手机号登录留接口，又不会卡住本轮开发。

## 核心数据对象

本轮至少围绕以下对象设计后端 DTO 和共享类型：

- `customer`
- `vehicle`
- `scrap_order`
- `order_timeline`
- `attachment`
- `support_content`

如果实现中确有必要，也可以补充：

- `mobile_auth_session`
- `operator_dashboard_summary`

## 统一状态语义

移动端和后端继续沿用已确定的统一状态：

- `submitted`
- `contacted`
- `quoted`
- `scheduled_pickup`
- `picked_up`
- `dismantling`
- `deregistration_processing`
- `completed`
- `cancelled`

页面展示文案可以更友好，但共享类型、接口和存储层要统一使用这组值。

## 游客态与登录态策略

### 当前策略

本轮客户侧主链路以“游客态 + 示例订单查询”跑通。

这意味着：

- 首页、流程说明、客服、FAQ 无需登录
- 估价预约允许以游客身份提交
- “我的预约”和“进度查询”当前可以展示示例订单数据或轻量查询结果

### 未来策略

后续切换到真实手机号登录时：

- 页面结构不需要推翻重写
- service 层只需要从游客态查询切换到登录态查询
- 后端登录预埋接口可以继续扩展为真实短信登录

## `packages/shared-types` 范围

首期 `shared-types` 至少包含：

- 订单状态枚举
- 客户侧内容 DTO
- 预约提交 DTO
- 订单详情 DTO
- 订单进度 DTO
- FAQ DTO
- 客服内容 DTO

这样可以让 `apps/mobile` 和 `apps/backend` 从第一天起就共享协议，而不是各自手写一份接口类型。

## 验证要求

本轮完成后，至少需要满足以下验证：

1. `apps/mobile` 可以本地启动
2. 客户侧页面路由可访问
3. 估价页提交流程可跑通
4. 示例订单能进入进度页和“我的预约”
5. `apps/backend` 可以本地启动
6. 客户侧接口能返回可供前端消费的数据

当前不要求：

- 真实短信发送成功
- 真实支付链路
- 真实政务系统联调
- 完整后台权限管理闭环

## 风险与约束

### 风险 1：移动端角色边界被写混

虽然 `apps/mobile` 是统一应用，但 `customer` 与 `operator` 必须在模块、路由、布局和入口层面保持分离，否则后续会快速混乱。

### 风险 2：过早做完整运营端

本轮如果把 `operator` 业务页也一并做深，容易拖慢客户主链路上线速度。因此本轮只预留骨架，不展开完整业务流。

### 风险 3：把手机号登录做成当前阻塞项

本轮需要预埋手机号登录，但不允许它成为客户链路落地的前置依赖，否则会把开发节奏绑在短信、风控和验证码服务上。

### 风险 4：`cool-admin-midway` 过度侵入客户接口表达

后端使用 `cool-admin-midway`，但客户侧 API 不应被后台框架默认语义污染。对外接口仍需保持清晰、直接、面向移动端消费。

## 结论

本轮设计的最终结论如下：

1. 移动端统一收口为 `apps/mobile`，技术栈为 `Vue 3 + TypeScript + Vite`。
2. `apps/mobile` 内部分为 `customer` 和 `operator` 两个角色分区。
3. 本轮完整实现 `customer` 分区，仅为 `operator` 分区预留骨架。
4. 后端使用 `cool-admin-midway`，本轮重点提供客户侧真实 API。
5. 手机号 + 验证码登录只做接口和数据结构预埋，当前前端主链路先以游客态 + 示例订单查询跑通。
6. `packages/shared-types` 从第一天开始作为移动端与后端共享协议层。
