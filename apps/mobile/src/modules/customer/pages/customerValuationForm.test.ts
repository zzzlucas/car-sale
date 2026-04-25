import { describe, expect, it } from "vitest";

import {
  clearPickupLocation,
  createInitialValuationForm,
  getCurrentLocationRejectionMessage,
  validateValuationForm,
} from "./customerValuationForm";

describe("customer valuation form helpers", () => {
  it("creates a complete default form object for the reservation flow", () => {
    expect(createInitialValuationForm()).toMatchObject({
      vehicleType: "car",
      brandModel: "",
      plateNumber: "",
      plateRetention: true,
      wheelMaterial: "",
      weightTons: null,
      contactName: "",
      contactPhone: "",
      pickupAddress: "",
      pickupLatitude: null,
      pickupLongitude: null,
      vehiclePhotos: [],
    });
  });

  it("requires contact, address, and photo fields before submission", () => {
    expect(
      validateValuationForm({
        ...createInitialValuationForm(),
        brandModel: "丰田 凯美瑞",
      }),
    ).toBe("请先填写联系姓名。");

    expect(
      validateValuationForm({
        ...createInitialValuationForm(),
        brandModel: "丰田 凯美瑞",
        contactName: "张三",
        contactPhone: "13800138000",
      }),
    ).toBe("请先填写取车地址。");

    expect(
      validateValuationForm({
        ...createInitialValuationForm(),
        brandModel: "丰田 凯美瑞",
        contactName: "张三",
        contactPhone: "13800138000",
        pickupAddress: "深圳南山",
      }),
    ).toBe("请至少上传 1 张车辆照片。");
  });

  it("clears stale coordinates when the pickup address is manually edited", () => {
    const form = {
      ...createInitialValuationForm(),
      pickupAddress: "深圳南山",
      pickupLatitude: 22.54,
      pickupLongitude: 113.93,
    };

    expect(clearPickupLocation(form)).toBe(true);
    expect(form.pickupLatitude).toBeNull();
    expect(form.pickupLongitude).toBeNull();
  });

  it("rejects low accuracy browser locations before reverse geocoding", () => {
    expect(getCurrentLocationRejectionMessage({ latitude: 23.13, longitude: 113.36, accuracy: 1500 })).toBe(
      "定位精度较低，请搜索地址建议或手动填写取车地址。",
    );
  });

  it("rejects browser locations outside the supported pickup area", () => {
    expect(getCurrentLocationRejectionMessage({ latitude: 35.676423, longitude: 139.650027, accuracy: 50 })).toBe(
      "当前位置不在当前服务范围内，请搜索地址建议或手动填写取车地址。",
    );
  });
});
