<template>
    <div class="sidebar">
        <ul>
            <li v-for="tab in tabs" :key="tab.id" @click="changeTab(tab.id)" :class="{ active: activeTab === tab.id }">
                {{ tab.name }}
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const tabs = [
    { id: 'info', name: '내 정보' },
    { id: 'rental', name: '대여 이력' },
    { id: 'purchase', name: '소장 이력' },
    { id: 'bucket', name: '찜 목록' },
];

const activeTab = ref('info');

const changeTab = (tabId) => {
    activeTab.value = tabId;
    emit('changeTab', tabId);
};

const emit = defineEmits(['changeTab']);
</script>

<style scope>
.sidebar {
    width: 150px;
    background-color: #f5f5f5;
    padding: 20px;
    height: 100vh;
    position: fixed;
    top: 9vh;
    left: 0;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    transition: width 0.3s ease;
}

@media (max-width: 768px) {
    .sidebar {
        /* 화면이 줄어들 때 사이드바 너비 축소 */
        width: 100px;
    }
}

@media (max-width: 480px) {
    .sidebar {
        /* 더 작은 화면에서는 더 축소 */
        width: 70px;
    }
}

.sidebar ul {
    list-style: none;
    padding: 0;
}

.sidebar li {
    padding: 20px 0 20px 0;
    cursor: pointer;
    font-weight: bold;
    text-align: center;
}

.sidebar li:hover:not(.active) {
    background-color: #eaeaea;
}

.sidebar li.active {
    background-color: #e0e0e0;
    color: #333;
}
</style>
