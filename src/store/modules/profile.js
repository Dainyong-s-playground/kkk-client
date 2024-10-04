import { createStore } from 'vuex';

export default createStore({
    state: {
        loginId: null, // 로그인한 유저의 ID
        selectedProfile: {}, // 선택된 프로필 정보
        jwtToken: null, // JWT 토큰 정보
    },
    mutations: {
        SET_LOGIN_ID(state, loginId) {
            state.loginId = loginId;
        },
        SET_SELECTED_PROFILE(state, profile) {
            state.selectedProfile = profile;
        },
        SET_JWT_TOKEN(state, token) {
            state.jwtToken = token;
        },
        CLEAR_USER_DATA(state) {
            state.loginId = null;
            state.selectedProfile = {};
            state.jwtToken = null;
        },
    },
    actions: {
        setLoginId({ commit }, loginId) {
            commit('SET_LOGIN_ID', loginId);
        },
        setSelectedProfile({ commit }, profile) {
            commit('SET_SELECTED_PROFILE', profile);
        },
        setJwtToken({ commit }, token) {
            commit('SET_JWT_TOKEN', token);
        },
        clearUserData({ commit }) {
            commit('CLEAR_USER_DATA');
        },
    },
    getters: {
        getLoginId: (state) => state.loginId,
        getSelectedProfile: (state) => state.selectedProfile,
        getJwtToken: (state) => state.jwtToken,
    },
});
