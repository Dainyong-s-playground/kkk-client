<template>
    <div class="fairy-player" :class="{ fullscreen: isFullscreen }" ref="playerRef">
        <div class="mac-window-controls" v-if="!isFullscreen">
            <span class="mac-btn close" @click="closeWindow"></span>
            <span class="mac-btn maximize" @click="toggleFullscreen"></span>
        </div>
        <div v-if="isFullscreen" class="fullscreen-header">
            <h1 class="story-title-fullscreen">{{ storyTitle }}</h1>
        </div>
        <div v-if="currentComponent === 'FairyPlayer'" class="player-container">
            <img :src="currentStoryImage" alt="Story Image" class="story-image" />
        </div>
        <component v-else :is="currentComponent"></component>

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
import HandLandmark from '@/components/pages/Game/HandLandmark.vue';
import RopeCut from '@/components/pages/Game/RopeCut.vue';
import axios from 'axios';
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const fairyTaleId = ref(route.params.id);
const storyTitle = ref(route.query.title || '제목 없음');
const progress = ref(Number(route.query.progress) || 0);
const imageUrl = ref(route.query.imageUrl || '기본 이미지 URL');
const storyImages = ref([]); // 이미지 URL 리스트를 저장할 ref
const currentImageIndex = ref(0); // 현재 표시 중인 이미지의 인덱스

const storyLines = ref([]);
const currentLineIndex = ref(0);
const sceneNumbers = ref([]);
const isFullscreen = ref(false);
const isPlaying = ref(false);
const playerRef = ref(null);

const currentLine = computed(() => storyLines.value[currentLineIndex.value] || '');
const currentStoryImage = computed(() => storyImages.value[currentImageIndex.value] || '');
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

const currentComponent = shallowRef('FairyPlayer');
const BASE_URL = 'http://localhost:7772';

const checkSpecialContent = (content) => {
    if (content === "게임") {
        currentComponent.value = RopeCut;
        return true;
    } else if (content === "모션인식") {
        currentComponent.value = HandLandmark;
        return true;
    }
    currentComponent.value = 'FairyPlayer';  // 일반 동화 플레이어로 돌아가기
    return false;
};

// 동화 플레이어 데이터 가져오기
const FairyTaleData = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/fairyTales/${fairyTaleId.value}`);
        const data = response.data;

        storyTitle.value = data.title || '제목 없음';
        
        if (data.script) {
            storyLines.value = data.script.split('\\n');
        } else {
            storyLines.value = ['스크립트가 없습니다.'];
            console.error('스크립트 데이터가 없습니다.');
        }

        if (data.sceneNumber) {
            sceneNumbers.value = data.sceneNumber.split('\\n').map(Number);
        } else {
            sceneNumbers.value = [0];
            console.error('장면 번호 데이터가 없습니다.');
        }
        
        if (data.url && Array.isArray(data.url)) {
            storyImages.value = data.url;
        } else if (data.image) {
            storyImages.value = [data.image];
        } else {
            storyImages.value = ['기본 이미지 URL'];
            console.error('이미지 데이터가 없습니다.');
        }
        
        // 첫 번째 이미지로 초기화
        currentImageIndex.value = 0;

        console.log('처리된 데이터:', {
            storyTitle: storyTitle.value,
            storyLines: storyLines.value,
            sceneNumbers: sceneNumbers.value,
            storyImages: storyImages.value
        });
    } catch (error) {
        console.error('동화 데이터를 가져오는 중 오류 발생:', error);
    }
};

watch(currentLineIndex, (newIndex) => {
    updateCurrentImage(newIndex);
});

const updateCurrentImage = (index) => {
    if (storyImages.value.length === 0) return; // 이미지가 없으면 함수 종료

    const nextSceneIndex = sceneNumbers.value.findIndex(sceneNumber => sceneNumber > index);
    if (nextSceneIndex === -1) {
        currentImageIndex.value = storyImages.value.length - 1;
    } else {
        currentImageIndex.value = Math.min(nextSceneIndex, storyImages.value.length - 1);
    }
};

const audioElement = ref(null);
const currentAudio = ref(null);

const playPause = async () => {
    isPlaying.value = !isPlaying.value;
    if (isPlaying.value) {
        await playCurrentLine();
    } else {
        currentAudio.value?.pause();
    }
};

const playCurrentLine = async () => {
    if (currentAudio.value) {
        currentAudio.value.pause();
    }

    const currentContent = storyLines.value[currentLineIndex.value];
    if (checkSpecialContent(currentContent)) {
        isPlaying.value = false;
        return;
    }

    currentComponent.value = 'FairyPlayer';

    try {
        const response = await axios.post(`${BASE_URL}/fairyTales/tts`, {
            sentence: currentContent,
            language: 'ko'
        }, {
            responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const audioBlob = new Blob([response.data], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        currentAudio.value = new Audio(audioUrl);
        currentAudio.value.onended = () => {
            if (currentLineIndex.value < storyLines.value.length - 1 && isPlaying.value) {
                nextLine();
            } else {
                isPlaying.value = false;
            }
        };
        await currentAudio.value.play();
    } catch (error) {
        console.error('TTS 생성 중 오류 발생:', error);
        isPlaying.value = false;
    }
};

const previousLine = () => {
    if (currentLineIndex.value > 0) {
        currentLineIndex.value--;
        updateCurrentImage(currentLineIndex.value);
        if (isPlaying.value) {
            playCurrentLine();
        }
    }
};

const nextLine = () => {
    if (currentLineIndex.value < storyLines.value.length - 1) {
        currentLineIndex.value++;
        const nextContent = storyLines.value[currentLineIndex.value];
        checkSpecialContent(nextContent);
        updateCurrentImage(currentLineIndex.value);
        if (!checkSpecialContent(nextContent) && isPlaying.value) {
            playCurrentLine();
        }
    } else {
        isPlaying.value = false;
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
    FairyTaleData();
    updateCurrentImage(0);
    audioElement.value = new Audio();
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    if (currentAudio.value) {
        currentAudio.value.pause();
        currentAudio.value = null;
    }
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
    width: 100%;
    height: 100%;
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
    z-index: 100;
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
    aspect-ratio: 16 / 9;
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
    height: 10%;
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