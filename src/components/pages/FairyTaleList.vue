<template>
    <div class="main-container">
        <section class="hero-section">
            <img src="https://i.ibb.co/xFTyX1B/beak.jpg" alt="Hero Image" class="hero-image" />
            <div class="hero-content">
                <h1>내가 바로 백설공주다</h1>
                <p>동화에 대한 간단한 설명이 여기에 들어갑니다.</p>
                <button class="play-button">▶ 재생</button>
                <button class="info-button">ⓘ 상세 정보</button>
            </div>
        </section>
        <section class="category recently-watched">
            <h2 class="category-title">나님이 시청 중인 콘텐츠</h2>
            <div class="content-slider">
                <div v-for="(item, index) in recentlyWatched" :key="index" class="content-item">
                    <div class="thumbnail-container">
                        <img :src="item.thumbnail" :alt="item.title" class="thumbnail" />
                        <div class="gradient-overlay"></div>
                        <div class="play-overlay">▶</div>
                        <div class="progress-bar">
                            <div class="progress" :style="{ width: `${item.progress}%` }"></div>
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

        <section class="category top-5">
            <h2 class="category-title">오늘 TOP 5 동화</h2>
            <div class="content-slider">
                <div v-for="(item, index) in top5Series" :key="index" class="content-item">
                    <div class="rank">{{ index + 1 }}</div>
                    <div class="thumbnail-container">
                        <img :src="item.thumbnail" :alt="item.title" class="thumbnail" />
                    </div>
                    <!-- <div class="title">{{ item.title }}</div> -->
                </div>
            </div>
        </section>

        <section class="category">
            <h2 class="category-title">추천 동화</h2>
            <div class="content-slider">
                <div v-for="(item, index) in categoryContent" :key="index" class="content-item base-item">
                    <div class="thumbnail-container base-thumbnail">
                        <img :src="item.thumbnail" :alt="item.title" class="thumbnail" />
                    </div>
                    <div class="content-info">
                        <span class="title">{{ item.title }}</span>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
