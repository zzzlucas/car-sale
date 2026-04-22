import { Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';

import type {
  ScrapOrderDetail,
  ScrapOrderSummary,
  ValuationOrderPayload,
  ValuationOrderSubmitResult,
} from '@car/shared-types';

@Provide()
export class AppOrderService extends BaseService {
  private readonly sampleOrder: ScrapOrderDetail = {
    id: 'order-demo-001',
    orderNo: 'VR-8893-X2M',
    currentStatus: 'scheduled_pickup',
    currentStatusLabel: '已安排上门 / 拖车',
    brandModel: '丰田 凯美瑞',
    plateNumber: '京A·88888',
    ownerName: '张三',
    vin: 'LTV1234567890ABCD',
    timeline: [
      { status: 'submitted', label: '已提交', time: '2026-04-22 09:30' },
      { status: 'contacted', label: '联系中', time: '2026-04-22 10:15' },
      { status: 'quoted', label: '估价完成', time: '2026-04-22 14:00' },
      {
        status: 'scheduled_pickup',
        label: '已安排上门 / 拖车',
        time: '2026-04-23 14:00',
        note: '工作人员将于今天 14:00 抵达现场，请保持电话畅通。',
      },
    ],
  };

  async submit(_payload: ValuationOrderPayload): Promise<ValuationOrderSubmitResult> {
    const slug = Date.now().toString().slice(-6);
    return {
      id: `order-${slug}`,
      orderNo: `VR-${slug}-H5`,
      currentStatus: 'submitted',
    };
  }

  async detail(id: string): Promise<ScrapOrderDetail> {
    return {
      ...this.sampleOrder,
      id,
    };
  }

  async progress(id: string): Promise<ScrapOrderDetail> {
    return this.detail(id);
  }

  async myOrders(): Promise<ScrapOrderSummary[]> {
    return [
      {
        id: this.sampleOrder.id,
        orderNo: this.sampleOrder.orderNo,
        currentStatus: this.sampleOrder.currentStatus,
        currentStatusLabel: this.sampleOrder.currentStatusLabel,
        brandModel: this.sampleOrder.brandModel,
        plateNumber: this.sampleOrder.plateNumber,
      },
      {
        id: 'order-demo-002',
        orderNo: 'VR-1024-A1B',
        currentStatus: 'completed',
        currentStatusLabel: '已完成',
        brandModel: '大众 帕萨特',
        plateNumber: '京B·10240',
      },
    ];
  }
}
