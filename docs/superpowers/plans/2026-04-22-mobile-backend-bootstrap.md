# Mobile And Backend Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the first runnable version of `apps/mobile` and `apps/backend`, plus `packages/shared-types`, so the customer-side H5 flow and backend APIs can run end-to-end.

**Architecture:** The repo becomes a lightweight monorepo with a shared type layer, a custom `Vue 3 + TypeScript + Vite` mobile app, and a `cool-admin-midway` backend adapted for customer-facing APIs. The mobile app fully implements the `customer` area and reserves an `operator` area, while the backend exposes real APIs for valuation orders, progress, content, and future mobile login.

**Tech Stack:** Vue 3, TypeScript, Vite, Vue Router, Pinia, Tailwind CSS, cool-admin-midway, MidwayJS, TypeORM, MySQL, pnpm

---

### File Structure

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `apps/mobile/*`
- Create: `apps/backend/*`
- Create: `packages/shared-types/*`

**Responsibilities:**
- `package.json`: workspace-level scripts for install, dev, build, and typecheck
- `pnpm-workspace.yaml`: defines `apps/*` and `packages/*` as workspace packages
- `tsconfig.base.json`: shared TypeScript path aliases and compiler baseline
- `apps/mobile`: customer flow app plus operator placeholder
- `apps/backend`: cool-admin-midway app plus custom customer-facing module
- `packages/shared-types`: enum and DTO source of truth shared by mobile and backend

### Task 1: Bootstrap Workspace Root

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `apps/.gitkeep`
- Create: `packages/.gitkeep`

- [ ] **Step 1: Create the workspace file tree**

Run:

```powershell
New-Item -ItemType Directory -Force '<REPO_ROOT>\apps','<REPO_ROOT>\packages' | Out-Null
```

Expected: `apps` and `packages` directories exist.

- [ ] **Step 2: Write the root workspace files**

Create these files with the following content:

`pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

`tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@car/shared-types": ["packages/shared-types/src/index.ts"]
    }
  }
}
```

`package.json`

```json
{
  "name": "car-platform",
  "private": true,
  "packageManager": "pnpm@10.0.0",
  "scripts": {
    "dev:mobile": "pnpm --filter @car/mobile dev",
    "build:mobile": "pnpm --filter @car/mobile build",
    "typecheck:mobile": "pnpm --filter @car/mobile typecheck",
    "dev:backend": "pnpm --filter @car/backend dev",
    "build:backend": "pnpm --filter @car/backend build",
    "typecheck:backend": "pnpm --filter @car/backend typecheck"
  }
}
```

- [ ] **Step 3: Verify the workspace files exist**

Run:

```powershell
Get-ChildItem '<REPO_ROOT>' | Select-Object Name
```

Expected: `package.json`, `pnpm-workspace.yaml`, and `tsconfig.base.json` are listed.

### Task 2: Build Shared Types Package

**Files:**
- Create: `packages/shared-types/package.json`
- Create: `packages/shared-types/tsconfig.json`
- Create: `packages/shared-types/src/index.ts`
- Create: `packages/shared-types/src/order.ts`
- Create: `packages/shared-types/src/content.ts`

- [ ] **Step 1: Create the shared-types package directory**

Run:

```powershell
New-Item -ItemType Directory -Force '<REPO_ROOT>\packages\shared-types\src' | Out-Null
```

Expected: `packages/shared-types/src` exists.

- [ ] **Step 2: Write package metadata and TS config**

Create:

`packages/shared-types/package.json`

```json
{
  "name": "@car/shared-types",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json --emitDeclarationOnly false",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  }
}
```

`packages/shared-types/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "emitDeclarationOnly": false
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Write the order and content contracts**

Create:

`packages/shared-types/src/order.ts`

```ts
export const SCRAP_ORDER_STATUSES = [
  "submitted",
  "contacted",
  "quoted",
  "scheduled_pickup",
  "picked_up",
  "dismantling",
  "deregistration_processing",
  "completed",
  "cancelled",
] as const;

export type ScrapOrderStatus = (typeof SCRAP_ORDER_STATUSES)[number];

export interface ValuationOrderPayload {
  vehicleType: "car" | "truck";
  brandModel: string;
  plateRetention: boolean;
  weightTons?: number | null;
  contactName: string;
  contactPhone: string;
}

export interface ScrapOrderTimelineItem {
  status: ScrapOrderStatus;
  label: string;
  time: string;
  note?: string;
}

export interface ScrapOrderSummary {
  id: string;
  orderNo: string;
  currentStatus: ScrapOrderStatus;
  currentStatusLabel: string;
  brandModel: string;
  plateNumber: string;
}

export interface ScrapOrderDetail extends ScrapOrderSummary {
  ownerName: string;
  vin: string;
  timeline: ScrapOrderTimelineItem[];
}
```

`packages/shared-types/src/content.ts`

```ts
export interface ServiceGuideStep {
  title: string;
  description: string;
}

export interface ServiceGuideContent {
  title: string;
  intro: string;
  steps: ServiceGuideStep[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SupportContent {
  phone: string;
  serviceHours: string;
  intro: string;
}
```

