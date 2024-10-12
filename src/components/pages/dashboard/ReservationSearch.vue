<template>
    <div class="search-container">
        <div class="search-input-container">
            <img src="https://dainyong-s-playground.github.io/imageServer/src/search.png" class="search-img" />
            <input type="text" v-model="searchKeyword" @input="filterStories" placeholder="검색어를 입력하세요..." />
        </div>
        <div class="tag-filter-container">
            <label v-for="tag in availableTags" :key="tag" class="tag-item">
                <input type="checkbox" :value="tag" v-model="selectedTags" @change="filterStories" /> {{ tag }}
            </label>
        </div>
        <!-- 조건에 따라 표시되는 영역 -->
        <div class="story-list-container">
            <!-- 검색어 또는 태그 필터가 없을 경우 추천 동화 및 TOP 5 표시 -->
            <template v-if="!hasSearchCondition">
                <!-- TOP 5 동화 -->
                <section class="category top-5">
                    <h2 class="category-title">오늘 TOP 5 동화</h2>
                    <div class="content-slider">
                        <div
                            v-for="(item, index) in top5Series"
                            :key="index"
                            class="content-item"
                            @click="handleStoryClick(item)"
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

                <!--기본 동화 리스트-->
                <section class="category recommended">
                    <h2>{{ displayTitle }}</h2>
                    <div class="content-slider">
                        <div
                            v-for="story in filteredStories"
                            :key="story.id"
                            class="content-item"
                            @click="handleStoryClick(story)"
                        >
                            <div class="thumbnail-container">
                                <img :src="story.fairyTaleImage" alt="썸네일" class="thumbnail" />
                                <div class="play-overlay">▶</div>
                                <div class="content-type-icon" :class="{ paid: story.rentalPrice > 0 }">
                                    {{ story.rentalPrice > 0 ? '유료' : '무료' }}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </template>

            <!-- 검색어 또는 태그 필터가 있을 경우 해당 스토리 리스트만 표시 -->
            <template v-else>
                <div class="search-category">
                    <h2>{{ displayTitle }}</h2>
                    <div class="search-content-slider">
                        <div
                            v-for="story in filteredStories"
                            :key="story.id"
                            class="search-content-item"
                            @click="handleStoryClick(story)"
                        >
                            <div class="search-thumbnail-container">
                                <img :src="story.fairyTaleImage" alt="썸네일" class="search-thumbnail" />
                                <div class="search-play-overlay">▶</div>
                                <div class="search-content-type-icon" :class="{ paid: story.rentalPrice > 0 }">
                                    {{ story.rentalPrice > 0 ? '유료' : '무료' }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            searchKeyword: '',
            selectedTags: [],
            availableTags: [],
            allStories: [],
            filteredStories: [],
            top5Series: [],
            selectedDate: '', // URL에서 전달된 날짜를 저장할 변수
        };
    },
    async mounted() {
        this.selectedDate = new URLSearchParams(window.location.search).get('selectedDate');
        await this.fetchTags();
        await this.fetchStories();
        await this.fetchTop5();
    },
    computed: {
        displayTitle() {
            const keyword = this.searchKeyword.toLowerCase();
            if (!keyword) {
                if (this.selectedTags.length === 0) {
                    return '추천 컨텐츠';
                } else if (this.selectedTags.length <= 5) {
                    return `${this.selectedTags.join(', ')} 컨텐츠`;
                } else {
                    return '검색결과 컨텐츠';
                }
            } else {
                return `${keyword} 검색결과`;
            }
        },
        hasSearchCondition() {
            return this.searchKeyword !== '' || this.selectedTags.length > 0;
        },
    },
    methods: {
        async fetchTags() {
            try {
                const response = await axios.get('http://localhost:7772/api/search/tags');
                this.availableTags = response.data;
            } catch (error) {
                console.error('태그 데이터를 가져오는 중 오류 발생:', error);
            }
        },
        async fetchStories() {
            try {
                const response = await axios.get('http://localhost:7772/api/search/fairytale');
                this.allStories = response.data;
                this.filteredStories = this.allStories;
            } catch (error) {
                console.error('동화 데이터를 가져오는 중 오류 발생:', error);
            }
        },

        async fetchTop5() {
            try {
                const response = await axios.get('http://localhost:7772/api/fairytales/top5');
                this.top5Series = response.data;
            } catch (error) {
                console.error('동화 데이터를 가져오는 중 오류 발생:', error);
            }
        },

        filterStories() {
            const keyword = this.searchKeyword.toLowerCase().split(' ').join(''); // 공백 제거

            this.filteredStories = this.allStories.filter((story) => {
                const normalizedTitle = story.fairyTaleTitle.toLowerCase().split(' ').join(''); // 동화 제목에서 공백 제거

                // 키워드가 입력된 경우, 태그 조건을 무시하고 키워드로만 필터링
                if (keyword) {
                    return normalizedTitle.includes(keyword);
                }

                // 태그 조건이 있을 때 OR 조건으로 계산
                const matchesTags =
                    this.selectedTags.length === 0 || this.selectedTags.some((tag) => story.tag.includes(tag));

                return matchesTags; // 키워드가 없을 경우 태그 조건으로 필터링
            });
        },
        handleStoryClick(story) {
            const storyId = story.id;
            // 객체를 문자열로 변환 후 다시 객체로 변환하여 전달
            window.opener.postMessage(
                { storyId, selectedDate: this.selectedDate },
                window.location.origin, // 동일 출처 보안 확인
            );
            window.close(); // 창 닫기
        },
    },
};
</script>

