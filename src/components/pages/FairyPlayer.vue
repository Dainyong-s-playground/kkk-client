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
        <div class="mac-close-button" v-if="!isFullscreen"></div>
    </div>
</template>

<script setup>
import { IMAGE_SERVER_URL, TALE_API_URL } from '@/constants/api';
import { gameComponentMap, motionComponentMap } from '@/constants/fairyTaleComponents';
import { useProfileStore } from '@/stores/profile';
import axios from 'axios';
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, provide, ref, shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const profileStore = useProfileStore();
const { selectedProfile } = storeToRefs(profileStore);

const profileId = computed(() => selectedProfile.value?.id);

const fairyTaleId = ref(route.params.id);

const storyTitle = ref(route.query.title || '제목 없음');
const storyImages = ref([]);
const currentImageIndex = ref(0);

const storyLines = ref([]);
const currentLineIndex = ref(0);
const sceneNumbers = ref([]);
const isFullscreen = ref(false);
const isPlaying = ref(false);
const playerRef = ref(null);

const currentLine = computed(() => storyLines.value[currentLineIndex.value] || '');
const currentStoryImage = computed(() => {
    return storyImages.value[currentImageIndex.value] || '';
});
const progressPercentage = computed(() => {
    return storyLines.value.length > 0 ? ((currentLineIndex.value + 1) / storyLines.value.length) * 100 : 0;
});

const guideCharacterImage = ref(`${IMAGE_SERVER_URL}/profile/profileFull01-removebg.png`);

const previousIcon = ref(`${IMAGE_SERVER_URL}/fairyPlayer/previousIcon.png`);
const playIcon = ref(`${IMAGE_SERVER_URL}/fairyPlayer/playIcon.png`);
const stopIcon = ref(`${IMAGE_SERVER_URL}/fairyPlayer/stopIcon.png`);
const skipIcon = ref(`${IMAGE_SERVER_URL}/fairyPlayer/skipIcon.png`);
const fullscreenIcon = ref(`${IMAGE_SERVER_URL}/fairyPlayer/fullScreen.png`);

const currentComponent = shallowRef('FairyPlayer');
const isFirstPlay = ref(true);
const isMotionComplete = ref(false);
const isGameComplete = ref(false);
const BASE_URL = TALE_API_URL;

const handleMotionComplete = async () => {
    currentComponent.value = 'FairyPlayer';
    nextLine();
    isMotionComplete.value = true;

    if (isMotionComplete.value && profileId.value) {
        try {
            const response = await axios.patch(`http://localhost:7772/api/graph/motionCount/${profileId.value}`);
            console.log('모션 인식 참여 횟수 업데이트 성공:', response.data);
        } catch (error) {
            console.error('모션 인식 참여 횟수 업데이트 중 오류 발생:', error.response ? error.response.data : error.message);
        }
    } else {
        console.log('프로필 ID 없음 또는 모션 미완료');
    }
};

const handleGameComplete = () => {
    if (isGameComplete.value) return; // 이미 완료된 경우 함수 실행 중단

    currentComponent.value = 'FairyPlayer';
    isGameComplete.value = true;

    if (profileId.value) {
        try {
            // 게임 카운트 API 호출
            axios.patch(`http://localhost:7772/api/graph/gameCount/${profileId.value}`);
            console.log('게임 참여 횟수 업데이트 성공');
        } catch (error) {
            console.error('게임 참여 횟수 업데이트 중 오류 발생:', error);
        }
    }
    
    // 게임 완료 후 다음 대사로 넘어가기
    nextLine();
};

provide('handleMotionComplete', handleMotionComplete);
provide('handleGameComplete', handleGameComplete);

const getGameComponent = (fairyTaleId) => {
    return gameComponentMap[fairyTaleId] || null;
};

const getMotionComponent = (fairyTaleId) => {
    return motionComponentMap[fairyTaleId] || null;
};

