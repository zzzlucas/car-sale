# AMap Key Pool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为客户预约页补上高德地址搜索，并把多个高德 Key 的轮转兜底收口到 backend。

**Architecture:** backend 新增一个轻量地图代理服务，读取环境变量里的 Key 池并顺序兜底；mobile 只请求 backend 的地址建议接口，不直接持有高德 Key。页面保持当前表单结构，只增加手动触发的地址搜索和结果回填。

**Tech Stack:** Vue 3, Vite, TypeScript, MidwayJS, Jest, Vitest, AMap Web Service API

---

### Task 1: 后端 Key 池与地址搜索服务

**Files:**
- Create: `apps/backend/src/modules/app/service/map.test.ts`
- Create: `apps/backend/src/modules/app/service/map.ts`
- Create: `apps/backend/src/modules/app/controller/app/map.ts`
- Modify: `apps/backend/test/support/shared-types.ts`
- Modify: `packages/shared-types/src/index.ts`
- Create: `packages/shared-types/src/map.ts`

- [ ] **Step 1: 写失败测试，定义 Key 池解析与兜底行为**

```ts
it('falls back to the next key when the current key fails', async () => {
  const result = await service.searchAddressSuggestions('科技园');
  expect(result[0]).toMatchObject({ name: '科技园' });
  expect(requests.map(item => item.params.key)).toEqual(['key-a', 'key-b']);
});
```

- [ ] **Step 2: 跑测试确认红灯**

Run: `pnpm --filter @car/backend test -- src/modules/app/service/map.test.ts`
Expected: FAIL，因为 `map.ts` 和相关导出尚不存在

- [ ] **Step 3: 写最小实现**

```ts
export class AppMapService {
  async searchAddressSuggestions(keywords: string) {
    // trim -> config -> request amap -> map poi -> fallback next key
  }
}
```

- [ ] **Step 4: 补 controller 暴露 `/app/map/address-suggestions`**

```ts
@Get('/map/address-suggestions')
async suggestions(@Query('keywords') keywords: string) {
  return this.ok(await this.appMapService.searchAddressSuggestions(keywords));
}
```

- [ ] **Step 5: 再跑测试确认绿灯**

Run: `pnpm --filter @car/backend test -- src/modules/app/service/map.test.ts`
Expected: PASS

### Task 2: mobile 地址搜索接入

**Files:**
- Create: `apps/mobile/src/services/map.test.ts`
- Create: `apps/mobile/src/services/map.ts`
- Modify: `apps/mobile/src/modules/customer/pages/CustomerValuationPage.test.ts`
- Modify: `apps/mobile/src/modules/customer/pages/CustomerValuationPage.vue`

- [ ] **Step 1: 写失败测试，定义前端请求与页面入口**

```ts
it('calls the backend map suggestion endpoint', async () => {
  const result = await searchAddressSuggestions('科技园');
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(result[0].longitude).toBe(113.95);
});
```

- [ ] **Step 2: 跑测试确认红灯**

Run: `pnpm --filter @car/mobile test -- src/services/map.test.ts src/modules/customer/pages/CustomerValuationPage.test.ts`
Expected: FAIL，因为 `map.ts` 和新页面文案尚不存在

- [ ] **Step 3: 写最小实现**

```ts
export async function searchAddressSuggestions(keywords: string) {
  if (keywords.trim().length < 2) return [];
  return requestJson(`/app/map/address-suggestions?keywords=${encodeURIComponent(keywords)}`);
}
```

- [ ] **Step 4: 在预约页增加搜索按钮、结果列表与回填逻辑**

```ts
async function handlePickupAddressSearch() {
  const suggestions = await searchAddressSuggestions(form.pickupAddress);
  addressSuggestions.value = suggestions;
}
```

- [ ] **Step 5: 再跑测试确认绿灯**

Run: `pnpm --filter @car/mobile test -- src/services/map.test.ts src/modules/customer/pages/CustomerValuationPage.test.ts`
Expected: PASS

### Task 3: 文档和配置收口

**Files:**
- Modify: `.env.example`
- Modify: `docs/requirements/project.md`
- Modify: `docs/requirements/index.md`

- [ ] **Step 1: 补环境变量示例**

```env
AMAP_WEB_SERVICE_KEYS=
# AMAP_WEB_SERVICE_KEY=
# AMAP_WEB_SERVICE_TIMEOUT_MS=2500
```

- [ ] **Step 2: 记录项目级约定**

```md
- 客户侧地址搜索统一走 backend 代理，不在前端直出高德 Key
- 高德 Key 池通过 `AMAP_WEB_SERVICE_KEYS` 注入
```

- [ ] **Step 3: 跑最小验证**

Run: `pnpm --filter @car/shared-types typecheck && pnpm --filter @car/backend test -- src/modules/app/service/map.test.ts && pnpm --filter @car/mobile test -- src/services/map.test.ts src/modules/customer/pages/CustomerValuationPage.test.ts`
Expected: PASS
