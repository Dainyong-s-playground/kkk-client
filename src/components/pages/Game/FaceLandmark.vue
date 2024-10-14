<template>
    <div class="background-container"></div>
    <div class="game-container" v-show="!isSuccess">
        <video ref="video" class="video-element" autoplay playsinline></video>
        <canvas ref="canvas" class="webcam-canvas"></canvas>
    </div>
</template>

<script setup>
import { IMAGE_SERVER_URL } from '@/constants/api';
import { DrawingUtils, FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';

const backgroundImage = `${IMAGE_SERVER_URL}/fairytale/SnowWhite/SnowWhite04.png`;
const video = ref(null);
const canvas = ref(null);
const faceLandmarker = shallowRef(null);
let canvasCtx = null;

// 이미지 원본 크기
const imageWidth = 2160;
const imageHeight = 1215;

// 타원의 중심 좌표 및 반지름 (픽셀 단위)
const ellipseCenterX = 1047.0;
const ellipseCenterY = 611.5;
const semiMajorAxis = 360.0;  // 가로 반지름
const semiMinorAxis = 548.2;  // 세로 반지름

// 정규화된 좌표 계산
var normalizedX = ellipseCenterX / imageWidth;
var normalizedY = ellipseCenterY / imageHeight;
var normalizedSemiMajorAxis = semiMajorAxis / imageWidth;
var normalizedSemiMinorAxis = semiMinorAxis / imageHeight;
var width = 0;
var height = 0;
var insideEllipseTime = 0;  // 얼굴 부위가 타원 안에 머무는 시간을 추적
var trackingInterval = null; // 타이머 인터벌

// 타원의 넓이 계산 (공식 적용)
var ellipseArea = 1;

// 상태 변수
const stopLandmarkPrediction = ref(false);
const isSuccess = ref(false);

// 비디오와 캔버스 크기를 동기화하는 함수
const syncCanvasSize = () => {
    if (video.value && canvas.value) {
        canvas.value.width = video.value.videoWidth;
        canvas.value.height = video.value.videoHeight;
        width = canvas.value.width;
        height = canvas.value.height;
    }
};

// 타원 내부에 있는지 확인하는 함수 (점이 타원 안에 있는지 계산)
const isPointInNormalizedEllipse = (x, y) => {
    const normX = (x - normalizedX * width) / (normalizedSemiMajorAxis * width);
    const normY = (y - normalizedY * height) / (normalizedSemiMinorAxis * height);
    const result = normX * normX + normY * normY;
    console.log(`내부 타원의 넓이: ${result}`);
    console.log(`ellipseArea = ${ellipseArea}`);
    return result <= ellipseArea;
};

// 얼굴의 눈, 코, 입 랜드마크가 타원 내부에 있는지 확인
const isFaceFeaturesInNormalizedEllipse = (landmarks) => {
    // Mediapipe의 랜드마크 인덱스를 정확하게 참조 (문서에서 확인 필요)
    // const leftEyeIndices = [33, 133]; // 예시로서 왼쪽 눈 인덱스
    // const rightEyeIndices = [362, 263]; // 예시로서 오른쪽 눈 인덱스
    const noseTipIndex = 1; // 예시로서 코끝 인덱스
    // const lipsIndices = [61, 291]; // 예시로서 입 인덱스

    // const featureIndices = [...leftEyeIndices, ...rightEyeIndices, noseTipIndex, ...lipsIndices];

    const landmark = landmarks[noseTipIndex];
    if (!landmark) {
        console.warn(`랜드마크가 존재하지 않습니다. 인덱스: ${landmark}`);
        return false;
    }

    const x = landmark.x * width;
    const y = landmark.y * height;
    console.log('x = ', x);
    console.log('y = ', y);
    return isPointInNormalizedEllipse(x, y);

    // return featureIndices.every(index => {
    //     // landmarks[index]가 undefined인지 확인
    //     const landmark = landmarks[index];
    //     if (!landmark) {
    //         console.warn(`랜드마크가 존재하지 않습니다. 인덱스: ${index}`);
    //         return false;
    //     }
    //     const x = landmark.x * width;
    //     const y = landmark.y * height;
    //     return isPointInNormalizedEllipse(x, y);
    // });
};

// 화면 크기가 줄어들 때 정규화된 좌표 업데이트
const updateNormalizedEllipseValues = () => {
    if (canvas.value) {
        const canvasWidth = canvas.value.width;
        const canvasHeight = canvas.value.height;

        // 정규화된 값을 재계산
        normalizedX = ellipseCenterX / canvasWidth;
        normalizedY = ellipseCenterY / canvasHeight;
        normalizedSemiMajorAxis = semiMajorAxis / canvasWidth;
        normalizedSemiMinorAxis = semiMinorAxis / canvasHeight;
    }
};

// 타원 안에 얼굴의 눈, 코, 입이 3초 이상 있으면 isSuccess를 true로 설정
const trackFaceInEllipse = (landmarks) => {
    if (isFaceFeaturesInNormalizedEllipse(landmarks)) {
        if (trackingInterval === null) {
            trackingInterval = setInterval(() => {
                insideEllipseTime += 100; // 0.1초 단위로 증가
                if (insideEllipseTime >= 3000) {  // 3초
                    clearInterval(trackingInterval);
                    isSuccess.value = true;
                    console.log('눈, 코, 입이 타원 안에 3초 이상 머물렀습니다.');
                }
            }, 100); // 100ms 간격으로 타이머 실행
        }
    } else {
        // 얼굴 부위가 타원에서 벗어나면 타이머 초기화
        clearInterval(trackingInterval);
        trackingInterval = null;
        insideEllipseTime = 0;
        isSuccess.value = false;
    }
};

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
            syncCanvasSize();
            canvasCtx = canvas.value.getContext("2d");
            updateNormalizedEllipseValues();  // 정규화된 타원 좌표 업데이트

            // 3초 후에 얼굴 인식 시작
            setTimeout(() => {
                console.log('얼굴 인식 시작');
                predictWebcam();  // 얼굴 인식 시작
            }, 3000);
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

    if (result.faceLandmarks) {
        const drawingUtils = new DrawingUtils(canvasCtx);

        // 각 랜드마크 그리기
        result.faceLandmarks.forEach((landmarks) => {
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: "#0067a3" });

            // 눈, 코, 입이 타원 안에 있는지 추적
            trackFaceInEllipse(landmarks);
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
});

