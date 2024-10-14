<template>
    <div>
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
        <div class="profile-box">
            <div v-if="!isLoading" class="profile-info">
                <div class="profile-card">
                    <div class="card" v-for="profile in profiles" :key="profile.id">
                        <div class="card-header">
                            <button class="edit-btn" @click="openEdit(profile)">
                                <img class="edit-img" :src="`${IMAGE_SERVER_URL}/profile/modify.png`" />
                            </button>
                            <button class="delete-btn" @click="deleteProfile(profile.id)">
                                <img class="delete-img" :src="`${IMAGE_SERVER_URL}/profile/delete.png`" />
                            </button>
                        </div>
                        <div class="select-btn">
                            <img :src="profile.image" />
                            <p>{{ profile.nickname }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="stats">
            <div>
                <p>총 구매 권수</p>
                <p>{{ totalPurchases }}</p>
            </div>
            <div>
                <p>총 대여 횟수</p>
                <p>{{ totalRentals }}</p>
            </div>
        </div>

        <!-- 프로필 수정 모달 -->
        <div v-if="showEdit" class="modal" @click.self="closeEdit">
            <div class="modal-content">
                <button class="close-btn" @click="closeEdit">X</button>
                <h2>프로필 생성</h2>

                <div class="img-profile">
                    <p>프로필 이미지 선택</p>
                    <div class="image-list">
                        <div
                            v-for="(image, index) in imageList"
                            :key="index"
                            @click="selectImage(image)"
                            :class="{ selected: selectedImage === image }"
                            class="image-option"
                        >
                            <img :src="image" class="profile-image" />
                        </div>
                    </div>
                </div>

                <form class="form-display" @submit.prevent="editProfile">
                    <div class="profile-dataform">
                        <p>닉네임</p>
                        <input v-model="newProfile.nickname" placeholder="닉네임" required type="text" />
                        <p>성별</p>
                        <div class="radio-group">
                            <label><input type="radio" value="M" v-model="newProfile.gender" /> 남자</label>
                            <label><input type="radio" value="F" v-model="newProfile.gender" /> 여자</label>
                        </div>
                        <p>생년월일</p>
                        <input v-model="newProfile.birth" type="date" required />
                    </div>
                    <button type="submit">수정</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useProfileStore } from '@/stores/profile'; // 프로필 스토어 가져오기
import { onMounted, ref } from 'vue';
import cookies from 'js-cookie';
import axios from 'axios';
import { USER_API_URL, IMAGE_SERVER_URL, TALE_API_URL } from '@/constants/api';

const profiles = ref([]);
const profileStore = useProfileStore();
const isLoading = ref(true);
// const showContent = ref(false);
// 총 구매 권수와 대여 횟수를 저장할 상태 변수
const totalPurchases = ref(0);
const totalRentals = ref(0);
const showEdit = ref(false);
const newProfile = ref({
    nickname: '',
    gender: 'M',
    birth: '',
    image: null,
});
const selectedProfileId = ref(null);
const selectedImage = ref(null);
const imageList = [
    `${IMAGE_SERVER_URL}/profile/profileFull01.jpeg`,
    `${IMAGE_SERVER_URL}/profile/profileFull02.png`,
    `${IMAGE_SERVER_URL}/profile/profileFull03.png`,
];

// 백엔드에서 총 구매 권수와 대여 횟수를 받아오는 함수
const fetchProfileStats = async () => {
    if (!profileStore.selectedProfile) {
        console.error('선택된 프로필 정보가 없습니다.');
        return;
    }
    try {
        const response = await axios.get(`${TALE_API_URL}/api/mypage/buyingStats/${profileStore.loginId}`);

        // 서버에서 받아온 데이터로 상태 업데이트
        totalPurchases.value = response.data.totalPurchaseCount;
        totalRentals.value = response.data.totalRentalCount;
    } catch (error) {
        console.error('Failed to fetch profile stats:', error);
    }
};

