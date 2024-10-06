<template>
    <div class="game-container">
        <h3>HandLandmarker Test</h3>
        <img src="https://Dainyong-s-playground.github.io/imageServer/src/bg_motion_sun.png" class="background-image" />
        <img src="https://Dainyong-s-playground.github.io/imageServer/src/cover_motion_sun.png" class="hand-image" />
        <div class="webcam-container">
            <video ref="video" class="video-element" autoplay playsinline></video>
            <canvas ref="canvas" class="webcam-canvas"></canvas>
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

// 컴포넌트가 마운트되면 handLandmarker 모델을 불러옴
onMounted(async () => {
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
        numHands: 1, // 감지할 손의 개수를 명확하게 설정
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
    // 비동기 방식으로 손 랜드마크 예측
    const result = await handLandmarker.detectForVideo(video.value, performance.now());

    // 캔버스 초기화
    canvasCtx.clearRect(0, 0, canvas.value.width, canvas.value.height);

    // 예측 결과가 존재할 때, 각 손의 랜드마크와 연결선을 그림
    if (result.landmarks) {

        result.landmarks.forEach((landmarks) => {
            const drawingUtils = new DrawingUtils(canvasCtx);
            drawingUtils.drawLandmarks(landmarks, {
                radius: (data) => (data.from ? DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1) : 1),
            });
            drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS);
        });
    }

    // 예측을 계속 실행하기 위해 requestAnimationFrame으로 다음 프레임 호출
    requestAnimationFrame(predictWebcam);
};

// 컴포넌트가 언마운트될 때 웹캠 종료
onUnmounted(() => {
    const stream = video.value.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
});
</script>

<style scoped>
.game-container {
    position: relative;
    width: 100%;
    height: 500px;
    margin-top: 100px;
}

.background-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 500px;
    z-index: 1;
}

.svg-rect {
    /* 이 부분 나중에 이미지로 대체 */
    width: inherit;
    height: 100%;
    fill: blue;
}

.webcam-conatiner {
    position: relative;
    width: 100%;
    height: auto;
}

.hand-image {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 480px;
    height: 100%;
    object-fit: cover;
    z-index: 2;
    z-index: 4;
    opacity: 0.3;
}

.hand-image,
.video-element,
.webcam-canvas {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* 중앙으로 위치 조정 */
    width: 480px;
    height: 100%;
    object-fit: cover;
}

.hand-image {
    z-index: 3;
    opacity: 0.4;
}

.video-element {
    z-index: 2;
    transform: translate(-50%, -50%) scaleX(-1);
}

.webcam-canvas {
    z-index: 3;
    transform: translate(-50%, -50%) scaleX(-1);
}
</style>
