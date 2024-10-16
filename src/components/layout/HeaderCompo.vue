<template>
    <header :class="['header', { scrolled: isScrolled || isNavHidden }]">
        <div class="header-content" :style="headerContentStyle">
            <div class="content">
                <div
                    class="logo"
                    :class="{ 'logo-move-down': isNavHidden, 'logo-move-up': !isNavHidden && wasNavHidden }"
                    @click="goToMain"
                >
                    {{ userName }} 님
                </div>
                <div :class="['center-logo', { 'logo-invert': isScrolled }]" @click="goToMain">
                    <img :src="logoSrc" @error="handleImageError" />
                </div>
                <div class="search-container">
                    <input
                        v-if="isSearchVisible"
                        type="text"
                        class="search-input"
                        placeholder="검색"
                        v-model="searchQuery"
                        @blur="toggleSearch"
                    />
                    <i class="search-icon" @click="triggerSearchToggle">
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
                            <img :src="loginUser.image" class="profile-image" />
                        </div>

                        <transition name="dropdown">
                            <div v-if="showDropdown" class="dropdown-menu" ref="dropdownMenu">
                                <button @click="goToMyPage">마이페이지</button>
                                <button @click="changeProfile">프로필 변경</button>
                                <button @click="logout">로그아웃</button>
                            </div>
                        </transition>
                    </div>

                    <div v-else class="login-container">
                        <div class="login-profile">
                            <button @click="onNaverLogin" class="profile-image">로그인</button>
                        </div>
                    </div>
                </div>
            </div>
            <nav v-if="showNav" :class="{ scrolled: isScrolled, 'nav-hidden': isNavHidden }">
                <a href="#" class="nav-item" @click.prevent="scrollToSection('recentlyWatched')">최근 시청 동화</a>
                <a href="#" class="nav-item" @click.prevent="scrollToSection('top-5')">TOP 5 동화</a>
                <!-- 카테고리 드롭다운 제거 -->
            </nav>
        </div>
    </header>

    <!-- 카테고리 드롭다운 콘텐츠 제거 -->
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '@/stores/profile';
import { useLayoutStore } from '@/stores/layout';
import { storeToRefs } from 'pinia';
import { USER_API_URL, TALE_API_URL, IMAGE_SERVER_URL } from '@/constants/api';

// ESLint 오류를 방지하기 위한 주석
// eslint-disable-next-line no-undef
defineProps({
    showNav: {
        type: Boolean,
        default: false,
    },
});

const router = useRouter();
const profileStore = useProfileStore();
const layoutStore = useLayoutStore();
const { isLoggedIn, selectedProfile: loginUser } = storeToRefs(profileStore);
const { showNav } = storeToRefs(layoutStore);

const isScrolled = ref(false);
const isNavHidden = ref(false);
const wasNavHidden = ref(false);
const lastScrollPosition = ref(0);
const showDropdown = ref(false);
const isSearchVisible = ref(false);
const searchQuery = ref('');
const userName = computed(() => profileStore.getUserName);

const emit = defineEmits(['toggle-search']);

const headerContentStyle = computed(() => ({
    padding: isScrolled.value && isNavHidden.value ? '0 30px' : '0 10px',
    transition: 'padding 0.5s ease',
}));

const triggerSearchToggle = () => {
    emit('toggle-search');
};

const handleScroll = () => {
    const currentScrollPosition = window.scrollY;
    isScrolled.value = currentScrollPosition > 10;

    if (currentScrollPosition < lastScrollPosition.value) {
        if (isNavHidden.value) {
            wasNavHidden.value = true;
            setTimeout(() => {
                wasNavHidden.value = false;
            }, 500);
        }
        isNavHidden.value = false;
    } else {
        isNavHidden.value = currentScrollPosition > 50;
    }

    lastScrollPosition.value = currentScrollPosition;
};

const handleOutsideClick = (event) => {
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const loginProfile = event.target.closest('.login-profile');
    if (showDropdown.value && dropdownMenu && !dropdownMenu.contains(event.target) && !loginProfile) {
        showDropdown.value = false;
    }
};

