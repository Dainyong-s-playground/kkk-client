<template>
    <div v-show="isAnimating" class="search-container">
        <div class="search-area-container">
            <div class="search-close-button" @click="closeSearch">
                <img src="https://dainyong-s-playground.github.io/imageServer/src/backspace.png" />
            </div>
            <div class="search-input-container">
                <img src="https://dainyong-s-playground.github.io/imageServer/src/search.png" class="search-img" />
                <input
                    type="text"
                    v-model="searchKeyword"
                    @input="filterStories"
                    placeholder="검색어를 입력하세요..."
                />
            </div>
        </div>

        <!-- 태그 필터링 영역 -->
        <div class="tag-filter-container">
            <label v-for="tag in availableTags" :key="tag" class="tag-item">
                <input type="checkbox" :value="tag" v-model="selectedTags" @change="filterStories" /> {{ tag }}
            </label>
        </div>

        <!-- 스토리 리스트 영역 -->
        <div class="story-list-container">
            <h2>{{ displayTitle }}</h2>
            <div class="story-list-content">
                <div
                    v-for="story in adjustedStories"
                    :key="story.id"
                    class="story-item"
                    @click="handleStoryClick(story)"
                >
                    <img :src="story.thumbnail" alt="썸네일" class="thumbnail" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, defineEmits } from 'vue';
import axios from 'axios';

// 부모 컴포넌트로 이벤트 전달
const emit = defineEmits(['close-search']);

const searchKeyword = ref(''); // 검색어 상태 관리
const selectedTags = ref([]); // 선택된 태그 목록
const availableTags = ref([]); // 필터링 가능한 태그 목록
const allStories = ref([]); // 모든 스토리 데이터
const filteredStories = ref([]); // 필터링된 스토리 목록
const isVisible = ref(false);
const isAnimating = ref(true);
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
        const response = await axios.get('/tagsData.json');
        availableTags.value = response.data;
    } catch (error) {
        console.error('태그 데이터를 가져오는 중 오류 발생:', error);
    }
};

// 스토리 데이터 가져오기
const fetchStories = async () => {
    try {
        const response = await axios.get('/storiesData.json');
        allStories.value = response.data;
        filteredStories.value = allStories.value; // 초기에는 전체 스토리 목록을 표시
    } catch (error) {
        console.error('동화 데이터를 가져오는 중 오류 발생:', error);
    }
};

// 스토리 필터링
const filterStories = () => {
    const keyword = searchKeyword.value.toLowerCase(); // 검색어를 소문자로 변환
    filteredStories.value = allStories.value.filter((story) => {
        const matchesKeyword = story.title.toLowerCase().includes(keyword);
        const matchesTags =
            selectedTags.value.length === 0 || selectedTags.value.every((tag) => story.tags.includes(tag));
        return matchesKeyword && matchesTags; // 검색어와 태그 조건에 맞는 스토리 필터링
    });
};

// 스토리 아이템 클릭 시 처리
const handleStoryClick = (story) => {
    console.log('클릭된 스토리:', story);
    // 이 부분에 클릭한 스토리에 대한 추가 로직 작성 가능
};

onMounted(() => {
    isVisible.value = true;
    fetchTags();
    fetchStories();
});

const displayTitle = computed(() => {
    if (selectedTags.value.length === 0) {
        return '추천 컨텐츠';
    } else if (selectedTags.value.length <= 5) {
        return `${selectedTags.value.join(', ')} 컨텐츠`;
    } else {
        return '검색결과 컨텐츠';
    }
});

// filteredStories를 4의 배수로 조정하여 반환 (단, 4개 미만인 경우에는 그대로 출력)
const adjustedStories = computed(() => {
    if (filteredStories.value.length < 4) {
        return filteredStories.value; // 4개 미만일 경우 전체 출력
    } else {
        // 4개 이상일 경우 4의 배수로 자르기
        const maxStories = Math.floor(filteredStories.value.length / 4) * 4;
        return filteredStories.value.slice(0, maxStories);
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
}
.search-area-container {
    display: flex;
    width: 100%;
}
.search-close-button {
    width: 5%;
    padding-left: 20px;
}
.search-close-button img {
    width: 30px;
    object-fit: contain;
    border-radius: 50%;
}
.search-input-container {
    width: 90%;
    margin-bottom: 20px;
    display: flex;
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
    transform: scale(1.05); /* 호버 시 이미지 확대 */
}

.story-title {
    font-size: 14px;
    text-align: center;
    margin: 0;
}
</style>
