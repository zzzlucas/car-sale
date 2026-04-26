import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "CustomerValuationPage.vue"), "utf8");

describe("CustomerValuationPage form coverage", () => {
  it("contains the missing appointment fields from the design screenshots", () => {
    expect(source).toContain("联系姓名");
    expect(source).toContain("联系电话");
    expect(source).toContain("轮毂材质");
    expect(source).toContain("整备质量");
    expect(source).toContain("取车地址");
    expect(source).toContain("车辆照片");
  });

  it("includes a real file input, location entry, and reset action", () => {
    expect(source).toContain('type="file"');
    expect(source).toContain("读取当前位置");
    expect(source).toContain("重置表单");
  });

  it("includes address search affordances for the amap key-pool flow", () => {
    expect(source).toContain("搜索地址建议");
    expect(source).toContain("推荐地址");
    expect(source).toContain("命中后自动回填位置");
  });

  it("does not expose raw latitude and longitude values directly to end users anymore", () => {
    expect(source).toContain("已记录当前位置，系统会据此安排上门服务。");
    expect(source).not.toContain("纬度 {{ form.pickupLatitude }}");
    expect(source).not.toContain("经度 {{ form.pickupLongitude }}");
  });

  it("explains that current location should be resolved to a chinese address first", () => {
    expect(source).toContain("已获取当前位置，请补充中文地址或继续搜索地址建议。");
  });

  it("shows address and location feedback inside the pickup address section", () => {
    expect(source).toContain('v-if="addressMessage"');
    expect(source).toContain("{{ addressMessage }}");
    expect(source).toContain("addressMessage.value = rejectionMessage");
  });

  it("uses a cleaner progress rail and a readable delete action for photo cards", () => {
    expect(source).toContain("absolute inset-x-2 top-4 h-[2px] rounded-full bg-surface-variant");
    expect(source).toContain("min-w-[3.5rem] shrink-0");
    expect(source).toContain("truncate text-label-md text-on-surface");
  });

  it("logs browser geolocation details for local troubleshooting", () => {
    expect(source).toContain('console.info("[pickup-location] browser geolocation"');
    expect(source).toContain("accuracy: position.coords.accuracy");
    expect(source).toContain("rejectionMessage");
  });

  it("keeps coordinate wording away from customer-facing copy", () => {
    expect(source).not.toContain("坐标");
    expect(source).not.toContain("经纬度");
  });
});
