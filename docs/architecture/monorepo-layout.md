# Monorepo 目录规划

## 当前结构

```text
apps/
  backend/
  mobile/
packages/
  shared-types/
docs/
```

## 后续预留结构

```text
apps/
  admin-web/
packages/
  api-sdk/
  shared-utils/
```

## apps 目录

### `apps/backend`
- Koa 服务端
- 负责订单、估价、状态流转、附件、时间线、后台账号

### `apps/mobile`
- 当前统一移动端应用
- 内部分为 `customer` 与 `operator` 两个角色分区
- 当前负责品牌展示、预约表单、订单查询、FAQ、客服入口、移动执行补充流程

### `apps/admin-web`
- 后续预留的 PC 运营后台
- 负责订单列表、详情审核、估价、调度、配置、查询类重操作

## packages 目录

### `packages/shared-types`
- 放跨端共享且稳定的类型
- 例如订单状态枚举、核心 DTO、附件类型、角色类型

### `packages/api-sdk`
- 后续在两端以上稳定复用接口封装时再补
- 避免在启动期为“未来可能复用”提前抽象

### `packages/shared-utils`
- 后续在两端以上稳定复用工具函数时再补
- 不放页面组件，不放强业务流程，不放只服务单端的临时逻辑

## 什么时候留在应用内

以下内容优先留在各自应用内部：

- 只被一个端使用的页面组件
- 只服务某个页面流程的状态管理
- 强依赖浏览器、桌面或移动能力的交互实现
- 还在快速试错、边界尚未稳定的功能

## 什么时候抽到共享层

满足下面两个条件时，再考虑上提到 `packages/*`：

1. 至少两个应用真实复用
2. 结构和语义已经比较稳定，不会一周改三次名字

## 当前阶段提醒

当前仓库已经落地 `apps/mobile`、`apps/backend` 与 `packages/shared-types`。因此本文件优先描述当前真实结构，同时保留 `admin-web` 和其他共享层的后续预留，不再把中央文档写成过期目标图。
