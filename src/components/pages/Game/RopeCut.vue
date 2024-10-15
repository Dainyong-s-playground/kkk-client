<template>
    <div class="game-container">
        <!-- 가이드 모달 -->
        <div v-if="showModal" class="modal" @click="closeModal">
            <div class="highlight-area">
                <img
                    :style="{ left: handPosition + 'px' }"
                    class="hand-image"
                    :src="`${IMAGE_SERVER_URL}/fairytale/TheSunAndTheMoon/handPointer.png`"
                    alt="Hand"
                />
            </div>
            <div class="modal-content">
                <p>화면을 클릭하고 드래그하여 동아줄을 자르세요!</p>
            </div>
        </div>

        <!-- 드래그 가능한 영역 -->
        <div class="drag-area" ref="dragArea"></div>

        <!-- 로프 이미지 -->
        <img :src="`${IMAGE_SERVER_URL}/fairytale/TheSunAndTheMoon/Rope.png`" alt="Rope" class="rope-image" />

        <!-- 드래그 가이드 (선 그리기) -->
        <canvas ref="ropeCanvas" @mousedown="startDragging" @mousemove="onDragging" @mouseup="endDragging"></canvas>

        <!-- 드래그 완료 후 pop 효과 -->
        <div v-if="showPop" :style="popStyle" class="pop-effect">CUT!</div>

        <!-- 성공 모달 -->
        <div v-if="showSuccessModal" class="success-modal">
            <div class="success-content">
                <div
                    v-for="confetti in confettis"
                    :key="confetti.id"
                    :style="{
                        left: confetti.left + 'px',
                        width: confetti.size + 'px',
                        height: confetti.size + 'px',
                        backgroundColor: confetti.color,
                        animationDelay: confetti.delay + 's',
                    }"
                    class="confetti"
                ></div>
                <h1>성공입니다!</h1>
            </div>
        </div>
    </div>
</template>

<script setup>
import { IMAGE_SERVER_URL } from '@/constants/api';
import { inject, onMounted, ref } from 'vue';

const handleMotionComplete = inject('handleMotionComplete');

const showModal = ref(true); // 가이드 모달 표시 여부
const isDragging = ref(false); // 드래그 여부
const dragStartX = ref(0); // 드래그 시작점 X
const dragStartY = ref(0); // 드래그 시작점 Y
const showPop = ref(false); // pop 효과 표시 여부
const showSuccessModal = ref(false); // 성공 모달 표시 여부
const popStyle = ref({}); // pop 위치
let canvasContext = null; // canvas의 context
let canvasElement = null; // canvas 요소
let canvasRect = null; // canvas의 bounding rect
const handPosition = ref(0);
let animationInterval = null;
const confettis = ref([]);

// 캔버스 초기화
onMounted(() => {
    createConfetti();
    startHandAnimation();
    canvasElement = document.querySelector('canvas');
    const ropeImage = document.querySelector('.rope-image');

    // canvas 크기를 이미지 크기와 맞추기
    canvasElement.width = ropeImage.clientWidth;
    canvasElement.height = ropeImage.clientHeight;

    canvasContext = canvasElement.getContext('2d');
    canvasContext.lineWidth = 5; // 선 두께 설정
    canvasContext.strokeStyle = 'red'; // 선 색상 설정
    canvasContext.lineCap = 'round'; // 선 끝을 둥글게 설정

    // canvas의 bounding rect 가져오기
    canvasRect = canvasElement.getBoundingClientRect();
});

// 가이드 모달을 닫는 함수
const closeModal = () => {
    showModal.value = false;
    clearInterval(animationInterval); // 애니메이션 중지
};

