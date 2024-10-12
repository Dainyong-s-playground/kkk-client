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
        <div class="main-container" :class="{ 'fade-in': !isLoading }">
            <section class="hero-section">
                <img
                    src="https://dainyong-s-playground.github.io/imageServer/Tumb1.png"
                    alt="Hero Image"
                    class="hero-image"
                />
                <div class="hero-content">
                    <h1>잭과 콩나물</h1>
                    <p>떡상 할끄니꼐~~~ 떡상 가즈아!!</p>
                    <button class="play-button">▶ 재생</button>
                    <button class="info-button">ⓘ 상세 정보</button>
                </div>
            </section>
            <!-- 나님이 시청 중인 콘텐츠 -->
            <section v-if="profileStore.selectedProfile" class="category recently-watched">
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
            <section class="category top-5">
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

            <!-- 추천 동화 -->
            <section class="category recommended">
                <h2 class="category-title">추천 동화</h2>
                <div class="content-slider">
                    <div
                        v-for="(item, index) in categoryContent"
                        :key="index"
                        class="content-item"
                        @click="showDetail(item)"
                    >
                        <div class="thumbnail-container">
                            <img :src="item.imageUrl" :alt="item.title" class="thumbnail" />
                            <div class="play-overlay">▶</div>
                            <div class="content-type-icon" :class="{ paid: item.rentalPrice > 0 }">
                                {{ item.rentalPrice > 0 ? '유료' : '무료' }}
                            </div>
                        </div>
                        <div class="content-info">
                            <span class="title">{{ item.title }}</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 동화 상세 정보 오버레이 -->
            <div v-if="selectedFairyTale" class="fairy-tale-detail-overlay">
                <FairyTaleDetail
                    :fairyTale="selectedFairyTale"
                    @close="closeDetail"
                    @update:views="updateFairyTaleViews"
                />
            </div>
        </div>
    </div>
</template>

<script>
import FairyTaleDetail from './FairyTaleDetail.vue';
import axios from 'axios';
import { useProfileStore } from '@/stores/profile';
import { storeToRefs } from 'pinia';