const checkSpecialContent = (content) => {
    if (content === '게임') {
        const gameComponent = getGameComponent(fairyTaleId.value);
        if (gameComponent) {
            currentComponent.value = gameComponent;
            return true;
        }
    } else if (content === '모션인식') {
        const motionComponent = getMotionComponent(fairyTaleId.value);
        if (motionComponent) {
            currentComponent.value = motionComponent;
            isMotionComplete.value = false;
            return true;
        }
    }
    currentComponent.value = 'FairyPlayer';
    return false;
};

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
        }

        if (data.url && Array.isArray(data.url)) {
            storyImages.value = data.url;
        } else if (data.image) {
            storyImages.value = [data.image];
        } else {
            storyImages.value = ['기본 이미지 URL'];
            console.error('이미지 데이터가 없습니다.');
        }

        // 히스토리에서 진행률을 가져와 시작 페이지 설정
        await setStartPageFromHistory();

        console.log('처리된 데이터:', {
            storyTitle: storyTitle.value,
            storyLines: storyLines.value,
            sceneNumbers: sceneNumbers.value,
            storyImages: storyImages.value,
            currentLineIndex: currentLineIndex.value,
        });
    } catch (error) {
        console.error('동화 데이터를 가져오는 중 오류 발생:', error);
    }
};

const setStartPageFromHistory = async () => {
    if (profileId.value) {
        try {
            const response = await axios.get(`http://localhost:7772/api/history/${profileId.value}/${fairyTaleId.value}/progress`);
            if (response.data !== null) {
                const progress = response.data;
                const totalPages = storyLines.value.length;
                const startPage = Math.floor((progress / 100) * totalPages);
                currentLineIndex.value = Math.min(startPage, totalPages - 1);
                
                // 시작 페이지에 해당하는 이미지 인덱스 찾기
                const startImageIndex = sceneNumbers.value.findIndex((sceneNumber, index) => {
                    return sceneNumber > currentLineIndex.value || index === sceneNumbers.value.length - 1;
                });
                
                currentImageIndex.value = startImageIndex;
                
                console.log('시작 페이지:', currentLineIndex.value);
                console.log('시작 이미지 인덱스:', currentImageIndex.value);
                console.log('시작 이미지 URL:', currentStoryImage.value);
            } else {
                console.log('진행률 데이터가 없습니다. 처음부터 시작합니다.');
                currentLineIndex.value = 0;
                currentImageIndex.value = 0;
            }
        } catch (error) {
            console.error('진행률 데이터를 가져오는 중 오류 발생:', error.response ? error.response.data : error.message);
            currentLineIndex.value = 0;
            currentImageIndex.value = 0;
        }
    } else {
        console.log('프로필 ID가 없습니다. 처음부터 시작합니다.');
        currentLineIndex.value = 0;
        currentImageIndex.value = 0;
    }
};

const updateCurrentImage = (index) => {
    if (storyImages.value.length === 0) return;

    const nextSceneIndex = sceneNumbers.value.findIndex((sceneNumber) => sceneNumber > index);
    if (nextSceneIndex === -1) {
        currentImageIndex.value = storyImages.value.length - 1;
    } else {
        currentImageIndex.value = Math.max(0, nextSceneIndex);
    }
    console.log('Updated image index:', currentImageIndex.value);
    console.log('Updated image URL:', currentStoryImage.value);
};

// currentLineIndex가 변경될 때마다 updateCurrentImage 호출
watch(currentLineIndex, (newIndex) => {
    updateCurrentImage(newIndex);
});

const playPause = async () => {
    if (isFirstPlay.value && profileId.value) {
        try {
            await axios.post(`http://localhost:7772/api/graph/totalCount/${profileId.value}`);
            isFirstPlay.value = false;
        } catch (error) {
            console.error('총 재생 횟수 업데이트 중 오류 발생:', error);
        }
    }

    isPlaying.value = !isPlaying.value;
    if (isPlaying.value) {
        await playCurrentLine();
    } else {
        currentAudio.value?.pause();
    }
};

const closeWindow = async () => {
    await saveProgress();
    window.close();
};

const saveProgress = async () => {
    if (profileId.value) {
        const progress = (currentLineIndex.value / storyLines.value.length) * 100;
        const historyData = {
            profileId: profileId.value,
            fairyTaleId: fairyTaleId.value,
            readDate: new Date().toISOString().split('T')[0],
            progress: progress
        };

        try {
            const response = await axios.post(`http://localhost:7772/api/history/`, historyData);
            if (response.status === 201) {
                console.log('진행률 저장 성공:', progress);
            } else {
                console.error('진행률 저장 실패:', response.status);
            }
        } catch (error) {
            console.error('진행률 저장 중 오류 발생:', error);
        }
    }
};

