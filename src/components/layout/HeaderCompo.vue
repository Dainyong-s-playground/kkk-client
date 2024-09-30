<template>
    <header :class="['header', { scrolled: isScrolled || isNavHidden }]">
        <div class="header-content" :style="headerContentStyle">
            <div class="content">
                <div
                    class="logo"
                    :class="{ 'logo-move-down': isNavHidden, 'logo-move-up': !isNavHidden && wasNavHidden }"
                >
                    나 님
                </div>
                <div class="blank"></div>
                <div class="search-container">
                    <input
                        v-if="isSearchVisible"
                        type="text"
                        class="search-input"
                        placeholder="검색"
                        v-model="searchQuery"
                        @blur="toggleSearch"
                    />
                    <i class="search-icon" @click="toggleSearch">
                        <!-- <img src="https://i.ibb.co/W34yBxW/search24px.png" alt="searchIcon" /> -->
                        <svg
                            v-if="!isScrolled"
                            class="svg-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            width="36"
                            height="36"
                            viewBox="0 0 64 64"
                        >
                            <path
                                d="M 27 9 C 17.075 9 9 17.075 9 27 C 9 36.925 17.075 45 27 45 C 31.129213 45 34.9263 43.587367 37.966797 41.240234 L 51.048828 54.322266 C 51.952828 55.226266 53.418266 55.226266 54.322266 54.322266 C 55.226266 53.418266 55.226266 51.952828 54.322266 51.048828 L 41.240234 37.966797 C 43.587367 34.9263 45 31.129213 45 27 C 45 17.075 36.925 9 27 9 z M 27 13 C 34.719 13 41 19.281 41 27 C 41 34.719 34.719 41 27 41 C 19.281 41 13 34.719 13 27 C 13 19.281 19.281 13 27 13 z"
                            ></path>
                        </svg>

                        <svg
                            v-else
                            class="svg-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            width="36"
                            height="36"
                            viewBox="0 0 64 64"
                        >
                            <path
                                d="M 27 9 C 17.075 9 9 17.075 9 27 C 9 36.925 17.075 45 27 45 C 31.129213 45 34.9263 43.587367 37.966797 41.240234 L 51.048828 54.322266 C 51.952828 55.226266 53.418266 55.226266 54.322266 54.322266 C 55.226266 53.418266 55.226266 51.952828 54.322266 51.048828 L 41.240234 37.966797 C 43.587367 34.9263 45 31.129213 45 27 C 45 17.075 36.925 9 27 9 z M 27 13 C 34.719 13 41 19.281 41 27 C 41 34.719 34.719 41 27 41 C 19.281 41 13 34.719 13 27 C 13 19.281 19.281 13 27 13 z"
                                fill="#ffffff"
                            ></path>
                        </svg>
                    </i>
                </div>

                <div class="login">
                    <div v-if="isLoggedIn" class="login-container">
                        <div class="login-profile" @click="toggleDropdown">
                            <!-- <img class="profile-image" alt="프로필 이미지" />
                            <span>{{ loginUser.nickname }}</span> -->
                            <!-- <input v-model="loginUser.nickname" class="profile-image" readonly /> -->
                            <img :src="loginUser.image" class="profile-image" />
                        </div>

                        <div v-if="showDropdown" class="dropdown-menu" ref="dropdownMenu">
                            <button @click="goToMyPage">마이페이지</button>
                            <button @click="changeProfile">프로필 변경</button>
                            <button @click="logout">로그아웃</button>
                        </div>
                    </div>

                    <div v-else>
                        <button @click="onNaverLogin" class="profile-image">로그인</button>
                    </div>
                </div>
            </div>
            <nav :class="{ scrolled: isScrolled, 'nav-hidden': isNavHidden }">
                <a href="#" class="nav-item">최근 시청 동화</a>
                <a href="#" class="nav-item">동화</a>
                <a href="#" class="nav-item">카테고리 ▽</a>
            </nav>
        </div>
    </header>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            isScrolled: false,
            isNavHidden: false,
            wasNavHidden: false,
            lastScrollPosition: 0,
            isLoggedIn: false, // 로그인 여부를 저장
            loginUser: '', // 닉네임 저장
            showDropdown: false, // 드롭다운 메뉴 표시 여부
        };
    },
    computed: {
        headerContentStyle() {
            return {
                padding: this.isScrolled && this.isNavHidden ? '0 30px' : '0 10px',
                transition: 'padding 0.5s ease',
            };
        },
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('click', this.handleOutsideClick); // 전역 클릭 이벤트 추가
        this.checkLoginStatus();
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('click', this.handleOutsideClick); // 전역 클릭 이벤트 제거
    },
    methods: {
        handleScroll() {
            const currentScrollPosition = window.scrollY;
            this.isScrolled = currentScrollPosition > 10;

            if (currentScrollPosition < this.lastScrollPosition) {
                if (this.isNavHidden) {
                    this.wasNavHidden = true;
                    setTimeout(() => {
                        this.wasNavHidden = false;
                    }, 500); // 애니메이션 지속 시간과 일치
                }
                this.isNavHidden = false;
            } else {
                this.isNavHidden = currentScrollPosition > 50;
            }

            this.lastScrollPosition = currentScrollPosition;
        },

        //김범철 로그인
        handleOutsideClick(event) {
            const dropdownMenu = this.$refs.dropdownMenu;
            const loginProfile = event.target.closest('.login-profile');
            // 드롭다운이 열려 있고, 클릭된 요소가 드롭다운 메뉴나 프로필이 아닐 경우 닫기
            if (this.showDropdown && dropdownMenu && !dropdownMenu.contains(event.target) && !loginProfile) {
                this.showDropdown = false;
            }
        },

        onNaverLogin() {
            // 네이버 로그인 페이지로 리다이렉트
            window.location.href = 'http://localhost:7771/oauth2/authorization/naver';
        },
        async logout() {
            const jwt = this.getCookie('Authorization');
            try {
                // 서버로 로그아웃 요청 보내기
                const response = await axios.post(
                    'http://localhost:7771/auth/logout',
                    {},
                    { headers: { Authorization: `Bearer ${jwt}` }, withCredentials: true },
                );

                this.deleteCookie('jwt');
                this.isLoggedIn = false;
                this.nickname = '';
                this.showDropdown = false; // 로그아웃 후 드롭다운 숨김
                if (response.status === 200) {
                    // 로그아웃 성공
                    this.$router.push('/'); // Vue.js의 경로로 리다이렉션
                }
                alert('로그아웃 성공!');
            } catch (error) {
                alert('로그아웃 실패: ' + error.message);
            }
        },
        deleteCookie(name) {
            document.cookie = name + '=; Max-Age=0; path=/;';
        },
        async checkLoginStatus() {
            const jwt = this.getCookie('Authorization'); // JWT 쿠키 가져오기
            if (jwt) {
                try {
                    const response = await axios.get('http://localhost:7771/api/me', {
                        headers: { Authorization: `Bearer ${jwt}` },
                        withCredentials: true, // 쿠키 전달
                    });
                    console.log(response.data);
                    // 백엔드에서 받은 응답에 nickname이 포함되는지 확인
                    this.loginUser = response.data;
                    console.log(this.loginUser);
                    this.isLoggedIn = true; // 로그인 상태 업데이트
                } catch (error) {
                    console.error('사용자 정보를 가져오는 데 실패했습니다.', error);
                    this.isLoggedIn = false;
                }
            }
        },
        getCookie(name) {
            const matches = document.cookie.match(
                new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[]\\\/+^])/g, '\\$1') + '=([^;]*)'),
            );
            return matches ? decodeURIComponent(matches[1]) : undefined;
        },
        toggleDropdown() {
            this.showDropdown = !this.showDropdown; // 드롭다운 메뉴 표시/숨김 토글
        },
        goToMyPage() {
            // 마이페이지로 이동하는 로직
            this.$router.push('/mypage');
            this.showDropdown = false; // 드롭다운 닫기
        },
        changeProfile() {
            // 프로필 변경 페이지로 이동하는 로직
            this.$router.push('/profiles');
            this.showDropdown = false; // 드롭다운 닫기
        },
    },
};
</script>

