import type { ValuationOrderPayload } from "@car/shared-types";

const MAX_ACCEPTED_LOCATION_ACCURACY_METERS = 1000;
const SUPPORTED_PICKUP_BOUNDS = {
  minLatitude: 18,
  maxLatitude: 54,
  minLongitude: 73,
  maxLongitude: 135,
};

type BrowserLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};

export function createInitialValuationForm(): ValuationOrderPayload {
  return {
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
  };
}

export function validateValuationForm(form: ValuationOrderPayload) {
  if (!form.brandModel.trim()) {
    return "请先填写车辆品牌型号。";
  }

  if (!form.contactName.trim()) {
    return "请先填写联系姓名。";
  }

  if (!/^1\d{10}$/.test(form.contactPhone.trim())) {
    return "请填写正确的联系电话。";
  }

  if (!form.pickupAddress.trim()) {
    return "请先填写取车地址。";
  }

  if (!form.vehiclePhotos.length) {
    return "请至少上传 1 张车辆照片。";
  }

  return null;
}

export function clearPickupLocation(form: Pick<ValuationOrderPayload, "pickupLatitude" | "pickupLongitude">) {
  const hadLocation = form.pickupLatitude !== null || form.pickupLongitude !== null;
  form.pickupLatitude = null;
  form.pickupLongitude = null;
  return hadLocation;
}

export function getCurrentLocationRejectionMessage(location: BrowserLocation) {
  if (
    !Number.isFinite(location.latitude) ||
    !Number.isFinite(location.longitude) ||
    location.latitude < -90 ||
    location.latitude > 90 ||
    location.longitude < -180 ||
    location.longitude > 180
  ) {
    return "定位结果无效，请搜索地址建议或手动填写取车地址。";
  }

  if (
    Number.isFinite(location.accuracy) &&
    Number(location.accuracy) > MAX_ACCEPTED_LOCATION_ACCURACY_METERS
  ) {
    return "定位精度较低，请搜索地址建议或手动填写取车地址。";
  }

  if (
    location.latitude < SUPPORTED_PICKUP_BOUNDS.minLatitude ||
    location.latitude > SUPPORTED_PICKUP_BOUNDS.maxLatitude ||
    location.longitude < SUPPORTED_PICKUP_BOUNDS.minLongitude ||
    location.longitude > SUPPORTED_PICKUP_BOUNDS.maxLongitude
  ) {
    return "当前位置不在当前服务范围内，请搜索地址建议或手动填写取车地址。";
  }

  return null;
}
