<template>
    <div class="main-page" :style="mainPageStyle">
        <div class="background-overlay"></div>
        <div class="content-wrapper">
            <div class="content-container">
                <h1>다이뇽에 오신 것을 환영합니다!</h1>
                <hr />
                <button v-if="!isLoggedIn" @click="onNaverLogin" class="login-button">네이버로 로그인</button>
                <button v-else @click="goToProfiles" class="profile-button">프로필 선택</button>
            </div>
        </div>

        <div class="middle-container">
            <div class="middle-content-container">
                <img
                    class="fairy-list"
                    :src="`${IMAGE_SERVER_URL}/fairyList2.png`"
                    alt="동화 목록"
                    @click="goToFairyList"
                />
                <img
                    class="parent-dashboard"
                    :src="`${IMAGE_SERVER_URL}/parentDashboard-removebg2.png`"
                    alt="부모 대시보드"
                    @click="goToDashboard"
                />
            </div>
        </div>
        <div class="footer-container">
            <div class="character-imgContainer">
                <div class="character-wrapper">
                    <img
                        v-for="(character, index) in characters"
                        :key="index"
                        :class="['character', index % 2 === 0 ? 'dino' : 'book']"
                        :src="character"
                        alt=""
                    />
                </div>
                <div class="character-wrapper">
                    <img
                        v-for="(character, index) in characters"
                        :key="index + '_duplicate'"
                        :class="['character', index % 2 === 0 ? 'dino' : 'book']"
                        :src="character"
                        alt=""
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '@/stores/profile';
import { storeToRefs } from 'pinia';
import { USER_API_URL, IMAGE_SERVER_URL } from '@/constants/api';

const router = useRouter();
const profileStore = useProfileStore();
const { isLoggedIn } = storeToRefs(profileStore);

const characters = ref([
    `${IMAGE_SERVER_URL}/profile/profileFull01-removebg.png`,
    'https://img.ridicdn.net/cover/2353000046/xxlarge?dpi=xxhdpi#1',
    `${IMAGE_SERVER_URL}/profile/profileFull02-removebg.png`,
    'https://img.ridicdn.net/cover/4261000010/xxlarge?dpi=xxhdpi#1',
    `${IMAGE_SERVER_URL}/profile/profileFull03-removebg.png`,
    'https://img.ridicdn.net/cover/1451000215/xxlarge?dpi=xxhdpi#1',
]);

const onNaverLogin = () => {
    window.location.href = `${USER_API_URL}/oauth2/authorization/naver`;
};

const goToFairyList = () => {
    router.push('/fairyTaleList');
};

const goToDashboard = () => {
    router.push('/dashboard');
};

const goToProfiles = () => {
    router.push('/profiles');
};

const mainPageStyle = computed(() => ({
    backgroundImage: `url(${IMAGE_SERVER_URL}/mainBackground.PNG)`,
    backgroundSize: '100% 100%',
    backgroundPosition: 'center',
    backgroundAttachment: 'scroll',
}));
</script>

<style scoped>
.main-page {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    min-height: 100dvh;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
}

.background-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background-color: rgba(0, 0, 0, 0.5);
}

.content-wrapper {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    height: 30dvh;
    margin: 0 auto;
    padding: 20px;
}

.content-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.login-button {
    padding: 10px 20px;
    font-size: 18px;
    background-color: #03c75a;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.login-button:hover {
    background-color: #02a050;
}

.middle-container {
    z-index: 2;
    display: flex;
    align-items: flex-end;
    height: 35dvh;
}
.middle-content-container {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    width: 100%;
    height: 35dvh;
}
.fairy-list,
.parent-dashboard {
    object-fit: cover;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.fairy-list {
    width: 600px;
}

.parent-dashboard {
    width: 400px;
}

.fairy-list:hover,
.parent-dashboard:hover {
    transform: scale(1.07);
}

.footer-container {
    height: 25dvh;
}
.character-imgContainer {
    display: flex;
    width: 200%;
    animation: slide 30s linear infinite;
}

.character-wrapper {
    display: flex;
    width: 100%;
    height: 25dvh;
    justify-content: space-around;
    align-items: flex-end;
}

.character {
    width: 110px;
    height: 130px;
    margin-bottom: 57px;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.dino {
    padding: 0px;
}

.book {
    border-radius: 7px;
    box-shadow: 0.5px 6px 10px rgba(62, 62, 62, 0.8);
    margin-left: 10px;
}

.character:hover {
    transform: scale(1.1);
}

@keyframes slide {
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(-50%);
    }
}

.character-imgContainer:hover {
    animation-play-state: paused;
}

.profile-button {
    padding: 10px 20px;
    font-size: 18px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.profile-button:hover {
    background-color: #45a049;
}
</style>
