<template>
    <div class="game-container">
        <div class="content-container">
            <div class="webcam-container" v-show="!isSuccess">
                <video ref="video" class="video-element" autoplay playsinline></video>
                <canvas ref="canvas" class="webcam-canvas"></canvas>
            </div>
            <transition name="fade" mode="out-in">
                <img v-if="!isSuccess"
                    src="https://Dainyong-s-playground.github.io/imageServer/src/cover_motion_sun.png"
                    class="before-hand-image" />
                <img v-else src="https://Dainyong-s-playground.github.io/imageServer/src/after_motion_sun_remove.png"
                    class="after-hand-image" />
            </transition>
        </div>
    </div>
</template>

<script setup>
import { DrawingUtils, FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { onMounted, onUnmounted, ref } from 'vue';

const video = ref(null);
const canvas = ref(null);
let handLandmarker = null;
let canvasCtx = null;

var y = 0;
var imageHeight = 0;
const image = ref(null);
let stopLandmarkPrediction = false;
const isSuccess = ref(false);

const getImagePosition = () => {
    if (image.value) {
        const rect = image.value.getBoundingClientRect();
        y = rect.top;
        imageHeight = rect.height;
    }
};

// 컴포넌트가 마운트되면 handLandmarker 모델을 불러옴
onMounted(async () => {
    if (image.value) {
        // 이미지가 로드된 경우
        if (image.value.complete) {
            getImagePosition();
        } else {
            // 이미지가 아직 로드되지 않은 경우, load 이벤트를 기다림
            image.value.addEventListener('load', getImagePosition);
        }
    }

    const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
    );

    // 손 감지를 위한 handLandmarker 인스턴스 생성
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1, // 감지할 손의 개수 설정
    });

    // 캔버스의 2D 컨텍스트를 가져옴
    canvasCtx = canvas.value.getContext('2d');

    // 웹캠 활성화
    await enableWebcam();
});

// 웹캠을 활성화하는 함수
const enableWebcam = async () => {
    if (!handLandmarker) {
        console.log('handLandmarker가 아직 로드되지 않았습니다.');
        return;
    }

    // getUserMedia를 이용하여 웹캠 스트림 요청
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.value.srcObject = stream;

    // 웹캠 데이터가 로드된 후 예측 시작
    video.value.addEventListener('loadeddata', predictWebcam);
};

// 웹캠 예측 함수
const predictWebcam = async () => {
    if (stopLandmarkPrediction) {
        console.log("중단");
        return;
    }

    // 비동기 방식으로 손 랜드마크 예측
    const result = await handLandmarker.detectForVideo(video.value, performance.now());

    // 캔버스 초기화
    canvasCtx.clearRect(0, 0, canvas.value.width, canvas.value.height);

    // 예측 결과가 존재할 때, 판단 로직 적용
    if (result.landmarks && result.landmarks.length > 0) {
        result.landmarks.forEach((landmarks) => {
            const drawingUtils = new DrawingUtils(canvasCtx);
            drawingUtils.drawLandmarks(landmarks, {
                radius: (data) => (data.from ? DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1) : 1),
            });
            drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS);
        });
        checkHandInImage(result.landmarks[0]);
    }

    // 예측을 계속 실행하기 위해 requestAnimationFrame으로 다음 프레임 호출
    if (!isSuccess.value) {
        requestAnimationFrame(predictWebcam);
    }
};

// 손이 이미지 안에 있는지 확인
const checkHandInImage = (landmarks) => {
    if (!landmarks || landmarks.length === 0) {
        console.warn("랜드마크가 존재하지 않습니다.");
        return; // 랜드마크가 없으면 함수 종료
    }

    const wrist = landmarks[0];
    const fingertips = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]];

    // 랜드마크가 유효한지 검사
    if (!wrist || typeof wrist.y === 'undefined' || fingertips.some(fingertip => !fingertip || typeof fingertip.y === 'undefined')) {
        console.warn("유효하지 않은 랜드마크 값이 있습니다.");
        return;
    }

    // 정규화된 좌표를 이미지 크기로 변환
    const wristY = wrist.y * imageHeight;
    const fingertipsY = fingertips.map(fingertip => fingertip.y * imageHeight);

    // 이미지의 상단, 하단 좌표 계산
    const imageTop = y;
    const imageBottom = y + imageHeight;

    // 1. 손목이 이미지 하단 10% ~ 30%에 속하는지 확인
    const isWristInBottom = (wristY <= imageBottom * 0.9) && (wristY >= imageBottom * 0.7);

    // 2. 손가락 끝이 이미지 상단 10% ~ 30%에 속하는지 확인
    const areFingertipsInTop = fingertipsY.every(fingertipY => (fingertipY >= (imageTop + imageHeight) * 0.1) && (fingertipY <= (imageTop + imageHeight) * 0.3));

    if (isWristInBottom && areFingertipsInTop) {
        console.log("성공");
        // 2초 후 성공 이미지 표시
        setTimeout(() => {
            isSuccess.value = true;

            // 카메라 스트림 종료
            if (video.value && video.value.srcObject) {
                const stream = video.value.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
            // requestAnimationFrame 중단을 위해 종료 플래그 설정
            stopLandmarkPrediction = true;
        }, 2000);  // 2초 지연
    } else {
        console.log("아직 성공하지 않았습니다.");
    }
};

// 컴포넌트가 언마운트될 때 웹캠 종료
onUnmounted(() => {
    if (video.value && video.value.srcObject) {
        const stream = video.value.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
    }
});
</script>

<style scoped>
.game-container {
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: url('https://Dainyong-s-playground.github.io/imageServer/src/bg_motion_sun.png');
    background-size: 100% 100%;
    width: 100%;
    height: 600px;
}

.background-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 600px;
    z-index: 1;
}

.svg-rect {
    /* 이 부분 나중에 이미지로 대체 */
    width: inherit;
    height: 100%;
    fill: blue;
}

.content-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.webcam-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.before-hand-image,
.after-hand-image,
.video-element,
.webcam-canvas {
    width: 35%;
    height: 100%;
    object-fit: cover;
}

.before-hand-image {
    position: absolute;
    width: auto;
    height: 70%;
    z-index: 3;
    opacity: 0.4;
    transition: opacity 1s ease-in-out;
}

.after-hand-image {
    width: 33%;
    z-index: 3;
    opacity: 1;

    margin-left: 22px;
    transition: opacity 1s ease-in-out;
}

.video-element {
    position: absolute;
    z-index: 2;
    transform: scaleX(-1);
    height: 90%
}

.webcam-canvas {
    z-index: 3;
    transform: scaleX(-1);
}

/* 트랜지션을 적용한 애니메이션 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s ease-in-out;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