<style scoped>
.header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    padding: 20px;
    flex-direction: column;
    transition: all 0.5s ease;
}

.content {
    display: flex;
    width: 100%;
    height: 100px;
    align-items: center;
    justify-content: space-between;
}

.header.nav-hidden .header-content {
    justify-content: center;
    align-items: center;
}

.logo {
    font-size: 2rem;
    font-weight: bold;
    padding: 10px 0;
    color: #e50914;
    transition: all 0.5s ease;
    width: 15%;
}

.logo-move-down {
    animation: logoMoveDown 0.5s ease forwards;
}

.logo-move-up {
    animation: logoMoveUp 0.5s ease forwards;
}

nav {
    display: flex;
    transition: all 0.3s ease;
    transform-origin: top right;
    max-height: 50px;
    padding-bottom: 10px;
    overflow: hidden;
}

.nav-item {
    font-weight: normal;
    color: #000000;
    text-decoration: none;
    margin-right: 10px;
    font-size: 1.2rem;
    padding: 3px 10px;
    transition: all 0.3s ease;
    border: 1px solid #000000;
    border-radius: 15px;
}

.header:not(.scrolled) .nav-item {
    color: #000000;
}

.header.scrolled {
    background-color: rgba(54, 54, 54, 0.8);
    backdrop-filter: blur(10px);
}

.header.scrolled .nav-item {
    color: #ffffff;
    border-color: #ffffff;
}

.header.scrolled .nav-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.nav-hidden {
    opacity: 0;
    transform: translate(50%, -100%) scale(0.5);
    max-height: 0;
}

.header.nav-hidden {
    height: 5vh;
}

@keyframes slideUpRight {
    0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
    }
    100% {
        transform: translate(10%, -150%) scale(0.1);
        opacity: 0;
    }
}

@keyframes slideDownLeft {
    0% {
        transform: translate(10%, -150%) scale(0.1);
        opacity: 0;
    }
    100% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
    }
}

nav:not(.nav-hidden) {
    animation: slideDownLeft 0.4s ease forwards;
}

nav.nav-hidden {
    animation: slideUpRight 0.4s ease forwards;
}

.search-icon {
    display: flex;
}

/* 김범철 로그인 css */
.login {
    width: 5%;
}
.login-container {
    position: relative;
}

.login-profile {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}

.profile-image {
    width: 75px;
    height: 75px;
    border-radius: 50%;
    object-fit: cover;
    text-align: center;
    font-size: 18px;
    font-family: 'CookieRun-Regular', sans-serif;
}

/* 드롭다운 메뉴 스타일 */
.dropdown-menu {
    position: absolute;
    /* top: 50px; */
    right: 0;
    background-color: white;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 10px;
    display: flex;
    flex-direction: column;
}

.dropdown-menu button {
    background: none;
    border: none;
    padding: 10px;
    text-align: left;
    cursor: pointer;
    font-size: 16px;
    width: 150px;
}

.dropdown-menu button:hover {
    background-color: #f0f0f0;
}

.blank {
    width: 60%;
}
.search-container {
    width: 20%;
}
</style>
