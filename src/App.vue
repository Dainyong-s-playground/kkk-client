<template>
    <div class="app-container" :class="{ 'home-background': isHomePage }">
        <header-compo
            v-if="showHeader"
            :class="{ 'header-scrolled': isHeaderScrolled }"
            :show-nav="showNav"
        ></header-compo>
        <page-main v-if="isHomePage && !isLoggedIn"></page-main>
        <template v-else>
            <middle-compo v-if="showMiddleCompo"></middle-compo>
            <fairy-player v-else></fairy-player>
        </template>
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

const route = useRoute();
const profileStore = useProfileStore();
const layoutStore = useLayoutStore();
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
</style>
