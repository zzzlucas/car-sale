# 项目需求记录

## 项目定位

本项目服务于报废机动车回收企业的自营预约业务，目标是让客户通过前端完成预约和进度查询，同时让内勤与外勤在统一系统里完成处理和执行。

## 当前活跃需求

### [REQ-PRJ-20260503-19] 公开 GitHub 快照不得包含真实 env
- 状态：`accepted`
- 优先级：`P0`
- 决策：
  - 当仓库、分支、压缩包或项目链接会提交给外部活动、供应商、评审或公开 GitHub 时，必须切换到公开快照口径：只保留代码、文档和 env example 模板，不包含任何真实 `.env` 文件
  - `.env`、`.env.local`、`.env.preprod`、`.env.production.local` 及 `apps/**` 下对应真实 env 默认不进入公开 GitHub；`.env.example`、`apps/**/.env.example`、`apps/**/.env.*.example` 继续保留
  - 私有开发协作中的非生产便捷口径仍可作为本地或私有仓库策略；但公开外发场景优先级更高，非生产 key、数据库密码、地图 key、COS key 和 AI provider key 都按敏感信息处理
  - 若真实 env 曾进入 Git 历史，公开时优先使用无历史快照、orphan 分支或新公开仓库，不直接公开原历史
  - 公开前以 `git ls-files "*.env*"` 做最小检查，结果应只剩 example 模板
- 原因：本项目现在需要把 GitHub 链接提交给外部活动申请赠送 token。活动审核只需要看到项目代码和配置清单，不需要真实非生产凭据；把真实 env 从公开快照中剥离可以降低密钥、数据库和对象存储误暴露风险，同时不影响本地继续用真实 env 开发。

### [REQ-PRJ-20260429-18] 客户 H5 埋点先复用采集协议，但保持 `car` 独立命名空间
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `apps/mobile` 埋点参考 `decorate/demo` 的 `/collect` 采集协议、设备 ID、签名头、本地默认禁发和页面停留事件
  - `car` 不复用 `decorate` 的事件名、设备前缀或前端 env，统一使用 `VITE_CAR_ANALYTICS_*`、`car-` 设备前缀和 `5100` 事件号段
  - 采集请求同时在顶层和 payload 内带 `project: "car"`、`app: "car-mobile"`、`env`、`site`、`route`；dashboard 以这些字段作为项目/应用/环境隔离主键，事件号段只做防撞和辅助排查
  - dashboard URL 的 `key` 只代表读取权限；`project/app/env/site` 可以作为视图过滤 query，例如 `/dashboard-read?key=...&project=car&app=car-mobile&env=preprod`
  - 页面分析默认看规范化 `route`，例如 `/customer/progress/:orderId`；query 只保留 `utm_*`、`channel` 等归因参数，不用于项目隔离，也不保留订单号、token 等高基数字段
  - 同一个 dashboard 只适合 MVP、同一负责人、低成本观察阶段；一旦进入甲方演示复盘、正式投放或需要多人看板，应为 `car` 单独建 dashboard/view，并默认固定过滤 `project=car&app=car-mobile`
- 原因：复用采集服务能减少首期接入成本，但混用 dashboard 容易让不同项目的转化、留存和异常数据串台，后续解读成本高于现在多做一层命名空间隔离。

### [REQ-PRJ-20260428-17] 预发布根命令必须同时发布 backend 与 mobile H5 静态站点
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `pnpm deploy:preprod` 不再只发布 backend，而是先执行 `pnpm deploy:preprod:backend`，再执行 `pnpm deploy:preprod:mobile`
  - `pnpm deploy:preprod:mobile` 负责以 `VITE_API_BASE_URL=/api` 构建 `apps/mobile`，并把 `apps/mobile/dist` 同步到 `/srv/nginx/name10.lucasishere.top`
  - `pnpm deploy:check:preprod` 必须同时探活公网 H5 首页入口资源与 API，避免后端已更新但根站点仍停留在旧静态产物
