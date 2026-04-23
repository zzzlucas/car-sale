# Mobile Home Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将移动端客户首页从“半表单 + 顶栏”改成纯转化落地页，并保留清晰的估价入口。

**Architecture:** 先用源码回归测试锁定首页不再包含固定顶栏和车牌输入框，再在 `CustomerHomePage.vue` 内把首屏改为无顶栏海报式结构，最后补 FAQ / 联系客服区块并做整体验证。

**Tech Stack:** Vue 3、Vite、TypeScript、Vitest、Tailwind CSS

---

### Task 1: 锁定首页回归约束

**Files:**
- Create: `apps/mobile/src/modules/customer/pages/CustomerHomePage.test.ts`
- Modify: `docs/superpowers/specs/2026-04-22-mobile-home-landing-design.md`
- Modify: `docs/superpowers/plans/2026-04-22-mobile-home-landing.md`

- [ ] **Step 1: 写一个先失败的源码回归测试**
- [ ] **Step 2: 运行测试并确认它因旧顶栏 / 车牌输入而失败**

### Task 2: 改造首页为落地页

**Files:**
- Modify: `apps/mobile/src/modules/customer/pages/CustomerHomePage.vue`
- Modify: `apps/mobile/src/styles/main.css`

- [ ] **Step 1: 去掉固定顶栏和车牌输入区**
- [ ] **Step 2: 重组 Hero、优势、流程、FAQ 和联系客服区块**
- [ ] **Step 3: 保留到底部导航和估价页 CTA 的完整跳转**

### Task 3: 验证与预览

**Files:**
- Test: `apps/mobile/src/modules/customer/pages/CustomerHomePage.test.ts`

- [ ] **Step 1: 运行首页相关测试**
- [ ] **Step 2: 运行移动端类型检查**
- [ ] **Step 3: 运行移动端构建**
- [ ] **Step 4: 启动本地预览供用户查看效果**
