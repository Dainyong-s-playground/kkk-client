<template>
    <div class="game-container">
        <div class="game-content">
            <!-- 성공 시 게이지 바가 사라지도록 v-if로 처리 -->
            <gauge-bar v-if="!isSuccess && !showGuide" :value="gauge" :max="maxGauge" />

            <!-- 사과 이미지 (이미지 단계에 따라 표시) -->
            <div class="apple-container">
                <img
                    v-if="!isSuccess && !showGuide"
                    class="apple"
                    :src="appleImages[imageStage]"
                    @click="handleClick"
                    @mousedown.prevent
                    @dragstart.prevent
                    alt="Apple"
                />
            </div>

            <!-- 게임 가이드 모달 -->
            <div v-if="showGuide" class="guide-modal" @click="closeGuide">
                <div class="guide-content">
                    <h2>🍎 사과 게임 안내 🍎</h2>
                    <div class="guide-ment">
                        <p>사과를 클릭하여 게이지를 채우세요!</p>
                        <p>게이지를 모두 채워서 사과를 완전히 먹으세요!</p>
                    </div>
                    <button class="close-button" @click.stop="closeGuide">시작하기</button>
                </div>
            </div>

            <!-- 성공 시 모달 표시 -->
            <div v-if="isSuccess" class="modal-overlay">
                <img
                    class="success-image"
                    src="https://dainyong-s-playground.github.io/imageServer/fairytale/SnowWhite/apple5.png"
                    @mousedown.prevent
                    @dragstart.prevent
                    alt="Eaten Apple"
                />
            </div>
        </div>
    </div>
</template>

<script>
import GaugeBar from './GaugeBar.vue';

export default {
    components: { GaugeBar },
    data() {
        return {
            gauge: 0, // 게이지 값
            maxGauge: 100, // 최대 게이지 값
            isSuccess: false, // 성공 여부
            showGuide: true, // 게임 가이드 모달 표시 여부
            imageStage: 0, // 이미지 단계 (0: 시작, 1: 25%, 2: 50%, 3: 75%, 4: 100%)
            appleImages: [
                'https://dainyong-s-playground.github.io/imageServer/fairytale/SnowWhite/apple1.png', // 초기 이미지
                'https://dainyong-s-playground.github.io/imageServer/fairytale/SnowWhite/apple2.png', // 25% 이미지
                'https://dainyong-s-playground.github.io/imageServer/fairytale/SnowWhite/apple3.png', // 50% 이미지
                'https://dainyong-s-playground.github.io/imageServer/fairytale/SnowWhite/apple4.png', // 75% 이미지
                'https://dainyong-s-playground.github.io/imageServer/fairytale/SnowWhite/apple5.png', // 100% 이미지 (완료)
            ],
        };
    },
    methods: {
        handleClick() {
            if (this.isSuccess || this.showGuide || this.gauge >= this.maxGauge) return;
            this.gauge += 10; // 클릭 시 게이지 증가
            this.updateImageStage(); // 게이지 값에 따라 이미지 단계 업데이트
            if (this.gauge >= this.maxGauge) {
                this.gauge = this.maxGauge;
                this.startSuccessAnimation(); // 성공 애니메이션 시작
            }
        },
        updateImageStage() {
            // 게이지 값에 따라 이미지 단계 업데이트
            if (this.gauge >= 75) {
                this.imageStage = 3; // 75%에 해당하는 이미지
            } else if (this.gauge >= 50) {
                this.imageStage = 2; // 50%에 해당하는 이미지
            } else if (this.gauge >= 25) {
                this.imageStage = 1; // 25%에 해당하는 이미지
            } else {
                this.imageStage = 0; // 초기 상태
            }
        },
        startSuccessAnimation() {
            // 0.5초 후 모달창이 표시되도록 설정
            setTimeout(() => {
                this.imageStage = 4; // 최종 이미지 (100%)
                this.isSuccess = true;
            }, 500);
        },
        decreaseGauge() {
            if (!this.isSuccess && this.gauge > 0) {
                this.gauge -= 1; // 게이지 감소
                if (this.gauge < 0) this.gauge = 0;
                this.updateImageStage(); // 게이지가 줄어들 때도 이미지 업데이트
            }
        },
        closeGuide() {
            this.showGuide = false; // 가이드 모달 닫기
        },
    },
    mounted() {
        // 0.1초마다 게이지가 감소되는 로직
        this.interval = setInterval(this.decreaseGauge, 100);
    },
    beforeUnmount() {
        // 인터벌 해제
        clearInterval(this.interval);
    },
};
</script>

<style scoped>
/* 게임 전체 레이아웃 */
.game-container {
    position: relative;
    width: 100%;
    height: -webkit-fill-available;
    max-height: 86vh;
    overflow: hidden;
}

.game-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.apple-container {
    display: flex;
    justify-content: space-around;
}

/* 사과 이미지 스타일 */
.apple {
    width: 50%;
    cursor: pointer;
    border-radius: 20px;
    margin-top: 50px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.apple:hover {
    scale: 1.1;
}

/* 모달 창 스타일 */
.modal-overlay {
    position: relative;
    left: 0;
    width: -webkit-fill-available;
    height: min-content;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

/* 가이드 모달 스타일 */
.guide-modal {
    position: relative;
    /* left: 0; */
    width: -webkit-fill-available;
    height: min-content;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 50px;
    animation: fade-in 0.5s ease-in-out;
}

.guide-content {
    width: 500px;
    height: -webkit-fill-available;
    background: #fff;
    border-radius: 15px;
    text-align: center;
    padding: 40px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    animation: content-expand 0.5s ease-in-out;
}

@keyframes content-expand {
    0% {
        transform: scale(0);
        opacity: 0;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.close-button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.close-button:hover {
    background-color: #388e3c;
}

/* 성공 시 이미지 확장 애니메이션 */
.success-image {
    width: 45%;
    cursor: pointer;
    animation: image-expand 1s ease-in-out;
    border-radius: 20px;
}
.guide-ment {
    margin: 20px;
    padding-top: 10px;
}

@keyframes image-expand {
    0% {
        transform: scale(0);
        opacity: 0;
    }
    50% {
        transform: scale(1.5);
        opacity: 0.8;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

/* 페이드 전환 애니메이션 */
@keyframes fade-in {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
</style>
