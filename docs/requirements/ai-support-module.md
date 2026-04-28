# AI 客服模块接入要求

## 目标

这份文档用于收口 `car` 项目“客户侧 AI 客服模块”的接入要求，服务当前已上线的客户侧客服页面，并为硅基流动等 OpenAI 风格 AI 平台提供统一的前后端边界、接口契约与配置约定。

当前阶段目标不是一次性做完整智能客服平台，而是先把“客户提问 -> backend 代理 AI -> 返回答复 -> 必要时升级专业客服”这条最小闭环跑通并保持可回退。

## 当前范围

- 当前已存在客户侧客服页面：
  - `apps/mobile/src/modules/customer/pages/CustomerSupportPage.vue`
  - `apps/mobile/src/modules/customer/pages/CustomerSupportContactPage.vue`
- 当前页面已改为调用 `apps/backend` 的 `/app/support/chat`，由 backend 代理第三方 AI 平台
- 前端保留请求失败兜底文案与专业客服入口，不直接持有第三方平台 key

## 总体边界

### 前端职责

- 展示 AI 聊天页、快捷问题、专业客服升级入口
- 维护当前会话 UI 状态，例如消息列表、轮次、是否展示大按钮
- 调用本项目 backend 的 AI 客服接口
- 不直接持有第三方平台 key

### Backend 职责

- 作为 AI 平台唯一调用方，统一代理第三方请求
- 管理模型名、key、超时、重试、降级与日志
- 对外提供稳定的项目内接口，不把第三方协议细节直接暴露给前端
- 根据业务规则决定是否建议升级到专业客服

### 第三方 AI 平台职责

- 负责生成文本答复
- 提供 token、模型、错误码等供应商原始信息
- 不直接暴露给 `apps/mobile`

## 接入原则

1. 真实 AI 请求必须走 `apps/backend`，不允许 `apps/mobile` 直连第三方。
2. 第一版默认先走非流式请求，优先把闭环跑通。
3. 前端只依赖项目内稳定响应格式，不依赖硅基流动的原始字段名。
4. AI 能力当前只做流程说明、材料说明、预约记录/进度引导，不直接承诺价格、政策结论或最终办理结果。
5. 即使 AI 不可用，页面也必须能正常展示“联系专业客服”。

## 推荐最小接口契约

### Request

```ts
type SupportChatRequest = {
  scene: "customer_support";
  userMessage: string;
  conversationId?: string;
  turnCount?: number;
  orderId?: string;
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
};
```

### Response

```ts
type SupportChatResponse = {
  reply: string;
  conversationId?: string;
  traceId?: string;
  model?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  escalation?: {
    showInlineProfessionalContact?: boolean;
    showLargeProfessionalContact?: boolean;
    reason?: string;
  };
};
```

## 字段要求

### 必填输入

- `scene`
  - 当前固定为 `customer_support`
  - 用于后续区分客户客服、后台助手、外勤助手等不同场景
- `userMessage`
  - 当前轮用户输入

### 建议输入

- `conversationId`
  - 用于后续承接轻会话或服务端会话存储
- `turnCount`
  - 用于辅助升级专业客服判断
- `history`
  - 当前阶段可选；若后续模型需要更完整上下文，可逐步启用
- `orderId`
  - 当用户从订单详情或预约记录进入客服时可携带，便于后续更精准答复

### 必填输出

- `reply`
  - 返回给前端展示的主答复文本

### 建议输出

- `traceId`
  - 用于定位一次 AI 请求
- `model`
  - 当前使用的模型名
- `usage`
  - 便于后续统计成本
- `escalation`
  - 由 backend 返回升级专业客服建议，减少前端写死业务规则

## 升级专业客服规则

### 当前前端兜底规则

- 第一轮答复后显示小号“联系专业客服”
- 超过三轮答复后显示大号“联系专业客服”

### 正式接入后建议规则

除轮次外，backend 还应支持以下命中即提前升级：

- 用户明确要求人工客服
- 涉及订单异常、预约记录异常、拖车时间协调
- 涉及价格争议、补贴争议、资料缺失
- AI 无法判断或多轮答非所问

