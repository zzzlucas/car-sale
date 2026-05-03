# OpenClaw Rembg Worker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `openclaw` 上部署一个仅通过虚拟局域网使用的 CPU-only `rembg` 批处理工作器，并用 `car` 项目的样张完成一次端到端验证。

**Implementation Adjustment:** `openclaw` 到 Docker Hub / GitHub release 的链路很差，Docker 镜像拉取与首次模型下载都不稳定；实际实现改为“用户级 Python 安装 + 启停脚本 + 用户 crontab 自启动”，不依赖 sudo，不新增公网入口。

**Architecture:** 部署形态采用 `openclaw` 本机目录 `/mnt/ssd_data/car-tools/rembg`，由 `~/.local/bin/rembg` 常驻监听当前 Tailscale IP 的 `17000` 端口。模型缓存落在 `models/`，日志落在 `logs/`，默认通过 `http://<tailscale-ip>:17000/api/remove` 处理图片。

**Tech Stack:** Python 3、`pip --user`、`rembg[cpu,cli]`、PowerShell、SSH、Tailscale

---

### Task 1: 核对远端主机与网络前提

**Files:**
- Create: `docs/deployment/records/2026-04-24-openclaw-rembg-worker.md`
- Modify: `docs/requirements/project.md`

- [x] **Step 1: 通过 SSH 探活 `openclaw`**

Run:

```powershell
ssh openclaw "hostname && whoami && uname -a"
```

Result: 已确认别名可用，宿主为 `<OPENCLAW_HOST_ALIAS>`，用户 `lucas`，系统为 Ubuntu 24.04。

- [x] **Step 2: 检查磁盘与 CPU-only 运行前提**

Run:

```powershell
ssh openclaw "nproc && free -h && df -h /mnt/ssd_data"
```

Result: 当前可用 CPU / 内存足够支撑 CPU-only `rembg` 常驻与轻量批处理。

- [x] **Step 3: 检查虚拟局域网入口**

Run:

```powershell
ssh openclaw "tailscale ip -4 || true"
```

Result: 当前可通过 `<OPENCLAW_TAILSCALE_HOST>` 访问，不需要追加 FRP / DDNS / 公网直连。

### Task 2: 安装用户级 `rembg` 运行时

**Files:**
- Create: `docs/deployment/records/2026-04-24-openclaw-rembg-worker.md`

- [x] **Step 1: 安装 `pip` 到用户目录**

Run:

```powershell
ssh openclaw "python3 get-pip.py --user"
```

Result: `pip` 已可在用户目录使用，不修改系统 Python。

- [x] **Step 2: 安装 CPU-only `rembg`**

Run:

```powershell
ssh openclaw "python3 -m pip install --user --break-system-packages 'rembg[cpu,cli]'"
```

Result: `rembg` CLI 已安装到 `~/.local/bin`。

### Task 3: 创建服务目录、启停脚本与自启动

**Files:**
- Create: `docs/deployment/records/2026-04-24-openclaw-rembg-worker.md`

- [x] **Step 1: 创建标准目录**

Run:

```powershell
ssh openclaw "mkdir -p /mnt/ssd_data/car-tools/rembg/{input,output,models,scripts,logs}"
```

Result: 工作目录、模型目录、日志目录已就位。

- [x] **Step 2: 写入启停脚本**

Run:

```powershell
ssh openclaw "ls -l /mnt/ssd_data/car-tools/rembg/*.sh"
```

Result: 已存在 `start-rembg.sh`、`stop-rembg.sh`、`status-rembg.sh`，用于常驻、停止和探活。

- [x] **Step 3: 配置用户级自启动**

Run:

```powershell
ssh openclaw "crontab -l | grep -F 'start-rembg.sh'"
```

Result: 已确认存在 `@reboot sleep 50 && /bin/bash -lc '/mnt/ssd_data/car-tools/rembg/start-rembg.sh'`。

### Task 4: 种入模型并完成端到端验证

**Files:**
- Create: `docs/deployment/records/2026-04-24-openclaw-rembg-worker.md`

- [x] **Step 1: 预置默认模型**

Run:

```powershell
ssh openclaw "ls -lh /mnt/ssd_data/car-tools/rembg/models/u2net.onnx"
```

Result: 已确认模型文件存在，避免首次请求在远端长时间卡 GitHub 下载。

- [x] **Step 2: 启动服务并确认监听**

Run:

```powershell
ssh openclaw "/mnt/ssd_data/car-tools/rembg/status-rembg.sh && ss -ltnp '( sport = :17000 )' || true"
```

Result: 服务监听在当前 Tailscale IP 的 `17000` 端口。

- [x] **Step 3: 通过真实样图调用接口**

Run:

```powershell
curl.exe -s --max-time 600 -F "file=@.temp\gpt-image-2\c1c9458d-817a-438b-af91-e50c11897dfa.png" "http://<OPENCLAW_TAILSCALE_HOST>:17000/api/remove" -o ".temp\gpt-image-2\c1c9458d-817a-438b-af91-e50c11897dfa.verify.rembg.png"
```

Result: 样图成功返回透明 PNG 结果。

- [x] **Step 4: 记录结果文件信息**

Run:

```powershell
Add-Type -AssemblyName System.Drawing; $img=[System.Drawing.Image]::FromFile('.temp\gpt-image-2\c1c9458d-817a-438b-af91-e50c11897dfa.verify.rembg.png'); [PSCustomObject]@{Width=$img.Width;Height=$img.Height;PixelFormat=$img.PixelFormat.ToString();SizeKB=[math]::Round((Get-Item '.temp\gpt-image-2\c1c9458d-817a-438b-af91-e50c11897dfa.verify.rembg.png').Length/1KB,1)}; $img.Dispose()
```

Result: 当前验证样图输出为 `1122x1402`、`836.1 KB`、`Format32bppArgb`。

### Task 5: 补齐项目文档与提交

**Files:**
- Create: `docs/deployment/records/2026-04-24-openclaw-rembg-worker.md`
- Modify: `docs/requirements/project.md`
- Modify: `docs/requirements/index.md`
- Create: `docs/superpowers/plans/2026-04-24-openclaw-rembg-worker.md`

- [x] **Step 1: 写部署记录**

Document:

```markdown
- 运行宿主：openclaw
- 访问方式：Tailscale
- 工作目录：/mnt/ssd_data/car-tools/rembg
- 服务入口：http://<OPENCLAW_TAILSCALE_HOST>:17000/api
- 样图验证输出：.temp\gpt-image-2\c1c9458d-817a-438b-af91-e50c11897dfa.verify.rembg.png
```

- [x] **Step 2: 在需求记录与索引中登记长期约定**

Document:

```markdown
- `car` 项目的图片抠图批处理默认落在 `openclaw`，采用 CPU-only `rembg`，访问方式默认走虚拟局域网 / Tailscale，不新增裸公网入口。
```

- [x] **Step 3: 精确提交本轮文档**

Run:

```powershell
git add docs/superpowers/plans/2026-04-24-openclaw-rembg-worker.md docs/deployment/records/2026-04-24-openclaw-rembg-worker.md
git apply --cached <custom-patch-for-requirement-hunks>
git commit -m "docs: record openclaw rembg worker deployment"
```

Result: 仅提交本轮 rembg 部署记录、计划和需求约定，不混入其他未完成工作。
