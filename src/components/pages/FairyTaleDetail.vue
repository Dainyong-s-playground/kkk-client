<template>
    <div class="fairy-tale-detail">
        <div class="detail-content">
            <div class="detail-body">
                <div class="image-container">
                    <img :src="fairyTale.thumbnail" :alt="fairyTale.title" class="detail-image" />
                    <h2 class="detail-title">{{ fairyTale.title }}</h2>
                    <!-- 새로운 닫기 버튼 추가 -->
                    <button @click="$emit('close')" class="close-button">
                        <img
                            src="https://dainyong-s-playground.github.io/imageServer/detailPage/closeButton.png"
                            alt="닫기"
                            class="close-icon"
                        />
                    </button>
                </div>
                <div class="detail-info">
                    <div class="button-group">
                        <button class="play-button">
                            <img
                                src="https://dainyong-s-playground.github.io/imageServer/fairyPlayer/playIcon.png"
                                alt="재생"
                                class="play-icon"
                            />
                            재생
                        </button>
                        <button class="download-button">
                            <img
                                src="https://dainyong-s-playground.github.io/imageServer/detailPage/underArrow.png"
                                alt="저장"
                                class="download-icon"
                            />
                            저장
                        </button>
                    </div>
                    <p class="description">{{ fairyTale.description }}</p>
                    <p v-if="fairyTale.episode" class="episode">{{ fairyTale.episode }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['fairyTale'],
};
</script>

<style scoped>
.fairy-tale-detail {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1001;
}

.detail-content {
    position: relative;
    z-index: 1002;
    background-color: rgba(42, 42, 42, 0.9);
    color: white;
    width: 650px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5); /* 그림자 효과 추가 */
}

.detail-title {
    position: absolute;
    bottom: 20px;
    left: 20px;
    font-size: 36px;
    font-weight: bold;
    color: white;
    text-shadow: 4px 4px 4px rgba(0, 0, 0, 0.8);
    margin: 0;
}

.close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    width: 36px;
    height: 36px;
    top: 11px;
    right: 11px;
    border: none;
    cursor: pointer;
    padding: 0;
    background-color: rgb(37, 41, 46);
    border-radius: 50%;
}

.close-icon {
    width: 16px;
    height: 16px;
    filter: brightness(0) invert(1);
}

.detail-body {
    display: flex;
    flex-direction: column;
    border-radius: 10px;
}

.detail-image {
    width: 100%;
    height: 500px;
    object-fit: cover;
    border-radius: 5px 5px 0 0;
    background-color: #191919;
}

.detail-info {
    padding: 20px;
}

.description {
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 20px;
    color: white;
}

.episode {
    font-size: 14px;
    color: #aaa;
    margin-bottom: 20px;
}

.button-group {
    display: flex;
    justify-content: center;
    gap: 15px;
}

.play-button,
.download-button {
    width: 48%;
    padding: 10px 20px;
    font-size: 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    transition: all 0.2s ease;
}

.play-button {
    background-color: white;
    color: black;
}

.download-button {
    background-color: rgb(66, 66, 66);
    color: white;
}

.play-button:hover,
.download-button:hover {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.play-button:active,
.download-button:active {
    transform: scale(0.95);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.play-icon,
.download-icon {
    width: 24px;
    height: 24px;
    margin-right: 8px;
    vertical-align: middle; /* 아이콘을 수직 중앙에 맞춥니다 */
}

.download-icon {
    filter: brightness(0) invert(1);
}

.image-container {
    display: flex;
    justify-content: center;
    position: relative;
}
</style>
