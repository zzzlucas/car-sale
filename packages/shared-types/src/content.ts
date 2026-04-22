export interface ServiceGuideStep {
  title: string;
  description: string;
}

export interface ServiceGuideContent {
  title: string;
  intro: string;
  steps: ServiceGuideStep[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SupportContent {
  phone: string;
  serviceHours: string;
  intro: string;
}