// 손 이미지 애니메이션 시작
const startHandAnimation = () => {
    const minPosition = -30; // 허용 범위의 왼쪽 끝
    const maxPosition = 180; // 허용 범위의 오른쪽 끝
    const speed = 2; // 속도 조절

    animationInterval = setInterval(() => {
        handPosition.value += speed;

        // 경계 검사
        if (handPosition.value > maxPosition || handPosition.value < minPosition) {
            handPosition.value = minPosition; // 위치를 초기화
        }
    }, 30); // 30ms마다 위치 변경
};
// 드래그 시작 처리
const startDragging = (event) => {
    if (!showModal.value) {
        const canvasCenterX = canvasElement.width / 2;
        const allowedWidthMin = canvasCenterX - 80;
        const allowedWidthMax = canvasCenterX + 160;
        const allowedHeightMax = canvasElement.height * 0.33;

        const startX = event.clientX - canvasRect.left;
        const startY = event.clientY - canvasRect.top;

        // 드래그 시작 위치가 허용 범위 내에 있는지 확인
        if (startX >= allowedWidthMin && startX <= allowedWidthMax && startY <= allowedHeightMax) {
            isDragging.value = true;
            dragStartX.value = startX;
            dragStartY.value = startY;

            // 드래그 시작점 설정
            canvasContext.beginPath();
            canvasContext.moveTo(dragStartX.value, dragStartY.value);
        }
    }
};

// 드래그 진행 처리 (마우스에 따라 선 그리기)
const onDragging = (event) => {
    if (isDragging.value) {
        const currentX = event.clientX - canvasRect.left;
        const currentY = event.clientY - canvasRect.top;

        // 선 그리기
        canvasContext.lineTo(currentX, currentY);
        canvasContext.stroke(); // 선을 그리는 동작 실행

        const dragDistance = Math.sqrt(
            Math.pow(currentX - dragStartX.value, 2) + Math.pow(currentY - dragStartY.value, 2),
        );

        // 드래그 허용 영역의 높이와 너비
        const allowedWidthMin = canvasElement.width / 2 - 80;
        const allowedWidthMax = canvasElement.width / 2 + 160;
        const allowedHeightMax = canvasElement.height * 0.33;

        const allowedWidth = allowedWidthMax - allowedWidthMin; // 드래그 허용 너비
        const dragThreshold = allowedWidth * 0.8; // 90% 드래그 거리

        // 현재 마우스 위치가 허용 범위 내에 있는지 확인
        if (currentX < allowedWidthMin || currentX > allowedWidthMax || currentY > allowedHeightMax) {
            // 범위를 벗어났다면 선 지우기
            clearCanvas();
            isDragging.value = false; // 드래그 종료
            canvasContext.closePath(); // 드래그 경로 종료
        } else {
            // 드래그 거리가 허용 범위의 90% 이상일 경우 pop 효과를 표시
            if (dragDistance >= dragThreshold) {
                showPopEffect(currentX, currentY);
                isDragging.value = false; // 드래그 종료
                canvasContext.closePath(); // 드래그 경로 종료

                // fade-out 후 성공 모달 표시
                setTimeout(() => {
                    canvasElement.style.transition = 'opacity 1s ease-out';
                    canvasElement.style.opacity = '0'; // fade-out 효과

                    setTimeout(() => {
                        showSuccessModal.value = true;
                        // 3초 후에 FairyPlayer로 돌아가기
                        setTimeout(() => {
                            handleMotionComplete();
                        }, 3000);
                    }, 1000); // fade-out 후 성공 모달 표시
                }, 500); // pop 효과 0.5초 후 fade-out 시작
            }
        }
    } else {
        clearCanvas();
    }
};
// 드래그 종료 처리
const endDragging = () => {
    isDragging.value = false;
    canvasContext.closePath(); // 드래그 종료 시 경로 닫기
};

//캔버스 클리어 함수
const clearCanvas = () => {
    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height); // 캔버스를 지움
};
// pop 효과 표시
const showPopEffect = (x, y) => {
    popStyle.value = {
        left: `${x}px`,
        top: `${y}px`,
    };
    showPop.value = true;

    // 1초 후 pop 효과 숨기기
    setTimeout(() => {
        showPop.value = false;
    }, 400);
};

const createConfetti = () => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#FFD700'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const size = Math.random() * 10 + 5;
        confettis.value.push({
            id: i,
            left: Math.random() * window.innerWidth,
            size: size,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 2,
        });
    }

    setTimeout(() => {
        confettis.value = [];
    }, 3000);
};
</script>

