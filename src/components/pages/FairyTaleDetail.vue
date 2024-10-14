<template>
    <div class="fairy-tale-detail-overlay" @click="closeDetail" @wheel.stop>
        <div
            class="detail-content"
            @click.stop
            :class="{
                'fade-in': !isClosing && !isTransitioning,
                'fade-out': isClosing,
                'fade-out-in': isTransitioning,
            }"
        >
            <!-- 로딩 인디케이터 추가 -->
            <div v-if="isLoading" class="loading-overlay">
                <div class="loading-spinner"></div>
            </div>

            <!-- 기존 코드 ... -->

            <div v-else class="detail-body">
                <div class="image-container">
                    <img :src="fairyTale.imageUrl" :alt="fairyTale.title" class="detail-image" />
                    <!-- 프로그레스 바를 항상 표시하도록 수정 -->
                    <div class="progress-bar-container">
                        <div class="progress-bar" :style="{ width: `${progressPercentage}%` }"></div>
                    </div>
                    <div class="image-overlay"></div>
                    <div
                        v-if="isOwned || isRented"
                        class="ownership-status"
                        :class="{ owned: isOwned, rented: isRented }"
                    >
                        {{ isOwned ? '소장' : '대여 중' }}
                    </div>
                    <h2 class="detail-title">{{ fairyTale.title }}</h2>
                    <div class="content-info">
                        <div class="content-type-icon" :class="{ paid: fairyTale.rentalPrice > 0 }">
                            {{ fairyTale.rentalPrice > 0 ? '유료' : '무료' }}
                        </div>
                        <div class="view-count">
                            <img :src="`${IMAGE_SERVER_URL}/detailPage/eyeIcon.png`" alt="조회수" class="eye-icon" />
                            <span>{{ localViews }}</span>
                        </div>
                    </div>
                    <button @click="$emit('close')" class="close-button">
                        <img :src="`${IMAGE_SERVER_URL}/detailPage/closeButton.png`" alt="닫기" class="close-icon" />
                    </button>
                </div>
                <div class="detail-info">
                    <div class="button-group">
                        <template v-if="!isLoading">
                            <button
                                v-if="fairyTale.rentalPrice === 0 || isOwnedOrRented"
                                class="play-button"
                                @click="playFairyTale"
                            >
                                <img
                                    :src="`${IMAGE_SERVER_URL}/fairyPlayer/playIcon.png`"
                                    alt="재생"
                                    class="play-icon"
                                />
                                <span :class="{ 'fade-in': isDataLoaded }">
                                    {{ playButtonText }}
                                </span>
                            </button>
                            <button v-else class="rent-buy-button" @click="openRentBuyModal">
                                <img
                                    :src="`${IMAGE_SERVER_URL}/detailPage/cartIcon.png`"
                                    alt="구매"
                                    class="cart-icon"
                                />
                                동화 대여/소장하기
                            </button>
                            <button class="download-button">
                                <img
                                    :src="`${IMAGE_SERVER_URL}/detailPage/underArrow.png`"
                                    alt="저장"
                                    class="download-icon"
                                />
                                저장
                            </button>
                        </template>
                        <template v-else>
                            <div class="loading-placeholder">로딩 ...</div>
                        </template>
                    </div>
                    <div class="scrollable-content" @wheel.stop>
                        <p class="description">{{ fairyTale.description }}</p>
                        <p v-if="fairyTale.episode" class="episode">{{ fairyTale.episode }}</p>
                        <div class="recommendations">
                            <h3 class="recommendations-category-title">다른 동화 추천</h3>
                            <div class="recommendations-list">
                                <div
                                    v-for="tale in recommendedTales"
                                    :key="tale.id"
                                    class="recommendation-item"
                                    @click="selectRecommendedTale(tale.id)"
                                >
                                    <img :src="tale.imageUrl" :alt="tale.title" class="recommendation-image" />
                                    <p class="recommendation-title">{{ tale.title }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 모달 컴포넌트 -->
        <div v-if="showRentBuyModal" class="modal-overlay" @click="closeRentBuyModal">
            <div class="modal-content" @click.stop>
                <h2>{{ fairyTale.title }} 대여/소장하기</h2>
                <div class="price-options">
                    <div class="price-option">
                        <h3>대여하기</h3>
                        <p class="price">{{ rentPrice }}원</p>
                        <button @click="rentFairyTale" class="rent-button">대여하기</button>
                    </div>
                    <div class="price-option">
                        <h3>소장하기</h3>
                        <p class="price">{{ buyPrice }}원</p>
                        <button @click="buyFairyTale" class="buy-button">소장하기</button>
                    </div>
                </div>
                <button @click="closeRentBuyModal" class="close-modal-button">닫기</button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { defineProps, ref, defineEmits, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '@/stores/profile';
import axios from 'axios';
import { TALE_API_URL, IMAGE_SERVER_URL } from '@/constants/api';
// import { inject } from 'vue';
// import { nextTick } from 'vue';

const router = useRouter();
const profileStore = useProfileStore();
const showRentBuyModal = ref(false);
const isOwned = ref(false);
const isRented = ref(false);
const isClosing = ref(false);
// const isRemoving = ref(false);
const isLoading = ref(false);
const isDataLoaded = ref(false);
const progress = ref(0);

const props = defineProps({
    fairyTale: {
        type: Object,
        required: true,
    },
});

const fairyTale = ref({ ...props.fairyTale });
const recommendedTales = ref([]);

const emit = defineEmits(['update:fairyTale', 'close', 'update:views']);

const checkOwnership = async () => {
    isLoading.value = true;
    try {
        const response = await axios.get(
            `${TALE_API_URL}/api/fairy-tale-ownership/check/${profileStore.selectedProfile.id}/${fairyTale.value.id}`,
        );
        console.log('소유권 확인 응답:', response.data);
        fairyTale.value = { ...fairyTale.value, ...response.data };
        isOwned.value = response.data.purchased;
        isRented.value = response.data.rented;
        progress.value = response.data.progress || 0;
        console.log('Progress updated:', progress.value);
    } catch (error) {
        console.error('소유권 확인 실패:', error);
    } finally {
        isLoading.value = false;
        isDataLoaded.value = true;
    }
};

const fetchRecommendations = async () => {
    try {
        const response = await axios.get(`${TALE_API_URL}/api/fairytales/${fairyTale.value.id}/recommendations`);
        recommendedTales.value = response.data;
    } catch (error) {
        console.error('추천 동화 가져오기 실패:', error);
    }
};

const fetchFairyTaleDetails = async (id) => {
    try {
        const response = await axios.get(`${TALE_API_URL}/api/fairytales/${id}`);
        fairyTale.value = response.data;
        localViews.value = response.data.views;
        emit('update:fairyTale', fairyTale.value);
        emit('update:views', localViews.value);
    } catch (error) {
        console.error('동화 상세 정보 가져오기 실패:', error);
    }
};

const isTransitioning = ref(false);

const selectRecommendedTale = async (taleId) => {
    if (fairyTale.value.id !== taleId) {
        isTransitioning.value = true;
        isLoading.value = true;

        try {
            await fetchFairyTaleDetails(taleId);
            await checkOwnership();
            await fetchRecommendations();
        } catch (error) {
            console.error('동화 전환 중 오류 발생:', error);
        } finally {
            isLoading.value = false;
            setTimeout(() => {
                isTransitioning.value = false;
            }, 300); // 페이드 인 효과를 위해 약간의 지연 추가
        }
    }
};

onMounted(() => {
    checkOwnership();
    fetchRecommendations();
    document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
    document.body.style.overflow = '';
});

watch(
    () => props.fairyTale,
    (newValue) => {
        fairyTale.value = { ...newValue };
        checkOwnership();
    },
    { deep: true },
);

const playFairyTale = () => {
    // fairyTale 객체에 id 는 경우를 비해 임시 ID를 생성합니다.
    const fairyTaleId = fairyTale.value.id || `temp_${Math.floor(Math.random() * 1000)}`;

    // 새 탭에 열 URL을 생성합니다.
    const url = router.resolve({
        name: 'FairyPlayer',
        params: { id: fairyTaleId },
        query: {
            title: fairyTale.value.title,
            progress: fairyTale.value.progress || 0,
            imageUrl: fairyTale.value.imageUrl,
        },
    }).href;

    // 새 탭에서 URL을 엽니다.
    window.open(url, '_blank');
};

const closeDetail = () => {
    if (isClosing.value) return;
    isClosing.value = true;
    setTimeout(() => {
        emit('close');
    }, 300);
};

// const disableScroll = (e) => {
//     e.preventDefault();
// };

const localViews = ref(props.fairyTale.views);

// props.fairyTale.views가 변경될 때마다 localViews를 업데이트합니다.
watch(
    () => props.fairyTale.views,
    (newViews) => {
        localViews.value = newViews;
    },
);

const openRentBuyModal = () => {
    console.log('모달 열기');
    showRentBuyModal.value = true;
};

const closeRentBuyModal = () => {
    showRentBuyModal.value = false;
};

const rentFairyTale = async () => {
    try {
        const response = await axios.post(`${TALE_API_URL}/api/fairy-tale-ownership/rent`, {
            profileId: profileStore.selectedProfile.id,
            fairyTaleId: fairyTale.value.id,
        });
        console.log('동화 대여 성공:', response.data);
        isRented.value = true;
        closeRentBuyModal();
    } catch (error) {
        console.error('동화 대여 실패:', error);
    }
};

const buyFairyTale = async () => {
    try {
        const response = await axios.post(`${TALE_API_URL}/api/fairy-tale-ownership/purchase`, {
            profileId: profileStore.selectedProfile.id,
            fairyTaleId: fairyTale.value.id,
        });
        console.log('동화 구매 성공:', response.data);
        isOwned.value = true;
        closeRentBuyModal();
    } catch (error) {
        console.error('동화 구매 실패:', error);
    }
};

// rentPrice와 buyPrice 계산된 속성 수정
const rentPrice = computed(() => fairyTale.value.rentalPrice);
const buyPrice = computed(() => fairyTale.value.purchasePrice || fairyTale.value.rentalPrice * 2);

const isOwnedOrRented = computed(() => isOwned.value || isRented.value);

// calculateProgress 함수 추가
const calculateProgress = (progressValue) => {
    if (!progressValue) return 0;
    let numericProgress = parseFloat(progressValue);
    return isNaN(numericProgress) ? 0 : Math.min(Math.max(numericProgress, 0), 100);
};

const progressPercentage = computed(() => {
    return calculateProgress(progress.value);
});

const playButtonText = computed(() => {
    return progress.value > 0 ? `이어보기 ${progressPercentage.value}%` : '재생하기';
});

// const controlScroll = inject('controlScroll');
</script>

<style scoped>
.fairy-tale-detail-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    overflow-y: auto;
}

.detail-content {
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1002;
    background-color: rgba(42, 42, 42, 0.8);
    color: white;
    width: 650px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
    margin: auto;
    max-height: 90vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.detail-title {
    position: absolute;
    bottom: 30px;
    left: 20px;
    font-size: 40px;
    font-weight: bold;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    margin: 0;
    z-index: 1;
    line-height: 1.2; /* 약간의 여를 둔 줄 간격 */
}

.close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    width: 36px;
    height: 36px;
    top: 11px;
    right: 11px;
    border: none;
    cursor: pointer;
    padding: 0;
    background-color: rgb(37, 41, 46);
    border-radius: 50%;
}

.close-icon {
    width: 16px;
    height: 16px;
    filter: brightness(0) invert(1);
}

.detail-body {
    display: flex;
    height: 100%;
    flex-direction: column;
    border-radius: 10px;
    border: 2px solid rgb(68, 68, 68);
    overflow-y: hidden;
}

.detail-image {
    width: 100%;
    height: auto;
    object-fit: contain;
    border-radius: 9px 9px 0 0;
    background-color: #191919;
}

.detail-info {
    display: flex;
    flex-direction: column;
    height: 40vh;
    padding: 20px;
    overflow-y: auto; /* 세로 스크롤 추가 */
}

.description {
    font-size: 23px;
    line-height: 1.5;
    margin-bottom: 20px;
    color: #d8d8d8;
}

.episode {
    font-size: 16px;
    color: #aaa;
    margin-bottom: 20px;
    line-height: 1.2; /* 약간의 여유를 둔 줄 간격 */
}

.button-group {
    display: flex;
    justify-content: center;
    gap: 15px;
}

.play-button,
.download-button {
    width: 48%;
    padding: 10px 20px;
    font-size: 22px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2; /* 약간의 여유를 둔 줄 간격 */
}

.play-button {
    background-color: white;
    color: black;
}

.download-button {
    background-color: rgb(66, 66, 66);
    color: white;
}

.play-button:hover,
.download-button:hover {
    transform: scale(0.97);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.play-button:active,
.download-button:active {
    transform: scale(0.95);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.play-icon,
.download-icon {
    width: 24px;
    height: 24px;
    margin-right: 8px;
    vertical-align: middle; /* 이콘을 수직 중앙에 맞춥니다 */
}

.download-icon {
    filter: brightness(0) invert(1);
}

.image-container {
    display: flex;
    height: 50vh;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 150px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.88), rgba(0, 0, 0, 0));
}

.recommendations-category-title {
    font-size: 30px;
    font-weight: bold;
    margin-bottom: 10px;
    color: white;
    line-height: 1; /* 약간의 여유를 둔 줄 간격 */
}

.recommendations-title {
    font-size: 23px;
    font-weight: bolder;
    margin-bottom: 10px;
    color: white;
    line-height: 1; /* 약간의 여유를 둔 줄 간격 */
}

.recommendations-list {
    display: flex;
    justify-content: space-between;
    gap: 15px;
}

.recommendation-item {
    flex: 1;
    max-width: 33%;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
}

.recommendation-item:hover {
    transform: scale(1.05);
}

.recommendation-image {
    width: 100%;
    height: 220px;
    object-fit: contain;
    border-radius: 5px;
}

.recommendation-title {
    font-size: 25px;
    margin-top: 5px;
    text-align: center;
    color: white;
    line-height: 1.2; /* 약간의 여유를 둔 줄 간격 */
}

.content-info {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    align-items: center;
    z-index: 2;
}

.content-type-icon {
    padding: 5px 18px;
    border-radius: 20px;
    font-size: 18px;
    font-weight: bold;
    color: white;
    background-color: #4caf50;
    margin-right: 9px;
    line-height: 1.2;
}

.content-type-icon.paid {
    background-color: #ffa500;
}

.view-count {
    display: flex;
    align-items: center;
    background-color: rgba(103, 103, 103, 0.796);
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 18px;
    color: white;
    line-height: 1.2;
}

.eye-icon {
    width: 22px;
    height: 22px;
    margin-right: 5px;
    filter: brightness(0) invert(1);
}

.rent-buy-button {
    width: 48%;
    padding: 10px 20px;
    font-size: 22px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1; /* 줄 간격을 최소합니다 */
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    background-color: #ffa500;
    color: white;
    white-space: nowrap; /* 텍스트가 한 줄로 유지되도록 합니다 */
    overflow: hidden; /* 넘치는 텍스트를 숨깁니다 */
    text-overflow: ellipsis; /* 필요한 경우 텍스트를 줄임표로 표시합니다 */
    line-height: 1.2; /* 약간의 여유를 둔 줄 간격 */
}

.rent-buy-button:hover {
    transform: scale(0.97);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.rent-buy-button:active {
    transform: scale(0.95);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.cart-icon {
    width: 24px;
    height: 24px;
    margin-right: 8px;
    vertical-align: middle;
    filter: brightness(0) invert(1);
    flex-shrink: 0; /* 아이콘이 축소되지 않도록 합니다 */
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}

.modal-content {
    background-color: #2a2a2a;
    padding: 20px;
    border-radius: 10px;
    width: 80%;
    max-width: 500px;
    border: 1.5px solid rgb(68, 68, 68);
}

.modal-content h2 {
    color: white;
    text-align: center;
    margin-bottom: 20px;
}

.price-options {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
    justify-content: center;
}

.price-option {
    text-align: center;
    width: 48%;
}

.price-option h3 {
    color: white;
    margin-bottom: 10px;
}

.price {
    color: #ffa500;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
}

.rent-button,
.buy-button {
    width: 88%;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;
}

.rent-button {
    background-color: #4caf50;
    color: white;
}

.buy-button {
    background-color: #ffa500;
    color: white;
}

.close-modal-button {
    display: block;
    width: 90%;
    margin: 0 auto;
    padding: 10px 20px;
    background-color: #666;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}

.rent-button:hover,
.buy-button:hover,
.close-modal-button:hover {
    opacity: 0.8;
}

.progress-bar-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.3);
    z-index: 2;
}

.progress-bar {
    height: 100%;
    background-color: #ff0000;
    transition: width 0.3s ease;
}

.ownership-status {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: 78px;
    left: 20px;
    color: white;
    padding: 6px 14px;
    border-radius: 15px;
    font-size: 15px;
    font-weight: bold;
    z-index: 3;
    line-height: 1;
}

.ownership-status.owned {
    background-color: rgba(128, 0, 128, 0.7); /* 소장 상태의 색상 (보라색) */
}

.ownership-status.rented {
    background-color: rgba(0, 123, 255, 0.7); /* 대여 상태의 색상 (파란색) */
}

.fade-in {
    animation: fadeIn 0.3s ease-in-out;
}

.fade-out {
    animation: fadeOut 0.3s ease-in-out forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
    to {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
    }
}

.loading-placeholder {
    width: 100%;
    height: 50px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.7);
    font-size: 16px;
}

.fade-in {
    animation: textFadeIn 0.3s ease-in-out;
}

@keyframes textFadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.scrollable-content {
    flex-grow: 1; /* 남은 공간을 모두 차지하도록 설정 */
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1003;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.fade-out-in {
    animation: fadeOutIn 0.6s ease-in-out;
}

@keyframes fadeOutIn {
    0% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
    50% {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
</style>
