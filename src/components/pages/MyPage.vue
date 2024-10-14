<template>
    <div class="mypage-container">
        <SidebarCompo @changeTab="setActiveTab" />
        <div class="content-container">
            <component :is="activeTabComponent" />
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import SidebarCompo from '../layout/SidebarCompo.vue';
import MyProfileVue from './MyProfile.vue';
import PurchaseHistoryVue from './PurchaseHistory.vue';
import RentalHistoryVue from './RentalHistory.vue';

// 현재 선택된 탭 상태
const activeTab = ref('info');

// 탭 변경 함수 정의
const setActiveTab = (tab) => {
    activeTab.value = tab;
};

// 탭에 따른 동적 컴포넌트 설정
const activeTabComponent = computed(() => {
    if (activeTab.value === 'rental') return RentalHistoryVue;
    else if (activeTab.value === 'purchase') return PurchaseHistoryVue;
    return MyProfileVue;
});
</script>

<style scoped>
.mypage-container {
    display: flex;
}

.content-container {
    flex-grow: 1;
    min-height: 80dvh;
    padding: 20px;
    margin-top: 10vh;
    margin-left: 150px;
    transition: margin-left 0.3s ease;
    background-color: #fff;
}

@media (max-width: 768px) {
    .content-container {
        /* 작은 화면에서 사이드바가 줄어들 때 콘텐츠 여백 조정 */
        margin-left: 100px;
    }
}

@media (max-width: 480px) {
    .content-container {
        /* 더 작은 화면에서는 사이드바 너비 축소 */
        margin-left: 70px;
    }
}
</style>
