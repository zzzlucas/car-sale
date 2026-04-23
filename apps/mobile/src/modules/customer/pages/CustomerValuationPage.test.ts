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
});
