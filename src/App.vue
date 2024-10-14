<template>
    <div class="app-container" :class="{ 'home-background': isHomePage }">
        <header-compo
            v-if="showHeader && !searchMode"
            :class="{ 'header-scrolled': isHeaderScrolled }"
            :show-nav="showNav"
            @toggle-search="toggleSearchMode"
        ></header-compo>
        <page-main v-if="isHomePage && !isLoggedIn && !searchMode"></page-main>
        <template v-else>
            <middle-compo v-if="showMiddleCompo && !searchMode"></middle-compo>
            <fairy-player v-else-if="!searchMode"></fairy-player>
        </template>
        <!-- 검색 모드일 때 search.vue를 전체 화면으로 덮어쓰기 -->
        <search-compo v-if="searchMode" @close-search="toggleSearchMode"></search-compo>
        <!-- 푸터 조건 수정 -->
        <footer-compo v-if="!searchMode && showFooter"></footer-compo>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProfileStore } from './stores/profile';
import { useLayoutStore } from './stores/layout';

import FooterCompo from './components/layout/FooterCompo.vue';
import HeaderCompo from './components/layout/HeaderCompo.vue';
import MiddleCompo from './components/layout/MiddleCompo.vue';
import FairyPlayer from './components/pages/FairyPlayer.vue';
import PageMain from './components/pages/PageMain.vue';
import SearchCompo from './components/layout/SearchCompo.vue';
const router = useRouter();
const profileStore = useProfileStore();
const layoutStore = useLayoutStore();
const { isLoggedIn } = storeToRefs(profileStore);

const isHeaderScrolled = ref(false);
const searchMode = ref(false);

const handleScroll = () => {
    isHeaderScrolled.value = window.scrollY > 50;
};

// 검색 모드 토글 함수
const toggleSearchMode = () => {
    searchMode.value = !searchMode.value;
};

// 로그인 상태 확인 함수
const checkAuth = async () => {
    await profileStore.checkLoginStatus();

    // 로그인이 필요한 페이지 목록
    const authRequiredPages = ['/fairyTaleList', '/dashboard'];

    if (!isLoggedIn.value && authRequiredPages.includes(router.currentRoute.value.path)) {
        router.push('/');
    }
};

// 라우트 변경 시마다 로그인 상태 확인
watch(() => router.currentRoute.value.path, checkAuth);

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
    checkAuth();
});

const showHeader = computed(() => {
    const hiddenHeaderRoutes = ['/profiles', '/search', '/fairyplayer'];
    const isMainPage = router.currentRoute.value.path === '/';

    if (isMainPage && !isLoggedIn.value) {
        return false;
    }

    return !hiddenHeaderRoutes.some((hiddenRoute) =>
        router.currentRoute.value.path.toLowerCase().startsWith(hiddenRoute.toLowerCase()),
    );
});

const showMiddleCompo = computed(() => {
    return !/^\/fairyplayer\/\d+$/.test(router.currentRoute.value.path.toLowerCase());
});

const isHomePage = computed(() => router.currentRoute.value.path === '/');

const showNav = computed(() => {
    return router.currentRoute.value.name === 'FairyTaleList';
});

watch(
    () => router.currentRoute.value.name,
    (newRouteName) => {
        layoutStore.setShowNav(newRouteName === 'FairyTaleList');
    },
);

// showFooter 계산된 속성 수정 및 디버깅 로그 추가
const showFooter = computed(() => {
    const hiddenFooterrRoutes = ['/profiles', '/search'];
    const isMainPage = router.currentRoute.value.path === '/';

    if (isMainPage && !isLoggedIn.value) {
        return false;
    }

    return !hiddenFooterrRoutes.some((hiddenRoute) =>
        router.currentRoute.value.path.toLowerCase().startsWith(hiddenRoute.toLowerCase()),
    );
});
</script>

<style>
@import 'assets/base.css';
div {
    color: #252f39;
}
.app-container.search-mode {
    overflow: hidden;
    height: 100vh;
}
</style>
