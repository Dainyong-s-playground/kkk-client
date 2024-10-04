import { createApp } from 'vue';
import App from './App.vue';
import store from './store'; // 스토어 import
import router from './router'; // 라우터 import

const app = createApp(App);

// Vuex 스토어와 라우터를 애플리케이션에 사용 등록
app.use(store);
app.use(router);
app.mount('#app'); // Vue 애플리케이션 마운트
