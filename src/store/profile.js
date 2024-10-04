import { defineStore } from 'pinia';

// Pinia를 사용하여 프로필 관련 스토어 정의
export const useProfileStore = defineStore('profile', {
    // state: 함수 형태로 정의하여 초기 상태 설정
    state: () => ({
        loginId: null,
        selectedProfile: {},
        jwtToken: null,
    }),

    // actions: 상태를 직접 수정하고, 비즈니스 로직을 포함하는 메서드
    actions: {
        setLoginId(loginId) {
            this.loginId = loginId;
        },
        setSelectedProfile(profile) {
            this.selectedProfile = profile;
        },
        setJwtToken(token) {
            this.jwtToken = token;
        },
        clearUserData() {
            this.loginId = null;
            this.selectedProfile = {};
            this.jwtToken = null;
        },
    },

    // getters: 계산된 속성으로, 상태를 기반으로 한 접근 방식을 정의
    getters: {
        getLoginId: (state) => state.loginId,
        getSelectedProfile: (state) => state.selectedProfile,
        getJwtToken: (state) => state.jwtToken,
    },
});
