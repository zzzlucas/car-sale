# Customer Order Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让客户预约表单、图片上传、订单记录与进度页全部走真实后端链路，形成可体验的最小闭环。

**Architecture:** 共享类型先扩容订单字段；后端新增预约订单实体与 visitorKey 过滤；移动端补全表单、图片上传、错误处理与真实数据展示。地图先落地址文本与经纬度，不先接第三方 SDK。

**Tech Stack:** Vue 3、Vite、TypeScript、Vitest、Midway、TypeORM、Jest

---

### Task 1: 锁定闭环字段与测试入口

**Files:**
- Modify: `packages/shared-types/src/order.ts`
- Test: `apps/backend/src/modules/app/service/order.test.ts`
- Test: `apps/mobile/src/services/orders.test.ts`
- Test: `apps/mobile/src/modules/customer/pages/CustomerValuationPage.test.ts`

- [ ] 写后端失败测试，明确提交后会生成真实订单、列表按访客隔离、详情返回预约快照
- [ ] 写移动端失败测试，明确订单接口不再静默回退 mock，表单源码包含缺失字段与真实提交入口
- [ ] 跑相关测试，确认当前实现失败点正确

### Task 2: 实现后端订单真实存储

**Files:**
- Create: `apps/backend/src/modules/app/entity/valuationOrder.ts`
- Modify: `apps/backend/src/entities.ts`
- Modify: `apps/backend/src/modules/app/service/order.ts`
- Modify: `apps/backend/src/modules/app/controller/app/order.ts`

- [ ] 新增预约订单实体，保存表单快照、timeline、visitorKey
- [ ] 改造订单 service 为 repository 驱动，生成订单号、初始 timeline 和 summary/detail 映射
- [ ] 增加明确的图片上传接口，供移动端上传车辆照片
- [ ] 跑后端测试，确认真实数据链路通过

### Task 3: 实现移动端真实预约页

**Files:**
- Create: `apps/mobile/src/modules/customer/pages/customerValuationForm.ts`
- Create: `apps/mobile/src/services/upload.ts`
- Create: `apps/mobile/src/services/visitor.ts`
- Modify: `apps/mobile/src/modules/customer/pages/CustomerValuationPage.vue`
- Modify: `apps/mobile/src/services/orders.ts`
- Modify: `apps/mobile/src/services/api.ts`

- [ ] 先写表单初始化与校验相关失败测试
- [ ] 补全字段、文件选择、定位入口、错误提示和重置逻辑
- [ ] 实现图片上传与 visitorKey 透传
- [ ] 提交成功后跳转真实进度页

### Task 4: 改造记录页与进度页

**Files:**
- Modify: `apps/mobile/src/modules/customer/pages/CustomerRecordsPage.vue`
- Modify: `apps/mobile/src/modules/customer/pages/CustomerProgressPage.vue`

- [ ] 去掉硬编码展示数据，全部改读后端返回值
- [ ] 增加空态、失败态与预约快照信息展示
- [ ] 让提交后的新订单能在记录页与进度页直接看到

### Task 5: 验证

**Files:**
- Modify: `packages/shared-types/src/order.ts`
- Modify: `apps/backend/src/modules/app/service/order.ts`
- Modify: `apps/mobile/src/modules/customer/pages/CustomerValuationPage.vue`

- [ ] 运行 `pnpm --filter @car/backend test`
- [ ] 运行 `pnpm --filter @car/mobile test`
- [ ] 运行 `pnpm --filter @car/backend typecheck`
- [ ] 运行 `pnpm --filter @car/mobile typecheck`
- [ ] 如运行环境允许，做一次本地手工提交订单验证