- 原因：`https://name10.lucasishere.top/` 的页面效果来自 Nginx 静态目录，不来自 backend 进程；如果根部署命令只重启后端，用户看到的 H5 仍会是旧构建产物。

### [REQ-PRJ-20260428-16] 客户侧品牌型号选择先以内置车型目录 + 手填兜底落地
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `apps/mobile` 车辆估价表单的品牌型号字段采用“选择按钮 + 底部弹窗”作为主入口，保留输入框与“使用当前输入”作为停产、地方俗称或目录缺失车型的兜底
  - 车型目录第一版内置在前端，乘用车主体参考汽车之家公开车型大全，覆盖品牌与车系；同时补充微面、轻卡、皮卡、面包车、常见摩托车和电摩等报废业务高频老旧型号
  - 当前不把车型目录抽到 `packages/*`，也不新增后端车型表；待 `admin-web` 或 backend 出现稳定复用、需要运营维护或价格规则联动时，再考虑抽共享包或服务端化
  - 提交到 backend 的 `brandModel` 仍保持单字符串，避免首期订单接口和历史数据结构被过早拆字段
- 原因：报废车辆里老款、停产款和口头叫法很多，完全依赖新车目录会漏填；但首期核心是客户预约闭环，内置目录 + 手填兜底投入小、可离线、容易回滚，也不打断现有订单接口。

### [REQ-PRJ-20260426-15] 客户侧 AI 客服正式接入先走 backend 代理，并以流式最小闭环落地
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `apps/mobile` AI 客服页面只作为前端交互承载层，第三方 AI 统一走 `apps/backend` 代理，不允许前端直连供应商
  - 第一版真实 AI 接入采用 SSE 流式请求，已按“用户提问 -> backend 调 AI -> 增量返回答复 -> done 补齐最终响应 -> 必要时升级专业客服”的最小闭环落地
  - 前端与 backend 之间保留稳定的项目内接口契约，至少支持 `userMessage`、`conversationId`、`turnCount`、`delta`、`reply` 与升级专业客服信号
  - 第三方平台 key、模型名、超时、重试和 fallback 策略统一收口在 backend 配置，并使用仓库内 `packages/ai-provider-runtime` 提供的 `@workspace-packages/ai-provider-runtime` 处理 key 路由与 fallback；非生产真实配置可以随 `apps/backend/.env.local`、`apps/backend/.env.preprod` 入 Git，优先保障开箱可跑和客户演示完整
  - 预发布部署使用 `git archive` 只发布 `car` 仓库内容，因此 AI provider runtime 必须内聚到本仓 `packages/*` 并随部署先构建，不再依赖仓库外 `../_workspace-packages` 的 `file:` 链接
  - AI 客服当前只负责流程说明、材料说明、预约记录/进度引导；涉及订单异常、价格争议、资料缺失或人工诉求时，应允许升级到专业客服
- 原因：项目已经先做了前端客服页面，现在把真实 AI 调用收口到 backend 和共享 runtime，可以避免供应商 key 暴露到前端，也能让 `car` 轻量复用 `koa-rent` 沉淀出的 AI provider 基础设施，而不是复制完整业务任务中心。

### [REQ-PRJ-20260424-14] `car` 图片抠图批处理默认收口为 `openclaw + CPU-only rembg + Tailscale`
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `car` 项目的图片抠图批处理默认落在 `openclaw`，采用用户级 Python 安装的 CPU-only `rembg`
  - 默认访问方式走 `Tailscale` 虚拟局域网，不新增裸公网入口，也不把这条链路切到 DDNS / FRP
  - 运行目录统一为 `/mnt/ssd_data/car-tools/rembg`，默认通过 `http://<openclaw-tailscale-ip>:17000/api/remove` 调用
  - 默认模型先使用 `u2net`；若后续要试其他模型，优先走“本机下载模型再 `scp` 到远端”的方式，避免在 `openclaw` 上长时间卡 GitHub 下载
