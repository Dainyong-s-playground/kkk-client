<template>
    <div class="profile-container">
        <div class="profile-box">
            <h1>다이뇽과 뛰어놀 친구를 선택하세요.</h1>

            <div class="profile-card" v-if="profiles.length === 0">
                <div class="card">
                    <button class="select-btn" @click="openModal">
                        <img :src="getImageUrl('profile/resisterProfile.png')" alt="프로필 생성" />
                    </button>
                </div>
            </div>

            <div class="profile-card" v-else>
                <div class="card" v-for="profile in profiles" :key="profile.id">
                    <div class="card-header">
                        <button class="edit-btn" @click="openEdit(profile)">
                            <img class="edit-img" :src="`${IMAGE_SERVER_URL}/profile/modify.png`" />
                        </button>
                        <button class="delete-btn" @click="deleteProfile(profile.id)">
                            <img class="delete-img" :src="`${IMAGE_SERVER_URL}/profile/delete.png`" />
                        </button>
                    </div>
                    <button class="select-btn" @click="selectProfile(profile.id)">
                        <img :src="profile.image" />
                        <p>{{ profile.nickname }}</p>
                    </button>
                </div>

                <div v-if="profiles.length < 3">
                    <div class="card">
                        <button class="select-btn" @click="openModal">
                            <img :src="`${IMAGE_SERVER_URL}/profile/resisterProfile.png`" alt="프로필 생성" />
                            <p>프로필 생성</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 프로필 생성 모달 -->
        <div v-if="showModal" class="modal" @click.self="closeModal">
            <div class="modal-content">
                <button class="close-btn" @click="closeModal">X</button>
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

                <form class="form-display" @submit.prevent="createProfile">
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
                    <button type="submit">생성</button>
                </form>
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
                    <button type="submit">생성</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import cookies from 'js-cookie';
import { USER_API_URL, IMAGE_SERVER_URL } from '@/constants/api';

export default {
    data() {
        return {
            selectedProfileId: '',
            profiles: [],
            showModal: false,
            showEdit: false,
            newProfile: {
                nickname: '',
                gender: 'M',
                birth: '',
                image: null,
            },
            selectedImage: null,
            imageList: [
                `${IMAGE_SERVER_URL}/profile/profileFull01.jpeg`,
                `${IMAGE_SERVER_URL}/profile/profileFull02.png`,
                `${IMAGE_SERVER_URL}/profile/profileFull03.png`,
            ],
            IMAGE_SERVER_URL: IMAGE_SERVER_URL,
        };
    },

    async mounted() {
        await this.loadProfile();
        document.addEventListener('keydown', this.handleEscKey);
    },

    beforeUnmount() {
        document.removeEventListener('keydown', this.handleEscKey);
    },

    methods: {
        getJwtToken() {
            const token = cookies.get('Authorization');
            console.log('가져온 JWT 토큰:', token);
            return token;
        },

        async loadProfile() {
            const token = this.getJwtToken();
            console.log(token);
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    const userId = decodedToken.id;

                    const response = await axios.get(`${USER_API_URL}/api/checkProfiles/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                    });
                    this.profiles = response.data;
                } catch (error) {
                    console.error('JWT 토큰을 디코딩하는 중 오류가 발생했습니다.', error);
                }
            } else {
                console.error('JWT 토큰이 없습니다.');
                this.$router.push('/');
            }
        },

        async selectProfile(profileId) {
            try {
                const token = cookies.get('Authorization');
                if (!token) {
                    throw new Error('JWT 토큰이 없습니다.');
                }

                const response = await axios.post(
                    `${USER_API_URL}/api/selectProfile`,
                    { profileId },
                    {
                        headers: {
                            Authorization: `${token}`,
                        },
                        withCredentials: true,
                    },
                );

                const newToken = response.data.newToken;
                if (newToken) {
                    cookies.set('Authorization', newToken);
                }

                this.$router.push('/');
            } catch (error) {
                console.error('프로필 선택 중 오류가 발생했습니다.', error);
            }
        },
        openModal() {
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
        },
        openEdit(profile) {
            this.newProfile = { ...profile };
            this.selectedImage = profile.image;
            this.showEdit = true;
            this.selectedProfileId = profile.id;
        },
        closeEdit() {
            this.showEdit = false;
        },
        selectImage(image) {
            this.selectedImage = image;
            this.newProfile.image = image;
            console.log('선택된 이미지:', image); // 디버깅을 위해 추가
        },
        async createProfile() {
            try {
                const token = this.getJwtToken();

                if (!token) {
                    throw new Error('JWT 토큰이 없습니다.');
                }

                if (!this.newProfile.image) {
                    throw new Error('프로필 이미지를 선택해주세요.');
                }

                const response = await axios.post(`${USER_API_URL}/api/createProfile`, this.newProfile, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                });

                console.log('생성된 프로필:', response.data);

                this.newProfile = { nickname: '', gender: 'M', birth: '', image: null };
                this.selectedImage = null;
                this.closeModal();
                this.$router.go(0);
            } catch (error) {
                console.error('프로필 생성 중 오류가 발생했습니다.', error);
                alert(error.message);
            }
        },

        async editProfile() {
            try {
                const token = this.getJwtToken();
                console.log(this.selectedProfileId);
                if (!token) {
                    throw new Error('JWT 토큰이 없습니다.');
                }

                if (!this.newProfile.image) {
                    throw new Error('프로필 이미지를 선택해주세요.');
                }

                const response = await axios.post(
                    `${USER_API_URL}/api/editProfile/${this.selectedProfileId}`,
                    this.newProfile,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                    },
                );

                console.log('수정된 프로필:', response.data);

                this.newProfile = { nickname: '', gender: 'M', birth: '', image: null };
                this.selectedImage = null;
                this.closeEdit();
                this.$router.go(0);
            } catch (error) {
                console.error('프로필 생성 중 오류가 발생했습니다.', error);
                alert(error.message);
            }
        },

        handleEscKey(event) {
            if (event.key === 'Escape' && this.showModal) {
                this.closeModal();
            }
        },

        handleImageError(event) {
            console.error('이미지 로드 실패:', event.target.src);
            event.target.src = `/profile/default-profile.png`; // 기본 이미지로 대체
        },

        getImageUrl(path) {
            return `${IMAGE_SERVER_URL}/${path}`;
        },
        async deleteProfile(profileId) {
            try {
                const token = this.getJwtToken();
                await axios.delete(`${USER_API_URL}/api/deleteProfile/${profileId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                this.profiles = this.profiles.filter((profile) => profile.id !== profileId);
                console.log('프로필이 삭제되었습니다.');
            } catch (error) {
                console.error('프로필 삭제 중 오류가 발생했습니다.', error);
            }
        },
    },
};
</script>

<style>
.profile-container {
    width: 100%;
}

.profile-box {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.profile-box h1 {
    margin-bottom: 20px;
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
    width: 350px;
    height: 350px;
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

.edit-btn:hover {
    color: green;
}

.delete-btn:hover {
    color: red;
}
.select-btn {
    width: 350px;
    height: 100%;
    background: none;
    border: none;
}

.select-btn img {
    width: 300px;
    height: 300px;
    border-radius: 10px;
    object-fit: contain;
    border: 1px solid #45a049;
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
</style>
