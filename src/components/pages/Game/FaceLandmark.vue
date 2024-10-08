<template>
    <div class="background-container"></div>
    <div class="game-container" v-show="!isSuccess">
        <video ref="video" class="video-element" autoplay playsinline></video>
        <canvas ref="canvas" class="webcam-canvas"></canvas>
    </div>
</template>

<script setup>
import { DrawingUtils, FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';

const video = ref(null);
const canvas = ref(null);
const faceLandmarker = shallowRef(null);
let canvasCtx = null;

const stopLandmarkPrediction = ref(false);
const isSuccess = ref(false);

// 비디오와 캔버스 크기를 동기화하는 함수
const syncCanvasSize = () => {
    if (video.value && canvas.value) {
        canvas.value.width = video.value.videoWidth;
        canvas.value.height = video.value.videoHeight;
    }
};

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
        console.log('FaceLandmarker 초기화 성공');
    } else {
        console.error('FaceLandmarker 초기화 실패');
    }
};

const enableWebcam = async () => {
    if (!faceLandmarker.value) {
        console.log("FaceLandmarker가 아직 로드되지 않았습니다.");
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.value.srcObject = stream;

        video.value.onloadedmetadata = () => {
            syncCanvasSize();
            canvasCtx = canvas.value.getContext("2d");
            predictWebcam();  // 비디오가 로드된 후 얼굴 인식 시작
        };
    } catch (error) {
        console.error("웹캠 접근 오류:", error);
    }
};

const predictWebcam = async () => {
    if (stopLandmarkPrediction.value || !video.value || !canvasCtx) {
        return;
    }

    const startTimeMs = performance.now();
    const result = await faceLandmarker.value.detectForVideo(video.value, startTimeMs);

    // 캔버스 초기화
    canvasCtx.clearRect(0, 0, canvas.value.width, canvas.value.height);

    if (result.faceLandmarks) {
        const drawingUtils = new DrawingUtils(canvasCtx);

        result.faceLandmarks.forEach((landmarks) => {
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: "#0067a3" });
        });
    } else {
        console.warn('얼굴 랜드마크가 감지되지 않았습니다.');
    }

    // 계속해서 얼굴 랜드마크 감지를 반복 실행
    if (!stopLandmarkPrediction.value) {
        window.requestAnimationFrame(predictWebcam);
    }
};

onMounted(async () => {
    await initFaceLandmarker();
    await enableWebcam();
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
.background-container {
    position: absolute;
    width: 100%;
    height: 700px;
    background-image: url('/src/assets/images/Mirror.png');
    /* background-size: contain; */
    background-size: auto 100%;
    background-repeat: no-repeat;
    background-position: center;
    z-index: 2;
}

.game-container {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 700px;
    z-index: 1;
}

.video-element,
.webcam-canvas {
    position: absolute;
    transform: scaleX(-1);
    height: 100%;
    z-index: 1;
}

@media (max-width: 1200px) {
    .video-element,
    .webcam-canvas {
        left: 50%;
        transform: translateX(-50%) scaleX(-1);
    }
}

@media (max-width: 768px) {
    .video-element,
    .webcam-canvas {
        left: 50%;
        top: 20px;
        transform: translateX(-50%) scaleX(-1);
    }
}
</style>
