// store/profile.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import cookies from 'js-cookie';
import { USER_API_URL } from '@/constants/api';

// axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: USER_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
    (config) => {
        const token = cookies.get('Authorization');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // 인증 에러 처리 (예: 로그아웃)
        }
        return Promise.reject(error);
    },
);

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
                        const response = await axiosInstance.get('/api/me');
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
            try {
                await axiosInstance.post('/auth/logout');
                this.clearUserData();
                this.deleteCookie('Authorization');
                this.deleteCookie('JSESSIONID');
                cookies.remove('Authorization', { path: '/', domain: '.dainyongplayground.site' });
                cookies.remove('JSESSIONID', { path: '/', domain: '.dainyongplayground.site' });
                localStorage.removeItem('Authorization');
                sessionStorage.removeItem('Authorization');
            } catch (error) {
                console.error('로그아웃 실패:', error);
                throw error;
            }
        },
        async selectProfile(profileId) {
            try {
                const response = await axiosInstance.post('/api/selectProfile', { profileId });
                const newToken = response.data.newToken;
                if (newToken) {
                    this.setJwtToken(newToken);
                    this.setCookie('Authorization', newToken);
                }
                await this.checkLoginStatus();
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
            const domain = '.dainyongplayground.site';
            const paths = ['/', '/api', ''];
            paths.forEach((path) => {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}; Secure; SameSite=Strict`;
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; Secure; SameSite=Strict`;
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
