<template>
    <div class="fairy-tale-detail" @click="closeDetail">
        <div class="detail-content" @click.stop>
            <div class="detail-body">
                <div class="image-container">
                    <img :src="fairyTale.thumbnail" :alt="fairyTale.title" class="detail-image" />
                    <div class="image-overlay"></div>
                    <h2 class="detail-title">{{ fairyTale.title }}</h2>
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
                        <button class="play-button" @click="playFairyTale">
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
                    <div class="recommendations">
                        <h3 class="recommendations-title">다른 동화 추천</h3>
                        <div class="recommendations-list">
                            <div v-for="tale in recommendedTales" :key="tale.id" class="recommendation-item">
                                <img :src="tale.thumbnail" :alt="tale.title" class="recommendation-image" />
                                <p class="recommendation-title">{{ tale.title }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref, defineEmits } from 'vue';

const props = defineProps({
    fairyTale: {
        type: Object,
        required: true,
        validator: (value) => {
            return value && typeof value.title !== 'undefined';
        },
    },
});

const recommendedTales = ref([
    { id: 1, title: '백설공주', thumbnail: 'https://img.ridicdn.net/cover/5273004187/xxlarge?dpi=xxhdpi#1' },
    { id: 2, title: '빨간 모자', thumbnail: 'https://img.ridicdn.net/cover/1745007459/xxlarge?dpi=xxhdpi#1' },
    { id: 3, title: '피노키오', thumbnail: 'https://img.ridicdn.net/cover/5273004218/xxlarge?dpi=xxhdpi#1' },
]);

const playFairyTale = () => {
    // 임시 ID 생성 (실제로는 서버에서 제공하는 고유 ID를 사용해야 합니다)
    const tempId = Math.floor(Math.random() * 1000);

    // 새 탭에서 FairyPlayer 열기
    const url = `/fairyPlayer/${tempId}?title=${encodeURIComponent(props.fairyTale.title)}`;
    window.open(url, '_blank');
};

const emit = defineEmits(['close']);

const closeDetail = () => {
    emit('close');
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
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1002;
    background-color: rgba(42, 42, 42, 0.8);
    color: white;
    width: 650px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.4); /* 그림자 효과 추가 */
}

.detail-title {
    position: absolute;
    bottom: 20px;
    left: 20px;
    font-size: 36px;
    font-weight: bold;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    margin: 0;
    z-index: 1;
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
    height: 800px;
    flex-direction: column;
    border-radius: 10px;
    border: 1.5px solid rgb(68, 68, 68);
}

.detail-image {
    width: 100%;
    height: 450px;
    object-fit: cover;
    border-radius: 9px 9px 0 0;
    background-color: #191919;
}

.detail-info {
    display: flex;
    flex-direction: column;
    height: 100%;
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
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
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
    transform: scale(0.97);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
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
    height: 100%;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 150px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.88), rgba(0, 0, 0, 0));
}

.recommendations-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
    color: white;
}

.recommendations-list {
    display: flex;
    justify-content: space-around;
    gap: 15px;
    overflow-x: auto;
}

.recommendation-item {
    flex: 0 0 auto;
    width: 120px;
}

.recommendation-image {
    width: 100%;
    height: 160px;
    object-fit: cover;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recommendation-image:hover {
    transform: scale(0.97); /* 호버 시 3% 축소 */
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.35); /* 그림자 약간 약화 */
}

.recommendation-image:active {
    transform: scale(0.95); /* 클릭 시 5% 축소 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* 그림자 더 약화 */
}

.recommendation-title {
    font-size: 14px;
    margin-top: 5px;
    text-align: center;
    color: white;
}
</style>
