import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    sampleOrderId: "order-demo-001",
  }),
});
