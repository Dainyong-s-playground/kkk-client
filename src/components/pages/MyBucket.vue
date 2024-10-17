<template>
    <div class="mybucket-container">
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
                    <div class="header-img" @click="deleteBucket(bucket.id)">
                        <img :src="`${IMAGE_SERVER_URL}/profile/delete.png`" />
                    </div>

                    <div class="card" @click="showFairyTaleDetail(bucket)">
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
                                <div class="bucket-rental">{{ formatPrice(bucket.rentalPrice) }}</div>
                                <div class="bucket-purchase">{{ formatPrice(bucket.purchasePrice) }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 전체 페이지 오버레이 추가 -->
        <div v-if="selectedFairyTale || isDetailLoading" class="page-overlay">
            <div v-if="isDetailLoading" class="loading-spinner">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>

        <!-- 동화 상세 정보 컴포넌트 추가 -->
        <FairyTaleDetail
            v-if="selectedFairyTale && !isDetailLoading"
            :fairyTale="selectedFairyTale"
            @close="closeFairyTaleDetail"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { useProfileStore } from '@/stores/profile';
import { IMAGE_SERVER_URL, TALE_API_URL } from '@/constants/api';
import FairyTaleDetail from './FairyTaleDetail.vue';
import { eventBus } from '@/utils/eventBus';

const profileStore = useProfileStore();
const isLoading = ref(true);
const bucketList = ref([]);
const selectedFairyTale = ref(null);
const isDetailLoading = ref(false);

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
        console.log('삭제할 ID:', fairyTaleId);
        console.log('삭제 전 bucketList:', bucketList.value);

        await axios.delete(`${TALE_API_URL}/api/bucket/delete`, {
            params: {
                loginId: profileStore.loginId,
                fairyTaleId: fairyTaleId,
            },
        });

        // 찜 목록에서 해당 아이템 제거
        bucketList.value = bucketList.value.filter((item) => item.id !== fairyTaleId);

        console.log('삭제 후 bucketList:', bucketList.value);
        console.log('찜목록에서 삭제되었습니다.');
    } catch (error) {
        console.error('찜목록 ��제 중 오류가 발생했습니다.', error);
    }
};

const showFairyTaleDetail = async (fairyTale) => {
    isDetailLoading.value = true;
    try {
        // 여기서 동화 상세 정보를 가져오는 API 호출을 수행합니다.
        const response = await axios.get(`${TALE_API_URL}/api/fairytales/${fairyTale.id}`);
        selectedFairyTale.value = response.data;
    } catch (error) {
        console.error('동화 상세 정보를 가져오는 데 실패했습니다:', error);
    } finally {
        isDetailLoading.value = false;
    }
};

const closeFairyTaleDetail = () => {
    selectedFairyTale.value = null;
};

// 가격을 포맷하는 함수 추가
const formatPrice = (price) => {
    return price === 0 ? '무료' : `${price.toLocaleString()}원`;
};

const updateBucketList = (fairyTaleId, isAdded) => {
    if (!isAdded) {
        bucketList.value = bucketList.value.filter((item) => item.id !== fairyTaleId);
    } else {
        // 필요한 경우 여기에 찜 목록에 아이템을 추가하는 로직을 구현합니다.
        // 일반적으로 전체 목록을 다시 불러오는 것이 좋습니다.
        fetchBucketList();
    }
};

onMounted(() => {
    if (profileStore.selectedProfile) {
        fetchBucketList();
    } else {
        console.error('선택된 프로필이 없습니다.');
        isLoading.value = false;
    }
    eventBus.on('bucketUpdated', updateBucketList);
});

onUnmounted(() => {
    eventBus.off('bucketUpdated', updateBucketList);
});
</script>

<style scoped>
.bucketList-container {
    width: 100%;
    margin-top: 5vh;
    padding: 20px;
    font-size: 16px;
}

.bucketList-content {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 20px;
}

.bucketList-card {
    position: relative;
    height: auto;
    width: 90%;
    max-width: 800px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 2px 8px 10px rgba(0, 0, 0, 0.2);
    border-radius: 15px;
    background-color: #ffffff;
    padding: 20px;
    transition: all 0.3s ease;
}

.bucketList-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.header-img {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
    background-color: #f8f9fa;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.header-img:hover {
    background-color: #e9ecef;
}

.header-img img {
    width: 15px;
    height: 15px;
    object-fit: contain;
}

.card {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
}

.card-left {
    width: 30%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.card-right {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 65%;
    height: 100%;
    border-left: 1px solid #e9ecef;
    padding-left: 20px;
}

.header-card,
.card-data {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 10px 0;
}

.header-card {
    border-bottom: 1px solid #e9ecef;
    font-weight: bold;
    color: #495057;
    font-size: 18px;
}

.bucket-img {
    width: 120px;
    height: 160px;
    object-fit: cover;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-title,
.bucket-title {
    width: 60%;
    text-align: left;
}

.header-rental,
.header-purchase,
.bucket-purchase,
.bucket-rental {
    width: 20%;
    text-align: center;
}

.bucket-title {
    font-weight: bold;
    color: #212529;
    font-size: 18px;
}

.bucket-rental,
.bucket-purchase {
    color: #495057;
    font-size: 16px;
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

.mybucket-container {
    position: relative;
    min-height: 100vh;
}

.page-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    transition: opacity 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* FairyTaleDetail 컴포넌트가 오버레이 위에 표시되도록 z-index 조정 */
:deep(.fairy-tale-detail-overlay) {
    z-index: 1001;
}
</style>
