<template>
    <div class="main-container">
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
        <section class="category recently-watched">
            <h2 class="category-title">나님이 시청 중인 콘텐츠</h2>
            <div class="content-slider">
                <div
                    v-for="(item, index) in recentlyWatched"
                    :key="index"
                    class="content-item"
                    @click="showDetail(item)"
                >
                    <div class="thumbnail-container">
                        <img :src="item.thumbnail" :alt="item.title" class="thumbnail" />
                        <div class="gradient-overlay"></div>
                        <div class="play-overlay">▶</div>
                        <div class="progress-bar">
                            <div class="progress" :style="{ width: `${item.progress}%` }"></div>
                        </div>
                        <div class="content-type-icon" :class="{ paid: item.price > 0 }">
                            {{ item.price > 0 ? '유료' : '무료' }}
                        </div>
                    </div>
                    <div class="content-info recently-watched-info">
                        <span class="title">{{ item.title }}</span>
                        <span class="episode">{{ item.episode }}</span>
                    </div>
                    <button class="more-info">ⓘ</button>
                </div>
            </div>
        </section>

        <!-- 오늘 TOP 5 동화 -->
        <section class="category top-5">
            <h2 class="category-title">오늘 TOP 5 동화</h2>
            <div class="content-slider">
                <div v-for="(item, index) in top5Series" :key="index" class="content-item" @click="showDetail(item)">
                    <div class="rank">{{ index + 1 }}</div>
                    <div class="thumbnail-container">
                        <img :src="item.thumbnail" :alt="item.title" class="thumbnail" />
                        <div class="play-overlay">▶</div>
                        <div class="content-type-icon" :class="{ paid: item.price > 0 }">
                            {{ item.price > 0 ? '유료' : '무료' }}
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
                        <img :src="item.thumbnail" :alt="item.title" class="thumbnail" />
                        <div class="play-overlay">▶</div>
                        <!-- 유료/무료 아이콘 추가 -->
                        <div class="content-type-icon" :class="{ paid: item.price > 0 }">
                            {{ item.price > 0 ? '유료' : '무료' }}
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
            <FairyTaleDetail :fairyTale="selectedFairyTale" @close="closeDetail" />
        </div>
    </div>
</template>

<script>
import FairyTaleDetail from './FairyTaleDetail.vue';

