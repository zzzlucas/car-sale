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

export interface ValuationOrderSubmitResult {
  id: string;
  orderNo: string;
  currentStatus: ScrapOrderStatus;
}
