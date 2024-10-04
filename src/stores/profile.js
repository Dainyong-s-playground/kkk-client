// store/profile.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import cookies from 'js-cookie';

export const useProfileStore = defineStore('profile', {
    state: () => ({
        loginId: null,
        selectedProfile: {},
        jwtToken: null,
        isLoggedIn: false,
    }),

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
            this.isLoggedIn = false;
        },
        async checkLoginStatus() {
            const jwt = this.getCookie('Authorization');
            if (jwt) {
                try {
                    const decodedToken = jwtDecode(jwt);
                    const profileId = decodedToken.profileId;
                    if (profileId && !this.selectedProfile.id) {
                        const response = await axios.get('http://localhost:7771/api/me', {
                            headers: { Authorization: `Bearer ${jwt}` },
                            withCredentials: true,
                        });
                        this.setSelectedProfile(response.data);
                        this.isLoggedIn = true;
                    }
                } catch (error) {
                    console.error('사용자 정보를 가져오는 데 실패했습니다.', error);
                    this.isLoggedIn = false;
                }
            }
        },
        async logout() {
            const jwt = this.getCookie('Authorization');
            try {
                await axios.post(
                    'http://localhost:7771/auth/logout',
                    {},
                    { headers: { Authorization: `Bearer ${jwt}` }, withCredentials: true },
                );
                this.clearUserData();
                this.deleteCookie('Authorization');
            } catch (error) {
                console.error('로그아웃 실패:', error);
                throw error;
            }
        },
        async selectProfile(profileId) {
            try {
                const jwt = this.getCookie('Authorization');
                if (!jwt) {
                    throw new Error('JWT 토큰이 없습니다.');
                }

                const response = await axios.post(
                    'http://localhost:7771/api/selectProfile',
                    { profileId },
                    {
                        headers: { Authorization: `Bearer ${jwt}` },
                        withCredentials: true,
                    },
                );

                const newToken = response.data.newToken;
                if (newToken) {
                    this.setJwtToken(newToken);
                    this.setCookie('Authorization', newToken);
                }

                await this.checkLoginStatus(); // 프로필 선택 후 로그인 상태 다시 확인
                return response.data;
            } catch (error) {
                console.error('프로필 선택 중 오류가 발생했습니다.', error);
                throw error;
            }
        },
        getCookie(name) {
            return cookies.get(name);
        },
        setCookie(name, value, options = {}) {
            options = {
                path: '/',
                ...options,
            };

            if (options.expires instanceof Date) {
                options.expires = options.expires.toUTCString();
            }

            let updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);

            for (let optionKey in options) {
                updatedCookie += '; ' + optionKey;
                let optionValue = options[optionKey];
                if (optionValue !== true) {
                    updatedCookie += '=' + optionValue;
                }
            }

            document.cookie = updatedCookie;
        },
        deleteCookie(name) {
            this.setCookie(name, '', {
                'max-age': -1,
            });
        },
    },

    getters: {
        getLoginId: (state) => state.loginId,
        getSelectedProfile: (state) => state.selectedProfile,
        getJwtToken: (state) => state.jwtToken,
    },
});
