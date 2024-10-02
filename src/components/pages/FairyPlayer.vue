<template>
    <div class="fairy-player">
        <div class="player-container">
            <img :src="currentStoryImage" alt="Story Image" class="story-image" />
            <div class="controls">
                <button @click="playPause">
                    {{ isPlaying ? '일시정지' : '재생' }}
                </button>
                <button @click="nextScene">다음</button>
            </div>
        </div>

        <div class="story-info">
            <img :src="guideCharacterImage" alt="Guide Character" class="guide-character" />
            <div class="story-title">
                <span class="green-icon">🟢</span>
                {{ storyTitle }}
                <span class="play-icon">▶</span>
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
    aspect-ratio: 16 / 9; /* 16:9 비율 유지 */
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
    height: 90%; /* 컨테이너가 플레이어 전체 높이를 차지하도록 설정 */
}

.story-image {
    min-width: 900px;
    max-width: 1200px;
    height: auto;
    object-fit: cover; /* 이미지가 컨테이너 비율에 맞게 조정 */
}

.controls {
    position: absolute;
    bottom: 10px;
    right: 10px;
}

.controls button {
    margin-left: 10px;
}

.story-info {
    display: flex;
    justify-content: center;
    height: 10%; /* 전체 높이에 대한 비율로 설정 */
    align-items: center;
    padding: 0 15px;
    background-color: #f0f0f0;
    font-size: 2vw; /* 화면 크기에 맞게 글자 크기 비율 조정 */
}

.guide-character {
    height: 90%;
    padding: 0 10px;
    object-fit: cover;
}

.story-title {
    display: flex;
    align-items: center;
    font-size: 40px;
}

.green-icon {
    margin: 0 5px;
}

.play-icon {
    margin-left: 10px;
}

.decorations {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
}

.character {
    position: absolute;
    left: 10px;
    bottom: 10px;
    width: 50px;
    height: 50px;
    background-image: url('https://dainyong-s-playground.github.io/imageServer/profile/profileFull01.jpeg');
    background-size: contain;
}

.chicks {
    position: absolute;
    right: 10px;
    bottom: 10px;
    width: 100px;
    height: 30px;
    background-image: url('https://dainyong-s-playground.github.io/imageServer/Tumb1.png');
    background-size: contain;
    background-repeat: repeat-x;
}
</style>
