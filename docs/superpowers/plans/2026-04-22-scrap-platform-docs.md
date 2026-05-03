# Scrap Platform Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the initial `AGENTS.md` and `docs/` documentation system for the scrap-car appointment platform monorepo so the repo can start development with clear structure, scope, and collaboration rules.

**Architecture:** The work creates a lightweight-but-structured documentation baseline around a three-frontend-plus-one-backend monorepo. Root guidance lives in `AGENTS.md`, navigation lives in `docs/README.md`, and topic-specific files are split into architecture, product, requirements, development, testing, and deployment sections so the repo can grow without losing shared context.

**Tech Stack:** Markdown, monorepo conventions, Vue 3 + Vite + TypeScript, Koa, MySQL

---

### Task 1: Create Root Collaboration Guide

**Files:**
- Create: `AGENTS.md`
- Reference: `docs/superpowers/specs/2026-04-22-scrap-platform-docs-design.md`

- [ ] **Step 1: Create the root guidance file**

Write `AGENTS.md` with sections for project context, communication, execution authorization, escalation rules, core engineering rules, validation baseline, and output requirements. The content must state the repo is a Chinese-first `monorepo` for `customer-h5`, `admin-web`, `admin-h5`, and `backend`, with the frontend strategy set to "build H5 first, evaluate `uni-app` later for customer-facing mini program needs."

- [ ] **Step 2: Verify the file exists and contains the expected headings**

Run: `Get-Content -Raw '<REPO_ROOT>\AGENTS.md'`
Expected: Markdown file with headings including `## Project Context`, `## Communication`, and `## Validation Baseline`

### Task 2: Create Documentation Navigation and Architecture Files

**Files:**
- Create: `docs/README.md`
- Create: `docs/architecture/overview.md`
- Create: `docs/architecture/monorepo-layout.md`
- Create: `docs/architecture/frontend-strategy.md`

- [ ] **Step 1: Create architecture directories**

Run: `New-Item -ItemType Directory -Force '<REPO_ROOT>\docs\architecture' | Out-Null`
Expected: Directory is created without error.

- [ ] **Step 2: Create the docs navigation file**

Write `docs/README.md` with quick links to architecture, product, requirements, development, testing, and deployment docs. Make it explicit that this repo is still in startup stage and these files describe the target structure and working agreements.

- [ ] **Step 3: Create architecture overview**

Write `docs/architecture/overview.md` describing:

```text
- why the repo uses a three-frontend-plus-one-backend monorepo
- the role of apps/backend as the business source of truth
- the responsibilities of customer-h5, admin-web, and admin-h5
- the purpose of shared packages such as shared-types and api-sdk
```

- [ ] **Step 4: Create monorepo layout doc**

Write `docs/architecture/monorepo-layout.md` with a target directory tree like:

```text
apps/
  backend/
  customer-h5/
  admin-web/
  admin-h5/
packages/
  shared-types/
  api-sdk/
  shared-utils/
docs/
```

Add short explanations for what each directory is responsible for and when code should stay app-local versus move to `packages/`.

- [ ] **Step 5: Create frontend strategy doc**

Write `docs/architecture/frontend-strategy.md` explaining:

```text
- all three frontends start with Vue 3 + Vite + TypeScript
- customer-h5 ships as H5 first
- customer-h5 may later migrate to or be rebuilt with uni-app for mini program delivery
- admin-web remains desktop-first
- admin-h5 stays a lightweight mobile operations client rather than a full admin mirror
```

- [ ] **Step 6: Verify navigation and architecture docs**

Run: `Get-ChildItem -Recurse '<REPO_ROOT>\docs\architecture' | Select-Object FullName`
Expected: `overview.md`, `monorepo-layout.md`, and `frontend-strategy.md` are listed.

### Task 3: Create Product and Requirements Docs

**Files:**
- Create: `docs/product/customer-journey.md`
- Create: `docs/product/admin-roles-and-workflows.md`
- Create: `docs/requirements/index.md`
- Create: `docs/requirements/project.md`

- [ ] **Step 1: Create product and requirements directories**

Run: `New-Item -ItemType Directory -Force '<REPO_ROOT>\docs\product','<REPO_ROOT>\docs\requirements' | Out-Null`
Expected: Both directories are created without error.

- [ ] **Step 2: Create customer journey doc**

Write `docs/product/customer-journey.md` describing the customer path from landing page trust-building, to valuation/appointment form, to appointment submission, to progress tracking, to support and FAQ. Mention the current design references under `.temp/stitch_`.

- [ ] **Step 3: Create admin roles and workflows doc**

Write `docs/product/admin-roles-and-workflows.md` describing role boundaries for admin-web and admin-h5, including admin, customer service/internal operations, and field staff. Explain which actions belong on desktop and which belong on mobile.

- [ ] **Step 4: Create requirements index**

