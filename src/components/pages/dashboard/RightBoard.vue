<template>
    <div v-if="isProfileReady" class="right-container">
        <!-- 프로필 정보 영역 -->
        <div class="profile-container">
            <div class="profile-card">
                <img :src="selectedProfile.image" alt="프로필 이미지" class="profile-image" />
                <div class="profile-data">
                    <h2>{{ selectedProfile.nickname || '닉네임 없음' }} | {{ selectedProfile.gender }}</h2>
                    <p>{{ selectedProfile.birth }}</p>
                </div>
            </div>
            <div class="total-reads">
                <h2>총 독서량</h2>
                <p>{{ totalFairyTales }}</p>
            </div>
        </div>

        <!-- 동화 유형 선호도 그래프 영역 -->
        <div class="favor-container">
            <h3>동화 유형 선호도</h3>
            <div class="favor-chart">
                <Bar v-if="favorChartData" :data="favorChartData" :options="chartOptions" />
            </div>
        </div>

        <!-- 컨텐츠 참여도 반달 도넛 그래프 영역 -->
        <div class="participate-container">
            <h3>컨텐츠별 참여율</h3>
            <div class="participate-chart">
                <div class="doughnut-wrapper">
                    <!-- 녹음 참여율 -->
                    <div class="doughnut-item">
                        <h4>녹음 참여</h4>
                        <Doughnut v-if="recordChartData" :data="recordChartData" :options="doughnutOptions" />
                    </div>
                    <!-- 모션 인식 참여율 -->
                    <div class="doughnut-item">
                        <h4>모션 인식 참여</h4>
                        <Doughnut v-if="motionChartData" :data="motionChartData" :options="doughnutOptions" />
                    </div>
                    <!-- 게임 참여율 -->
                    <div class="doughnut-item">
                        <h4>게임 참여</h4>
                        <Doughnut v-if="gameChartData" :data="gameChartData" :options="doughnutOptions" />
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- 프로필이 로드되지 않았을 때 로딩 화면 -->
    <div v-else class="loading-container">
        <p>프로필 정보를 불러오는 중입니다...</p>
    </div>
</template>

<script>
import { useProfileStore } from '@/stores/profile';
import { mapState } from 'pinia';
import axios from 'axios';
import { Bar, Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale } from 'chart.js';

// Chart.js 모듈 등록
ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

export default {
    name: 'ProfileContainer',
    components: {
        Bar,
        Doughnut,
    },
    data() {
        return {
            favorChartData: null,
            recordChartData: null,
            motionChartData: null,
            gameChartData: null,
            totalFairyTales: null,
            isProfileReady: false,
            chartOptions: {
                responsive: true,
                maintainAspectRatio: false,
            },
            doughnutOptions: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                rotation: -90,
                circumference: 180,
            },
        };
    },
    computed: {
        ...mapState(useProfileStore, ['selectedProfile']),
    },
    async mounted() {
        if (!this.selectedProfile || Object.keys(this.selectedProfile).length === 0) {
            // 프로필이 설정되지 않았을 때 다시 체크
            await this.loadProfile();
        }

        if (this.selectedProfile && Object.keys(this.selectedProfile).length > 0) {
            this.isProfileReady = true;
            await this.loadChartData();
        } else {
            console.error('프로필 정보를 불러올 수 없습니다.');
        }
    },
    methods: {
        async loadProfile() {
            try {
                const profileStore = useProfileStore();
                await profileStore.checkLoginStatus(); // 로그인 상태 및 프로필 정보 로드
            } catch (error) {
                console.error('프로필 정보를 불러오는 중 오류가 발생했습니다.', error);
                this.isProfileReady = false;
            }
        },
        async loadChartData() {
            try {
                const favorResponse = await axios.get(
                    `http://localhost:7772/api/graph/prefer/${this.selectedProfile.id}`,
                );
                const favorTags = favorResponse.data;

                this.favorChartData = {
                    labels: favorTags.map((item) => item.content),
                    datasets: [
                        {
                            label: '태그별 수치',
                            backgroundColor: '#5a9',
                            borderColor: '#4e8',
                            borderWidth: 1,
                            data: favorTags.map((item) => item.count),
                        },
                    ],
                };

                const participateResponse = await axios.get(
                    `http://localhost:7772/api/graph/report/${this.selectedProfile.id}`,
                );
                const participateData = participateResponse.data;
                this.totalFairyTales = participateData.count;
                this.recordChartData = {
                    labels: ['수행', '스킵'],
                    datasets: [
                        {
                            label: '녹음 참여율',
                            backgroundColor: ['#4caf50', '#e0e0e0'],
                            data: [participateData.recordCount, participateData.count - participateData.recordCount],
                        },
                    ],
                };
                this.motionChartData = {
                    labels: ['수행', '스킵'],
                    datasets: [
                        {
                            label: '모션 인식 참여율',
                            backgroundColor: ['#03a9f4', '#e0e0e0'],
                            data: [participateData.motionCount, participateData.count - participateData.motionCount],
                        },
                    ],
                };
                this.gameChartData = {
                    labels: ['수행', '스킵'],
                    datasets: [
                        {
                            label: '게임 참여율',
                            backgroundColor: ['#ff9800', '#e0e0e0'],
                            data: [participateData.gameCount, participateData.count - participateData.gameCount],
                        },
                    ],
                };
            } catch (error) {
                console.error('차트 데이터를 불러오는 중 오류가 발생했습니다:', error);
            }
        },
    },
};
</script>

<style scoped>
.right-container {
    display: flex;
    flex-direction: column;
    width: 30%;
    padding: 20px;
}

.doughnut-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 200px;
}

.doughnut-item {
    width: 150px; /* 각 도넛 차트의 너비 */
    height: 150px; /* 각 도넛 차트의 높이 */
}

.profile-container {
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 180px;
}
.profile-card {
    display: flex;
    justify-content: left;
    align-items: center;
    width: 60%;
    height: 180px;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.profile-image {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 10px;
    margin-left: 20px;
}

.profile-data {
    width: 50%;
}
.total-reads {
    width: 40%;
    margin-left: 20px;
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}
.total-reads h2 {
    margin-top: 0;
}
.total-reads p {
    margin: 0;
}
.profile-description {
    margin: 10px 0;
    font-size: 1.1rem;
}

.favor-container,
.participate-container {
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #ddd;
    background: #fff;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    text-align: center;
}

.doughnut-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.doughnut-item {
    width: 150px; /* 각 도넛 차트의 너비 */
    height: 150px; /* 각 도넛 차트의 높이 */
}
.doughnut-item h4 {
    margin: 0;
}
.favor-chart {
    height: 200px; /* 차트 높이 조절 */
    width: 95%;
}

canvas {
    max-width: 100%;
}
</style>
