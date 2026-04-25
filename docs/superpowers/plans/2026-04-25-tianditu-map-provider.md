# Tianditu Map Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Tianditu-backed map provider with env-based switching while keeping existing mobile API contracts stable.

**Architecture:** `AppMapService` remains the controller-facing facade. Provider selection is driven by `MAP_SERVICE_PROVIDER`, defaulting to `tianditu`; AMap logic stays available behind `amap`. Tests define provider selection, Tianditu request mapping, fallback, and invalid coordinate behavior.

**Tech Stack:** TypeScript, Midway/COOL backend, axios, Jest, pnpm.

---

### Task 1: Provider Config Tests

**Files:**
- Modify: `apps/backend/src/modules/app/service/map.test.ts`
- Modify: `apps/backend/src/modules/app/service/map.ts`

- [ ] Write failing tests for `resolveMapServiceProvider` defaulting to `tianditu`, accepting `amap`, and rejecting unknown providers by falling back to `tianditu`.
- [ ] Implement the minimal provider resolver in `map.ts`.
- [ ] Run `pnpm --filter @car/backend test -- map.test.ts` and verify the new tests pass.

### Task 2: Tianditu Request Mapping

**Files:**
- Modify: `apps/backend/src/modules/app/service/map.test.ts`
- Modify: `apps/backend/src/modules/app/service/map.ts`

- [ ] Write failing tests for Tianditu reverse geocode and address search using mocked `requestTianditu`.
- [ ] Implement `resolveTiandituWebServiceConfig`, key pool fallback, `requestTianditu`, response parsing, and mapping to shared map types.
- [ ] Run `pnpm --filter @car/backend test -- map.test.ts` and verify Tianditu tests pass.

### Task 3: Coordinate Error Contract

**Files:**
- Modify: `apps/backend/src/modules/app/service/map.test.ts`
- Modify: `apps/backend/src/modules/app/service/map.ts`

- [ ] Write a failing test that invalid coordinates reject with `缺少有效经纬度`.
- [ ] Replace the current `return null` branch with a `CoolCommException`.
- [ ] Run `pnpm --filter @car/backend test -- map.test.ts` and verify the regression test passes.

### Task 4: Env Templates and Deploy Sync

**Files:**
- Modify: `.env.example`
- Modify: `apps/backend/.env.preprod.example`
- Modify: `apps/backend/.env.production.example`
- Modify: `scripts/deploy/update-preprod-backend-env.ps1`
- Modify: `scripts/deploy/check-preprod.ps1`

- [ ] Add `MAP_SERVICE_PROVIDER` and `TIANDITU_WEB_SERVICE_*` variables to env templates.
- [ ] Update preprod env sync and check scripts to include provider and Tianditu variables.
- [ ] Parse-check changed PowerShell scripts.

### Task 5: Final Validation and Commit

**Files:**
- All changed files.

- [ ] Run focused backend map tests.
- [ ] Run backend typecheck if focused tests pass.
- [ ] Confirm real env files remain ignored and secrets are not staged.
- [ ] Commit the feature.
