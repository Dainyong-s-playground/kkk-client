<template>
    <div class="app-container" :class="{ 'home-background': isHomePage }">
        <header-compo v-if="showHeader" :class="{ 'header-scrolled': isHeaderScrolled }"></header-compo>
        <page-main v-else-if="isHomePage && !isLoggedIn"></page-main>
        <middle-compo v-if="showMiddleCompo"></middle-compo>
        <fairy-player v-else></fairy-player>
        <footer-compo v-if="showHeader"></footer-compo>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProfileStore } from './stores/profile';

import FooterCompo from './components/layout/FooterCompo.vue';
import HeaderCompo from './components/layout/HeaderCompo.vue';
import MiddleCompo from './components/layout/MiddleCompo.vue';
import FairyPlayer from './components/pages/FairyPlayer.vue';
import PageMain from './components/pages/PageMain.vue';

const route = useRoute();
const profileStore = useProfileStore();
const { isLoggedIn } = storeToRefs(profileStore);

const isHeaderScrolled = ref(false);

const handleScroll = () => {
    isHeaderScrolled.value = window.scrollY > 50;
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

// onNaverLogin 함수 제거
</script>

<style>
@import 'assets/base.css';
div {
    color: #252f39;
}
</style>
