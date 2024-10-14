/* eslint-disable */
<template>
    <div>
        <div v-if="isLoading || isDetailLoading" class="loading-overlay">
            <div class="loading-spinner">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
        <div class="main-container" :class="{ 'fade-in': !isLoading }">
            <section class="hero-section">
                <img :src="`${IMAGE_SERVER_URL}/Tumb1.png`" alt="Hero Image" class="hero-image" />
                <div class="hero-content">
                    <h1>잭과 콩나물</h1>
                    <p>떡상 할끄니꼐~~~ 떡상 가즈아!!</p>
                    <button class="play-button">▶ 재생</button>
                    <button class="info-button">ⓘ 상세 정보</button>
                </div>
            </section>
            <!-- 나님이 시청 중인 콘텐츠 -->
            <section id="recentlyWatched" v-if="profileStore.selectedProfile" class="category recently-watched">
                <h2 class="category-title">{{ profileStore.selectedProfile.nickname }}님이 시청 중인 콘텐츠</h2>
                <div class="content-slider">
                    <div
                        v-for="(item, index) in recentlyWatched"
                        :key="index"
                        class="content-item"
                        @click="showDetail(item.fairyTale)"
                    >
                        <div class="thumbnail-container">
                            <img :src="item.fairyTale.imageUrl" :alt="item.fairyTale.title" class="thumbnail" />
                            <div class="gradient-overlay"></div>
                            <div class="play-overlay">▶</div>
                            <div class="progress-bar">
                                <div class="progress" :style="{ width: `${calculateProgress(item.progress)}%` }"></div>
                            </div>
                            <div class="content-type-icon" :class="{ paid: item.fairyTale.rentalPrice > 0 }">
                                {{ item.fairyTale.rentalPrice > 0 ? '유료' : '무료' }}
                            </div>
                        </div>
                        <div class="content-info recently-watched-info">
                            <span class="title">{{ item.fairyTale.title }}</span>
                            <span class="episode">{{ item.fairyTale.description }}</span>
                        </div>
                        <button class="more-info" @click.stop="showDetail(item.fairyTale)">ⓘ</button>
                    </div>
                </div>
            </section>

            <!-- 오늘 TOP 5 동화 -->
            <section id="top-5" class="category top-5">
                <h2 class="category-title">오늘 TOP 5 동화</h2>
                <div class="content-slider">
                    <div
                        v-for="(item, index) in top5Series"
                        :key="index"
                        class="content-item"
                        @click="showDetail(item)"
                    >
                        <div class="rank">{{ index + 1 }}</div>
                        <div class="thumbnail-container">
                            <img :src="item.imageUrl" :alt="item.title" class="thumbnail" />
                            <div class="play-overlay">▶</div>
                            <div class="content-type-icon" :class="{ paid: item.rentalPrice > 0 }">
                                {{ item.rentalPrice > 0 ? '유료' : '무료' }}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 카테고리별 동화 리스트 -->
            <section v-for="category in categories" :key="category.id" :id="category.name" class="category recommended">
                <h2 class="category-title">{{ category.name }}</h2>
                <div class="content-slider">
                    <div
                        v-for="item in getCategoryContent(category.name)"
                        :key="item.id"
                        class="content-item"
                        @click="showDetail(item)"
                    >
                        <div class="thumbnail-container">
                            <img :src="item.fairyTaleImage" :alt="item.fairyTaleTitle" class="thumbnail" />
                            <div class="play-overlay">▶</div>
                            <div class="content-type-icon" :class="{ paid: item.rentalPrice > 0 }">
                                {{ item.rentalPrice > 0 ? '유료' : '무료' }}
                            </div>
                        </div>
                        <div class="content-info">
                            <span class="title">{{ item.fairyTaleTitle }}</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <transition name="fade">
            <FairyTaleDetail
                v-if="selectedFairyTale"
                :key="selectedFairyTale.id"
                :fairyTale="selectedFairyTale"
                @update:fairyTale="updateSelectedFairyTale"
                @close="closeDetail"
                @update:views="updateFairyTaleViews"
            />
        </transition>
    </div>
</template>

