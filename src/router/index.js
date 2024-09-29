import PageNotFound from '@/components/pages/PageNotFound.vue';
import routes from '@/router/route';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [...routes, { path: '/:pathMatch(.*)*', name: 'NotFound', component: PageNotFound }],
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('jwt'); // JWT 토큰을 localStorage 또는 쿠키에서 가져옴

    if (to.matched.some((record) => record.meta.requiresAuth) && !token) {
        // 인증이 필요한 페이지에 JWT 토큰이 없으면 프로필 선택 페이지로 리다이렉트
        next('/'); // '/profiles'로 리다이렉트
    } else {
        next(); // 계속 진행
    }
});

let sessionTimeout = 30 * 60 * 1000; // 30분

let logoutTimer = setTimeout(() => {
    // 쿠키 삭제 후 로그아웃 처리
    document.cookie = 'Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/'; // 리다이렉트
}, sessionTimeout);

// 사용자가 활동할 때마다 타이머 리셋 (마우스 클릭, 키보드 입력 등)
document.addEventListener('click', resetTimer);
document.addEventListener('keypress', resetTimer);

function resetTimer() {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
        document.cookie = 'Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/';
    }, sessionTimeout);
}

export default router;
