import { Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';

import type { FaqItem, ServiceGuideContent, SupportContent } from '@car/shared-types';

@Provide()
export class AppContentService extends BaseService {
  async serviceGuide(): Promise<ServiceGuideContent> {
    return {
      title: '车辆报废流程指南',
      intro: '线上估价、预约拖车、合规拆解、注销办结，全程进度可查。',
      steps: [
        {
          title: '在线估价与预约',
          description: '填写车辆信息并提交申请，平台会尽快给出回收建议并联系确认。',
        },
        {
          title: '联系确认与上门拖车',
          description: '客服确认资料后安排拖车，无法行驶车辆也可以正常预约处理。',
        },
        {
          title: '合规拆解与证明办理',
          description: '车辆进入正规拆解流程，并办理报废回收证明与注销材料。',
        },
      ],
    };
  }

  async faqs(): Promise<FaqItem[]> {
    return [
      {
        id: 'faq-1',
        question: '车辆不在本地可以报废吗？',
        answer: '可以，平台会根据车辆位置安排拖车与后续回收流程。',
      },
      {
        id: 'faq-2',
        question: '报废需要准备哪些证件？',
        answer: '通常需要身份证、行驶证、登记证书等，具体由客服联系时确认。',
      },
    ];
  }

  async support(): Promise<SupportContent> {
    return {
      phone: '400-800-8899',
      serviceHours: '周一至周日 08:30 - 20:30',
      intro: '专业车辆报废回收平台，为您提供估价、预约、拖车与证明办理协助。',
    };
  }
}
