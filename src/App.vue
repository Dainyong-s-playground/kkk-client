<template>
    <div class="app-container">
        <header-compo v-if="showHeader"></header-compo>
        <middle-compo></middle-compo>
        <footer-compo v-if="showHeader"></footer-compo>
    </div>
</template>

<script>
import FooterCompo from './components/layout/FooterCompo.vue';
import HeaderCompo from './components/layout/HeaderCompo.vue';
import MiddleCompo from './components/layout/MiddleCompo.vue';
//import { mapState } from 'vuex'; // 상태 관리 사용 시

export default {
    name: 'App',
    components: {
        HeaderCompo,
        MiddleCompo,
        FooterCompo,
    },
    computed: {
        // Vuex나 Pinia로 showHeader 상태 관리 가능
        showHeader() {
            return this.$route.path !== '/profiles'; // '/profiles' 페이지에서만 Header 숨김
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