export default {
    components: {
        FairyTaleDetail,
    },
    data() {
        return {
            recentlyWatched: [
                {
                    title: '큼이네집 한글놀이 자음모음편',
                    thumbnail: 'https://img.ridicdn.net/cover/2353000046/xxlarge?dpi=xxhdpi#1',
                    episode: '자음모음편: 50%',
                    progress: 90,
                    price: 0,
                    viewCount: 1234, // 조회수 추가
                },
                {
                    title: '소미의 소리 가득 하루',
                    thumbnail: 'https://img.ridicdn.net/cover/4261000010/xxlarge?dpi=xxhdpi#1',
                    episode: '의성어로 만나는 신나는 세상',
                    progress: 45,
                    price: 3000,
                    viewCount: 5678, // 조회수 추가
                },
                {
                    title: '쓱쓱 싹싹',
                    thumbnail: 'https://img.ridicdn.net/cover/1451000215/xxlarge?dpi=xxhdpi#1',
                    episode: '북극곰 꿈나무 그림책 111',
                    progress: 72,
                    price: 2500,
                    viewCount: 9012, // 조회수 추가
                },
                {
                    title: '토네이똥',
                    thumbnail: 'https://img.ridicdn.net/cover/2353000263/xxlarge?dpi=xxhdpi#1',
                    episode: '똥똥똥',
                    progress: 41,
                    price: 0,
                    viewCount: 3456, // 조회수 추가
                },
                {
                    title: '달은 어떻게 달이 될까?',
                    thumbnail: 'https://img.ridicdn.net/cover/1451000214/xxlarge?dpi=xxhdpi#1',
                    episode: '북극곰 궁금해 시리즈 25',
                    progress: 10,
                    price: 1500,
                    viewCount: 7890, // 조회수 추가
                },
                {
                    title: '아빠의 토마토스튜',
                    thumbnail: 'https://img.ridicdn.net/cover/2353000261/xxlarge?dpi=xxhdpi#1',
                    episode: '오늘 아침은 뭘 먹을까?',
                    progress: 50,
                    price: 0,
                    viewCount: 2345, // 조회수 추가
                },
                {
                    title: '고양이 산책',
                    thumbnail: 'https://img.ridicdn.net/cover/749000361/xxlarge?dpi=xxhdpi#1',
                    episode: '물구나무 세상보기',
                    progress: 80,
                    price: 2000,
                    viewCount: 6789, // 조회수 추가
                },
                {
                    title: '엄마에게 비밀이!',
                    thumbnail: 'https://img.ridicdn.net/cover/1745007613/xxlarge?dpi=xxhdpi#1',
                    episode: '6년 만에 엄마에게 비밀이 생겼다!',
                    progress: 20,
                    price: 0,
                    viewCount: 4567, // 조회수 추가
                },
                {
                    title: '큼이네집 한글놀이 자음모음편',
                    thumbnail: 'https://img.ridicdn.net/cover/2353000046/xxlarge?dpi=xxhdpi#1',
                    episode: '자음모음편: 50%',
                    progress: 30,
                    price: 0,
                    viewCount: 8901, // 조회수 추가
                },
                {
                    title: '소미의 소리 가득 하루',
                    thumbnail: 'https://img.ridicdn.net/cover/4261000010/xxlarge?dpi=xxhdpi#1',
                    episode: '의성어로 만나는 신나는 세상',
                    progress: 20,
                    price: 3000,
                    viewCount: 2345, // 조회수 추가
                },
                {
                    title: '쓱쓱 싹싹',
                    thumbnail: 'https://img.ridicdn.net/cover/1451000215/xxlarge?dpi=xxhdpi#1',
                    episode: '북극곰 꿈나무 그림책 111',
                    progress: 70,
                    price: 2500,
                    viewCount: 6789, // 조회수 추가
                },
                {
                    title: '토네이똥',
                    thumbnail: 'https://img.ridicdn.net/cover/2353000263/xxlarge?dpi=xxhdpi#1',
                    episode: '똥똥똥',
                    progress: 40,
                    price: 0,
                    viewCount: 1234, // 조회수 추가
                },
                {
                    title: '달은 어떻게 달이 될까?',
                    thumbnail: 'https://img.ridicdn.net/cover/1451000214/xxlarge?dpi=xxhdpi#1',
                    episode: '북극곰 궁금해 시리즈 25',
                    progress: 50,
                    price: 1500,
                    viewCount: 5678, // 조회수 추가
                },
                {
                    title: '아빠의 토마토스튜',
                    thumbnail: 'https://img.ridicdn.net/cover/2353000261/xxlarge?dpi=xxhdpi#1',
                    episode: '오늘 아침은 뭘 먹을까?',
                    progress: 50,
                    price: 0,
                    viewCount: 9012, // 조회수 추가
                },
                {
                    title: '고양이 산책',
                    thumbnail: 'https://img.ridicdn.net/cover/749000361/xxlarge?dpi=xxhdpi#1',
                    episode: '물구나무 세상보기',
                    progress: 50,
                    price: 2000,
                    viewCount: 3456, // 조회수 추가
                },
                {
                    title: '엄마에게 비밀이!',
                    thumbnail: 'https://img.ridicdn.net/cover/1745007613/xxlarge?dpi=xxhdpi#1',
                    episode: '6년 만에 엄마에게 비밀이 생겼다!',
                    progress: 50,
                    price: 0,
                    viewCount: 7890, // 조회수 추가
                },
                // Add more items...
            ],
            top5Series: [
                {
                    title: '감각 통합 놀이',
                    thumbnail: 'https://img.ridicdn.net/cover/3397000176/xxlarge?dpi=xxhdpi#1',
                    price: 2500,
                },
                {
                    title: '조용한 빵 가게',
                    thumbnail: 'https://img.ridicdn.net/cover/1351000111/xxlarge?dpi=xxhdpi#1',
                    price: 0,
                },
                {
                    title: '소나기',
                    thumbnail: 'https://img.ridicdn.net/cover/852001701/xxlarge?dpi=xxhdpi#1',
                    price: 1800,
                },
                {
                    title: '우리아이 괜찮아요 1권',
                    thumbnail: 'https://img.ridicdn.net/cover/887000033/xxlarge?dpi=xxhdpi#1',
                    price: 2200,
                },
                {
                    title: '우리아이 괜찮아요 2권',
                    thumbnail: 'https://img.ridicdn.net/cover/734001025/xxlarge?dpi=xxhdpi#1',
                    price: 0,
                },
                // Add more items...
            ],
            categoryContent: [
                {
                    title: 'The story of 붉은 여우 루비',
                    thumbnail: 'https://img.ridicdn.net/cover/5273004218/xxlarge?dpi=xxhdpi#1',
                    price: 3000,
                    isOwned: true, // 소장한 동화
                    viewCount: 1500,
                },
                {
                    title: '알렉스 미아와 장난감 공장의 비밀',
                    thumbnail: 'https://img.ridicdn.net/cover/1745007459/xxlarge?dpi=xxhdpi#1',
                    price: 0,
                    viewCount: 2000,
                },
                {
                    title: '우리 바다 친구들',
                    thumbnail: 'https://img.ridicdn.net/cover/5273004187/xxlarge?dpi=xxhdpi#1',
                    price: 2500,
                    isRented: true, // 대여한 동화
                    viewCount: 1800,
                },
                {
                    title: '꼬마 마법사의 모험',
                    thumbnail: 'https://img.ridicdn.net/cover/5273004218/xxlarge?dpi=xxhdpi#1',
                    price: 3500,
                    viewCount: 2200,
                },
                {
                    title: '숲속 동물들의 파티',
                    thumbnail: 'https://img.ridicdn.net/cover/1745007459/xxlarge?dpi=xxhdpi#1',
                    price: 0,
                    viewCount: 1700,
                },
                {
                    title: '용감한 기사의 여행',
                    thumbnail: 'https://img.ridicdn.net/cover/5273004187/xxlarge?dpi=xxhdpi#1',
                    price: 4000,
                    viewCount: 2500,
                },
                // 추가 아이템...
            ],
            selectedFairyTale: null,
        };
    },
    methods: {
        showDetail(item) {
            this.selectedFairyTale = {
                ...item,
                description: '이 동화의 상세 설명입니다.', // 실제로는 API에서 가져올 수 있습니다
            };
        },
        closeDetail() {
            this.selectedFairyTale = null;
        },
    },
};
</script>