<style scoped>
.search-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    width: 100%;
    height: 100vh;
}

.search-input-container {
    width: 90%;
    height: 5%;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    border-radius: 20px;
    border: 1px solid #007a33;
    background: #ffffff;
}

.search-input-container input {
    width: 90%;
    font-size: 16px;
    border-radius: 5px;
    margin-left: 10px;
    border: none;
    background: none;
}

.search-input-container input[type='text']:focus {
    border: none;
    outline: none; /* outline 제거 */
}

.search-img {
    margin-left: 20px;
    width: 20px;
    object-fit: contain;
}

.tag-filter-container {
    display: flex;
    flex-wrap: wrap;
    margin-left: 20px;
    margin-right: 20px;
    justify-content: center;
    width: 100%;
    max-height: 200px;
    margin-bottom: 20px;
    border-bottom: 2px solid #171717;
    box-sizing: border-box;
}

.tag-item {
    margin: 20px;
    font-size: 14px;
}

.story-list-container {
    display: flex;
    flex-direction: column;
    justify-content: left;
    width: 90%;
}
.story-list-content {
    display: flex;
    flex-wrap: wrap;
    padding-left: 15px;
}
.story-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 5px 0 5px;
    width: 23%;
}

.story-item img {
    width: 100%;
    height: auto;
    margin-bottom: 10px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}
.story-item img:hover {
    scale: 1.05;
}

.story-title {
    font-size: 14px;
    text-align: center;
    margin: 0;
}
.search-content-slider {
    display: flex;
    flex-wrap: wrap; /* 줄 넘기기 활성화 */
    justify-content: flex-start; /* 요소들이 항상 왼쪽부터 시작하도록 설정 */
}

.search-content-item {
    flex: 0 1 calc(20% - 20px); /* 5개씩 배치되도록 고정 너비 설정 */
    margin: 5px; /* 아이템 간의 여백 */
    box-sizing: border-box; /* 패딩과 마진이 너비 계산에 포함되도록 설정 */
}

.search-thumbnail-container {
    width: 100%;
    overflow: hidden;
    position: relative;
    padding-top: 150%; /* 2:3 비율 유지 */
}

.search-thumbnail {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
}

.search-play-overlay {
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

.search-content-item:hover .search-play-overlay {
    opacity: 1; /* 마우스 호버 시 오버레이가 보이도록 설정 */
}

.search-content-info {
    padding-top: 10px;
    text-align: center;
}

.search-title {
    font-size: 1rem;
    font-weight: bold;
}

.search-content-type-icon {
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

.search-content-type-icon.paid {
    background-color: #ffa500;
}

/* 카테고리 및 슬라이더 공통 스타일 */
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
    width: 150px;
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
    width: 150px;
    height: 210px; /* 높이 증가 */
    margin-right: 70px;
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
    font-size: 100px;
    font-weight: bold;
    color: #90b4e2;
    -webkit-text-stroke: 4px #000000;
    line-height: 0.8;
}
.recommended .thumbnail-container {
    padding-top: 150%; /* 2:3 비율로 수정 */
}
</style>