- 原因：当前项目确实需要一条可复用的抠图批处理能力，但这条链路又不值得单独开公网、上 GPU 或引入更重的部署编排。把能力收口到 `openclaw + Tailscale + CPU-only rembg` 后，投入最小、回滚简单，也更符合当前启动期“先把素材处理闭环跑起来”的节奏。

### [REQ-PRJ-20260423-12] `car` 后端正式运行方式收口为 `cloud2026 + pm2 + env-driven prod config`
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `car` 后端在 `cloud2026` 的正式运行方式默认收口为 `pm2` 单进程，不再把本地 `docker-compose.yml` 当成云上业务进程入口
  - 远端工作区目录统一为 `/srv/apps/car-platform/app`，备份目录统一为 `/srv/apps/car-platform/backups`
  - 生产配置由 `apps/backend/src/config/config.prod.ts` 通过进程环境变量或 `apps/backend/.env.production.local` 读取，不再保留模板默认数据库口径
  - `pm2` 服务名统一为 `car-platform-backend`
  - `NODE_ENV` 统一使用 `prod`，不继续混用 `production`
  - 预发布后端部署从 `git archive` 解包前先清理 `/srv/apps/car-platform/app` 下除根 `node_modules` 外的旧源码，并临时保留 `apps/backend/.env.production.local`，避免已从仓库删除的旧 `package.json` 继续被 pnpm workspace 识别
- 原因：当前项目最容易踩坑的地方，不是“不会部署”，而是运行方式、目录结构和生产配置入口还没统一。一旦 `config.prod.ts` 继续保留模板默认值、`pm2` 继续沿用 `cool-admin` 服务名、远端目录继续按单个 backend 裸目录理解，后面每次上云都会反复猜。先把这几件事收口，开发体验和后续 AI 协作都会稳很多。

### [REQ-PRJ-20260423-10] 域名规划采用“共享 DNS 边界 + 项目级 domain planning”两层分工
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - 阿里云 DNS 这类共享域名管理能力，其边界、权限留存原则和 TTL / 切换规则统一写到 `E:\web_work_-1\_workspace-base\ops`
  - `car` 项目仓库只负责记录自己的域名规划、未来切流步骤和回滚线索
  - `car` 当前阶段优先采用 `car.<domain>` + `admin.car.<domain>` 两个前端入口，并优先通过各自同域 `/api` 反代同一个 backend，不急着单独暴露 `api` 子域名
  - 真实阿里云账号密码、`AccessKey`、`RAM` 密钥不写入仓库文档，只记录变量名和获取路径
- 原因：如果把 DNS 管理能力完全写在项目仓库里，后续多个项目一多就会重复维护；反过来如果把某个项目具体用哪个域名、这次怎么切也都塞到共享层，项目侧又会失去可执行入口。拆成“共享 DNS 边界 + 项目级 domain planning”两层后，后面让 AI 帮忙部署、配域名、切流会更稳，也更不容易误把真实密钥写进仓库。

### [REQ-PRJ-20260423-09] `docs/deployment/` 增加项目级 playbooks 层，收口部署、回滚与当前阻塞项
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `car` 的 `docs/deployment/` 下新增 `playbooks/` 目录，作为项目级部署和回滚手册入口
  - 共享主机事实、共享脚本与跨项目运维规则继续看 `E:\web_work_-1\_workspace-base\ops`
  - `cloud2026-backend-deploy.md` 需要明确写出当前真正可执行的步骤，以及 `config.prod.ts`、本地模板 `docker-compose.yml` 还不能直接当正式部署基线的风险
  - `h5-release.md` 需要明确 `apps/mobile/dist` 是唯一发布产物，且正式发布前必须显式设置 `VITE_API_BASE_URL`
- 原因：当前仓库已经有 `cloud2026`、COS 和开发联调约定，但缺少“真正准备发布时先看哪页”的项目级入口，导致后续让 AI 协助部署时很容易误把本地模板或别的项目经验当成 `car` 的正式路径。补一层 `playbooks` 后，可以把共享层、项目层和当前阻塞项一次说清楚，开发体验会稳很多。

