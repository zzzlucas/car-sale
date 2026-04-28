import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "CustomerHomePage.vue"), "utf8");
const brandImage = fs.readFileSync(path.join(__dirname, "../../../assets/customer-home/brand-mark.png"));
const heroBasePath = path.join(__dirname, "../../../assets/customer-home/banner-base.jpg");
const heroCtaPath = path.join(__dirname, "../../../assets/customer-home/banner-cta.png");
const heroShieldPath = path.join(__dirname, "../../../assets/customer-home/banner-shield.png");

function readPngSize(buffer: Buffer) {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function readJpegSize(buffer: Buffer) {
  let offset = 2;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      throw new Error("Invalid JPEG marker");
    }

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);

    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + length;
  }

  throw new Error("JPEG size marker not found");
}

describe("CustomerHomePage landing layout", () => {
  it("removes the legacy fixed header and inline plate input", () => {
    expect(source).not.toContain('fixed left-0 right-0 top-0');
    expect(source).not.toContain("输入车牌号");
    expect(source).not.toContain('v-model="plateNumber"');
  });

  it("keeps the homepage as a single-cta landing page with support entry", () => {
    expect(source).toContain('to="/customer/valuation"');
    expect(source).toContain("立即估价 / 预约回收");
    expect(source).toContain("常见问题");
    expect(source).toContain("联系客服");
  });

  it("uses optimized layered banner assets as the primary homepage visual", () => {
    expect(source).toContain("homeBrandImage");
    expect(source).toContain("brand-mark.png");
    expect(source).toContain("homeHeroBase");
    expect(source).toContain("homeHeroCta");
    expect(source).toContain("homeHeroShield");
    expect(source).toContain("banner-base.jpg");
    expect(source).toContain("banner-cta.png");
    expect(source).toContain("banner-shield.png");
    expect(source).not.toContain("banner-hero-full.jpg");
    expect(source).toContain('aria-label="立即估价 / 预约回收');
    expect(source).toContain("sr-only");
    expect(source).not.toContain("trustBadges");
    expect(source).not.toContain("homeFlowImage");
    expect(source).not.toContain("homeTrustImage");
  });

  it("keeps the branded hero compact on mobile", () => {
    expect(source).toContain("pt-[calc(env(safe-area-inset-top)+14px)]");
    expect(source).toContain("pb-8");
    expect(source).toContain("mb-4 flex items-center justify-between");
    expect(source).toContain("w-[150px] max-w-[52vw]");
    expect(source).toContain("rounded-[32px]");
    expect(source).toContain("fetchpriority=\"high\"");
    expect(source).toContain("customer-home-hero__base");
    expect(source).toContain("customer-home-hero__cta");
    expect(source).toContain("customer-home-hero__shield");
    expect(source).toContain("px-margin-page pt-8 pb-stack-lg");
  });

  it("adds restrained CTA and shield motion with reduced-motion support", () => {
    expect(source).toContain("@keyframes home-hero-cta-glow");
    expect(source).toContain("@keyframes home-hero-shield-float");
    expect(source).toContain("customer-home-hero__cta-shine");
    expect(source).toContain("prefers-reduced-motion: reduce");
    expect(source).toContain("animation: none");
  });

  it("uses a cropped brand image without large transparent padding", () => {
    const { width, height } = readPngSize(brandImage);

    expect(width).toBeLessThanOrEqual(690);
    expect(height).toBeLessThanOrEqual(250);
  });

  it("keeps the layered hero assets optimized for mobile H5", () => {
    const heroBase = fs.readFileSync(heroBasePath);
    const heroCta = fs.readFileSync(heroCtaPath);
    const heroShield = fs.readFileSync(heroShieldPath);
    const baseSize = readJpegSize(heroBase);
    const ctaSize = readPngSize(heroCta);
    const shieldSize = readPngSize(heroShield);

    expect(baseSize.width).toBeLessThanOrEqual(1200);
    expect(baseSize.height).toBeLessThanOrEqual(850);
    expect(heroBase.byteLength).toBeLessThanOrEqual(380 * 1024);
    expect(ctaSize.width).toBeLessThanOrEqual(900);
    expect(ctaSize.height).toBeLessThanOrEqual(220);
    expect(heroCta.byteLength).toBeLessThanOrEqual(260 * 1024);
    expect(shieldSize.width).toBeLessThanOrEqual(560);
    expect(shieldSize.height).toBeLessThanOrEqual(560);
    expect(heroShield.byteLength).toBeLessThanOrEqual(360 * 1024);
  });
});
