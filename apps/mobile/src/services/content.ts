import type { FaqItem, ServiceGuideContent, SupportContent } from "@car/shared-types";
import { requestJson } from "./api";

const guideFallback: ServiceGuideContent = {
  title: "车辆报废流程指南",
  intro: "线上估价、预约拖车、合规拆解、注销办结，全程进度可查。",
  steps: [
    {
      title: "在线估价与预约",
      description: "输入车辆信息并提交申请，平台先给出初步估价和预约建议。",
    },
    {
      title: "联系确认与上门拖车",
      description: "客服确认资料后安排上门拖车，无法行驶车辆也可处理。",
    },
    {
      title: "合规拆解与证明办理",
      description: "车辆进入正规拆解厂处理，并办理回收证明与注销材料。",
    },
  ],
};

const faqFallback: FaqItem[] = [
  {
    id: "faq-1",
    question: "车辆不在本地可以报废吗？",
    answer: "可以，平台会根据车辆位置安排拖车与后续流程。",
  },
  {
    id: "faq-2",
    question: "报废需要准备哪些证件？",
    answer: "通常需要身份证、行驶证、登记证书等，具体会在客服联系时确认。",
  },
];

const supportFallback: SupportContent = {
  phone: "400-800-8899",
  serviceHours: "周一至周日 08:30 - 20:30",
  intro: "专业车辆报废回收平台，为您提供估价、预约、拖车与证明办理协助。",
};

export async function getServiceGuide(): Promise<ServiceGuideContent> {
  try {
    return await requestJson<ServiceGuideContent>("/app/content/service-guide");
  } catch {
    return guideFallback;
  }
}

export async function getFaqs(): Promise<FaqItem[]> {
  try {
    return await requestJson<FaqItem[]>("/app/content/faqs");
  } catch {
    return faqFallback;
  }
}

export async function getSupport(): Promise<SupportContent> {
  try {
    return await requestJson<SupportContent>("/app/content/support");
  } catch {
    return supportFallback;
  }
}
