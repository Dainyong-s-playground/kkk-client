<template>
    <div class="game-container">
        <div class="game-content">
            <!-- 성공 시 게이지 바가 사라지도록 v-if로 처리 -->
            <gauge-bar v-if="!isSuccess && !showGuide" :value="gauge" :max="maxGauge" />

            <!-- 사과 이미지 -->
            <div class="apple-container">
                <img
                    v-if="!isSuccess && !showGuide"
                    class="apple"
                    src="https://dainyong-s-playground.github.io/imageServer/src/BeforeApple.png"
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
                    <p>사과를 클릭하여 게이지를 채우세요!</p>
                    <p>게이지가 100%가 되면 게임이 성공합니다.</p>
                    <p>계속 클릭하여 사과를 베어 먹으세요!</p>
                    <button class="close-button" @click.stop="closeGuide">시작하기</button>
                </div>
            </div>

            <!-- 성공 시 모달 표시 -->
            <div v-if="isSuccess" class="modal-overlay">
                <img
                    class="success-image"
                    src="https://dainyong-s-playground.github.io/imageServer/src/AfterApple.png"
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
        };
    },
    methods: {
        handleClick() {
            if (this.isSuccess || this.showGuide || this.gauge >= this.maxGauge) return;
            this.gauge += 10; // 클릭 시 게이지 증가
            if (this.gauge >= this.maxGauge) {
                this.gauge = this.maxGauge;
                this.startSuccessAnimation(); // 성공 애니메이션 시작
            }
        },
        startSuccessAnimation() {
            // 0.5초 후 모달창이 표시되도록 설정
            setTimeout(() => {
                this.isSuccess = true;
            }, 500);
        },
        decreaseGauge() {
            if (!this.isSuccess && this.gauge > 0) {
                this.gauge -= 1; // 게이지 감소
                if (this.gauge < 0) this.gauge = 0;
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
    height: 400px;
}

.game-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
}

.apple-container {
    position: relative;
}

/* 사과 이미지 스타일 */
.apple {
    width: 300px;
    cursor: pointer;
}

/* 모달 창 스타일 */
.modal-overlay {
    position: fixed;
    left: 0;
    width: 100%;
    height: 400px;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

/* 가이드 모달 스타일 */
.guide-modal {
    position: fixed;
    left: 0;
    width: 100%;
    height: 400px;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fade-in 0.5s ease-in-out;
}

.guide-content {
    width: 500px;
    height: 300px;
    background: #fff;
    border-radius: 15px;
    text-align: center;
    padding: 20px;
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
    width: 300px;
    cursor: pointer;
    animation: image-expand 1s ease-in-out;
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