export default {
    data() {
        return {
            recentlyWatched: [
                {
                    title: '큼이네집 한글놀이 자음모음편',
                    thumbnail: 'https://img.ridicdn.net/cover/2353000046/xxlarge?dpi=xxhdpi#1',
                    episode: '자음모음편: 50%',
                    progress: 90,
                },
                {
                    title: '소미의 소리 가득 하루',
                    thumbnail: 'https://img.ridicdn.net/cover/4261000010/xxlarge?dpi=xxhdpi#1',
                    episode: '의성어로 만나는 신나는 세상',
                    progress: 45,
                },
                {
                    title: '쓱쓱 싹싹',
                    thumbnail: 'https://img.ridicdn.net/cover/1451000215/xxlarge?dpi=xxhdpi#1',
                    episode: '북극곰 꿈나무 그림책 111',
                    progress: 72,
                },
                {
                    title: '토네이똥',
                    thumbnail: 'https://img.ridicdn.net/cover/2353000263/xxlarge?dpi=xxhdpi#1',
                    episode: '똥똥똥',
                    progress: 41,
                },
                {
                    title: '달은 어떻게 달이 될까?',
                    thumbnail: 'https://img.ridicdn.net/cover/1451000214/xxlarge?dpi=xxhdpi#1',
                    episode: '북극곰 궁금해 시리즈 25',
                    progress: 10,
                },
                {
                    title: '아빠의 토마토스튜',
                    thumbnail: 'https://img.ridicdn.net/cover/2353000261/xxlarge?dpi=xxhdpi#1',
                    episode: '오늘 아침은 뭘 먹을까?',
                    progress: 50,
                },
                {
                    title: '고양이 산책',
                    thumbnail: 'https://img.ridicdn.net/cover/749000361/xxlarge?dpi=xxhdpi#1',
                    episode: '물구나무 세상보기',
                    progress: 80,
                },
                {
                    title: '엄마에게 비밀이!',
                    thumbnail: 'https://img.ridicdn.net/cover/1745007613/xxlarge?dpi=xxhdpi#1',
                    episode: '6년 만에 엄마에게 비밀이 생겼다!',
                    progress: 20,
                },
                {
                    title: '큼이네집 한글놀이 자음모음편',
                    thumbnail: 'https://img.ridicdn.net/cover/2353000046/xxlarge?dpi=xxhdpi#1',
                    episode: '자음모음편: 50%',
                    progress: 30,
                },
                {
                    title: '소미의 소리 가득 하루',
                    thumbnail: 'https://img.ridicdn.net/cover/4261000010/xxlarge?dpi=xxhdpi#1',
                    episode: '의성어로 만나는 신나는 세상',
                    progress: 20,
                },
                {
                    title: '쓱쓱 싹싹',
                    thumbnail: 'https://img.ridicdn.net/cover/1451000215/xxlarge?dpi=xxhdpi#1',
                    episode: '북극곰 꿈나무 그림책 111',
                    progress: 70,
                },
                {
                    title: '토네이똥',
                    thumbnail: 'https://img.ridicdn.net/cover/2353000263/xxlarge?dpi=xxhdpi#1',
                    episode: '똥똥똥',
                    progress: 40,
                },
                {
                    title: '달은 어떻게 달이 될까?',
                    thumbnail: 'https://img.ridicdn.net/cover/1451000214/xxlarge?dpi=xxhdpi#1',
                    episode: '북극곰 궁금해 시리즈 25',
                    progress: 50,
                },
                {
                    title: '아빠의 토마토스튜',
                    thumbnail: 'https://img.ridicdn.net/cover/2353000261/xxlarge?dpi=xxhdpi#1',
                    episode: '오늘 아침은 뭘 먹을까?',
                    progress: 50,
                },
                {
                    title: '고양이 산책',
                    thumbnail: 'https://img.ridicdn.net/cover/749000361/xxlarge?dpi=xxhdpi#1',
                    episode: '물구나무 세상보기',
                    progress: 50,
                },
                {
                    title: '엄마에게 비밀이!',
                    thumbnail: 'https://img.ridicdn.net/cover/1745007613/xxlarge?dpi=xxhdpi#1',
                    episode: '6년 만에 엄마에게 비밀이 생겼다!',
                    progress: 50,
                },
                // Add more items...
            ],
            top5Series: [
                { title: '감각 통합 놀이', thumbnail: 'https://img.ridicdn.net/cover/3397000176/xxlarge?dpi=xxhdpi#1' },
                {
                    title: '조용한 빵 가게',
                    thumbnail: 'https://img.ridicdn.net/cover/1351000111/xxlarge?dpi=xxhdpi#1',
                },
                {
                    title: '소나기',
                    thumbnail: 'https://img.ridicdn.net/cover/852001701/xxlarge?dpi=xxhdpi#1',
                },
                {
                    title: '우리아이 괜찮아요 1권',
                    thumbnail: 'https://img.ridicdn.net/cover/887000033/xxlarge?dpi=xxhdpi#1',
                },
                {
                    title: '우리아이 괜찮아요 2권',
                    thumbnail: 'https://img.ridicdn.net/cover/734001025/xxlarge?dpi=xxhdpi#1',
                },
                // Add more items...
            ],
            categoryContent: [
                {
                    title: 'The story of 붉은 여우 루비',
                    thumbnail: 'https://img.ridicdn.net/cover/5273004218/xxlarge?dpi=xxhdpi#1',
                },
                {
                    title: '알렉스 미아와 장난감 공장의 비밀',
                    thumbnail: 'https://img.ridicdn.net/cover/1745007459/xxlarge?dpi=xxhdpi#1',
                },
                {
                    title: '우리 바다 친구들',
                    thumbnail: 'https://img.ridicdn.net/cover/5273004187/xxlarge?dpi=xxhdpi#1',
                },
                {
                    title: 'The story of 붉은 여우 루비',
                    thumbnail: 'https://img.ridicdn.net/cover/5273004218/xxlarge?dpi=xxhdpi#1',
                },
                {
                    title: '알렉스 미아와 장난감 공장의 비밀',
                    thumbnail: 'https://img.ridicdn.net/cover/1745007459/xxlarge?dpi=xxhdpi#1',
                },
                {
                    title: '우리 바다 친구들',
                    thumbnail: 'https://img.ridicdn.net/cover/5273004187/xxlarge?dpi=xxhdpi#1',
                },
                {
                    title: 'The story of 붉은 여우 루비',
                    thumbnail: 'https://img.ridicdn.net/cover/5273004218/xxlarge?dpi=xxhdpi#1',
                },
                {
                    title: '알렉스 미아와 장난감 공장의 비밀',
                    thumbnail: 'https://img.ridicdn.net/cover/1745007459/xxlarge?dpi=xxhdpi#1',
                },
                {
                    title: '우리 바다 친구들',
                    thumbnail: 'https://img.ridicdn.net/cover/5273004187/xxlarge?dpi=xxhdpi#1',
                },
                // 추가 아이템...
            ],
        };
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
}

.content-slider::-webkit-scrollbar {
    display: none;
}

.content-item {
    flex: 0 0 auto;
    width: 200px; /* 고정 너비 */
    margin-right: 20px;
}

.thumbnail-container {
    width: 100%;
    position: relative;
    overflow: hidden;
}
.thumbnail {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 6px;
    z-index: 100;
}
.play-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(255, 255, 255, 0.7);
    color: #000;
    width: 3vw;
    height: 3vw;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2vw;
    opacity: 0;
    transition: opacity 0.3s ease;
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

@media (max-width: 768px) {
    .content-item {
        width: 150px;
    }

    .hero-content {
        width: 60%;
    }

    .hero-content h1 {
        font-size: 5vw;
    }

    .hero-content p {
        font-size: 3vw;
    }

    .play-button,
    .info-button {
        font-size: 2.5vw;
        padding: 1vw 3vw;
    }
}

.recently-watched .content-info.recently-watched-info {
    padding: 10px;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    height: 90px;
}

.recently-watched .content-info.recently-watched-info .title,
.recently-watched .content-info.recently-watched-info .episode {
    color: #ffffff; /* 텍스트 색상을 흰색으로 변경 */
}

/* 필요하다면 hover 효과도 추가할 수 있습니다 */
.recently-watched .content-item:hover .content-info.recently-watched-info {
    background-color: #4a4a4a; /* hover 시 약간 밝은 회색으로 변경 */
}

.recently-watched .thumbnail-container {
    position: relative;
    overflow: hidden;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
}

.recently-watched .thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
}

