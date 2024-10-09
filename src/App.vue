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
    </div>
</template>

<script setup>
import { computed, onMounted, ref, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProfileStore } from './stores/profile';
import { useLayoutStore } from './stores/layout';

// import FooterCompo from './components/layout/FooterCompo.vue';
import HeaderCompo from './components/layout/HeaderCompo.vue';
import MiddleCompo from './components/layout/MiddleCompo.vue';
import FairyPlayer from './components/pages/FairyPlayer.vue';
import PageMain from './components/pages/PageMain.vue';
import SearchCompo from './components/layout/SearchCompo.vue';
const route = useRoute();
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

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
    profileStore.checkLoginStatus();
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});

const showHeader = computed(() => {
    const hiddenHeaderRoutes = ['/profiles', '/search', /^\/fairyplayer\/\d+$/];
    const isMainPage = route.path === '/';

    if (isMainPage && !isLoggedIn.value) {
        return false;
    }

    return !hiddenHeaderRoutes.some((hiddenRoute) =>
        typeof hiddenRoute === 'string'
            ? hiddenRoute === route.path.toLowerCase()
            : hiddenRoute.test(route.path.toLowerCase()),
    );
});

const showMiddleCompo = computed(() => {
    return !/^\/fairyplayer\/\d+$/.test(route.path.toLowerCase());
});

const isHomePage = computed(() => route.path === '/');

const showNav = computed(() => {
    return route.name === 'FairyTaleList';
});

watch(
    () => route.name,
    (newRouteName) => {
        layoutStore.setShowNav(newRouteName === 'FairyTaleList');
    },
);
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