### [REQ-PRJ-20260423-11] 客户侧地图能力先走 backend 代理 + 高德 Key 池，不在前端直出 Key
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `apps/mobile` 首期只落“地址搜索建议 + 经纬度回填”，不直接上完整嵌入地图页
  - 客户侧地图请求统一走 `apps/backend` 代理接口，不在前端直出地图 Key
  - 地图 provider 通过 `MAP_SERVICE_PROVIDER=tianditu|amap` 切换，默认使用 `tianditu`
  - 天地图 Key 池通过 `TIANDITU_WEB_SERVICE_KEYS` 注入，并兼容单 Key 配置 `TIANDITU_WEB_SERVICE_KEY`
  - 高德中转站作为显式回退 provider 保留，通过 `AMAP_WEB_SERVICE_KEYS` 和 `AMAP_WEB_SERVICE_PROXY_*` 配置
  - 线上遇到 `USERKEY_PLAT_NOMATCH` / `10009` 时，优先按中转站变量是否缺失排查，不把该问题归因到前端 H5
  - backend 侧按池内顺序尝试 Key；遇到额度、鉴权或网络异常时切下一个 Key 兜底
- 原因：当前项目还处于低成本验证阶段，优先保证预约页地址搜索能闭环，同时把 Key 暴露面和后续替换成本压到最低。

### [REQ-PRJ-20260422-01] 当前以 `mobile + admin-web + backend + shared-types` 作为真实落地基线
- 状态：`accepted`
- 优先级：`P0`
- 决策：当前仓库以 `apps/mobile`、`apps/admin-web`、`apps/backend`、`packages/shared-types` 作为真实落地基线；`packages/api-sdk`、`packages/shared-utils` 继续保留为后续扩展
- 原因：客户 H5 主链路与后台订单处理链路都已经进入真实联调阶段，`admin-web` 不再只是预留目录，而是承担 PC 侧登录、订单查询、详情查看和状态流转的实际入口

### [REQ-PRJ-20260422-02] `apps/mobile` 客户侧先 H5，后评估 `uni-app`
- 状态：`accepted`
- 优先级：`P0`
- 决策：`apps/mobile` 首期先以 `Vue 3 + Vite + TypeScript` 做 H5，并在其中承载客户侧主链路；待业务模型稳定后再评估是否把客户侧迁到 `uni-app`
- 原因：项目启动期更需要快速联调和快速收敛业务边界，暂不引入跨端运行时约束

### [REQ-PRJ-20260422-03] `v1` 范围收口
- 状态：`accepted`
- 优先级：`P0`
- 纳入范围：
  - 客户预约报废车
  - 后台接单、联系、报价、安排拖车
  - 移动运营端执行现场任务
  - 客户查看订单进度与联系客服
- 暂不纳入：
  - 在线支付
  - 政务/车管所自动对接
  - 多租户 SaaS
  - 复杂 CRM 和营销体系

### [REQ-PRJ-20260422-04] 统一状态口径
- 状态：`accepted`
- 优先级：`P0`
- 决策：三端统一使用以下底层订单状态值：
  - `submitted`
  - `contacted`
  - `quoted`
  - `scheduled_pickup`
  - `picked_up`
  - `dismantling`
  - `deregistration_processing`
  - `completed`
  - `cancelled`
- 原因：进度展示、后台管理、移动执行和后续统计都依赖一致口径

### [REQ-PRJ-20260423-05] 腾讯云 COS 采用独立前缀的项目级命名空间
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `car` 项目可复用现有腾讯云账号或同一个 COS bucket；非生产真实值按 [REQ-PRJ-20260429-02] 和 [REQ-PRJ-20260429-03] 可进入项目 env 或 `_workspace-base` 的 `resources-ai` 集中凭据清单，明确生产 COS key 仍单独收紧
  - 若与其他项目共用 bucket，必须使用 `car-platform-*` 这类独立前缀，例如 `car-platform-dev/`、`car-platform-preprod/`、`car-platform-prod/`
  - `COS_BUCKET` 允许写桶名称本体并配套 `COS_APP_ID`，也兼容直接写带 `-AppId` 后缀的完整 bucket 名称
  - 对象存储隔离重点是项目级 `COS_UPLOAD_PREFIX`，多项目共用 bucket 时必须避免对象路径互相混淆