onUnmounted(() => {
    stopLandmarkPrediction.value = true;
    if (video.value && video.value.srcObject) {
        const stream = video.value.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
    }
    clearInterval(trackingInterval); // 컴포넌트가 제거될 때 타이머를 정리
});
</script>

<style scoped>
.background-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 90%;
    background-image: v-bind(`url(${backgroundImage})`);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    z-index: 2;
}

.game-container {
    position: relative;
    width: 100%;
    height: calc(100% - 7vh);
    overflow: hidden;
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
    z-index: 1;
}

/* 전체 화면 모드를 위한 스타일 */
.face-landmark-container.is-fullscreen .background-container {
    height: 100%;
    background-size: cover;
    background-position: center;
}

.face-landmark-container.is-fullscreen .game-container {
    height: 100;
}

.face-landmark-container.is-fullscreen .video-element,
.face-landmark-container.is-fullscreen .webcam-canvas {
    object-fit: cover;
    height: 100%;
}

/* 모바일 및 태블릿 대응 */
@media (max-width: 768px) {

    .face-landmark-container.is-fullscreen .background-container,
    .face-landmark-container.is-fullscreen .game-container,
    .face-landmark-container.is-fullscreen .video-element,
    .face-landmark-container.is-fullscreen .webcam-canvas {
        height: 100vh;
    }
}
</style>
