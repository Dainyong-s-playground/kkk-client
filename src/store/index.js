import { createStore } from 'vuex';

const store = createStore({
    state: {
        loginId: null,
        selectedProfile: {},
        jwtToken: null,
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

export default store;