- 原因：这样能在不增加接入阻力的前提下，避免对象路径与 `koa-rent` 等项目混淆；安全边界已从“所有真实密钥不入仓”更新为“非生产便捷优先、生产明确收紧”。

### [REQ-PRJ-20260423-06] `car` 的提交策略与 `koa-rent` 保持同口径
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `car` 项目的 `Commit Workflow` 默认与 `koa-rent` 对齐，继续采用“可归因改动即自动提交”策略
  - 同一需求下的多文件联动不因文件数量自动升级为人工确认
  - 工作区存在外部改动时，默认只精确暂存并提交本轮可归因文件或 hunk，不使用会放大范围的提交方式
  - 仅在高风险链路、提交范围无法清晰归因、或外部改动与本轮变更严重交织时，才先确认提交策略
- 原因：这样能让两个项目的协作体验保持一致，减少代理在不同仓库之间切换时的判断分叉，也能降低把无关脏改动误混进提交的风险

### [REQ-PRJ-20260423-07] `apps/admin-web` 先落地轻量后台壳子，不额外引入完整后台框架迁移
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `apps/admin-web` 当前采用轻量 `Vue 3 + Vite + TypeScript` 应用，直接对接 `apps/backend` 现有 cool-admin 登录、权限和订单接口
  - 首期只承载后台登录、业务菜单、报废预约单列表、详情查看和状态流转
  - 暂不在本轮扩展系统管理、角色管理、配置中心等额外后台模块
- 原因：用户当前最需要的是先看到后台和 H5 的真实闭环，而不是再引入一套更重的后台脚手架改造成本；先让 PC 处理台可用，再按实际业务扩页更稳妥

### [REQ-PRJ-20260423-08] `car` 的根 `AGENTS.md` 显式接入 `_workspace-base`
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `car` 的公共 AGENTS 基线来源统一指向 `E:\web_work_-1\_workspace-base\agents\AGENTS-baseline.md`
  - 根 `AGENTS.md` 继续只维护 `car` 的项目专属差异、当前阶段边界和必要补充，不再暗含自己是一份独立完整模板
  - 涉及共享服务器事实、共享脚本、共享网络边界与跨项目运维规则时，优先参考 `E:\web_work_-1\_workspace-base\ops`
  - 项目仓库仍负责 `car` 自己的业务代码、部署记录、回滚线索与项目专属文档
- 原因：工作区已经把共享运维和共享模板收口到 `_workspace-base`，如果项目根 `AGENTS.md` 不显式接入，AI 在 `car` 里仍然容易只围着本仓自转，不知道什么时候该去看共享基座。显式声明后更有利于后续部署、COS、云资源和协作规则复用，也能减少项目边界跑偏。

### [REQ-PRJ-20260425-09] 预发布环境使用本地 `.env.preprod` 作为显式来源
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `apps/backend/.env.preprod` 是预发布环境变量的本地真实来源文件，可以提交 Git，默认保存真实非生产配置
  - `apps/backend/.env.local`、`.env.preprod` 等未明确标记生产的 env 默认可复用同一套非生产数据库服务、AI key、地图 key、COS key 与普通配置
  - `apps/backend/.env.preprod.example` 继续入 Git，用于说明变量清单；但真实非生产值不必只藏在 example 之外
  - `pnpm env:pull:preprod:backend` 从远端预发布 `.env.production.local` 拉取到本地 `.env.preprod`
  - `pnpm env:update:preprod:backend` 默认从 `.env.preprod` 同步地图 provider 变量到远端
- 原因：预发布不是正式生产环境，按当前项目“小本生意、时间优先、减少无谓开发负担”的口径，非生产配置便捷优先、开箱即跑；不要因为大厂式密钥洁癖反复增加本地、联调和客户演示成本。