// 이미지 변경을 감지하는 watch 추가
watch(currentImageIndex, (newIndex) => {
    console.log('Image index changed to:', newIndex);
    console.log('New image URL:', currentStoryImage.value);
});

const currentAudio = ref(null);

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
        const response = await axios.post(
            `${BASE_URL}/fairyTales/tts`,
            {
                sentence: currentContent,
                language: 'ko',
            },
            {
                responseType: 'arraybuffer',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );

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
        const isSpecialContent = checkSpecialContent(nextContent);
        updateCurrentImage(currentLineIndex.value);
        if (!isSpecialContent) {
            if (isPlaying.value) {
                playCurrentLine();
            }
        } else {
            isPlaying.value = false;
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
            playerRef.value.mozRequestFullScreen();
        } else if (playerRef.value.webkitRequestFullscreen) {
            playerRef.value.webkitRequestFullscreen();
        } else if (playerRef.value.msRequestFullscreen) {
            playerRef.value.msRequestFullscreen();
        }
        isFullscreen.value = true;
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        isFullscreen.value = false;
    }
};

const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement;
};

const handleKeyDown = (event) => {
    if (event.key === 'Escape' && isFullscreen.value) {
        toggleFullscreen();
    }
};

onMounted(async () => {
    await profileStore.checkLoginStatus();
    console.log('선택된 프로필:', selectedProfile.value);
    console.log('프로필 ID:', profileId.value);
    console.log('전체 프로필 스토어 상태:', profileStore.$state);
    
    await FairyTaleData();
    await setStartPageFromHistory();
    updateCurrentImage(currentLineIndex.value);  // 여기서 직접 호출

    // 새로 추가된 코드
    if (profileId.value && fairyTaleId.value) {
        try {
            const progressResponse = await axios.get(`http://localhost:7772/api/history/${profileId.value}/${fairyTaleId.value}/progress`);
            const progress = progressResponse.data;
            
            if (progress === 100 || progress === 0) {
                const updatePreferenceDTO = {
                    profileId: profileId.value,
                    fairyTaleId: fairyTaleId.value
                };
                
                try {
                    const preferenceResponse = await axios.patch('http://localhost:7772/api/fairytales/preferences', updatePreferenceDTO);
                    console.log('선호도 업데이트 응답:', preferenceResponse);
                    console.log('선호도 업데이트 성공');
                } catch (error) {
                    console.error('선호도 업데이트 중 오류 발생:', error.response ? error.response.data : error.message);
                }
            }
        } catch (error) {
            console.error('선호도 업데이트 중 오류 발생:', error.response ? error.response.data : error.message);
        }
    }

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    const macCloseButton = playerRef.value.querySelector('.mac-close-button');
    if (macCloseButton) {
        macCloseButton.style.backgroundImage = `url(${IMAGE_SERVER_URL}/macCloseButton)`;
    }

    window.addEventListener('beforeunload', saveProgress);

    console.log('Initial image index:', currentImageIndex.value);
    console.log('Initial image URL:', currentStoryImage.value);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    currentAudio.value?.pause();

    // 윈도우 종료 이벤트 리스너 제거
    window.removeEventListener('beforeunload', saveProgress);
});

watch(selectedProfile, (newProfile) => {
    console.log('선택된 프로필 변경:', newProfile);
    console.log('새 프로필 ID:', profileId.value);
}, { immediate: true });
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
    left: 30%;
    align-items: center;
    font-size: 18px;
    max-width: 70%;
    overflow: hidden;
    margin: 0 auto 0 35px;
}

.story-text {
    white-space: nowrap;
    font-size: 30px;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #fff;
    margin-left: 25px;
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
    border: 1px solid #d8d8d8;
    /* 테두리 추가 */
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
    border: 1px solid #d8d8d8;
    /* 테두리 추가 */
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

.fairy-player:not(.fullscreen) .mac-close-button {
    position: absolute;
    top: 5px;
    left: 10px;
    width: 20px;
    height: 20px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}
</style>