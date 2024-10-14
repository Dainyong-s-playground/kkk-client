<template>
    <div>
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
        <div class="bucketList-container">
            <div class="bucketList-content">
                <div class="bucketList-card" v-for="(bucket, index) in bucketList" :key="index">
                    <button class="header-img" @click="deleteBucket(bucket.id)">
                        <img :src="`${IMAGE_SERVER_URL}/profile/delete.png`" />
                    </button>

                    <div class="card">
                        <div class="card-left">
                            <img class="bucket-img" :src="bucket.image" />
                        </div>
                        <div class="card-right">
                            <div class="header-card">
                                <div class="header-title">동화 제목</div>
                                <div class="header-rental">대여</div>
                                <div class="header-purchase">소장</div>
                            </div>
                            <div class="card-data">
                                <div class="bucket-title">{{ bucket.title }}</div>
                                <div class="bucket-rental">{{ bucket.rentalPrice }}</div>
                                <div class="bucket-purchase">{{ bucket.purchasePrice }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useProfileStore } from '@/stores/profile';
import { IMAGE_SERVER_URL, TALE_API_URL } from '@/constants/api';

const profileStore = useProfileStore();
const isLoading = ref(true);
const bucketList = ref([]);

// 백엔드에서 구매 목록 데이터를 가져오는 함수
const fetchBucketList = async () => {
    try {
        const response = await axios.get(`${TALE_API_URL}/api/bucket/${profileStore.loginId}`);
        bucketList.value = response.data; // 데이터 저장
    } catch (error) {
        console.error('Failed to fetch purchase books:', error);
    } finally {
        isLoading.value = false; // 로딩 종료
    }
};

const deleteBucket = async (fairyTaleId) => {
    try {
        console.log(fairyTaleId);

        const selectedBucket = {
            loginId: profileStore.loginId, // 현재 선택된 프로필의 ID
            fairyTaleId: fairyTaleId, // 동화 제목
        };
        await axios.delete(`${TALE_API_URL}/api/deletebucket/`, selectedBucket);
        await fetchBucketList();
        console.log('찜목록에서 삭제되었습니다.');
    } catch (error) {
        console.error('찜목록 삭제 중 오류가 발생했습니다.', error);
    }
};

// 컴포넌트가 마운트될 때 데이터 로딩
onMounted(async () => {
    if (profileStore.selectedProfile) {
        await fetchBucketList();
    } else {
        console.error('선택된 프로필이 없습니다.');
        isLoading.value = false;
    }
});
</script>

<style scoped>
.bucketList-container {
    width: 100%;
}

.bucketList-content {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.bucketList-card {
    position: relative;
    height: 200px;
    width: 80%;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    box-shadow: #ccc;
    border-radius: 20px;
}

.header-img {
    background: none;
    position: absolute;
    width: 25px;
    height: 25px;
    right: 100px;
    border: none;
}

.header-img img {
    width: 20px;
    height: 20px;
    object-fit: cover;
    border-radius: 5px;
}

.card {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.card-left {
    width: 15%;
    display: flex;
    justify-content: center;
}

.card-right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 60%;
    height: 100%;
    border-top: 1px solid;
}

.header-card {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 20%;
    border-bottom: 1px solid #ccc;
}

.card-data {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 80%;
    border-bottom: 1px solid #ccc;
}

.bucket-img {
    width: 150px;
    height: 150px;
    object-fit: contain;
    border-radius: 10px;
}

.header-title,
.bucket-title {
    width: 70%;
    text-align: center;
}

.header-rental,
.header-purchase,
.bucket-purchase,
.bucket-rental {
    width: 15%;
    text-align: center;
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.loading-spinner {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
}

.loading-spinner div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 64px;
    height: 64px;
    margin: 8px;
    border: 8px solid #fff;
    border-radius: 50%;
    animation: loading-spinner 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #fff transparent transparent transparent;
}

.loading-spinner div:nth-child(1) {
    animation-delay: -0.3s;
}

.loading-spinner div:nth-child(2) {
    animation-delay: -0.25s;
}

.loading-spinner div:nth-child(3) {
    animation-delay: -0.1s;
}

@keyframes loading-spinner {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