<script>
import FairyTaleDetail from './FairyTaleDetail.vue';
import axios from 'axios';
import { useProfileStore } from '@/stores/profile';
import { storeToRefs } from 'pinia';
import { TALE_API_URL, IMAGE_SERVER_URL } from '@/constants/api';
import { watch, ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';

export default {
    components: {
        FairyTaleDetail,
    },
    setup() {
        const profileStore = useProfileStore();
        const { selectedProfile } = storeToRefs(profileStore);
        const route = useRoute();

        const categories = ref([]);
        const allFairyTales = ref([]);
        const isLoading = ref(true);
        const isDetailLoading = ref(false);
        const selectedFairyTale = ref(null);
        const recentlyWatched = ref([]);
        const top5Series = ref([]);
        const dataLoaded = ref(false);
        const categoryContents = ref({});
        const fairyTales = ref({});

        const calculateProgress = (progress) => {
            let numericProgress = parseFloat(progress);
            if (isNaN(numericProgress)) {
                console.error('잘못된 progress 값:', progress);
                return 0;
            }
            return Math.min(Math.max(numericProgress, 0), 100);
        };

        const showDetail = async (fairyTale) => {
            if (!(await validateTokenAndRedirect())) {
                return;
            }

            isDetailLoading.value = true;

            try {
                const response = await axios.get(`${TALE_API_URL}/api/fairytales/${fairyTale.id}`, {
                    headers: {
                        Authorization: `Bearer ${profileStore.jwtToken}`,
                    },
                });

                const updatedFairyTale = response.data;
                updateLocalFairyTaleData(updatedFairyTale);

                selectedFairyTale.value = null;
                await nextTick();
                selectedFairyTale.value = updatedFairyTale;
            } catch (error) {
                console.error('동화 정보를 가져오는 중 오류 발생:', error);
            } finally {
                isDetailLoading.value = false;
            }
        };

        const closeDetail = () => {
            selectedFairyTale.value = null;
        };

        const updateLocalFairyTaleData = (updatedFairyTale) => {
            if (fairyTales.value[updatedFairyTale.id]) {
                fairyTales.value[updatedFairyTale.id] = updatedFairyTale;
            }

            recentlyWatched.value = recentlyWatched.value.map((item) => {
                if (item.fairyTale.id === updatedFairyTale.id) {
                    return { ...item, fairyTale: updatedFairyTale };
                }
                return item;
            });

            top5Series.value = top5Series.value.map((item) => {
                if (item.id === updatedFairyTale.id) {
                    return updatedFairyTale;
                }
                return item;
            });
        };

        const updateFairyTaleViews = (id, newViews) => {
            updateLocalFairyTaleData({ id, views: newViews });
        };

        const getCategoryContent = (categoryName) => {
            return allFairyTales.value.filter((tale) => tale.tag.includes(categoryName));
        };

        const updateSelectedFairyTale = (newFairyTale) => {
            showDetail(newFairyTale);
        };

        const setupCategories = () => {
            const fixedCategories = [
                { id: 1, name: '전래동화' },
                { id: 2, name: '외국동화' },
            ];

            const randomCategories = [
                { id: 3, name: '권선징악' },
                { id: 4, name: '공주' },
                { id: 5, name: '노력' },
                { id: 6, name: '지혜' },
                { id: 7, name: '동물' },
                { id: 8, name: '이별' },
                { id: 9, name: '모험' },
                { id: 10, name: '교육' },
                { id: 11, name: '코미디' },
            ];

            // Fisher-Yates 셔플 알고리즘을 사용하여 랜덤 카테고리 섞기
            for (let i = randomCategories.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [randomCategories[i], randomCategories[j]] = [randomCategories[j], randomCategories[i]];
            }

            categories.value = [...fixedCategories, ...randomCategories];
        };

        const fetchRecentlyWatched = async () => {
            if (!profileStore.selectedProfile) {
                console.error('선택된 프로필 정보가 없습니다.');
                return;
            }
            try {
                const response = await axios.get(
                    `${TALE_API_URL}/api/history/recently-watched/${profileStore.selectedProfile.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${profileStore.jwtToken}`,
                        },
                    },
                );
                console.log('서버에서 받은 데이터:', response.data);
                recentlyWatched.value = response.data.map((item) => {
                    return {
                        ...item,
                        progress: item.progress || 0,
                    };
                });
            } catch (error) {
                console.error('최근 시청 목록을 가져오는데 실했습니다:', error);
            }
        };

        const fetchTop5FairyTales = async () => {
            try {
                const response = await axios.get(`${TALE_API_URL}/api/fairytales/top5`);
                top5Series.value = response.data.map((item) => ({
                    title: item.title,
                    imageUrl: item.imageUrl,
                    rentalPrice: item.rentalPrice,
                    purchasePrice: item.purchasePrice,
                    description: item.description,
                    author: item.author,
                    views: item.views,
                    id: item.id,
                }));
            } catch (error) {
                console.error('TOP 5 동화를 가져오는 데 실패했습니다:', error);
            }
        };

        const loadAllData = async () => {
            isLoading.value = true;
            try {
                await Promise.all([fetchRecentlyWatched(), fetchTop5FairyTales(), fetchAllFairyTales()]);
                dataLoaded.value = true;
            } catch (error) {
                console.error('데이터 로딩 중 오류 발생:', error);
            } finally {
                isLoading.value = false;
            }
        };

        const validateTokenAndRedirect = async () => {
            const isValid = await profileStore.validateToken();
            if (!isValid) {
                console.error('인증 토큰이 유효하지 않습니다. 로그인이 필요합니다.');
                this.$router.push('/');
                return false;
            }
            return true;
        };

        const fetchAllFairyTales = async () => {
            try {
                const response = await axios.get(`${TALE_API_URL}/api/search/fairytale`, {
                    headers: {
                        Authorization: `Bearer ${profileStore.jwtToken}`,
                    },
                });
                allFairyTales.value = response.data;
            } catch (error) {
                console.error('동화를 가져오는 데 실패했습니다:', error);
            }
        };

        onMounted(async () => {
            if (!(await validateTokenAndRedirect())) {
                return;
            }

            setupCategories();

            if (profileStore.selectedProfile && !dataLoaded.value) {
                await loadAllData();
            }
            await fetchAllFairyTales();
        });

        watch(
            () => route.params.id,
            async (newId, oldId) => {
                if (newId && newId !== oldId) {
                    await showDetail({ id: newId });
                }
            },
        );

        watch(
            () => profileStore.selectedProfile,
            (newProfile) => {
                if (newProfile && !dataLoaded.value) {
                    loadAllData();
                }
            },
            { immediate: true },
        );

        return {
            profileStore,
            selectedProfile,
            categories,
            allFairyTales,
            isLoading,
            isDetailLoading,
            selectedFairyTale,
            recentlyWatched,
            top5Series,
            dataLoaded,
            categoryContents,
            IMAGE_SERVER_URL,
            showDetail,
            closeDetail,
            calculateProgress,
            updateFairyTaleViews,
            getCategoryContent,
            updateSelectedFairyTale,
            // ... 기타 필요한 메서드들 ...
        };
    },
};
</script>

