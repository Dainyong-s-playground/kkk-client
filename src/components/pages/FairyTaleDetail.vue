<template>
    <div class="fairy-tale-detail" @click="closeDetail" @wheel.prevent @touchmove.prevent>
        <div class="detail-content" @click.stop>
            <div class="detail-body">
                <div class="image-container">
                    <img :src="fairyTale.imageUrl" :alt="fairyTale.title" class="detail-image" />
                    <!-- 프로그레스 바 추가 -->
                    <div v-if="fairyTale.progress > 0" class="progress-bar-container">
                        <div class="progress-bar" :style="{ width: `${fairyTale.progress}%` }"></div>
                    </div>
                    <div class="image-overlay"></div>
                    <!-- 대여/소장 상태 표시 추가 -->
                    <div
                        v-if="fairyTale.isOwned || fairyTale.isRented"
                        class="ownership-status"
                        :class="{ owned: fairyTale.isOwned, rented: fairyTale.isRented }"
                    >
                        {{ fairyTale.isOwned ? '소장' : '대여 중' }}
                    </div>
                    <h2 class="detail-title">{{ fairyTale.title }}</h2>
                    <div class="content-info">
                        <div class="content-type-icon" :class="{ paid: fairyTale.rentalPrice > 0 }">
                            {{ fairyTale.rentalPrice > 0 ? '유료' : '무료' }}
                        </div>
                        <div class="view-count">
                            <img
                                src="https://dainyong-s-playground.github.io/imageServer/detailPage/eyeIcon.png"
                                alt="조회수"
                                class="eye-icon"
                            />
                            <span>{{ localViews }}</span>
                        </div>
                    </div>
                    <button @click="$emit('close')" class="close-button">
                        <img
                            src="https://dainyong-s-playground.github.io/imageServer/detailPage/closeButton.png"
                            alt="닫기"
                            class="close-icon"
                        />
                    </button>
                </div>
                <div class="detail-info">
                    <div class="button-group">
                        <button
                            v-if="fairyTale.rentalPrice === 0 || fairyTale.isOwned || fairyTale.isRented"
                            class="play-button"
                            @click="playFairyTale"
                        >
                            <img
                                src="https://dainyong-s-playground.github.io/imageServer/fairyPlayer/playIcon.png"
                                alt="재생"
                                class="play-icon"
                            />
                            {{ fairyTale.progress > 0 ? `이어보기 (${fairyTale.progress}%)` : '재생하기' }}
                        </button>
                        <button v-else class="rent-buy-button" @click="openRentBuyModal">
                            <img
                                src="https://dainyong-s-playground.github.io/imageServer/detailPage/cartIcon.png"
                                alt="구매"
                                class="cart-icon"
                            />
                            동화 대여/소장하기
                        </button>
                        <button class="download-button">
                            <img
                                src="https://dainyong-s-playground.github.io/imageServer/detailPage/underArrow.png"
                                alt="저장"
                                class="download-icon"
                            />
                            저장
                        </button>
                    </div>
                    <p class="description">{{ fairyTale.description }}</p>
                    <p v-if="fairyTale.episode" class="episode">{{ fairyTale.episode }}</p>
                    <div class="recommendations">
                        <h3 class="recommendations-title">다른 동화 추천</h3>
                        <div class="recommendations-list">
                            <div v-for="tale in recommendedTales" :key="tale.id" class="recommendation-item">
                                <img :src="tale.thumbnail" :alt="tale.title" class="recommendation-image" />
                                <p class="recommendation-title">{{ tale.title }}</p>
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
                        <button @click="buyFairyTale" class="buy-button">장하기</button>
                    </div>
                </div>
                <button @click="closeRentBuyModal" class="close-modal-button">닫기</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref, defineEmits, computed, onMounted, watch, nextTick } from 'vue';
import { onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const props = defineProps({
    fairyTale: {
        type: Object,
        required: true,
        validator: (value) => {
            return (
                value &&
                typeof value.title !== 'undefined' &&
                typeof value.rentalPrice !== 'undefined' &&
                typeof value.views !== 'undefined'
            );
        },
    },
});

const recommendedTales = ref([
    { id: 1, title: '백설공주', thumbnail: 'https://img.ridicdn.net/cover/5273004187/xxlarge?dpi=xxhdpi#1' },
    { id: 2, title: '빨간 모자', thumbnail: 'https://img.ridicdn.net/cover/1745007459/xxlarge?dpi=xxhdpi#1' },
    { id: 3, title: '피노키오', thumbnail: 'https://img.ridicdn.net/cover/5273004218/xxlarge?dpi=xxhdpi#1' },
]);

const playFairyTale = () => {
    // fairyTale 객체에 id가 없는 경우를 대비해 임시 ID를 생성합니다.
    const fairyTaleId = props.fairyTale.id || `temp_${Math.floor(Math.random() * 1000)}`;

    // 새 탭에서 열 URL을 생성합니다.
    const url = router.resolve({
        name: 'FairyPlayer',
        params: { id: fairyTaleId },
        query: {
            title: props.fairyTale.title,
            progress: props.fairyTale.progress || 0,
            imageUrl: props.fairyTale.imageUrl,
        },
    }).href;

    // 새 탭에서 URL을 엽니다.
    window.open(url, '_blank');
};

const emit = defineEmits(['close', 'update:views']);

const closeDetail = () => {
    emit('close');
};

const disableScroll = (e) => {
    e.preventDefault();
};

const localViews = ref(props.fairyTale.views);

const fetchAndIncrementViews = async () => {
    try {
        const response = await axios.post(`http://localhost:7772/api/fairytales/${props.fairyTale.id}/incrementViews`);
        localViews.value = response.data.views;
        emit('update:views', props.fairyTale.id, localViews.value);
    } catch (error) {
        console.error('조회수 증가 중 오류 발생:', error);
    }
};

onMounted(async () => {
    await nextTick();
    fetchAndIncrementViews();
});

// localViews가 변경될 때마다 부모 컴포넌트에 알립니다
watch(localViews, (newViews) => {
    emit('update:views', props.fairyTale.id, newViews);
});

onUnmounted(() => {
    document.body.style.overflow = '';
    document.removeEventListener('wheel', disableScroll);
    document.removeEventListener('touchmove', disableScroll);
});

const showRentBuyModal = ref(false);

const openRentBuyModal = () => {
    console.log('모달 열기');
    showRentBuyModal.value = true;
};

const closeRentBuyModal = () => {
    showRentBuyModal.value = false;
};

const rentFairyTale = () => {
    console.log('동화 대여 기능 실행');
    closeRentBuyModal();
};

const buyFairyTale = () => {
    console.log('동화 소장 기능 실행');
    closeRentBuyModal();
};

// rentPrice와 buyPrice 계산된 속성 수정
const rentPrice = computed(() => props.fairyTale.rentalPrice);
const buyPrice = computed(() => props.fairyTale.purchasePrice || props.fairyTale.rentalPrice * 2);
</script>

<style scoped>
.fairy-tale-detail {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999; /* z-index 값을 높임 */
    background-color: rgba(0, 0, 0, 0.5); /* 배경에 반투명한 오버레이 추가 */
    overflow: hidden; /* 외부 스크롤 완전히 차단 */
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1001;
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
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.4); /* 그림자 효과 추가 */
    max-height: 90vh; /* 뷰포트 높이의 90%로 제한 */
    overflow-y: auto; /* 내용이 넘칠 경우 스크롤 허용 */
    -webkit-overflow-scrolling: touch; /* iOS 스크롤 개선 */
}

.detail-title {
    position: absolute;
    bottom: 30px;
    left: 20px;
    font-size: 36px;
    font-weight: bold;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    margin: 0;
    z-index: 1;
    line-height: 1.2; /* 약간의 여유를 둔 줄 간격 */
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
    height: 900px;
    flex-direction: column;
    border-radius: 10px;
    border: 1.5px solid rgb(68, 68, 68);
}

.detail-image {
    width: 100%;
    height: 100%;
    max-height: 450px;
    object-fit: contain;
    border-radius: 9px 9px 0 0;
    background-color: #191919;
}

.detail-info {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px;
}

.description {
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 20px;
    color: white;
}

.episode {
    font-size: 14px;
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
    font-size: 20px;
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
    vertical-align: middle; /* 아이콘을 수직 중앙에 맞춥니다 */
}

.download-icon {
    filter: brightness(0) invert(1);
}

.image-container {
    display: flex;
    height: 100%;
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

.recommendations-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
    color: white;
    line-height: 1.2; /* 약간의 여유를 둔 줄 간격 */
}

.recommendations-list {
    display: flex;
    justify-content: space-around;
    gap: 15px;
    overflow-x: auto;
}

.recommendation-item {
    flex: 0 0 auto;
    width: 120px;
}

.recommendation-image {
    width: 100%;
    height: 160px;
    object-fit: cover;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recommendation-image:hover {
    transform: scale(0.97); /* 호버 시 3% 축소 */
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.35); /* 그림자 약간 약화 */
}

.recommendation-image:active {
    transform: scale(0.95); /* 클릭 시 5% 축소 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* 그림자 더 약화 */
}

.recommendation-title {
    font-size: 14px;
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
    padding: 5px 14px;
    border-radius: 15px;
    font-size: 15px;
    font-weight: bold;
    color: white;
    background-color: #4caf50;
    margin-right: 9px;
    line-height: 1.2; /* 약간의 여유를 둔 줄 간격 */
}

.content-type-icon.paid {
    background-color: #ffa500;
}

.view-count {
    display: flex;
    align-items: center;
    background-color: rgba(103, 103, 103, 0.796);
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
    color: white;
    line-height: 1.2; /* 약간의 여유를 둔 줄 간격 */
}

.eye-icon {
    width: 20px;
    height: 20px;
    margin-right: 5px;
    filter: brightness(0) invert(1);
}

.rent-buy-button {
    width: 48%;
    padding: 10px 20px;
    font-size: 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1; /* 줄 간격을 최소화합니다 */
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
</style>
