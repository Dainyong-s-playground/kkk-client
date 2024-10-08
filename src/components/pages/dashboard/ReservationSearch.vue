<template>
    <div class="search-container">
        <div class="search-input-container">
            <input type="text" v-model="searchKeyword" @input="filterStories" placeholder="검색어를 입력하세요..." />
        </div>
        <div class="tag-filter-container">
            <label v-for="tag in availableTags" :key="tag" class="tag-item">
                <input type="checkbox" :value="tag" v-model="selectedTags" @change="filterStories" /> {{ tag }}
            </label>
        </div>
        <div class="story-list-container">
            <div v-for="story in filteredStories" :key="story.id" class="story-item" @click="handleStoryClick(story)">
                <img :src="story.thumbnail" alt="썸네일" class="thumbnail" />
                <p class="story-title">{{ story.title }}</p>
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
        console.log(this.selectedDate);
        await this.fetchTags();
        await this.fetchStories();
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
            // 선택된 동화 데이터를 부모 창에 전송
            const clonedStory = JSON.parse(JSON.stringify(story)); // 객체를 문자열로 변환 후 다시 객체로 변환
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
}

.search-input-container {
    width: 60%;
    margin-bottom: 20px;
}

.search-input-container input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.tag-filter-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 60%;
    margin-bottom: 20px;
}

.tag-item {
    margin: 5px;
    font-size: 14px;
}

.story-list-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 80%;
}

.story-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 23%;
    margin: 10px;
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.story-item img {
    width: 100%;
    height: auto;
    border-radius: 5px;
    margin-bottom: 10px;
}

.story-title {
    font-size: 14px;
    text-align: center;
    margin: 0;
}
</style>
