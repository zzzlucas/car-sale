# 开发协作流程

## 当前阶段原则

项目还在启动期，默认追求“结构清楚、规则够用、迭代轻快”，不提前上过重治理。

## 推荐工作顺序

1. 先固定产品主链路和状态语义
2. 再搭后端对象、接口和共享类型
3. 再接 `apps/mobile` 的客户侧主链路
4. 再补 `apps/mobile` 的 `operator` 执行闭环
5. 最后再评估是否补 `apps/admin-web`

这样更容易让当前真实存在的应用围绕同一套业务协议发展，而不是先写一堆未来端，再回头收主链路。

## 应用内闭环优先

默认优先在单个应用内闭环，特别是以下场景：

- 页面还在快速试错
- 只被一个端使用
- 交互强依赖当前端的设备形态

## 何时抽共享

满足以下条件时，再考虑抽到 `packages/*`：

1. 两个以上应用真实复用
2. 名称、字段和边界已经稳定
3. 抽出后不会让阅读成本明显上升

## 共享层建议

- `packages/shared-types`
  - 状态枚举、核心 DTO、角色类型、字段字典
- `packages/api-sdk`
  - 请求客户端、接口路径、响应类型、公共错误处理
- `packages/shared-utils`
  - 日期格式化、字段转换、弱业务辅助函数

## 文档同步规则

以下变化需要同步更新文档：

- 新增或调整应用目录
- 修改三端职责边界
- 修改核心数据对象
- 修改统一状态语义
- 改变 `apps/mobile` 客户侧与 `uni-app` 的路线判断
- 新增、调整对象存储目录前缀或共享云资源命名空间

## 当前可用命令

当前根目录已经建立以下工作区脚本：

- `pnpm dev:mobile`
- `pnpm build:mobile`
- `pnpm typecheck:mobile`
- `pnpm dev:backend`
- `pnpm build:backend`
- `pnpm typecheck:backend`
- `pnpm typecheck:shared-types`

这些脚本已经可以直接作为开发和验证入口使用。

## 后续命令收口建议

等 `apps/admin-web`、自动化测试和更多共享层进入稳定阶段后，再考虑统一收口为：

- `pnpm dev`
- `pnpm build`
- `pnpm test`