<style scoped>
.main-container {
    color: black;
    padding: 0 4%;
}

.hero-section {
    display: flex;
    position: relative;
    height: 56.25vw;
    max-height: 720px;
    margin-bottom: 3vw;
    align-items: center;
    justify-content: center;
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
    justify-content: space-around;
}

.content-slider::-webkit-scrollbar {
    display: none;
}

.content-item {
    flex: 0 0 auto;
    width: 200px;
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
    color: #999;
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
    cursor: pointer;
}

/* 나님이 시청 중인 콘텐츠 스타일 */
.recently-watched .content-item {
    width: 200px;
    overflow: hidden;
}

.recently-watched .thumbnail-container {
    padding-top: 120%; /* 2:3 비율 유지 */
    border-radius: 6px 6px 0 0; /* 상단만 둥글게 */
    overflow: hidden;
}

.recently-watched .thumbnail {
    border-radius: 6px 6px 0 0; /* 상단만 둥글게 */
}

.recently-watched .content-info.recently-watched-info {
    padding: 10px;
    border-radius: 0 0 6px 6px; /* 하단만 둥글게 */
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
    padding-left: 5%;
    overflow-y: hidden; /* 세로 스크롤 비활성화 */
}

.top-5 .content-item {
    width: 200px;
    height: 300px; /* 높이 증가 */
    margin-right: 100px;
}

.top-5 .thumbnail-container {
    height: 100%;
    padding-top: 0;
}

.top-5 .rank {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    position: absolute;
    right: 78%;
    bottom: 8px;
    font-size: 230px;
    font-weight: bold;
    color: black;
    -webkit-text-stroke: 4px white;
    line-height: 0.8;
}

/* 추천 동화 스타일 */
.recommended .content-item {
    width: 200px;
}

.recommended .thumbnail-container {
    padding-top: 140%; /* 2:3 비율로 수정 */
}

/* 동화 상세 페이지 오버레이 스타일 */
.fairy-tale-detail-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
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
</style>
