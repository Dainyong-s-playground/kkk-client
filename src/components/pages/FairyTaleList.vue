<template>
    <div class="main-container">
        <div class="hero-section">
            <img src="https://i.ibb.co/xFTyX1B/beak.jpg" alt="Hero Image" class="hero-image" />
            <div class="hero-content">
                <h1>내가 바로 백설공주다</h1>
                <p>동화에 대한 간단한 설명이 여기에 들어갑니다.</p>
                <button class="play-button">▶ 재생</button>
                <button class="info-button">ⓘ 상세 정보</button>
            </div>
        </div>

        <div class="fairy_category">
            <div>최근 시청 동화</div>
            <div class="popular_fairy">
                <div class="slider-container">
                    <div class="fairy-tale-list" ref="slider">
                        <div v-for="(fairyTale, index) in fairyTales" :key="index" class="fairy-tale-item">
                            <img :src="fairyTale.thumbnail" :alt="fairyTale.title" class="thumbnail" />
                            <div class="title">{{ fairyTale.title }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="fairy_category">
            <div>오늘의 TOP 10 동화</div>
            <div class="popular_fairy">
                <div class="slider-container">
                    <div class="fairy-tale-list" ref="slider">
                        <div v-for="(fairyTale, index) in fairyTales" :key="index" class="fairy-tale-item">
                            <img :src="fairyTale.thumbnail" :alt="fairyTale.title" class="thumbnail" />
                            <div class="title">{{ fairyTale.title }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="fairy_category">
            <div>오늘의 TOP 10 동화</div>
            <div class="popular_fairy">
                <div class="slider-container">
                    <div class="fairy-tale-list" ref="slider">
                        <div v-for="(fairyTale, index) in fairyTales" :key="index" class="fairy-tale-item">
                            <img :src="fairyTale.thumbnail" :alt="fairyTale.title" class="thumbnail" />
                            <div class="title">{{ fairyTale.title }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="fairy_category">
            <div>오늘의 TOP 10 동화</div>
            <div class="popular_fairy">
                <div class="slider-container">
                    <div class="fairy-tale-list" ref="slider">
                        <div v-for="(fairyTale, index) in fairyTales" :key="index" class="fairy-tale-item">
                            <img :src="fairyTale.thumbnail" :alt="fairyTale.title" class="thumbnail" />
                            <div class="title">{{ fairyTale.title }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="fairy_category">
            <div>오늘의 TOP 10 동화</div>
            <div class="popular_fairy">
                <div class="slider-container">
                    <div class="fairy-tale-list" ref="slider">
                        <div v-for="(fairyTale, index) in fairyTales" :key="index" class="fairy-tale-item">
                            <img :src="fairyTale.thumbnail" :alt="fairyTale.title" class="thumbnail" />
                            <div class="title">{{ fairyTale.title }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="fairy_category">
            <div>회원님을 위한 추천 동화</div>
            <div class="popular_fairy">
                <div class="slider-container">
                    <div class="fairy-tale-list" ref="slider">
                        <div v-for="(fairyTale, index) in fairyTales" :key="index" class="fairy-tale-item">
                            <img :src="fairyTale.thumbnail" :alt="fairyTale.title" class="thumbnail" />
                            <div class="title">{{ fairyTale.title }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            fairyTales: [
                {
                    id: 1,
                    title: '백설공주',
                    thumbnail: 'https://i.ibb.co/xXkt0W5/IMG-4283.jpg',
                    author: '그림 형제',
                    viewCount: 1300,
                },
                {
                    id: 2,
                    title: '신데렐라',
                    thumbnail: 'https://i.ibb.co/xXkt0W5/IMG-4283.jpg',
                    author: '샤를 페로',
                    viewCount: 1200,
                },
                {
                    id: 3,
                    title: '빨간 모자',
                    thumbnail: 'https://i.ibb.co/xXkt0W5/IMG-4283.jpg',
                    author: '그림 형제',
                    viewCount: 1000,
                },
                {
                    id: 4,
                    title: '피노키오',
                    thumbnail: 'https://i.ibb.co/xXkt0W5/IMG-4283.jpg',
                    author: '카를로 콜로디',
                    viewCount: 800,
                },
                {
                    id: 5,
                    title: '인어공주',
                    thumbnail: 'https://i.ibb.co/xXkt0W5/IMG-4283.jpg',
                    author: '안데르센',
                    viewCount: 950,
                },
                {
                    id: 5,
                    title: '인어공주',
                    thumbnail: 'https://i.ibb.co/xXkt0W5/IMG-4283.jpg',
                    author: '안데르센',
                    viewCount: 950,
                },
                {
                    id: 5,
                    title: '인어공주',
                    thumbnail: 'https://i.ibb.co/xXkt0W5/IMG-4283.jpg',
                    author: '안데르센',
                    viewCount: 950,
                },
                {
                    id: 5,
                    title: '인어공주',
                    thumbnail: 'https://i.ibb.co/xXkt0W5/IMG-4283.jpg',
                    author: '안데르센',
                    viewCount: 950,
                },
                {
                    id: 6,
                    title: '인어공주',
                    thumbnail: 'https://i.ibb.co/xXkt0W5/IMG-4283.jpg',
                    author: '안데르센',
                    viewCount: 950,
                },
            ],
            scrollPosition: 0,
            canSlideRight: true,
        };
    },
    methods: {
        initializeSlider() {
            const slider = this.$refs.slider;
            slider.scrollLeft = 0;
        },
        handleScroll() {
            this.isScrolled = window.scrollY > 10; // 10px 이상 스크롤 시 배경 표시
        },
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    },
};
</script>

<style scoped>
.main-container {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
}

.main-container::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
}

.header.scrolled {
    background-color: rgba(20, 20, 20, 0.8);
    backdrop-filter: blur(10px);
}
.hero-section {
    position: relative;
    height: 55vh;
    width: 100%;
    overflow: hidden;
    border: 1px solid;
    border-radius: 15px;
    margin-top: 5vh;
}

.hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: none;
}

.hero-content {
    position: absolute;
    bottom: 10%;
    left: 4%;
    width: 50%;
}

.hero-content p {
    font-size: 1.2rem;
    margin-bottom: 1rem;
}

.play-button,
.info-button {
    padding: 10px 20px;
    margin-right: 10px;
    font-size: 1.2rem;
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

.slider-container {
    width: 100%;
    overflow: hidden;
}

.fairy-tale-list {
    display: flex;
    overflow-x: auto;
    scroll-behavior: smooth;
    -ms-overflow-style: none;
    scrollbar-width: none;
    padding: 20px 0;
}

.fairy-tale-list::-webkit-scrollbar {
    display: none;
}

.fairy-tale-item {
    flex: 0 0 auto;
    width: 150px;
    margin-right: 20px;
}

.thumbnail {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
}

.title {
    margin-top: 10px;
    font-weight: bold;
}

.popular_fairy {
    width: 100%;
    display: flex;
}

.fairy_category {
    margin-top: 20px;
}
</style>