.recently-watched .gradient-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 35px; /* 그라데이션의 높이를 조절할 수 있습니다 */
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
    background-color: #e50914; /* Netflix 스타일 빨간색 */
    transition: width 0.3s ease;
}

.recently-watched .content-info.recently-watched-info {
    background-color: #333333;
    padding: 10px;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    margin-top: -2px; /* 썸네일과의 간격을 없애기 위해 추가 */
}

.recently-watched .content-item {
    overflow: hidden; /* 내부 요소들이 둥근 모서리를 벗어나지 않도록 */
    border-radius: 6px; /* content-item 전체에 둥근 모서리 적용 */
    background-color: #333333; /* content-item 전체 배경색 설정 */
}

.recently-watched .content-info.recently-watched-info .title,
.recently-watched .content-info.recently-watched-info .episode {
    color: #ffffff;
}

/* hover 효과 */
.recently-watched .content-item:hover .content-info.recently-watched-info {
    background-color: #4a4a4a;
}

/* play-overlay 위치 조정 */
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
}

/* more-info 버튼 위치 조정 */
.recently-watched .more-info {
    bottom: 10px;
    right: 10px;
    z-index: 100;
}

.content-item {
    flex: 0 0 auto;
    width: 14%;
    margin-right: 1.5vw;
    position: relative;
    min-width: 200px; /* 최소 너비 설정 */
}

