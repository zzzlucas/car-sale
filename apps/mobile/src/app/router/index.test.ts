import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "index.ts"), "utf8");

describe("mobile router scroll behavior", () => {
  it("resets scroll to top on forward navigation while preserving browser saved positions", () => {
    expect(source).toContain("scrollBehavior: (_to, _from, savedPosition) => savedPosition ?? { left: 0, top: 0 }");
  });
});
