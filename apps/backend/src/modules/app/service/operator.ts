import { Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';

@Provide()
export class AppOperatorService extends BaseService {
  async dashboard() {
    return {
      pendingTasks: 3,
      contactNeeded: 1,
      pickupToday: 2,
      latestTask: {
        orderNo: 'VR-8893-X2M',
        status: 'scheduled_pickup',
        contactName: '张三',
        contactPhone: '13800001234',
      },
    };
  }
}
