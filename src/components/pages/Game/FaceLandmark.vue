<template>
    <div class="player-container" :class="{ 'is-fullscreen': isFullscreen }">
        <div class="background-container"></div>
        <div class="game-container" v-show="!isSuccess">
            <video ref="video" class="video-element" autoplay playsinline></video>
            <canvas ref="canvas" class="webcam-canvas"></canvas>
        </div>
    </div>
</template>

<script setup>
import { IMAGE_SERVER_URL } from '@/constants/api';
import { DrawingUtils, FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { inject, onMounted, onUnmounted, ref, shallowRef } from 'vue';
const backgroundImage = `${IMAGE_SERVER_URL}/fairytale/SnowWhite/SnowWhite04.png`;
const video = ref(null);
const canvas = ref(null);
const faceLandmarker = shallowRef(null);
let canvasCtx = null;

// 상태 변수
const stopLandmarkPrediction = ref(false);
const isSuccess = ref(false);
const isFullscreen = ref(false);

const semiMajorAxis = 360.0;  // 가로 반지름
const semiMinorAxis = 548.2;  // 세로 반지름

const faceDetectedTime = ref(null);
const faceDetectionThreshold = 3000;

// Mediapipe FaceLandmarker 초기화
const initFaceLandmarker = async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );

    faceLandmarker.value = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1,
    });

    if (faceLandmarker.value) {
        await enableWebcam();
        console.log('FaceLandmarker 초기화 성공');
    } else {
        console.error('FaceLandmarker 초기화 실패');
    }
};

// 웹캠 활성화 및 얼굴 인식 시작
const enableWebcam = async () => {
    if (!faceLandmarker.value) {
        console.log("FaceLandmarker가 아직 로드되지 않았습니다.");
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.value.srcObject = stream;

        video.value.onloadedmetadata = () => {
            canvasCtx = canvas.value.getContext("2d");

            // 3초 후에 얼굴 인식 시작
            setTimeout(() => {
                console.log('얼굴 인식 시작');
                predictWebcam();  // 얼굴 인식 시작
            }, 1000);
        };
    } catch (error) {
        console.error("웹캠 접근 오류:", error);
    }
};

// 얼굴 인식 및 예측 반복 실행
const predictWebcam = async () => {
    if (stopLandmarkPrediction.value || !video.value || !canvasCtx) {
        return;
    }

    const startTimeMs = performance.now();
    const result = await faceLandmarker.value.detectForVideo(video.value, startTimeMs);

    // 캔버스 초기화
    canvasCtx.clearRect(0, 0, canvas.value.width, canvas.value.height);

    if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const drawingUtils = new DrawingUtils(canvasCtx);
        const landmarks = result.faceLandmarks[0];  // 첫 번째 얼굴의 랜드마크

        // 랜드마크 그리기
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: "#0067a3" });

        // 얼굴의 중심점 계산
        const centerX = landmarks.reduce((sum, point) => sum + point.x, 0) / landmarks.length;
        const centerY = landmarks.reduce((sum, point) => sum + point.y, 0) / landmarks.length;

        // 타원 내부에 얼굴이 있는지 확인
        if (isInsideEllipse(centerX, centerY)) {
            if (!faceDetectedTime.value) {
                faceDetectedTime.value = performance.now();
            } else if (performance.now() - faceDetectedTime.value >= faceDetectionThreshold) {
                isSuccess.value = true;
                stopLandmarkPrediction.value = true;
                console.log('얼굴 인식 성공!');
                // 모션 인식이 완료되면 부모 컴포넌트에 알립니다.
                handleMotionComplete();
                return;
            }
        } else {
            faceDetectedTime.value = null;
        }
    } else {
        console.warn('얼굴 랜드마크가 감지되지 않았습니다.');
        faceDetectedTime.value = null;
    }

    // 계속해서 얼굴 랜드마크 감지를 반복 실행
    if (!stopLandmarkPrediction.value) {
        window.requestAnimationFrame(predictWebcam);
    }
};

// 타원 내부에 점이 있는지 확인하는 함수
const isInsideEllipse = (x, y) => {
    const centerX = canvas.value.width / 2;
    const centerY = canvas.value.height / 2;
    const normalizedX = (x - centerX) / semiMajorAxis;
    const normalizedY = (y - centerY) / semiMinorAxis;
    return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
};

// handleMotionComplete 함수를 주입받습니다.
const handleMotionComplete = inject('handleMotionComplete');

onMounted(async () => {
    await initFaceLandmarker();
});

onUnmounted(() => {
    stopLandmarkPrediction.value = true;
    if (video.value && video.value.srcObject) {
        const stream = video.value.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
    }
});
</script>

<style scoped>
.player-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.background-container,
.game-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.background-container {
    background-image: v-bind(`url(${backgroundImage})`);
    background-size: cover;
    background-position: center;
    z-index: 2;
}

.game-container {
    z-index: 1;
}

.video-element,
.webcam-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: scaleX(-1);
}

/* 전체 화면 모드를 위한 스타일 */
.player-container.is-fullscreen {
    position: fixed;
    top: 7vh;
    left: 0;
    width: 100vw;
    height: calc(100vh - 14vh);
}

.player-container.is-fullscreen .background-container {
    background-size: contain;
    background-position: center;
}

.player-container.is-fullscreen .video-element,
.player-container.is-fullscreen .webcam-canvas {
    object-fit: contain;
}

/* 모바일 및 태블릿 대응 */
@media (max-width: 768px) {
    .player-container.is-fullscreen {
        top: 0;
        height: 100vh;
    }
}
</style>
