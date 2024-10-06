import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // 라우터 import
import { createPinia } from 'pinia';
const app = createApp(App);

const pinia = createPinia();
// Vuex 스토어와 라우터를 애플리케이션에 사용 등록
app.use(pinia);
app.use(router);
app.mount('#app'); // Vue 애플리케이션 마운트
