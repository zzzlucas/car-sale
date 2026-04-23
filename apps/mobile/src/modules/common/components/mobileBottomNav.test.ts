import { describe, expect, it } from "vitest";

import { MOBILE_BOTTOM_NAV_ITEMS, findActiveTabIndex, getTabIndexFromOffset, snapTabIndex } from "./mobileBottomNav";

describe("findActiveTabIndex", () => {
  it("maps each primary customer route to the matching tab", () => {
    expect(findActiveTabIndex("/customer", MOBILE_BOTTOM_NAV_ITEMS)).toBe(0);
    expect(findActiveTabIndex("/customer/valuation", MOBILE_BOTTOM_NAV_ITEMS)).toBe(1);
    expect(findActiveTabIndex("/customer/records", MOBILE_BOTTOM_NAV_ITEMS)).toBe(2);
    expect(findActiveTabIndex("/customer/me", MOBILE_BOTTOM_NAV_ITEMS)).toBe(3);
  });

  it("keeps order progress under the records tab", () => {
    expect(findActiveTabIndex("/customer/progress/order-demo-001", MOBILE_BOTTOM_NAV_ITEMS)).toBe(2);
  });

  it("falls back to the home tab for unknown routes", () => {
    expect(findActiveTabIndex("/customer/unknown", MOBILE_BOTTOM_NAV_ITEMS)).toBe(0);
  });
});

describe("snapTabIndex", () => {
  it("snaps to the nearest tab when dragging across more than half of a slot", () => {
    expect(
      snapTabIndex({
        originIndex: 0,
        deltaX: 48,
        itemWidth: 80,
        itemCount: MOBILE_BOTTOM_NAV_ITEMS.length,
      }),
    ).toBe(1);
  });

  it("stays on the current tab when the drag distance is short", () => {
    expect(
      snapTabIndex({
        originIndex: 2,
        deltaX: -26,
        itemWidth: 80,
        itemCount: MOBILE_BOTTOM_NAV_ITEMS.length,
      }),
    ).toBe(2);
  });

  it("clamps to the valid tab range at both ends", () => {
    expect(
      snapTabIndex({
        originIndex: 0,
        deltaX: -200,
        itemWidth: 80,
        itemCount: MOBILE_BOTTOM_NAV_ITEMS.length,
      }),
    ).toBe(0);

    expect(
      snapTabIndex({
        originIndex: 3,
        deltaX: 200,
        itemWidth: 80,
        itemCount: MOBILE_BOTTOM_NAV_ITEMS.length,
      }),
    ).toBe(3);
  });
});

describe("getTabIndexFromOffset", () => {
  it("maps pointer offsets to the nearest tab slot across the full track", () => {
    expect(getTabIndexFromOffset(-20, 320, MOBILE_BOTTOM_NAV_ITEMS.length)).toBe(0);
    expect(getTabIndexFromOffset(20, 320, MOBILE_BOTTOM_NAV_ITEMS.length)).toBe(0);
    expect(getTabIndexFromOffset(96, 320, MOBILE_BOTTOM_NAV_ITEMS.length)).toBe(1);
    expect(getTabIndexFromOffset(188, 320, MOBILE_BOTTOM_NAV_ITEMS.length)).toBe(2);
    expect(getTabIndexFromOffset(319, 320, MOBILE_BOTTOM_NAV_ITEMS.length)).toBe(3);
    expect(getTabIndexFromOffset(400, 320, MOBILE_BOTTOM_NAV_ITEMS.length)).toBe(3);
  });
});
