// store/profile.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import cookies from 'js-cookie';

export const useProfileStore = defineStore('profile', {
    state: () => ({
        loginId: null,
        selectedProfile: null, // {} 대신 null로 초기화
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
                    this.setLoginId(decodedToken.id);
                    const profileId = decodedToken.profileId;
                    if (profileId) {
                        const response = await axios.get('http://localhost:7771/api/me', {
                            headers: { Authorization: `Bearer ${jwt}` },
                            withCredentials: true,
                        });
                        this.setSelectedProfile(response.data);
                        this.setJwtToken(jwt);
                        this.isLoggedIn = true;
                    }
                } catch (error) {
                    console.error('사용자 정보를 가져오는 데 실패했습니다.', error);
                    this.isLoggedIn = false;
                    this.clearUserData();
                }
            } else {
                this.isLoggedIn = false;
                this.clearUserData();
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
        async validateToken() {
            const jwt = this.getCookie('Authorization');
            if (!jwt) {
                this.clearUserData();
                return false;
            }

            try {
                // JWT를 디코드하여 만료 시간을 확인합니다.
                const decodedToken = jwtDecode(jwt);
                const currentTime = Date.now() / 1000;
                if (decodedToken.exp < currentTime) {
                    // 토큰이 만료되었다면
                    this.clearUserData();
                    return false;
                }
                // 토큰이 유효하다면
                return true;
            } catch (error) {
                console.error('토큰 검증 실패:', error);
                this.clearUserData();
                return false;
            }
        },
    },

    getters: {
        getLoginId: (state) => state.loginId,
        getSelectedProfile: (state) => state.selectedProfile,
        getJwtToken: (state) => state.jwtToken,
        getUserName: (state) => state.selectedProfile?.nickname || '게스트',
    },
});
