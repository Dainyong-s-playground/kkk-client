<template>
    <div v-show="isAnimating" class="search-container">
        <div class="search-area-container">
            <div class="search-close-button" @click="closeSearch">
                <img :src="`${IMAGE_SERVER_URL}/src/backspace.png`" alt="뒤로 가기" />
            </div>
            <div class="search-input-container">
                <img :src="`${IMAGE_SERVER_URL}/src/search.png`" class="search-img" alt="검색" />
                <input type="text" :value="searchKeyword" @input="onSearchInput" placeholder="검색어를 입력하세요..." />
            </div>
        </div>

        <!-- 태그 필터링 영역 -->
        <div class="tag-filter-container">
            <label v-for="tag in availableTags" :key="tag" class="tag-item">
                <input type="checkbox" :value="tag" v-model="selectedTags" @change="filterStories" />
                <span class="tag-text">{{ tag }}</span>
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

        <!-- 동화 상세 정보 오버레이 -->
        <div v-if="selectedFairyTale" class="fairy-tale-detail-overlay">
            <FairyTaleDetail :fairyTale="selectedFairyTale" @close="closeDetail" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, defineEmits } from 'vue';
import axios from 'axios';
import FairyTaleDetail from '../pages/FairyTaleDetail.vue';
import { TALE_API_URL, IMAGE_SERVER_URL } from '@/constants/api';
// 부모 컴포넌트로 이벤트 전달
const emit = defineEmits(['close-search']);

const searchKeyword = ref(''); // 검색어 상태 관리
const selectedTags = ref([]); // 선택된 태그 목록
const availableTags = ref([]); // 필터링 가능한 태그 목록
const allStories = ref([]); // 모든 스토리 데이터
const filteredStories = ref([]); // 필터링된 스토리 목록
const selectedFairyTale = ref(null); // 선택된 동화 정보를 저장하는 변수
const isVisible = ref(false);
const isAnimating = ref(true);
const top5Series = ref([]); // TOP 5 동화 데이터

// 검색 조건 여부를 판단하는 computed 속성
const hasSearchCondition = computed(() => {
    return searchKeyword.value !== '' || selectedTags.value.length > 0;
});
// 동화 상세정보 오버레이 닫기
const closeDetail = () => {
    selectedFairyTale.value = null;
};

// 스토리 아이템 클릭 시 상세정보를 표시하는 메서드
const handleStoryClick = (story) => {
    selectedFairyTale.value = story; // 선택된 동화 설정
};

// 검색창 닫기 이벤트 발생
const closeSearch = () => {
    isVisible.value = false; // 퇴장 애니메이션 실행
    setTimeout(() => {
        isAnimating.value = false; // 애니메이션이 끝난 후 DOM에서 제거
        emit('close-search'); // 부모 컴포넌트로 이벤트 전달
    }, 500); // 퇴장 애니메이션 시간 (0.5s)과 일치시킴
};

// 태그 목록 가져오기
const fetchTags = async () => {
    try {
        const response = await axios.get(`${TALE_API_URL}/api/search/tags`);
        availableTags.value = response.data;
    } catch (error) {
        console.error('태그 데이터를 가져오는 중 오류 발생:', error);
    }
};

// 스토리 데이터 가져오기
const fetchStories = async () => {
    try {
        const response = await axios.get(`${TALE_API_URL}/api/search/fairytale`);
        allStories.value = response.data;
        console.log(allStories.value);
        filteredStories.value = allStories.value;
        console.log(filterStories); // 초기에는 전체 스토리 목록을 표시
    } catch (error) {
        console.error('동화 데이터를 가져오는 중 오류 발생:', error);
    }
};

// TOP 5 동화 및 추천 동화 데이터 로딩
const fetchTop5AndRecommended = async () => {
    const top5Response = await axios.get(`${TALE_API_URL}/api/fairytales/top5`);
    top5Series.value = top5Response.data;
};

const onSearchInput = (event) => {
    searchKeyword.value = event.target.value;
    filterStories();
};

const filterStories = () => {
    const keyword = searchKeyword.value.toLowerCase().trim();

    filteredStories.value = allStories.value.filter((story) => {
        const normalizedTitle = story.fairyTaleTitle.toLowerCase();
        const matchesKeyword = keyword === '' || normalizedTitle.includes(keyword);
        const matchesTags =
            selectedTags.value.length === 0 || selectedTags.value.every((tag) => story.tag.includes(tag));

        return matchesKeyword && matchesTags;
    });
};

onMounted(() => {
    isVisible.value = true;
    fetchTags();
    fetchStories();
    fetchTop5AndRecommended();

    // 컴포넌트가 마운트될 때 스크롤을 최상단으로 이동
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.scrollTop = 0;
    }
});

const displayTitle = computed(() => {
    const keyword = searchKeyword.value.toLowerCase();
    if (!keyword) {
        if (selectedTags.value.length === 0) {
            return '추천 컨텐츠';
        } else if (selectedTags.value.length <= 5) {
            return `${selectedTags.value.join(', ')} 컨텐츠`;
        } else {
            return '검색결과 컨텐츠';
        }
    } else {
        return `${keyword} 검색결과`;
    }
});
</script>

<style scoped>
.search-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    width: 100%;
    height: 100vh;
    overflow-y: auto; /* 수직 스크롤 추가 */
    position: fixed; /* 추가 */
    top: 0; /* 추가 */
    left: 0; /* 추가 */
    z-index: 1000; /* 추가 */
    background-color: #ffffff; /* 추가: 배경색 설정 */
}
.search-area-container {
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 20px;
}
.search-close-button {
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin-right: 15px;
}
.search-close-button img {
    width: 30px;
    height: 30px;
    object-fit: contain;
}
.search-input-container {
    width: 90%;
    display: flex;
    align-items: center;
    height: 50px;
    border-radius: 25px;
    border: 2px solid #007a33;
    background: #ffffff;
    padding: 0 20px;
}

.search-input-container input {
    flex-grow: 1;
    height: 100%;
    font-size: 1.5rem;
    border: none;
    background: none;
    outline: none;
}

.search-input-container input::placeholder {
    color: #999;
}

.search-img {
    width: 24px;
    height: 24px;
    object-fit: contain;
    margin-right: 15px;
}

.tag-filter-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    max-height: 200px;
    margin-bottom: 20px;
    padding: 10px;
    border-bottom: 2px solid #e0e0e0;
    box-sizing: border-box;
    gap: 15px;
}

.tag-item {
    display: inline-block;
    margin: 5px;
    font-size: 16px;
    cursor: pointer;
}

.tag-item input[type='checkbox'] {
    display: none;
}

.tag-text {
    display: inline-block;
    padding: 8px 16px;
    background-color: #f0f0f0;
    border-radius: 20px;
    transition: all 0.3s ease;
    width: 59px;
    text-align: center;
}

.tag-item input[type='checkbox']:checked + .tag-text {
    background-color: #007a33;
    color: white;
}

.story-list-container {
    display: flex;
    flex-direction: column;
    justify-content: left;
    width: 90%;
    overflow-y: visible; /* 내부 스크롤 제거 */
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
    transform: scale(1.05); /* 호버 시 이미지 확대 */
}

.story-title {
    font-size: 14px;
    text-align: center;
    margin: 0;
}
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
    padding-bottom: 20px; /* 하단 여백 추가 */
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

.search-content-slider {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 20px; /* 아이템 간 간격 추가 */
}

.search-content-item {
    flex: 0 1 calc(20% - 16px); /* 간격을 고려한 너비 조정 */
    margin: 0; /* 마진 제거 */
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
</style>
