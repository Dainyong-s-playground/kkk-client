<template>
    <div class="fairy-player" :class="{ fullscreen: isFullscreen }" ref="playerRef">
        <div class="mac-window-controls" v-if="!isFullscreen">
            <span class="mac-btn close" @click="closeWindow"></span>
            <span class="mac-btn maximize" @click="toggleFullscreen"></span>
        </div>
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
                <span class="line-counter" v-if="storyLines && storyLines.length">
                    {{ currentLineIndex + 1 }} / {{ storyLines.length }}
                </span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const fairyTaleId = ref(route.params.id);
const storyTitle = ref(route.query.title || '제목 없음');
const progress = ref(Number(route.query.progress) || 0);
const imageUrl = ref(route.query.imageUrl || '기본 이미지 URL');

const storyLines = ref([]);
const currentLineIndex = ref(0);
const isFullscreen = ref(false);
const isPlaying = ref(false);
const playerRef = ref(null);

const currentLine = computed(() => storyLines.value[currentLineIndex.value] || '');
const currentStoryImage = computed(() => imageUrl.value);
const progressPercentage = computed(() => {
    return storyLines.value.length > 0 ? ((currentLineIndex.value + 1) / storyLines.value.length) * 100 : 0;
});

// 가이드 캐릭터 이미지 URL
const guideCharacterImage = ref(
    'https://dainyong-s-playground.github.io/imageServer/profile/profileFull01-removebg.png',
);

// 컨트롤 아이콘 URL
const previousIcon = ref('https://dainyong-s-playground.github.io/imageServer/fairyPlayer/previousIcon.png');
const playIcon = ref('https://dainyong-s-playground.github.io/imageServer/fairyPlayer/playIcon.png');
const stopIcon = ref('https://dainyong-s-playground.github.io/imageServer/fairyPlayer/stopIcon.png');
const skipIcon = ref('https://dainyong-s-playground.github.io/imageServer/fairyPlayer/skipIcon.png');
const fullscreenIcon = ref('https://dainyong-s-playground.github.io/imageServer/fairyPlayer/fullScreen.png');

const playPause = () => {
    isPlaying.value = !isPlaying.value;
    // 여기에 실제 재생/일시정지 로직을 추가해야 합니다.
};

const previousLine = () => {
    if (currentLineIndex.value > 0) {
        currentLineIndex.value--;
    }
};

const nextLine = () => {
    if (currentLineIndex.value < storyLines.value.length - 1) {
        currentLineIndex.value++;
    }
};

const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        if (playerRef.value.requestFullscreen) {
            playerRef.value.requestFullscreen();
        } else if (playerRef.value.mozRequestFullScreen) {
            // Firefox
            playerRef.value.mozRequestFullScreen();
        } else if (playerRef.value.webkitRequestFullscreen) {
            // Chrome, Safari and Opera
            playerRef.value.webkitRequestFullscreen();
        } else if (playerRef.value.msRequestFullscreen) {
            // IE/Edge
            playerRef.value.msRequestFullscreen();
        }
        isFullscreen.value = true;
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            // Chrome, Safari and Opera
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            // IE/Edge
            document.msExitFullscreen();
        }
        isFullscreen.value = false;
    }
};

const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement;
};

const handleKeyDown = (event) => {
    // Escape 키 처리
    if (event.key === 'Escape' && isFullscreen.value) {
        toggleFullscreen();
    }
};

const closeWindow = () => {
    window.close();
};

onMounted(() => {
    // 여기에서 fairyTaleId를 사용하여 실제 스토리 데이터를 불러와야 합니다.
    console.log('동화 ID:', fairyTaleId.value);
    console.log('제목:', storyTitle.value);
    console.log('진행률:', progress.value);
    console.log('이미지 URL:', imageUrl.value);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
});
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
    background-color: rgba(0, 0, 0, 0.9);
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
    width: 80px;
    object-fit: cover;
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
    background-color: #4a4949;
}

.fairy-player.fullscreen .story-info {
    height: 7vh;
}

.fairy-player.fullscreen .guide-character {
    height: 80px;
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
    background-color: rgba(0, 0, 0, 0.9);
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

/* 전체 화면일 때만 #fullScreenTooltip의 너비 늘립니다 */
.fairy-player.fullscreen #fullScreenTooltip {
    width: 120px;
    left: 0;
    right: 0;
    transform: translateX(-55%);
}

/* 반응형 스타일 추가 */
@media (max-width: 768px) {
    .story-info {
        flex-wrap: wrap;
        justify-content: center;
        height: auto;
        padding: 10px;
    }

    .controls {
        width: 100%;
        justify-content: center;
        margin-bottom: 10px;
    }

    .story-title {
        position: static;
        width: 100%;
        justify-content: center;
        margin-bottom: 10px;
    }

    .guide-character {
        height: 40px;
        width: 40px;
        min-width: 40px;
    }

    .story-text {
        font-size: 16px;
    }

    .control-wrapper:last-child {
        position: absolute;
        right: 10px;
        top: 10px;
    }
}

/* 더 작은 화면에 대한 추가 조정 */
@media (max-width: 480px) {
    .guide-character {
        height: 30px;
        width: 30px;
        min-width: 30px;
    }

    .story-text {
        font-size: 14px;
    }

    .control-icon {
        width: 20px;
        height: 20px;
        margin: 0 4px;
    }
}

.fairy-player:not(.fullscreen) {
    max-width: 1280px;
    aspect-ratio: 16 / 10;
    border-radius: 10px;
    background-color: #f0f0f0;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    position: relative;
    border: 1px solid #d8d8d8; /* 테두리 추가 */
}

.fairy-player:not(.fullscreen)::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 30px;
    background: linear-gradient(to bottom, #d8d8d8, #f0f0f0);
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}

.fairy-player:not(.fullscreen) .player-container {
    height: calc(100% - 130px);
    width: calc(100% - 40px);
    margin: 30px 20px 20px;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #d8d8d8; /* 테두리 추가 */
}

.fairy-player:not(.fullscreen) .story-info {
    background-color: #f0f0f0;
    border-top: 1px solid #d8d8d8;
    height: 100px;
}

.fairy-player:not(.fullscreen) .control-icon {
    filter: none;
}

.fairy-player:not(.fullscreen) .story-text {
    color: #333;
}

.fairy-player:not(.fullscreen) .line-counter {
    color: #666;
}

.fairy-player:not(.fullscreen)::after {
    content: '';
    position: absolute;
    top: 5px;
    left: 10px;
    width: 20px;
    height: 20px;
    background-image: url('https://dainyong-s-playground.github.io/imageServer/macCloseButton');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}

.mac-window-controls {
    position: absolute;
    top: 39px;
    left: 35px;
    z-index: 10;
}

.mac-btn {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 8px;
    cursor: pointer;
}

.mac-btn.close {
    background-color: #ff5f56;
}

.mac-btn.maximize {
    background-color: #27c93f;
}

/* 호버 효과 */
.mac-btn:hover {
    filter: brightness(0.9);
}

.fairy-player.fullscreen .mac-window-controls {
    display: none;
}
</style>
