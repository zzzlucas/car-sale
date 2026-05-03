# `openclaw` rembg 工作器部署记录

## 目标

- 时间：`2026-04-24`
- 宿主：`openclaw` / `<OPENCLAW_HOST_ALIAS>`
- 访问方式：`Tailscale` 虚拟局域网
- 本轮目标：把 `car` 项目的图片抠图能力落到 `openclaw`，形成一个仅内网可访问的 CPU-only `rembg` 常驻工作器

## 本轮实际落点

- 服务文档入口：`http://<OPENCLAW_TAILSCALE_HOST>:17000/api`
- 实际处理接口：`http://<OPENCLAW_TAILSCALE_HOST>:17000/api/remove`
- 工作目录：`/mnt/ssd_data/car-tools/rembg`
- 输入目录：`/mnt/ssd_data/car-tools/rembg/input`
- 输出目录：`/mnt/ssd_data/car-tools/rembg/output`
- 模型目录：`/mnt/ssd_data/car-tools/rembg/models`
- 日志目录：`/mnt/ssd_data/car-tools/rembg/logs`
- 当前默认模型：`u2net`
- 常驻脚本：
  - `/mnt/ssd_data/car-tools/rembg/start-rembg.sh`
  - `/mnt/ssd_data/car-tools/rembg/stop-rembg.sh`
  - `/mnt/ssd_data/car-tools/rembg/status-rembg.sh`

## 本轮实际方案

- 原始设想是 Docker Compose，但 `openclaw` 到 Docker Hub / GitHub release 的链路很差，镜像拉取和首次模型下载都不稳定。
- 最终改为用户级 Python 方案，不依赖 sudo，也不改系统 Python：
  - `python3 get-pip.py --user`
  - `python3 -m pip install --user --break-system-packages 'rembg[cpu,cli]'`
- `start-rembg.sh` 会：
  - 优先等待并绑定当前 `tailscale ip -4`
  - 把 `U2NET_HOME` 指到 `/mnt/ssd_data/car-tools/rembg/models`
  - 用 `OMP_NUM_THREADS=2` 启动 `~/.local/bin/rembg`
  - 把标准输出和错误输出写到 `logs/`
- 自启动方式采用用户 crontab：
  - `@reboot sleep 50 && /bin/bash -lc '/mnt/ssd_data/car-tools/rembg/start-rembg.sh'`

## 模型处理

- 默认模型文件：`/mnt/ssd_data/car-tools/rembg/models/u2net.onnx`
- 当前文件大小：约 `168M`
- 由于 `openclaw` 自己拉 GitHub release 很慢，本轮实际采用“本机下载 + scp 种入模型”的方式完成首轮落地。

## 验证结果

- 服务状态：
  - `status-rembg.sh` 返回 `running pid=4134873`
  - `ss -ltnp '( sport = :17000 )'` 显示 `<OPENCLAW_TAILSCALE_HOST>:17000` 正在监听
- API 入口：
  - `curl http://<OPENCLAW_TAILSCALE_HOST>:17000/api` 返回 `200`
- 样图端到端验证：
  - 输入文件：`.temp\gpt-image-2\c1c9458d-817a-438b-af91-e50c11897dfa.png`
  - 输出文件：`.temp\gpt-image-2\c1c9458d-817a-438b-af91-e50c11897dfa.verify.rembg.png`
  - 输出尺寸：`1122 x 1402`
  - 输出像素格式：`Format32bppArgb`
  - 输出体积：`836.1 KB`

## 已确认问题

- `openclaw` 没有 GPU，本服务只适合轻量批处理，不适合高并发或大规模队列。
- 默认 `u2net` 对当前这类白底插画素材能抠出透明底，但边缘会有发灰/发黑 halo，更适合做批量底稿，不适合直接当最终精修素材。
- 如果后续要试更好的模型，建议继续采用“本机下载模型后再 `scp` 到 `models/`”的方式，不要在 `openclaw` 上等待 GitHub 慢速下载。

## 回滚与停用线索

- 停服务：`ssh openclaw "/mnt/ssd_data/car-tools/rembg/stop-rembg.sh"`
- 看状态：`ssh openclaw "/mnt/ssd_data/car-tools/rembg/status-rembg.sh"`
- 看日志：
  - `/mnt/ssd_data/car-tools/rembg/logs/rembg.stdout.log`
  - `/mnt/ssd_data/car-tools/rembg/logs/rembg.stderr.log`
- 如需彻底停用自启动，先删除用户 crontab 中的 `start-rembg.sh` 项，再手动停止当前进程。
