<template>
    <div class="profile-container">
        <div class="profile-box">
            <h1>다이뇽과 뛰어놀 친구를 선택하세요.</h1>

            <div class="profile-card" v-if="profiles.length === 0">
                <div class="card">
                    <button @click="openModal">
                        <img
                            src="https://dainyong-s-playground.github.io/imageServer/profile/resisterProfile.png"
                            alt="프로필 생성"
                        />
                    </button>
                </div>
            </div>
            <div class="profile-card" v-else>
                <div class="card" v-for="profile in profiles" :key="profile.id">
                    <button @click="selectProfile(profile.id)">
                        <img :src="profile.image" />
                        <p>{{ profile.nickname }}</p>
                    </button>
                </div>
                <div v-if="profiles.length < 3">
                    <div class="card">
                        <button @click="openModal">
                            <img
                                src="https://dainyong-s-playground.github.io/imageServer/profile/resisterProfile.png"
                                alt="프로필 생성"
                            />
                            <p>프로필 생성</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 프로필 생성 모달 -->
        <div v-if="showModal" class="modal" @click.self="closeModal">
            <!-- 모달 외부 클릭으로 닫기 -->
            <div class="modal-content">
                <button class="close-btn" @click="closeModal">X</button>
                <h2>프로필 생성</h2>

                <!-- 이미지 리스트 -->
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

                <!-- 프로필 생성 폼 -->
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
    </div>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // jwt-decode 라이브러리에서 명명된 내보내기를 사용하여 임포트
import cookies from 'js-cookie';
export default {
    data() {
        return {
            profiles: [], // 기존 프로필 리스트
            showModal: false, // 모달 표시 여부
            newProfile: {
                nickname: '',
                gender: 'M',
                birth: '',
                image: null, // 선택된 이미지 저장
            },
            selectedImage: null, // 사용자가 선택한 이미지
            imageList: [
                // 미리 정의된 이미지 경로
                'https://dainyong-s-playground.github.io/imageServer/profile/profileFull01.jpeg',
                'https://dainyong-s-playground.github.io/imageServer/profile/profileFull02.png',
                'https://dainyong-s-playground.github.io/imageServer/profile/profileFull03.png',
            ], // 프로필 이미지 리스트
        };
    },

    async mounted() {
        const token = this.getJwtToken(); // JWT 토큰 가져오기
        console.log(token);
        // JWT 토큰이 유효한지 확인
        if (token) {
            try {
                const decodedToken = jwtDecode(token); // JWT 토큰 디코딩
                const userId = decodedToken.id; // 토큰에서 userId 추출

                // 프로필 조회 API 호출
                const response = await axios.get(
                    `http://login.dainyongplayground.site:7771/api/checkProfiles/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // JWT 토큰을 Authorization 헤더에 추가
                        },
                        withCredentials: true, // 인증 정보를 포함하여 요청
                    },
                );
                this.profiles = response.data;
            } catch (error) {
                console.error('JWT 토큰을 디코딩하는 중 오류가 발생했습니다.', error);
            }
        } else {
            console.error('JWT 토큰이 없습니다.');
            // 필요에 따라 프로필 선택 페이지로 리다이렉트
            this.$router.push('/');
        }

        // 'Esc' 키 입력 시 모달 닫기 기능
        document.addEventListener('keydown', this.handleEscKey);
    },

    beforeUnmount() {
        // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
        document.removeEventListener('keydown', this.handleEscKey);
    },

    methods: {
        getJwtToken() {
            // 쿠키에서 JWT 토큰 가져오기
            // return Cookies.get('Authorization');  // 쿠키에서 JWT 가져오기
            const token = cookies.get('Authorization');
            console.log('가져온 JWT 토큰:', token);
            return token;
        },

        async selectProfile(profileId) {
            try {
                const token = cookies.get('Authorization'); // 쿠키에서 JWT 토큰 가져오기
                if (!token) {
                    throw new Error('JWT 토큰이 없습니다.');
                }

                // 프로필 선택 API 호출
                const response = await axios.post(
                    'http://login.dainyongplayground.site:7771/api/selectProfile',
                    { profileId },
                    {
                        headers: {
                            Authorization: `${token}`, // Authorization 헤더 추가
                        },
                        withCredentials: true, // 쿠키를 포함하기 위해 withCredentials 설정
                    },
                );

                // 서버에서 새로 발급된 JWT 토큰이 있는 경우 저장
                const newToken = response.data.newToken; // 서버가 반환하는 새로운 JWT 토큰
                if (newToken) {
                    cookies.set('Authorization', newToken); // 쿠키에 새로운 토큰 저장
                }

                // 메인 페이지로 라우팅
                this.$router.push('/fairyTaleList'); // 메인 페이지로 이동
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
        selectImage(image) {
            this.selectedImage = image; // 선택한 이미지 저장
            this.newProfile.image = image; // 새 프로필 이미지로 설정
        },
        async createProfile() {
            try {
                const token = this.getJwtToken(); // JWT 토큰 가져오기

                if (!token) {
                    throw new Error('JWT 토큰이 없습니다.');
                }

                // 새 프로필 데이터를 백엔드로 POST 요청
                const response = await axios.post(
                    'http://login.dainyongplayground.site:7771/api/createProfile',
                    this.newProfile,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // JWT 토큰을 Authorization 헤더에 추가
                        },
                        withCredentials: true, // 인증 정보를 포함하여 요청
                    },
                );

                // 프로필 생성이 성공하면 profiles 리스트를 업데이트
                this.profiles.push(response.data);

                // 프로필 생성 완료 후 모달 닫기 및 초기화
                this.newProfile = { nickname: '', gender: 'M', birth: '', image: null }; // 입력값 초기화
                this.selectedImage = null; // 선택된 이미지 초기화
                this.$router.go(0);
            } catch (error) {
                console.error('프로필 생성 중 오류가 발생했습니다.', error);
            }
        },

        handleEscKey(event) {
            if (event.key === 'Escape' && this.showModal) {
                this.closeModal(); // Esc 키 입력 시 모달 닫기
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
    display: flex;
    justify-content: center;
    align-items: center;
    width: 350px;
    height: 350px;
    animation: profile-card-scale-in 0.5s ease-in-out;
}

.card button {
    width: 350px;
    height: 100%;
    background: none;
    border: none;
}

.card button img {
    width: 300px;
    height: 300px;
    border-radius: 50%;
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
