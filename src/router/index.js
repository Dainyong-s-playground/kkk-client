import PageNotFound from '@/components/pages/PageNotFound.vue';
import routes from '@/router/route';
import { createRouter, createWebHistory } from 'vue-router';
import Cookies from 'js-cookie';

// routes 배열에 requiresAuth 메타 필드 추가
const authedRoutes = routes.map((route) => ({
    ...route,
    meta: { ...route.meta, requiresAuth: true },
}));

// 로그인 페이지와 같이 인증이 필요 없는 라우트는 여기에 추가
const publicRoutes = [{ path: '/', name: 'PageMain', component: () => import('@/components/pages/PageMain.vue') }];

const router = createRouter({
    history: createWebHistory(),
    routes: [...publicRoutes, ...authedRoutes, { path: '/:pathMatch(.*)*', name: 'NotFound', component: PageNotFound }],
});

router.beforeEach((to, from, next) => {
    const token = Cookies.get('Authorization'); // JWT 토큰을 쿠키에서 가져옴

    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!token) {
            // 인증이 필요한 페이지에 JWT 토큰이 없으면 메인 페이지로 리다이렉트
            next('/');
        } else {
            next(); // 토큰이 있으면 요청한 라우트로 진행
        }
    } else {
        next(); // 인증이 필요 없는 페이지는 그대로 진행
    }
});

export default router;
