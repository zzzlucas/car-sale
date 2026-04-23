# playbooks 目录说明

## 这个目录做什么

- 这里放 `car` 项目自己的部署、发布和回滚手册。
- 共享服务器事实、SSH 入口、共享脚本和跨项目公网边界，继续优先看 `E:\web_work_-1\_workspace-base\ops`。
- 这里更关注“这个项目这次怎么发、怎么回滚、当前还有哪些部署阻塞项”。

## 推荐查找顺序

1. 先看 [../README.md](/e:/web_work_-1/car/docs/deployment/README.md)，确认这轮属于数据库/COS/后端/H5 哪一类问题。
2. 需要 `cloud2026` 主机事实、端口和数据库现状时，再看 [../cloud2026.md](/e:/web_work_-1/car/docs/deployment/cloud2026.md)。
3. 需要对象存储约定时，再看 [../tencent-cos.md](/e:/web_work_-1/car/docs/deployment/tencent-cos.md)。
4. 真的要执行部署、发 H5 或准备回滚时，再进入本目录。

## 当前入口

- `cloud2026` 后端部署前检查与标准路径：
  - [cloud2026-backend-deploy.md](/e:/web_work_-1/car/docs/deployment/playbooks/cloud2026-backend-deploy.md)
- H5 构建与发布前检查：
  - [h5-release.md](/e:/web_work_-1/car/docs/deployment/playbooks/h5-release.md)
- 通用回滚与备份约定：
  - [rollback.md](/e:/web_work_-1/car/docs/deployment/playbooks/rollback.md)

## 维护提醒

- 这里优先写“下一次还会照着做的标准步骤”，不要把一次性事故排查写成长期手册。
- 如果后续补了一键部署脚本，这里应改成“脚本优先”的手册，不要继续平行维护纯手工版。
- 如果某次远端写操作产生了新的目录约定、备份位置或回滚线索，应在同轮同步更新这里和对应会话记录。