export default {
    components: {
        FairyTaleDetail,
    },
    setup() {
        const profileStore = useProfileStore();
        const { selectedProfile } = storeToRefs(profileStore);
        return { profileStore, selectedProfile };
    },
    data() {
        return {
            isLoading: true,
            showContent: false,
            recentlyWatched: [],
            top5Series: [],
            categoryContent: [
                {
                    title: 'The story of 붉은 여우 루비',
                    imageUrl: 'https://img.ridicdn.net/cover/5273004218/xxlarge?dpi=xxhdpi#1',
                    rentalPrice: 3000,
                    purchasePrice: 6000,
                    isOwned: true,
                    views: 1500,
                    progress: 60,
                    description: '붉은 여우 루비의 모험 이야기',
                    author: '작가이름',
                },
                {
                    title: '알렉스 미아와 장난감 공장의 비밀',
                    imageUrl: 'https://img.ridicdn.net/cover/1745007459/xxlarge?dpi=xxhdpi#1',
                    rentalPrice: 0,
                    views: 2000,
                    progress: 30,
                    description: '알렉스 미아의 장난감 공장 비밀 이야기',
                    author: '작가이름',
                },
                {
                    title: 'The story of 붉은 여우 루비',
                    imageUrl: 'https://img.ridicdn.net/cover/5273004218/xxlarge?dpi=xxhdpi#1',
                    rentalPrice: 3000,
                    purchasePrice: 6000,
                    isOwned: true,
                    views: 1500,
                    progress: 60,
                    description: '붉은 여우 루비의 모험 이야기',
                    author: '작가이름',
                },
                {
                    title: '알렉스 미아와 장난감 공장의 비밀',
                    imageUrl: 'https://img.ridicdn.net/cover/1745007459/xxlarge?dpi=xxhdpi#1',
                    rentalPrice: 0,
                    views: 2000,
                    progress: 30,
                    description: '알렉스 미아의 장난감 공장 비밀 이야기',
                    author: '작가이름',
                },
                {
                    title: '우리 바다 친구들',
                    imageUrl: 'https://img.ridicdn.net/cover/5273004187/xxlarge?dpi=xxhdpi#1',
                    rentalPrice: 2500,
                    isRented: true,
                    views: 1800,
                    progress: 45,
                    description: '바다 친구들의 모험 이야기',
                    author: '작가이름',
                },
                {
                    title: '꼬마 마법사의 모험',
                    imageUrl: 'https://img.ridicdn.net/cover/5273004218/xxlarge?dpi=xxhdpi#1',
                    rentalPrice: 3500,
                    views: 2200,
                    description: '꼬마 마법사의 모험 이야기',
                    author: '작가이름',
                },
                {
                    title: '숲속 동물들의 파티',
                    imageUrl: 'https://img.ridicdn.net/cover/1745007459/xxlarge?dpi=xxhdpi#1',
                    rentalPrice: 0,
                    views: 1700,
                    description: '숲속 동물들의 파티 이야기',
                    author: '작가이름',
                },
                {
                    title: '용감한 기사의 여행',
                    imageUrl: 'https://img.ridicdn.net/cover/5273004187/xxlarge?dpi=xxhdpi#1',
                    rentalPrice: 4000,
                    views: 2500,
                    description: '용감한 기사의 여행 이야기',
                    author: '작가이름',
                },
                // 추가 아이템...
            ],
            selectedFairyTale: null,
            fairyTales: {}, // 동화 데이터를 저장할 객체
        };
    },
    methods: {
        async fetchRecentlyWatched() {
            if (!this.profileStore.selectedProfile) {
                console.error('선택된 프로필 정보가 없습니다.');
                return;
            }
            try {
                const response = await axios.get(
                    `http://localhost:7772/api/history/recently-watched/${this.profileStore.selectedProfile.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${this.profileStore.jwtToken}`,
                        },
                    },
                );
                console.log('서버에서 받은 데이터:', response.data); // 추가된 로그
                this.recentlyWatched = response.data.map((item) => {
                    return {
                        ...item,
                        progress: item.progress || 0,
                    };
                });
            } catch (error) {
                console.error('최근 시청 목록을 가져오는데 실패했습니다:', error);
            }
        },
        showDetail(fairyTale) {
            // 동화 상세 정보를 표시하기 전에 조회수 증가
            const updatedViews = (fairyTale.views || 0) + 1;
            this.updateFairyTaleViews(fairyTale.id, updatedViews);

            // 업데이트된 동화 정보로 선택
            this.selectedFairyTale = { ...fairyTale, views: updatedViews };
        },
        closeDetail() {
            this.selectedFairyTale = null;
        },
        updateFairyTaleViews(id, newViews) {
            // fairyTales 객체 업데이트
            if (this.fairyTales[id]) {
                this.fairyTales[id].views = newViews;
            }

            // recentlyWatched 배열 업데이트
            this.recentlyWatched = this.recentlyWatched.map((item) => {
                if (item.fairyTale.id === id) {
                    return { ...item, fairyTale: { ...item.fairyTale, views: newViews } };
                }
                return item;
            });

            // top5Series 배열 업데이트
            this.top5Series = this.top5Series.map((item) => {
                if (item.id === id) {
                    return { ...item, views: newViews };
                }
                return item;
            });

            // categoryContent 배열 업데이트
            this.categoryContent = this.categoryContent.map((item) => {
                if (item.id === id) {
                    return { ...item, views: newViews };
                }
                return item;
            });
        },
        async fetchTop5FairyTales() {
            try {
                const response = await axios.get('http://localhost:7772/api/fairytales/top5');
                this.top5Series = response.data.map((item) => ({
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
        },
        calculateProgress(progress) {
            let numericProgress;
            if (typeof progress === 'string') {
                // 문자열인 경우 숫자로 변환
                numericProgress = parseFloat(progress);
            } else if (typeof progress === 'number') {
                numericProgress = progress;
            } else {
                console.error('잘못된 progress 형식:', progress);
                return 0;
            }

            // NaN 체크
            if (isNaN(numericProgress)) {
                console.error('progress를 숫자로 변환할 수 없습니다:', progress);
                return 0;
            }

            // 0-1 사이의 값으로 가정
            if (numericProgress <= 1) {
                numericProgress *= 100;
            }

            const result = Math.min(Math.max(numericProgress, 0), 100);
            return result;
        },
        async loadAllData() {
            try {
                this.isLoading = true;
                this.showContent = false;
                await Promise.all([
                    this.fetchRecentlyWatched(),
                    this.fetchTop5FairyTales(),
                    // 추가적인 데이터 로딩 메서드가 있다면 여기에 추가
                ]);
            } catch (error) {
                console.error('데이터 로딩 중 오류 발생:', error);
            } finally {
                this.isLoading = false;
                // 로딩이 끝난 후 바로 컨텐츠를 표시합니다.
                this.showContent = true;
            }
        },
    },
    async mounted() {
        await this.profileStore.checkLoginStatus();
        if (this.profileStore.selectedProfile) {
            await this.loadAllData();
        } else {
            console.error('선택된 프로필이 없습니다.');
            this.isLoading = false;
        }
    },
};
</script>

<style scoped>
.main-container {
    color: black;
    padding: 0 4%;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
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
    margin-top: 7vh;
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

/* TOP 5 동화 스타일 */
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
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); /* 그림자 추가 */
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