<style scoped>
.main-container {
    color: black;
    padding: 0 4%;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    position: relative;
    z-index: 1;
}

.main-container.fade-in {
    opacity: 1;
}

.hero-section {
    display: flex;
    position: relative;
    height: 56.25vw;
    max-height: 720px;
    margin-bottom: 3vw;
    align-items: center;
    justify-content: center;
    margin-top: 5vh;
}

.hero-image {
    width: 80%;
    height: 100%;
    object-fit: contain;
}

.hero-content {
    position: absolute;
    bottom: 10%;
    left: 4%;
    width: 36%;
}

.hero-content h1 {
    font-size: 3vw;
    margin-bottom: 0.5vw;
}

.hero-content p {
    font-size: 1.4vw;
    margin-bottom: 1.5vw;
}

.play-button,
.info-button {
    font-size: 1.2vw;
    padding: 0.5vw 1.5vw;
    margin-right: 1vw;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.play-button {
    background-color: white;
    color: black;
}

.info-button {
    background-color: rgba(109, 109, 110, 0.7);
    color: white;
}

.category {
    margin-bottom: 3vw;
    scroll-margin-top: 100px; /* 헤더 높이에 따라 조정 */
}

.category-title {
    font-size: 1.4vw;
    margin-bottom: 1vw;
}

.content-slider {
    display: flex;
    overflow-x: auto;
    scroll-behavior: smooth;
    -ms-overflow-style: none;
    scrollbar-width: none;
    align-items: center;
    gap: 10px;
}

.content-slider::-webkit-scrollbar {
    display: none;
}

.content-item {
    flex: 0 0 auto;
    width: 250px;
    margin-right: 20px;
    position: relative;
    cursor: pointer;
}

.thumbnail-container {
    position: relative;
    width: 100%;
    overflow: hidden;
    padding-top: 150%; /* 2:3 비율 유지 */
}

.thumbnail {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
}

.play-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 110;
}

