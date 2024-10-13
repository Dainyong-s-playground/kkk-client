<template>
    <div class="profile-info">
        <img :src="profileStore.selectedProfile.image" alt="프로필 이미지" class="profile-img" />
        <h2>{{ profileStore.selectedProfile.nickname }}</h2>
        <p>{{ profileStore.selectedProfile.birth }}</p>
        <p>{{ profileStore.selectedProfile.gender }}</p>
    </div>

    <div class="stats">
        <div>
            <p>총 구매 권수</p>
            <p>{{ totalPurchases }}</p>
        </div>
        <div>
            <p>총 대여 횟수</p>
            <p>{{ totalRentals }}</p>
        </div>
    </div>
</template>

<script setup>
import { useProfileStore } from '@/stores/profile'; // 프로필 스토어 가져오기
import { onMounted, ref } from 'vue';
import axios from 'axios';

const profileStore = useProfileStore();

// 총 구매 권수와 대여 횟수를 저장할 상태 변수
const totalPurchases = ref(0);
const totalRentals = ref(0);

// 백엔드에서 총 구매 권수와 대여 횟수를 받아오는 함수
const fetchProfileStats = async () => {
    if (!profileStore.selectedProfile) {
        console.error('선택된 프로필 정보가 없습니다.');
        return;
    }
    try {
        const response = await axios.get(
            `http://localhost:7772/api/mypage/buyingStats/${profileStore.selectedProfile.id}`,
        );

        // 서버에서 받아온 데이터로 상태 업데이트
        totalPurchases.value = response.data.totalPurchaseCount;
        totalRentals.value = response.data.totalRentalCount;
    } catch (error) {
        console.error('Failed to fetch profile stats:', error);
    }
};

// 컴포넌트가 마운트될 때 데이터 가져오기
onMounted(async () => {
    await fetchProfileStats();
});
</script>

<style scope>
.profile-info {
    text-align: center;
}

.profile-img {
    width: 200px;
    height: 200px;
}

.profile-info h2 {
    font-size: 36px;
}

.profile-info p {
    font-size: 16px;
    margin: 10px 0;
}

.stats {
    display: flex;
    justify-content: center;
    margin-top: 50px;
}

.stats div {
    width: 150px;
    height: 100%;
    padding: 10px 20px;
    border: 1px solid #ddd;
    margin: 0 10px;
    border-radius: 10%;
    text-align: center;
}

.stats p:first-child {
    /* 총 구매권수, 총 대여 횟수 */
    font-size: 26px;
}

.stats p:last-child {
    /* user.totalPurchases와 user.totalRentals */
    font-weight: bold;
    font-size: 26px;
    color: darkblue;
}
</style>
