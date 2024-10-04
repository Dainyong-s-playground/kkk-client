<template>
    <div class="fairy-player">
        <div class="player-container">
            <img :src="currentStoryImage" alt="Story Image" class="story-image" />
        </div>

        <div class="story-info">
            <div class="story-title">
                <img :src="guideCharacterImage" alt="Guide Character" class="guide-character" />
                <span class="green-icon">🟢</span>
                {{ storyTitle }}
                <span class="play-icon">▶</span>
            </div>
            <div class="controls">
                <button @click="playPause" class="control-button">
                    {{ isPlaying ? '⏸️' : '▶️' }}
                </button>
                <button @click="nextScene" class="control-button">⏭️</button>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'FairyPlayer',
    data() {
        return {
            isPlaying: false,
            storyTitle: '다이농 가이드',
            currentStoryImage: 'https://dainyong-s-playground.github.io/imageServer/Tumb1.png',
            guideCharacterImage:
                'https://dainyong-s-playground.github.io/imageServer/profile/profileFull01-removebg.png',
            // 여기에 더 많은 장면이나 오디오 파일 등을 추가할 수 있습니다.
        };
    },
    methods: {
        playPause() {
            this.isPlaying = !this.isPlaying;
            // 여기에 실제 오디오 재생/일시정지 로직을 추가하세요
        },
        nextScene() {
            // 다음 장면으로 넘어가는 로직을 구현하세요
        },
    },
};
</script>
<style scoped>
.fairy-player {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1440px;
    aspect-ratio: 16 / 9;
    margin: 0 auto;
    background-color: rgb(135, 156, 94);
    border-radius: 15px;
    overflow: hidden;
    position: relative;
    box-shadow: 8px 8px 12px 5px rgba(0, 0, 0, 0.25);
}

.player-container {
    display: flex;
    position: relative;
    justify-content: center;
    padding: 0;
    height: 90%;
}

.story-image {
    min-width: 900px;
    max-width: 1200px;
    height: auto;
    object-fit: cover;
}

.story-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 10%;
    padding: 0 15px;
    background-color: #f0f0f0;
    font-size: 2vw;
}

.guide-character {
    max-height: 81px;
    padding: 0 10px;
    object-fit: cover;
}

.story-title {
    display: flex;
    align-items: center;
    font-size: 40px;
    flex-grow: 1;
    justify-content: center;
    position: relative; /* Add this line */
}

.green-icon {
    margin: 0 5px;
}

.play-icon {
    margin-left: 10px;
}

.controls {
    position: absolute;
    right: 15px;
    display: flex;
    align-items: center;
}

.control-button {
    background: none;
    border: none;
    font-size: 35px;
    cursor: pointer;
    margin-left: 10px;
    padding: 5px 10px;
    border-radius: 5px;
    transition: background-color 0.3s;
}

.control-button:hover {
    background-color: rgba(0, 0, 0, 0.1);
}
</style>
