<template>
    <div class="fairy-player" :class="{ fullscreen: isFullscreen }">
        <div v-if="isFullscreen" class="fullscreen-header">
            <h1 class="story-title-fullscreen">{{ storyTitle }}</h1>
        </div>
        <div class="player-container">
            <img :src="currentStoryImage" alt="Story Image" class="story-image" />
        </div>

        <div class="progress-bar">
            <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
        </div>

        <div class="story-info">
            <div class="controls">
                <div class="control-wrapper">
                    <button @click="previousLine" class="control-button">
                        <img :src="previousIcon" alt="Previous" class="control-icon" />
                    </button>
                    <span class="tooltip">이전</span>
                </div>
                <div class="control-wrapper">
                    <button @click="playPause" class="control-button">
                        <img :src="isPlaying ? stopIcon : playIcon" alt="Play/Pause" class="control-icon" />
                    </button>
                    <span class="tooltip">{{ isPlaying ? '정지' : '재생' }}</span>
                </div>
                <div class="control-wrapper">
                    <button @click="nextLine" class="control-button">
                        <img :src="skipIcon" alt="Next" class="control-icon" />
                    </button>
                    <span class="tooltip">다음</span>
                </div>
                <span class="line-counter">{{ currentLineIndex + 1 }} / {{ storyLines.length }}</span>
            </div>
            <div class="story-title">
                <img :src="guideCharacterImage" alt="Guide Character" class="guide-character" />
                <div class="story-text">{{ currentLine }}</div>
            </div>
            <div class="control-wrapper">
                <button @click="toggleFullscreen" class="control-button fullscreen-button">
                    <img :src="fullscreenIcon" alt="Fullscreen" class="control-icon fullscreen-icon" />
                </button>
                <span id="fullScreenTooltip" class="tooltip">{{ isFullscreen ? '전체화면 종료' : '전체화면' }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const storyTitle = ref(route.query.title || '제목 없음');
const currentStoryImage = ref(route.query.imageUrl || 'default-image-url.jpg');

// ... 기존 코드 ...
</script>

<style scoped>
.fairy-player {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1600px;
    aspect-ratio: 16 / 9;
    margin: 20px auto;
    background-color: #ffffff;
    border-radius: 15px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.player-container {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    height: 90%;
    width: 100%;
    background-color: #ffffff;
}

.story-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.story-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 10%;
    padding: 0 20px;
    background-color: rgb(0, 0, 0);
    color: #fff;
    margin-top: 0;
}

.controls {
    display: flex;
    align-items: center;
}

.control-wrapper {
    position: relative;
    display: inline-block;
    margin-right: 15px;
}

.control-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.control-icon {
    width: 24px;
    height: 24px;
    margin: 0px 8px;
    transition: opacity 0.3s;
    filter: brightness(0) invert(1);
}

.control-button:hover .control-icon {
    opacity: 0.7;
}

.tooltip {
    visibility: hidden;
    width: 80px;
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    z-index: 1;
    bottom: 260%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s, visibility 0.3s;
}

.control-wrapper:hover .tooltip {
    visibility: visible;
    opacity: 1;
}

.guide-character {
    height: 80px;
    object-fit: cover;
    border-radius: 50%;
    margin-right: 10px;
}

.story-title {
    display: flex;
    position: fixed;
    left: 30%;
    align-items: center;
    font-size: 18px;
    max-width: 70%;
    overflow: hidden;
}

.story-text {
    white-space: nowrap;
    font-size: 30px;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #fff;
}

.line-counter {
    font-size: 1.5rem;
    color: #fff;
    margin-left: 10px;
}

.fairy-player.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    max-width: none;
    aspect-ratio: auto;
    z-index: 9999;
    border-radius: 0;
    margin: 0;
}

.fairy-player.fullscreen .player-container {
    height: 86vh;
    background-color: #252525;
}

.fairy-player.fullscreen .story-info {
    height: 7vh;
}

.fairy-player.fullscreen .guide-character {
    height: 65px;
}

.progress-bar {
    width: 100%;
    height: 4px;
    background-color: rgba(54, 54, 54, 0.2);
    position: relative;
}

.progress {
    height: 100%;
    background-color: #ff0000;
    transition: width 0.3s ease;
}

.fairy-player.fullscreen .progress-bar {
    position: absolute;
    bottom: 7vh;
}

.fullscreen-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.fullscreen-button .control-icon {
    width: 24px;
    height: 24px;
    transition: opacity 0.3s;
    margin: 0px;
    filter: brightness(0) invert(1);
}

.fullscreen-button:hover .control-icon {
    opacity: 0.7;
}

.fullscreen-header {
    width: 100%;
    height: 7vh;
    background-color: rgba(0, 0, 0);
    display: flex;
    align-items: center;
    padding-left: 20px;
    z-index: 1;
}

.story-title-fullscreen {
    color: white;
    font-size: 1.5rem;
    margin: 0;
}

/* 전체 화면일 때만 #fullScreenTooltip의 너비를 늘립니다 */
.fairy-player.fullscreen #fullScreenTooltip {
    width: 120px;
    left: 0;
    right: 0;
    transform: translateX(-55%);
}
</style>