.content-item:hover .play-overlay {
    opacity: 1;
}

.content-info {
    padding: 0.5vw 0;
    height: 60px;
}

.title {
    display: block;
    font-weight: bold;
    font-size: 1.2vw;
    margin-bottom: 0.2vw;
}

.episode,
.status {
    font-size: 0.8vw;
    color: #cbcbcbed !important;
}

.more-info {
    position: absolute;
    right: 0.5vw;
    bottom: 0.5vw;
    background-color: rgba(42, 42, 42, 0.6);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    width: 2vw;
    height: 2vw;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1vw;
    line-height: 0;
    cursor: pointer;
}

/* 나님이 시청 중인 콘텐츠 스타일 */
.recently-watched .content-item {
    width: 250px;
    overflow: hidden;
}

.recently-watched .thumbnail-container {
    padding-top: 120%; /* 2:3 비율 유지 */
    border-radius: 12px 12px 0 0; /* 상단만 둥글게 */
    overflow: hidden;
}

.recently-watched .thumbnail {
    border-radius: 12px 12px 0 0; /* 상단만 둥글게 */
}

.recently-watched .content-info.recently-watched-info {
    padding: 10px;
    border-radius: 0 0 12px 12px; /* 하단만 둥글게 */
    height: 90px;
    background-color: #333333;
    margin-top: -2px;
}

.recently-watched .content-info.recently-watched-info .title,
.recently-watched .content-info.recently-watched-info .episode {
    color: #ffffff;
}

.recently-watched .content-item:hover .content-info.recently-watched-info {
    background-color: #4a4a4a;
}

.recently-watched .gradient-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 35px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.7));
    z-index: 100;
}

.recently-watched .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.3);
    z-index: 102;
}

.recently-watched .progress {
    height: 100%;
    background-color: #e50914;
    transition: width 0.3s ease;
}

.recently-watched .more-info {
    bottom: 10px;
    right: 10px;
    z-index: 100;
}

/* TOP 5 동 스타일 */
.top-5 {
    margin-bottom: 3vw;
    overflow: hidden; /* 세로 스크롤 비활성화 */
}

.top-5 .content-slider {
    padding-left: 7%;
    overflow-y: hidden; /* 세로 스크롤 비활성화 */
}

.top-5 .content-item {
    width: 240px;
    height: 320px; /* 높이 증가 */
    margin-right: 100px;
}

.top-5 .thumbnail-container {
    height: 100%;
    padding-top: 0;
}

.top-5 .rank {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    position: absolute;
    right: 84%;
    bottom: 2px;
    font-size: 240px;
    font-weight: bold;
    color: #90b4e2;
    -webkit-text-stroke: 4px #000000;
    line-height: 0.8;
}

.recommended .thumbnail-container {
    padding-top: 150%; /* 2:3 비율로 수정 */
}

/* 동화 상세 페이지 오버레이 스타일 */
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
}

.content-type-icon {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 14px;
    font-weight: bold;
    color: white;
    background-color: #4caf50;
    z-index: 2;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.content-type-icon.paid {
    background-color: #ffa500;
}

/* TOP 5 동화에 대한 특별한 스타일 */
.top-5 .content-type-icon {
    top: 8px;
    left: 9px;
    font-size: 16px;
    box-shadow: 0 1px px rgba(0, 0, 0, 0.2); /* 그림자 약간 더 강하게 */
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
    z-index: 10000;
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
    animation: loading-spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #fff transparent transparent transparent;
}

.loading-spinner div:nth-child(1) {
    animation-delay: -0.45s;
}
.loading-spinner div:nth-child(2) {
    animation-delay: -0.3s;
}
.loading-spinner div:nth-child(3) {
    animation-delay: -0.15s;
}

@keyframes loading-spinner {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}

body.modal-open {
    overflow: hidden;
}
</style>
