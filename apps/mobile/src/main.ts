import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "./App.vue";
import { applyBrowserChromeClass } from "./app/browserChrome";
import { router } from "./app/router";
import { bindCarAnalyticsToRouter, initCarAnalytics } from "./services/analytics";
import "./styles/main.css";

applyBrowserChromeClass(document.documentElement, navigator.userAgent);
void initCarAnalytics();
bindCarAnalyticsToRouter(router);

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.mount("#app");
