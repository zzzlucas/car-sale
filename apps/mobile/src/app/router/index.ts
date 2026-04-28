import { createRouter, createWebHistory } from "vue-router";

import CustomerLayout from "@/app/layouts/CustomerLayout.vue";
import OperatorLayout from "@/app/layouts/OperatorLayout.vue";
import CustomerGuidePage from "@/modules/customer/pages/CustomerGuidePage.vue";
import CustomerHomePage from "@/modules/customer/pages/CustomerHomePage.vue";
import CustomerMePage from "@/modules/customer/pages/CustomerMePage.vue";
import CustomerRecordsPage from "@/modules/customer/pages/CustomerRecordsPage.vue";
import CustomerProgressPage from "@/modules/customer/pages/CustomerProgressPage.vue";
import CustomerSupportContactPage from "@/modules/customer/pages/CustomerSupportContactPage.vue";
import CustomerSupportPage from "@/modules/customer/pages/CustomerSupportPage.vue";
import CustomerValuationPage from "@/modules/customer/pages/CustomerValuationPage.vue";
import OperatorHomePage from "@/modules/operator/pages/OperatorHomePage.vue";

const DEFAULT_DOCUMENT_TITLE = "报废车预约平台";

declare module "vue-router" {
  interface RouteMeta {
    title?: string;
  }
}

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: (_to, _from, savedPosition) => savedPosition ?? { left: 0, top: 0 },
  routes: [
    { path: "/", redirect: "/customer" },
    {
      path: "/customer",
      component: CustomerLayout,
      children: [
        { path: "", component: CustomerHomePage, meta: { title: DEFAULT_DOCUMENT_TITLE } },
        { path: "records", component: CustomerRecordsPage, meta: { title: "预约记录" } },
        { path: "valuation", component: CustomerValuationPage, meta: { title: "车辆估价评估" } },
        { path: "progress/:orderId", component: CustomerProgressPage, props: true, meta: { title: "报废进度" } },
        { path: "guide", component: CustomerGuidePage, meta: { title: "报废流程指南" } },
        { path: "me", component: CustomerMePage, meta: { title: "我的" } },
        { path: "support/contact", component: CustomerSupportContactPage, meta: { title: "一对一客服" } },
        { path: "support", component: CustomerSupportPage, meta: { title: "AI 客服助手" } },
      ],
    },
    {
      path: "/operator",
      component: OperatorLayout,
      children: [{ path: "", component: OperatorHomePage }],
    },
  ],
});

router.afterEach((to) => {
  document.title = to.meta.title ?? DEFAULT_DOCUMENT_TITLE;
});
