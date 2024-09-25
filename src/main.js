import { createApp } from "vue";
import App from "./App.vue";
import router from "./router"; // 이 줄이 있는지 확인

createApp(App).use(router).mount("#app");