<style scoped>
.game-container {
    position: relative;
    height: -webkit-fill-available; 
    max-height: 86vh;
    overflow: hidden;
}

.rope-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: relative;
    z-index: 1;
}

.drag-area {
    position: absolute;
    top: 0;
    left: calc(50% + 40px);
    width: 240px; /* 드래그 허용 영역 너비 */
    height: 33%; /* 드래그 허용 영역 높이 */
    border: 5px solid rgb(255, 221, 0); /* 기본 테두리 색상 */
    border-radius: 10px; /* 모서리 둥글게 */
    transform: translateX(-50%); /* 가운데 정렬 */
    pointer-events: none; /* 마우스 이벤트 차단 */
    z-index: 2; /* 캔버스와 겹치지 않게 설정 */
    animation: pulse 1.5s infinite; /* 애니메이션 추가 */
}

canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 3;
    transition: opacity 1s ease-out; /* fade-out 효과를 위해 transition 추가 */
}

.modal {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 20px;
    flex-direction: column; /* 세로 정렬 */
}

.modal-content {
    margin-left: 350px;
}
.highlight-area {
    position: absolute;
    left: calc(50% - 80px); /* 허용 범위 왼쪽 시작 위치 */
    top: 1.1%; /* 모달 최상단에 위치 */
    width: 240px; /* 허용 범위 너비 */
    height: 33%; /* 허용 범위 높이 */
    background-color: rgba(255, 255, 255, 0.4); /* 밝은 배경 색상 */
    border-radius: 10px; /* 모서리 둥글게 */
    z-index: 1; /* 텍스트 뒤에 위치 */
}

.hand-image {
    position: absolute;
    bottom: 20%;
    width: 50px; /* 손 이미지의 크기 조절 */
    transition: left 0.1s; /* 부드러운 이동 효과 */
    z-index: 2; /* 손 이미지가 강조되어 보이도록 설정 */
    /* left: calc(50% -80px); */
}

.pop-effect {
    position: absolute;
    background-color: red;
    color: white;
    padding: 10px;
    border-radius: 50%;
    font-size: 18px;
    animation: pop-animation 0.3s ease-out forwards;
    z-index: 4;
}

.success-modal {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 5;
}

.success-content {
    text-align: center;
    color: white;
    animation: success-animation 1s ease-in-out forwards;
}

.confetti {
    position: absolute;
    width: 10px; /* 작은 크기 */
    height: 10px;
    top: 0;
    background-color: yellow;
    border-radius: 20%;
    opacity: 0.8; /* 약간 투명 */
    animation: confetti-animation 4s ease-in-out infinite;
    z-index: 5;
}

@keyframes pop-animation {
    0% {
        transform: scale(1); /* 초기 크기 */
        opacity: 0;
    }
    /* 80% {
        transform: scale(1.5); 
    } */
    /* 100% {
        transform: scale(1); /* 다시 원래 크기로 돌아옴 */
    /* //opacity: 0; 
    } */
}

@keyframes success-animation {
    0% {
        opacity: 0;
        transform: scale(0.5);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes confetti-animation {
    0% {
        transform: translateY(0) rotate(0); /* 시작 위치 */
        opacity: 1;
    }
    50% {
        transform: translateY(200px) rotate(360deg); /* 중간에 회전 효과 */
        opacity: 0.7; /* 중간에 약간 투명 */
    }
    100% {
        transform: translateY(400px) rotate(720deg); /* 끝 위치 */
        opacity: 0; /* 서서히 사라짐 */
    }
}

@keyframes pulse {
    0% {
        border-color: rgb(255, 221, 0); /* 시작 색상 */
        box-shadow: 0 0 0 rgba(255, 221, 0, 0.6); /* 그림자 효과 없음 */
    }
    50% {
        border-color: rgb(255, 100, 0); /* 중간 색상으로 변화 */
        box-shadow: 0 0 20px rgba(255, 100, 0, 0.8); /* 그림자 효과 추가 */
    }
    100% {
        border-color: rgb(255, 221, 0); /* 다시 기본 색상으로 */
        box-shadow: 0 0 0 rgba(255, 221, 0, 0.6); /* 그림자 효과 없음 */
    }
}
</style>