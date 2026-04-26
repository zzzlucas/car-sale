export const SUPPORT_PRESET_QUESTIONS = [
  { id: "flow", label: "报废流程怎么走", question: "报废流程怎么走？" },
  { id: "materials", label: "需要准备哪些材料", question: "需要准备哪些材料？" },
  { id: "progress", label: "怎么查看预约进度", question: "怎么查看预约进度？" },
] as const;

export const PROFESSIONAL_SUPPORT_CONTACT = {
  phone: "400-800-8899",
  wechatId: "scrap-service-001",
  serviceHours: [
    "周一至周日 08:30 - 20:30",
    "节假日可先留言，客服会在营业时段优先回呼",
  ],
} as const;

function includesAny(question: string, keywords: string[]) {
  return keywords.some(keyword => question.includes(keyword));
}

export function buildAssistantReply(question: string) {
  if (includesAny(question, ["流程", "报废", "怎么办理"])) {
    return "标准流程一般是：先提交车辆信息和取车地址，随后平台联系确认材料与上门时间，完成拖车/交车后再进入拆解、出具回收证明与注销协办。";
  }

  if (includesAny(question, ["材料", "证件", "资料"])) {
    return "常见材料包括车主身份证、行驶证、登记证书和车辆号牌；如果是代办，还需要补充授权资料。正式办理前，专业客服会再按车辆情况给您核对一遍。";
  }

  if (includesAny(question, ["进度", "记录", "订单", "预约"])) {
    return "您可以先去“预约记录”里查看订单状态和最近更新时间；如果记录里信息异常，建议转专业客服继续核实。";
  }

  if (includesAny(question, ["价格", "估价", "多少钱"])) {
    return "演示版 AI 只能先给您方向性说明，最终回收价仍要结合车型、车况、手续完整度和上门距离综合确认。您也可以先提交估价预约，让专业客服跟进。";
  }

  return "我先帮您做基础说明：这版是前端演示型 AI 助手，适合回答流程、材料、进度这类常见问题；如果涉及订单异常、报价争议或个性化情况，建议转专业客服继续处理。";
}

export function shouldShowInlineProfessionalContact(answeredTurns: number) {
  return answeredTurns >= 1;
}

export function shouldShowFullProfessionalContact(answeredTurns: number) {
  return answeredTurns > 3;
}
