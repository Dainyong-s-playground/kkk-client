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
            selectedDate: '', // URL에서 전달된 날짜를 저장할 변수
        };
    },
    async mounted() {
        this.selectedDate = new URLSearchParams(window.location.search).get('selectedDate');
        await this.fetchTags();
        await this.fetchStories();
    },
    computed: {
        displayTitle() {
            if (this.selectedTags.length === 0) {
                return '추천 컨텐츠';
            } else if (this.selectedTags.length <= 5) {
                return `${this.selectedTags.join(', ')} 컨텐츠`;
            } else {
                return '검색결과 컨텐츠';
            }
        },

        // filteredStories를 4의 배수로 조정하여 반환 (단, 4개 미만인 경우에는 그대로 출력)
        adjustedStories() {
            if (this.filteredStories.length < 4) {
                return this.filteredStories; // 4개 미만일 경우 전체 출력
            } else {
                // 4개 이상일 경우 4의 배수로 자르기
                const maxStories = Math.floor(this.filteredStories.length / 4) * 4;
                return this.filteredStories.slice(0, maxStories);
            }
        },
    },
    methods: {
        async fetchTags() {
            try {
                const response = await axios.get('/tagsData.json');
                this.availableTags = response.data;
            } catch (error) {
                console.error('태그 데이터를 가져오는 중 오류 발생:', error);
            }
        },
        async fetchStories() {
            try {
                const response = await axios.get('/storiesData.json');
                this.allStories = response.data;
                this.filteredStories = this.allStories;
            } catch (error) {
                console.error('동화 데이터를 가져오는 중 오류 발생:', error);
            }
        },
        filterStories() {
            const keyword = this.searchKeyword.toLowerCase();
            this.filteredStories = this.allStories.filter((story) => {
                const matchesKeyword = story.title.toLowerCase().includes(keyword);
                const matchesTags =
                    this.selectedTags.length === 0 || this.selectedTags.every((tag) => story.tags.includes(tag));
                return matchesKeyword && matchesTags;
            });
        },
        handleStoryClick(story) {
            const clonedStory = JSON.parse(JSON.stringify(story)); // 객체를 문자열로 변환 후 다시 객체로 변환하여 전달
            window.opener.postMessage(
                { story: clonedStory, selectedDate: this.selectedDate },
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
    height: 20%;
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
</style>
