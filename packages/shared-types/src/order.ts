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
export type VehicleType = "car" | "truck" | "motorcycle";

export interface ValuationOrderPayload {
  vehicleType: VehicleType;
  brandModel: string;
  plateNumber: string;
  plateRetention: boolean;
  wheelMaterial: string;
  weightTons?: number | null;
  contactName: string;
  contactPhone: string;
  pickupAddress: string;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  vehiclePhotos: string[];
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
  contactName: string;
  contactPhone: string;
  pickupAddress: string;
  updatedAt: string;
}

export interface ScrapOrderDetail extends ScrapOrderSummary {
  ownerName: string;
  vin: string;
  vehicleType: VehicleType;
  plateRetention: boolean;
  wheelMaterial: string;
  weightTons?: number | null;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  vehiclePhotos: string[];
  timeline: ScrapOrderTimelineItem[];
}

export interface ValuationOrderSubmitResult {
  id: string;
  orderNo: string;
  currentStatus: ScrapOrderStatus;
}

export interface ValuationPhotoUploadTicketPayload {
  fileName: string;
  contentType?: string;
}

export interface ValuationPhotoUploadTicketResult {
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
  objectPointer: string;
  expiresAt: string;
}