const onNaverLogin = () => {
    window.location.href = `${USER_API_URL}/oauth2/authorization/naver`;
};

const logout = async () => {
    try {
        await profileStore.logout();
        router.push('/');
        // 페이지 새로고침 대신 상태 초기화
        profileStore.clearUserData();
        showDropdown.value = false;
    } catch (error) {
        console.error('로그아웃 실패:', error);
        alert('로그아웃 실패: ' + error.message);
    }
};

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

const goToMyPage = () => {
    router.push('/mypage');
    showDropdown.value = false;
};

const goToMain = () => {
    router.push('/');
};

const changeProfile = () => {
    profileStore.clearUserData();
    router.push('/profiles');
    showDropdown.value = false;
};

const toggleSearch = () => {
    isSearchVisible.value = !isSearchVisible.value;
    if (!isSearchVisible.value) {
        searchQuery.value = '';
    }
};

// IMAGE_SERVER_URL 값을 확인하기 위해 콘솔에 출력
console.log('IMAGE_SERVER_URL:', IMAGE_SERVER_URL);
console.log('USER_API_URL:', USER_API_URL);
console.log('TALE_API_URL:', TALE_API_URL);

const handleImageError = (e) => {
    console.error('이미지 로드 실패:', e.target.src);
    // 필요한 경우 대체 이미지를 설정할 수 있습니다.
    // e.target.src = '대체 이미지 URL';
};

const logoSrc = computed(() => {
    return isScrolled.value
        ? `${IMAGE_SERVER_URL}/src/kkkLogo_noneBlack.png`
        : `${IMAGE_SERVER_URL}/src/kkkLogo_none.png`;
});

const scrollToSection = (sectionId) => {
    let offset = 144; // 기본 오프셋

    window.dispatchEvent(
        new CustomEvent('scrollToSection', {
            detail: {
                sectionId: sectionId,
                offset: offset,
            },
        }),
    );
};

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleOutsideClick);
    profileStore.checkLoginStatus();
});

onMounted(() => {
    window.addEventListener('scrollToSection', (event) => {
        const { sectionId, offset } = event.detail;
        const element = document.getElementById(sectionId);
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    });
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('click', handleOutsideClick);
});
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
    color: rgb(155, 190, 78);
    transition: all 0.5s ease;
    width: 15%;
}

.logo-move-down {
    animation: logoMoveDown 0.5s ease forwards;
}

.logo-move-up {
    animation: logoMoveUp 0.5s ease forwards;
}

.center-logo {
    width: 70%;
    height: 100px;
    display: flex;
    justify-content: center;
}
.center-logo img {
    width: 450px;
    object-fit: contain;
}

.center-logo.logo-invert img {
    /* 이 부분은 더 이상 필요하지 않으므로 제거하거나 주석 처리합니다 */
    /* filter: invert(1); */
}

nav {
    display: flex;
    transition: all 0.3s ease;
    transform-origin: top right;
    max-height: 50px;
    padding: 0px;
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

.header.scrolled nav {
    padding-bottom: 10px;
}

.header.scrolled .nav-hidden {
    padding-bottom: 0px;
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
    flex-direction: row-reverse;
}

/* 김범철 로그인 css */
.login {
    width: 10%;
}
.login-container {
    position: relative;
    width: 100%;
}

.login-profile {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    justify-content: flex-end;
}

.profile-image {
    width: 85px;
    height: 85px;
    border-radius: 50%;
    object-fit: cover;
    text-align: center;
    font-size: 18px;
    font-family: 'CookieRun-Regular', sans-serif;
}

/* 드롭다운 메뉴 스타일 */
.dropdown-menu {
    position: absolute;
    top: 90px;
    right: 0;
    background-color: white;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    transform-origin: top center;
}

/* 드롭다운 애니메이션 */
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-20px);
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

.search-container {
    width: 5%;
}

/* 네비게이션 숨김 상태에 대한 스타일 추가 */
.nav-hidden {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}
</style>