.thumbnail-container {
    position: relative;
    padding-top: 120.25%; /* 16:9 비율 유지 */
    overflow: hidden;
}

.thumbnail {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* 대형 화면 (1200px 이상) */
@media (min-width: 1200px) {
    .content-item {
        width: 14%;
    }
}

/* 중형 화면 (992px - 1199px) */
@media (min-width: 992px) and (max-width: 1199px) {
    .content-item {
        width: 18%;
    }
}

/* 태블릿 (768px - 991px) */
@media (min-width: 768px) and (max-width: 991px) {
    .content-item {
        width: 23%;
    }
}

/* 큰 모바일 화면 (576px - 767px) */
@media (min-width: 576px) and (max-width: 767px) {
    .content-item {
        width: 31.33%;
    }
}

/* 작은 모바일 화면 (575px 이하) */
@media (max-width: 575px) {
    .content-item {
        width: 45%;
        min-width: 150px; /* 더 작은 화면에서의 최소 너비 */
    }
}

/* 추가적인 스타일 조정 */
.category-title {
    font-size: calc(1rem + 1vw);
    margin-bottom: 1rem;
}

.title {
    font-size: calc(0.8rem + 0.5vw);
}

.episode,
.status {
    font-size: calc(0.6rem + 0.3vw);
}

.play-overlay {
    width: calc(2rem + 2vw);
    height: calc(2rem + 2vw);
    font-size: calc(1rem + 0.5vw);
}

.more-info {
    width: calc(1.5rem + 1vw);
    height: calc(1.5rem + 1vw);
    font-size: calc(0.8rem + 0.3vw);
}
</style>

<style scoped>
.top-5 {
    margin-bottom: 3vw;
    overflow-x: hidden;
}

.top-5 .category-title {
    font-size: 24px;
    margin-bottom: 20px;
}

.top-5 .content-slider {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    padding-left: 5%; /* 슬라이드가 조금 더 자연스럽게 보이도록 패딩 조정 */
    -ms-overflow-style: none; /* 인터넷 익스플로러의 스크롤바 숨기기 */
    scrollbar-width: none; /* 파이어폭스의 스크롤바 숨기기 */
}

.top-5 .content-slider::-webkit-scrollbar {
    display: none; /* 웹킷 브라우저(크롬, 사파리 등)의 스크롤바 숨기기 */
}

.top-5 .content-item {
    flex: 0 0 auto;
    width: 200px; /* 고정 너비 */
    height: 280px; /* 고정 높이 */
    margin-right: 100px;
    position: relative;
}

/* top-5 섹션에서는 미디어 쿼리에서도 크기 변경 없음 */
@media (max-width: 768px) {
    .top-5 .content-item {
        width: 200px; /* 고정된 너비 유지 */
        height: 280px; /* 고정된 높이 유지 */
    }
}

@media (max-width: 576px) {
    .top-5 .content-item {
        width: 200px; /* 고정된 너비 유지 */
        height: 280px; /* 고정된 높이 유지 */
    }
}

.top-5 .rank {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    position: absolute;
    right: 78%;
    bottom: 0;
    font-size: 230px;
    font-weight: bold;
    color: black;
    -webkit-text-stroke: 4px white;
    line-height: 0.8;
    z-index: 10;
}

.top-5 .thumbnail-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
}
.top-5 .thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* 다른 섹션의 스타일이 top-5에 영향을 주지 않도록 재정의 */
.top-5 .thumbnail-container {
    padding-top: 0;
}
</style>