`packages/shared-types/src/index.ts`

```ts
export * from "./order";
export * from "./content";
```

- [ ] **Step 4: Verify shared types compile**

Run:

```powershell
pnpm --dir '<REPO_ROOT>' --filter @car/shared-types typecheck
```

Expected: exit code `0`.

### Task 3: Scaffold `apps/mobile`

**Files:**
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/tsconfig.json`
- Create: `apps/mobile/vite.config.ts`
- Create: `apps/mobile/tailwind.config.ts`
- Create: `apps/mobile/postcss.config.cjs`
- Create: `apps/mobile/index.html`
- Create: `apps/mobile/src/main.ts`
- Create: `apps/mobile/src/App.vue`
- Create: `apps/mobile/src/styles/main.css`
- Create: `apps/mobile/src/app/router/index.ts`
- Create: `apps/mobile/src/app/layouts/CustomerLayout.vue`
- Create: `apps/mobile/src/app/layouts/OperatorLayout.vue`
- Create: `apps/mobile/src/modules/customer/pages/*.vue`
- Create: `apps/mobile/src/modules/operator/pages/OperatorHomePage.vue`
- Create: `apps/mobile/src/services/api.ts`
- Create: `apps/mobile/src/services/content.ts`
- Create: `apps/mobile/src/services/orders.ts`
- Create: `apps/mobile/src/stores/app.ts`

- [ ] **Step 1: Create the mobile app directories**

Run:

```powershell
New-Item -ItemType Directory -Force `
  '<REPO_ROOT>\apps\mobile\src\app\router',`
  '<REPO_ROOT>\apps\mobile\src\app\layouts',`
  '<REPO_ROOT>\apps\mobile\src\modules\customer\pages',`
  '<REPO_ROOT>\apps\mobile\src\modules\operator\pages',`
  '<REPO_ROOT>\apps\mobile\src\modules\common',`
  '<REPO_ROOT>\apps\mobile\src\services',`
  '<REPO_ROOT>\apps\mobile\src\stores',`
  '<REPO_ROOT>\apps\mobile\src\styles' | Out-Null
```

Expected: all `apps/mobile/src/...` directories exist.

- [ ] **Step 2: Write app package metadata**

Create `apps/mobile/package.json`:

```json
{
  "name": "@car/mobile",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "typecheck": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@car/shared-types": "workspace:*",
    "pinia": "^3.0.3",
    "vue": "^3.5.13",
    "vue-router": "^4.5.1"
  },
  "devDependencies": {
    "@types/node": "^22.13.10",
    "@vitejs/plugin-vue": "^5.2.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3",
    "vite": "^6.2.0",
    "vue-tsc": "^2.2.8"
  }
}
```

- [ ] **Step 3: Write Vite, TS, and Tailwind configuration**

Create:

`apps/mobile/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["node"],
    "composite": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue", "vite.config.ts", "tailwind.config.ts"]
}
```

`apps/mobile/vite.config.ts`

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
```

`apps/mobile/tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{vue,ts}"],
  theme: {
    extend: {
      colors: {
        background: "#f8f9fa",
        primary: "#004c4c",
        "primary-container": "#006666",
        secondary: "#904d00",
        surface: "#f8f9fa",
        "surface-container-lowest": "#ffffff",
        "surface-variant": "#e1e3e4",
        outline: "#6f7979",
      },
      spacing: {
        "margin-page": "20px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "24px",
        "inset-card": "16px",
      },
      borderRadius: {
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 4: Write the app shell and routes**

Create the router with these paths:

```ts
[
  { path: "/", redirect: "/customer" },
  { path: "/customer", component: CustomerHomePage },
  { path: "/customer/valuation", component: CustomerValuationPage },
  { path: "/customer/progress/:orderId", component: CustomerProgressPage },
  { path: "/customer/guide", component: CustomerGuidePage },
  { path: "/customer/me", component: CustomerMePage },
  { path: "/customer/support", component: CustomerSupportPage },
  { path: "/operator", component: OperatorHomePage }
]
```

And create `CustomerLayout.vue`, `OperatorLayout.vue`, and `App.vue` to render `RouterView`.

- [ ] **Step 5: Implement the customer pages**

Write the six customer pages to follow the current design references under `.temp/stitch_`, using Tailwind utility classes and shared theme tokens:

```text
Home: strong brand hero + CTA
Valuation: real form state with submit button
Progress: current state card + timeline + vehicle detail
Guide: static process steps + faq
Me: summary cards + menu links + sample order entry
Support: support contact details + service intro
```

- [ ] **Step 6: Implement services and fallback logic**

Create:

`apps/mobile/src/services/api.ts` for a small `fetch` wrapper with `VITE_API_BASE_URL`

`apps/mobile/src/services/orders.ts` for:

```ts
submitValuationOrder(payload)
getOrderDetail(orderId)
getOrderProgress(orderId)
getMyOrders()
```

`apps/mobile/src/services/content.ts` for:

```ts
getServiceGuide()
getFaqs()
getSupport()
```

The service layer must support mock fallback data when the backend is unavailable.

- [ ] **Step 7: Verify mobile typecheck and build**

Run:

```powershell
pnpm --dir '<REPO_ROOT>' install
pnpm --dir '<REPO_ROOT>' --filter @car/mobile typecheck
pnpm --dir '<REPO_ROOT>' --filter @car/mobile build
```

Expected: typecheck and build both succeed.

### Task 4: Bootstrap `apps/backend` From Official Cool Admin Midway

**Files:**
- Create: `apps/backend/*`
- Modify: `apps/backend/package.json`
- Modify: `apps/backend/src/modules/*`
- Modify: `apps/backend/src/config/config.local.ts`
- Create: `apps/backend/src/modules/app/*`

- [ ] **Step 1: Fetch the official backend scaffold**

Run:

```powershell
git clone https://github.com/cool-team-official/cool-admin-midway.git '<REPO_ROOT>\apps\backend'
Remove-Item -Recurse -Force '<REPO_ROOT>\apps\backend\.git'
```

Expected: `apps/backend` contains the cool-admin-midway scaffold without nested git metadata.

- [ ] **Step 2: Adjust backend package metadata for the workspace**

Update `apps/backend/package.json` so the package is named `@car/backend` and keeps `dev`, `build`, and `typeorm` scripts intact. Add a dependency on `@car/shared-types` using `workspace:*`.

- [ ] **Step 3: Configure local database defaults for startup**

Update `apps/backend/src/config/config.local.ts` to use local MySQL defaults like:

```ts
host: "127.0.0.1",
port: 3306,
username: "root",
password: "123456",
database: "car_platform",
synchronize: true,
logging: false,
charset: "utf8mb4",
entities: ["**/modules/*/entity"]
```

- [ ] **Step 4: Create the customer-facing app module**

Create an `app` module under `apps/backend/src/modules/app` with:

```text
controller/
service/
entity/
dto/
config.ts
```

Implement:

```text
POST /app/valuation-orders
GET /app/valuation-orders/:id
GET /app/valuation-orders/:id/progress
GET /app/me/valuation-orders
GET /app/content/service-guide
GET /app/content/faqs
GET /app/content/support
POST /auth/mobile/send-code
POST /auth/mobile/login
GET /operator/dashboard
```

Use fixed sample data where persistence is not yet necessary, but shape every response using `@car/shared-types`.

- [ ] **Step 5: Add the minimum entities and services**

Create simple entities and/or in-memory services for:

```text
customer
vehicle
scrap_order
order_timeline
support_content
```

The minimum implementation may return seeded sample rows without full production-grade auth, as long as the API contracts are stable and real route handlers exist.

- [ ] **Step 6: Verify backend install, typecheck, and build**

Run:

```powershell
pnpm --dir '<REPO_ROOT>' install
pnpm --dir '<REPO_ROOT>' --filter @car/backend typecheck
pnpm --dir '<REPO_ROOT>' --filter @car/backend build
```

Expected: backend typecheck and build succeed.

### Task 5: Wire Mobile App To Backend Contracts

**Files:**
- Modify: `apps/mobile/src/services/api.ts`
- Modify: `apps/mobile/src/services/orders.ts`
- Modify: `apps/mobile/src/services/content.ts`
- Modify: `apps/mobile/src/modules/customer/pages/*.vue`

- [ ] **Step 1: Point the mobile app at the backend URL**

Create or document:

```text
VITE_API_BASE_URL=http://127.0.0.1:8001
```

Use that base URL in the fetch wrapper, with fallback to mock data when requests fail.

- [ ] **Step 2: Connect page actions to the service layer**

Wire:

```text
Home CTA -> /customer/valuation
Valuation submit -> submitValuationOrder()
Progress page -> getOrderProgress(orderId)
Me page -> getMyOrders()
Guide page -> getServiceGuide() + getFaqs()
Support page -> getSupport()
```

- [ ] **Step 3: Verify the mobile build still passes after API wiring**

Run:

```powershell
pnpm --dir '<REPO_ROOT>' --filter @car/mobile typecheck
pnpm --dir '<REPO_ROOT>' --filter @car/mobile build
```

Expected: exit code `0` for both commands.

### Task 6: End-To-End Smoke Verification

**Files:**
- Modify: `docs/testing/README.md`

- [ ] **Step 1: Add local run instructions**

Update `docs/testing/README.md` to include:

```text
pnpm install
pnpm dev:backend
pnpm dev:mobile
```

and a short manual smoke checklist for the first customer flow.

- [ ] **Step 2: Verify the complete workspace state**

Run:

```powershell
Get-ChildItem -Recurse '<REPO_ROOT>\apps','<REPO_ROOT>\packages' | Select-Object FullName
```

Expected: `apps/mobile`, `apps/backend`, and `packages/shared-types` all exist with source files.

- [ ] **Step 3: Verify key contract terms are consistent**

Run:

```powershell
rg -n "scheduled_pickup|/app/valuation-orders|/auth/mobile/login|/operator" '<REPO_ROOT>\apps' '<REPO_ROOT>\packages'
```

Expected: the order status and core route strings appear in both frontend and backend source.
