import FaceLandmark from '@/components/pages/Game/FaceLandmark.vue';
import HandLandmark from '@/components/pages/Game/HandLandmark.vue';
import PoisonApple from '@/components/pages/Game/PoisonApple.vue';
import RopeCut from '@/components/pages/Game/RopeCut.vue';
// 다른 게임과 모션인식 컴포넌트들을 여기에 import

export const gameComponentMap = {
  '4': RopeCut,        // 햇님달님
  '2': PoisonApple,    // 백설공주
  // 다른 동화들의 게임 컴포넌트 매핑
};

export const motionComponentMap = {
  '4': HandLandmark,   // 햇님달님
  '2': FaceLandmark,   // 백설공주
  // 다른 동화들의 모션인식 컴포넌트 매핑
};