<template>
    <div class="app-container">
        <header-compo v-if="showHeader"></header-compo>
        <middle-compo v-if="showMiddleCompo"></middle-compo>
        <fairy-player v-else></fairy-player>
        <footer-compo v-if="showHeader"></footer-compo>
    </div>
</template>

<script>
import FooterCompo from './components/layout/FooterCompo.vue';
import HeaderCompo from './components/layout/HeaderCompo.vue';
import MiddleCompo from './components/layout/MiddleCompo.vue';
import FairyPlayer from './components/pages/FairyPlayer.vue';

export default {
    name: 'App',
    components: {
        HeaderCompo,
        MiddleCompo,
        FairyPlayer,
        FooterCompo,
    },
    computed: {
        showHeader() {
            const hiddenHeaderRoutes = ['/profiles', /^\/fairyplayer\/\d+$/];
            return !hiddenHeaderRoutes.some((route) =>
                typeof route === 'string'
                    ? route === this.$route.path.toLowerCase()
                    : route.test(this.$route.path.toLowerCase()),
            );
        },
        showMiddleCompo() {
            return !/^\/fairyplayer\/\d+$/.test(this.$route.path.toLowerCase());
        },
    },
};
</script>

<style>
@import 'assets/base.css';
div {
    color: #252f39;
}
</style>
