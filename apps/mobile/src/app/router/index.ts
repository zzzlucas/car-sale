import { createRouter, createWebHistory } from "vue-router";

import CustomerLayout from "@/app/layouts/CustomerLayout.vue";
import OperatorLayout from "@/app/layouts/OperatorLayout.vue";
import CustomerGuidePage from "@/modules/customer/pages/CustomerGuidePage.vue";
import CustomerHomePage from "@/modules/customer/pages/CustomerHomePage.vue";
import CustomerMePage from "@/modules/customer/pages/CustomerMePage.vue";
import CustomerRecordsPage from "@/modules/customer/pages/CustomerRecordsPage.vue";
import CustomerProgressPage from "@/modules/customer/pages/CustomerProgressPage.vue";
import CustomerSupportPage from "@/modules/customer/pages/CustomerSupportPage.vue";
import CustomerValuationPage from "@/modules/customer/pages/CustomerValuationPage.vue";
import OperatorHomePage from "@/modules/operator/pages/OperatorHomePage.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/customer" },
    {
      path: "/customer",
      component: CustomerLayout,
      children: [
        { path: "", component: CustomerHomePage },
        { path: "records", component: CustomerRecordsPage },
        { path: "valuation", component: CustomerValuationPage },
        { path: "progress/:orderId", component: CustomerProgressPage, props: true },
        { path: "guide", component: CustomerGuidePage },
        { path: "me", component: CustomerMePage },
        { path: "support", component: CustomerSupportPage },
      ],
    },
    {
      path: "/operator",
      component: OperatorLayout,
      children: [{ path: "", component: OperatorHomePage }],
    },
  ],
});