const fetchProfiles = async () => {
    const token = getJwtToken();
    try {
        const response = await axios.get(`${USER_API_URL}/api/checkProfiles/${profileStore.loginId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
        });

        // 서버에서 받아온 데이터로 상태 업데이트
        profiles.value = response.data;

        console.log(profiles.value);
    } catch (error) {
        console.error('Failed to fetch profile stats:', error);
    }
};

const selectImage = (image) => {
    selectedImage.value = image;
    newProfile.value.image = image;
    console.log('선택된 이미지:', newProfile.value.image); // 디버깅을 위해 추가
};

const openEdit = (profile) => {
    newProfile.value = { ...profile };
    selectedImage.value = profile.image;
    selectedProfileId.value = profile.id;
    showEdit.value = true;
};
const closeEdit = () => {
    showEdit.value = false;
};

const editProfile = async () => {
    const token = getJwtToken();
    try {
        const response = await axios.post(
            `${USER_API_URL}/api/editProfile/${selectedProfileId.value}`,
            newProfile.value,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            },
        );

        console.log('수정된 프로필:', response.data);
        // 서버에서 받아온 데이터로 상태 업데이트
        newProfile.value = { nickname: '', gender: 'M', birth: '', image: null };
        selectedImage.value = null;
        closeEdit();
        await fetchProfiles();
        await profileStore.checkLoginStatus();
    } catch (error) {
        console.error('Failed to fetch profile stats:', error);
    }
};
const getJwtToken = () => {
    const token = cookies.get('Authorization');
    console.log('가져온 JWT 토큰:', token);
    return token;
};

const deleteProfile = async (profileId) => {
    if (profileStore.selectedProfile.id === profileId) {
        alert('현재 로그인된 프로필 입니다.');
        return;
    }
    try {
        console.log(profileId);
        const token = getJwtToken();
        await axios.delete(`${USER_API_URL}/api/deleteProfile/${profileId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
        });
        await fetchProfiles();
        console.log('프로필이 삭제되었습니다.');
    } catch (error) {
        console.error('프로필 삭제 중 오류가 발생했습니다.', error);
    }
};

// 컴포넌트가 마운트될 때 데이터 가져오기
onMounted(async () => {
    await fetchProfiles();
    await fetchProfileStats();
    isLoading.value = false;
});
</script>

<style scoped>
.profile-info {
    text-align: center;
}

.profile-info h2 {
    font-size: 36px;
}

.profile-info p {
    font-size: 16px;
    margin: 10px 0;
}

.stats {
    display: flex;
    justify-content: center;
    margin-top: 50px;
}

.stats div {
    width: 150px;
    height: 100%;
    padding: 10px 20px;
    border: 1px solid #ddd;
    margin: 0 10px;
    border-radius: 10%;
    text-align: center;
}

.stats p:first-child {
    /* 총 구매권수, 총 대여 횟수 */
    font-size: 26px;
}

.stats p:last-child {
    /* user.totalPurchases와 user.totalRentals */
    font-weight: bold;
    font-size: 26px;
    color: darkblue;
}
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.loading-spinner {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
}

.loading-spinner div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 64px;
    height: 64px;
    margin: 8px;
    border: 8px solid #fff;
    border-radius: 50%;
    animation: loading-spinner 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #fff transparent transparent transparent;
}

.loading-spinner div:nth-child(1) {
    animation-delay: -0.3s;
}

.loading-spinner div:nth-child(2) {
    animation-delay: -0.25s;
}

.loading-spinner div:nth-child(3) {
    animation-delay: -0.1s;
}

@keyframes loading-spinner {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.modal {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 500px;
    position: relative;
    animation: modal-scale-in 0.5s ease-in-out;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
}

.image-list {
    display: flex;
    justify-content: space-around;
}

.image-option {
    cursor: pointer;
    border: 2px solid transparent;
    padding: 5px;
    transition: border-color 0.3s;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 120px;
    height: 120px;
}

.image-option.selected {
    border-color: blue; /* 선택된 이미지의 테두리 강조 */
    transition: transform 0.3s ease;
    transform: scale(1.1); /* 선택된 이미지에 크기 변화 */
}

.profile-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 50%;
}

input[type='text'],
input[type='date'] {
    width: 100%;
    height: 30px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}

button[type='submit'] {
    background-color: #4caf50;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 20px;
    width: 150px;
    margin-top: 50px;
}

button[type='submit']:hover {
    background-color: #45a049;
}

input[type='radio'] {
    margin-right: 5px;
}

label {
    font-size: 20px;
}
.card p {
    margin: 0px 0 10px 0;
    font-family: 'CookieRun-Regular', sans-serif;
}

p {
    font-size: 24px;
    margin: 24px 0 10px 0;
}

.form-display {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}
.profile-dataform {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.profile-dataform input[type='text']:focus {
    outline: none; /* outline 제거 */
}

/* 모달 애니메이션 */
@keyframes modal-scale-in {
    0% {
        transform: scale(0);
        opacity: 0;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes profile-card-scale-in {
    0% {
        transform: scale(0);
        opacity: 0;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}
.profile-box {
    margin-top: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.profile-card {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
}

.profile-card .card {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 250px;
    height: 250px;
    animation: profile-card-scale-in 0.5s ease-in-out;
}
.card-header {
    position: absolute;
    top: 8px;
    display: flex;
    gap: 2px;
    right: 30px;
}

.edit-btn,
.delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-size: 18px;
}
.edit-img,
.delete-img {
    width: 25px;
    height: 25px;
    object-fit: contain;
    border: 1px solid #ccc;
    border-radius: 10px;
    padding: 0;
}

.select-btn {
    width: 250px;
    height: 100%;
    background: none;
    border: none;
}

.select-btn img {
    width: 200px;
    height: 200px;
    border-radius: 10px;
    object-fit: contain;
    border: 1px solid #45a049;
}
.edit-btn:hover {
    color: green;
}

.delete-btn:hover {
    color: red;
}
</style>
