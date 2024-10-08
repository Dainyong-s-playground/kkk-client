<template>
    <div class="right-container">
        <!-- 프로필 정보 영역 -->
        <div class="profile-container">
            <img v-if="selectedProfile.image" :src="selectedProfile.image" alt="프로필 이미지" class="profile-image" />
            <div>
                <h2>{{ selectedProfile.nickname || '닉네임 없음' }}</h2>
                <p class="profile-description">{{ selectedProfile.description || '프로필 설명이 없습니다.' }}</p>
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
        Bar, // `Bar` 컴포넌트를 등록
        Doughnut, // `Doughnut` 컴포넌트를 등록
    },
    data() {
        return {
            favorChartData: null, // 태그 선호도 차트 데이터
            recordChartData: null, // 녹음 참여율 차트 데이터
            motionChartData: null, // 모션 인식 참여율 차트 데이터
            gameChartData: null, // 게임 참여율 차트 데이터
            chartOptions: {
                responsive: true,
                maintainAspectRatio: false, // 비율을 유지하지 않도록 설정
            },
            doughnutOptions: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%', // 도넛의 내부 비율 조정
                rotation: -90, // 도넛 그래프를 90도 회전하여 반달 모양으로 표현
                circumference: 180, // 반달 모양 설정
            },
        };
    },
    computed: {
        ...mapState(useProfileStore, ['selectedProfile']),
    },
    async mounted() {
        await this.loadChartData();
    },
    methods: {
        async loadChartData() {
            try {
                // 1. 태그 선호도 데이터를 비동기식으로 가져오기
                const favorResponse = await axios.get('/favorData.json');
                const favorTags = favorResponse.data;

                // 가져온 데이터를 기반으로 차트 데이터 생성
                this.favorChartData = {
                    labels: favorTags.map((item) => item.tag),
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

                // 2. 컨텐츠 참여도 데이터를 비동기식으로 가져오기
                const participateResponse = await axios.get('/participateData.json');
                const participateData = participateResponse.data;

                // 전체 동화 수 및 각 컨텐츠별 참여도 계산
                const totalFairyTales = 13; // 전체 읽은 동화 수를 명시적으로 지정
                const totalRecordCount = participateData.reduce((sum, item) => sum + item.recordParticipation, 0);
                const totalMotionCount = participateData.reduce((sum, item) => sum + item.motionParticipation, 0);
                const totalGameCount = participateData.reduce((sum, item) => sum + item.gameParticipation, 0);

                // 각각의 도넛 차트를 위한 데이터 생성
                this.recordChartData = {
                    labels: ['참여', '미참여'],
                    datasets: [
                        {
                            label: '녹음 참여율',
                            backgroundColor: ['#4caf50', '#e0e0e0'],
                            data: [totalRecordCount, totalFairyTales - totalRecordCount],
                        },
                    ],
                };
                this.motionChartData = {
                    labels: ['참여', '미참여'],
                    datasets: [
                        {
                            label: '모션 인식 참여율',
                            backgroundColor: ['#03a9f4', '#e0e0e0'],
                            data: [totalMotionCount, totalFairyTales - totalMotionCount],
                        },
                    ],
                };
                this.gameChartData = {
                    labels: ['참여', '미참여'],
                    datasets: [
                        {
                            label: '게임 참여율',
                            backgroundColor: ['#ff9800', '#e0e0e0'],
                            data: [totalGameCount, totalFairyTales - totalGameCount],
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
}

.doughnut-item {
    width: 150px; /* 각 도넛 차트의 너비 */
    height: 150px; /* 각 도넛 차트의 높이 */
}
</style>