建议通过响应中的 `escalation` 返回，而不是把所有判断都继续硬编码在前端。

## 配置要求

当前先只约定变量名和用途，不记录真实值。

### 必要配置项

- `AI_SUPPORT_PROVIDER`
  - 当前建议预留为 `siliconflow`
- `AI_SUPPORT_BASE_URL`
  - 第三方平台基础地址
- `AI_SUPPORT_API_KEY`
  - 单 key 模式时使用
- `AI_SUPPORT_MODEL`
  - 默认模型名
- `AI_SUPPORT_TIMEOUT_MS`
  - 请求超时

### 可扩展配置项

- `AI_SUPPORT_API_KEYS`
  - 多 key 模式时使用，支持 key 池
- `AI_SUPPORT_MAX_RETRIES`
  - 单次请求最大重试次数
- `AI_SUPPORT_FALLBACK_MODEL`
  - 主模型不可用时的回退模型
- `AI_SUPPORT_ENABLE_STREAM`
  - 后续若切流式输出可显式控制
- `AI_SUPPORT_LEVEL1_ALLOWLIST`
  - 复用共享 runtime 的模型分级路由时，用于声明普通 key 可走的模型列表
- `AI_SUPPORT_FALLBACK_API_KEYS`
  - 复用共享 runtime 的 fallback key 池时使用

## Key 与安全要求

- 第三方平台 key 只允许出现在 backend 环境变量，不允许写入前端代码
- 仓库文档只记录变量名，不记录真实 key
- 日志中不记录完整用户身份证、手机号、详细地址等敏感原文
- 若记录请求样本用于排障，应先做脱敏

## 错误处理与降级要求

### Backend 侧

- 统一处理第三方超时、鉴权失败、额度不足、网络异常
- 对前端返回项目内统一错误结构或可兜底的默认文案
- 若后续启用 key 池，遇到供应商额度或鉴权错误时允许切下一个 key 重试

### Frontend 侧

- 当 AI 接口失败时，至少展示：
  - “当前智能客服暂时不可用”
  - “联系专业客服”入口
- 不因为 AI 失败导致整个客服页空白或卡死

## 会话策略

- 第一版建议采用“轻会话”策略：
  - 会话仅围绕当前页面短历史
  - 不强求长期记忆
  - `conversationId` 先预留
- 若后续需要真正会话持久化，再补：
  - 会话表
  - 过期策略
  - 审计与脱敏策略

## 观测与排障要求

建议 backend 至少记录：

- `traceId`
- 请求开始时间与耗时
- 使用模型名
- 是否命中重试
- 是否触发升级专业客服
- 第三方错误码或错误摘要

这样后续接入真实平台后，才有足够线索定位“答非所问”“超时”“模型不可用”等问题。

## 与当前前端页面的对接要求

当前接入已优先复用现有页面和路由：

- `apps/mobile/src/modules/customer/pages/CustomerSupportPage.vue`
- `apps/mobile/src/modules/customer/pages/CustomerSupportContactPage.vue`
- `apps/mobile/src/modules/customer/pages/supportChat.ts`

已完成替换顺序为：

1. 保留页面结构与“联系专业客服”入口
2. 用 backend AI 接口替换 `supportChat.ts` 的本地答复逻辑
3. 将升级规则逐步从前端收口到 backend 响应，前端只保留失败兜底

## 当前未定项

以下内容仍待按真实环境资料补齐或验证：

- 真实请求 URL / path
- 鉴权方式
- 模型名
- 生产环境是否继续使用硅基流动 OpenAI 风格 `/chat/completions`
- 是否启用流式返回
- 是否使用单 key 还是 key 池，以及 fallback key 池策略
- 是否需要模型 fallback

## 后续升级条件

当以下信息明确后，建议把本文件升级为正式实现 spec：

- 硅基流动真实 API 调用方式已明确
- key 管理方式已明确
- 模型与超时策略已明确
- 是否需要流式输出已明确
- 是否需要后端持久化会话已明确

在那之前，本文件应作为“接入要求 + 协作契约”使用，而不是实现细节 spec。
