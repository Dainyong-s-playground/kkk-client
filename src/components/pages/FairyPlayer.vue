<template>
    <div class="fairy-player">
        <div class="player-container">
            <img :src="currentStoryImage" alt="Story Image" class="story-image" />
        </div>

        <div class="story-info">
            <div class="story-title">
                <img :src="guideCharacterImage" alt="Guide Character" class="guide-character" />
                <div class="story-text">{{ currentLine }}</div>
            </div>
            <div class="controls">
                <button @click="playPause" class="control-button">
                    {{ isPlaying ? '⏸️' : '▶️' }}
                </button>
                <button @click="nextLine" class="control-button">⏭️</button>
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
            currentStoryImage: 'https://dainyong-s-playground.github.io/imageServer/Tumb1.png',
            guideCharacterImage:
                'https://dainyong-s-playground.github.io/imageServer/profile/profileFull01-removebg.png',
            storyLines: [
                '옛날 옛날에 어미니와 사이좋은 오누이가 살았습니다.',
                '어머니는 시장에 떡을 팔러 나갔습니다.',
                '집에 돌아오던 중, 호랑이 한 마리를 만났습니다.',
                '어흥',
            ],
            currentLineIndex: 0,
            playInterval: null,
        };
    },
    computed: {
        currentLine() {
            return this.storyLines[this.currentLineIndex];
        },
    },
    methods: {
        playPause() {
            this.isPlaying = !this.isPlaying;
            if (this.isPlaying) {
                this.playInterval = setInterval(this.nextLine, 3000); // 3초마다 다음 줄로 넘어감
            } else {
                clearInterval(this.playInterval);
            }
        },
        nextLine() {
            if (this.currentLineIndex < this.storyLines.length - 1) {
                this.currentLineIndex++;
            } else {
                this.currentLineIndex = 0; // 마지막 줄이면 처음으로 돌아감
                this.isPlaying = false;
                clearInterval(this.playInterval);
            }
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
    object-fit: cover;
}

.story-title {
    display: flex;
    align-items: center;
    font-size: 40px;
    flex-grow: 1;
    justify-content: center;
    position: relative;
}

.story-text {
    text-align: center;
    max-width: 80%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.green-icon {
    margin: 0 5px;
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