Write `docs/requirements/index.md` with a lightweight single-line requirement format and an initial active entry for the first project decision set covering the three-frontends-plus-one-backend monorepo, H5-first strategy, and the scrap-appointment v1 scope.

- [ ] **Step 5: Create project requirements doc**

Write `docs/requirements/project.md` with the active project requirements, including:

```text
- product scope is self-operated scrap-car appointment service
- v1 covers customer booking, admin processing, and mobile field execution
- v1 excludes online payment, government system integration, and multi-tenant SaaS
- unified order status semantics must be shared across all clients
```

- [ ] **Step 6: Verify product and requirements docs**

Run: `Get-ChildItem -Recurse '<REPO_ROOT>\docs\product','<REPO_ROOT>\docs\requirements' | Select-Object FullName`
Expected: Four markdown files are listed under those directories.

### Task 4: Create Development, Testing, and Deployment Docs

**Files:**
- Create: `docs/development/workflow.md`
- Create: `docs/development/api-conventions.md`
- Create: `docs/testing/README.md`
- Create: `docs/deployment/README.md`

- [ ] **Step 1: Create development, testing, and deployment directories**

Run: `New-Item -ItemType Directory -Force '<REPO_ROOT>\docs\development','<REPO_ROOT>\docs\testing','<REPO_ROOT>\docs\deployment' | Out-Null`
Expected: All three directories are created without error.

- [ ] **Step 2: Create development workflow doc**

Write `docs/development/workflow.md` describing how this repo should evolve in startup phase:

```text
- prefer app-local closure before extracting shared code
- extract to packages only when two or more apps truly share stable structures
- backend contracts and shared types must stabilize before mini program migration work
- keep docs lightweight and update them when collaboration rules or structure change
```

- [ ] **Step 3: Create API conventions doc**

Write `docs/development/api-conventions.md` covering:

```text
- route naming style for customer, admin-web, and admin-h5 consumers
- a shared response envelope recommendation
- the core entities: customer, vehicle, scrap_order, valuation, pickup_task, order_timeline, attachment, operator_user
- the unified status values: submitted, contacted, quoted, scheduled_pickup, picked_up, dismantling, deregistration_processing, completed, cancelled
```

- [ ] **Step 4: Create testing baseline doc**

Write `docs/testing/README.md` clarifying that the repo is not fully scaffolded yet, so current validation is documentation and structure review only; once apps exist, verification should converge on standard workspace commands such as `pnpm dev`, `pnpm build`, and `pnpm test`.

- [ ] **Step 5: Create deployment placeholder doc**

Write `docs/deployment/README.md` stating deployment docs will later capture environments, domains, storage, and release steps, but the current file exists only to reserve a clean entry point and avoid mixing future deployment notes into unrelated docs.

- [ ] **Step 6: Verify the new docs exist**

Run: `Get-ChildItem -Recurse '<REPO_ROOT>\docs\development','<REPO_ROOT>\docs\testing','<REPO_ROOT>\docs\deployment' | Select-Object FullName`
Expected: `workflow.md`, `api-conventions.md`, `README.md`, and `README.md` are listed in the expected folders.

### Task 5: Cross-Check Links and Terminology

**Files:**
- Modify: `AGENTS.md`
- Modify: `docs/README.md`
- Modify: `docs/architecture/overview.md`
- Modify: `docs/architecture/monorepo-layout.md`
- Modify: `docs/architecture/frontend-strategy.md`
- Modify: `docs/product/customer-journey.md`
- Modify: `docs/product/admin-roles-and-workflows.md`
- Modify: `docs/requirements/index.md`
- Modify: `docs/requirements/project.md`
- Modify: `docs/development/workflow.md`
- Modify: `docs/development/api-conventions.md`
- Modify: `docs/testing/README.md`
- Modify: `docs/deployment/README.md`

- [ ] **Step 1: Review terminology consistency**

Ensure every file consistently uses the same app names and package names:

```text
apps/backend
apps/customer-h5
apps/admin-web
apps/admin-h5
packages/shared-types
packages/api-sdk
packages/shared-utils
```

- [ ] **Step 2: Review state terminology consistency**

Ensure the same order status list appears wherever order state is mentioned:

```text
submitted
contacted
quoted
scheduled_pickup
picked_up
dismantling
deregistration_processing
completed
cancelled
```

- [ ] **Step 3: Verify with a repo-wide markdown listing**

Run: `Get-ChildItem -Recurse '<REPO_ROOT>\docs' -Filter *.md | Select-Object FullName`
Expected: All planned markdown files are listed, including the spec and plan files.

- [ ] **Step 4: Verify key terms are discoverable**

Run: `rg -n \"customer-h5|admin-web|admin-h5|scheduled_pickup|uni-app\" '<REPO_ROOT>\AGENTS.md' '<REPO_ROOT>\docs'`
Expected: Matches appear across the new docs, proving terminology is wired through the documentation set.