### [REQ-PRJ-20260429-01] 预发布环境必须同步 AI 客服配置
- 状态：`accepted`
- 优先级：`P1`
- 决策：
  - `apps/backend/.env.preprod` 作为预发布真实配置来源时，必须包含 AI 客服所需的 `AI_SUPPORT_*` 变量
  - `pnpm env:update:preprod:backend` 除地图与 COS 外，也要同步 `AI_SUPPORT_PROVIDER`、`AI_SUPPORT_BASE_URL`、`AI_SUPPORT_API_KEYS`、`AI_SUPPORT_MODEL` 等 AI 客服变量到远端预发布后端
  - 非生产真实 key 可以保存在 `apps/backend/.env.preprod` 并提交 Git；只有明确生产环境或高权限生产 key 才默认不入仓库
- 原因：按 `_workspace-base` 非正式环境“便捷优先、变量清单明确”的口径，预发布应优先给客户完整体验；之前项目级同步脚本只同步地图/COS，导致 AI key 已在本地 `.env.preprod` 配好但不会推到远端。

### [REQ-PRJ-20260429-02] 非生产 env 默认通用并提交 Git
- 状态：`accepted`
- 优先级：`P0`
- 决策：
  - 除用户明确说明是生产环境 env 外，其他 `.env.local`、`.env.dev`、`.env.test`、`.env.preprod`、`.env.staging` 默认都属于非生产配置，可以保存真实值并提交到私有 Git
  - 非生产配置可以通用复用，包括但不限于数据库服务、AI key、地图 key、COS key、短信/微信测试配置和普通业务配置
  - `.gitignore` 只默认排除 `.env.production*`、`.env.prod*` 等明确生产命名 env；不要再笼统忽略全部 `.env.*`
  - 后续 AI 代理遇到非生产 env 缺失、未提交或不同步时，默认直接补齐并提交，不再把“隐藏 key”作为默认正确做法
- 原因：本项目是小本自营业务，当前优先级是快速开发、少折腾、客户可完整体验；过度套用大厂生产密钥管理标准会浪费时间精力。生产环境仍保留基本边界，但非生产环境默认便捷优先。

### [REQ-PRJ-20260429-03] `car` 重新接入 `_workspace-base` 最新共享口径
- 状态：`accepted`
- 优先级：`P0`
- 决策：
  - `car` 根 `AGENTS.md` 显式参考 `E:\web_work_-1\_workspace-base\AGENTS.md`、`agents/AGENTS-baseline.md` 和 `docs/how-projects-use-workspace-base.md`
  - 需要 AI 可直接复用的 MVP/demo/非生产 key、密码和供应商配置片段时，优先参考 `E:\web_work_-1\_workspace-base\ops\docs\resources-ai\nonprod-shared-credentials.md`
  - 需要真人快速确认共享端口、DNS、COS 等资源台账时，优先参考 `E:\web_work_-1\_workspace-base\ops\docs\_resources-developer`
  - `car` 的开发、预发布、甲方 demo 默认可以共用同一个非生产数据库；只有进入正式 production、长期试用、真实敏感数据承载或高风险业务流转时，再拆分独立生产资源
  - 常用能力供应商继续按共享基座候选收口：AI 优先 `SiliconFlow` 或 `sub2api`，地图优先高德 backend 代理，存储优先本地或腾讯云 COS
- 原因：`_workspace-base` 已经沉淀了新项目 bootstrap、非生产 env 入仓、非生产共享明文凭据、资源目录受众命名和常用能力供应商候选；`car` 作为当前活跃 MVP 项目应重新接入这些最新口径，避免后续代理继续按旧规则保守处理。

## 当前核心数据对象

- `customer`
- `vehicle`
- `scrap_order`
- `valuation`
- `pickup_task`
- `order_timeline`
- `attachment`
- `operator_user`

这些对象的更详细约定见 `../development/api-conventions.md`。
