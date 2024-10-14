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
        <div v-if="!isLoading" class="rental-history">
            <table>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>도서번호</th>
                        <th>도서이름</th>
                        <th>대여 시작 날짜</th>
                        <th>대여 종료 날짜</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(book, index) in rentalBooks" :key="index">
                        <tr @click="toggleDetails(index)">
                            <td>{{ index + 1 }}</td>
                            <td>{{ book.id }}</td>
                            <td>{{ book.title }}</td>
                            <td>{{ book.startDate }}</td>
                            <td>{{ book.endDate }}</td>
                        </tr>
                        <tr v-if="isRowSelected(index)" class="details-row">
                            <td colspan="5">
                                <div class="book-details">
                                    <img :src="book.imageUrl" alt="Book Image" />
                                    <div class="book-info">
                                        <h3>{{ book.title }}</h3>
                                        <p>{{ book.author }}</p>
                                        <p>{{ book.rentalPrice }}</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useProfileStore } from '@/stores/profile';
import { TALE_API_URL } from '@/constants/api';
const profileStore = useProfileStore();

const isLoading = ref(true);
const showContent = ref(false);
// 대여 목록 데이터 저장
const rentalBooks = ref([]);
const selectedBooks = ref([]);

// 백엔드에서 대여 목록 데이터를 가져오는 함수
const fetchRentalBooks = async () => {
    if (!profileStore.selectedProfile) {
        console.error('선택된 프로필 정보가 없습니다.');
        return;
    }
    try {
        const response = await axios.get(`${TALE_API_URL}/api/mypage/rental/${profileStore.loginId}`);

        rentalBooks.value = response.data; // 데이터를 상태에 저장
    } catch (error) {
        console.error('Failed to fetch rental books:', error);
    }
};

const loadAllData = async () => {
    try {
        isLoading.value = true;
        showContent.value = false;
        await Promise.all([fetchRentalBooks()]);
    } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error);
    } finally {
        isLoading.value = false;
        // 로딩이 끝난 후 바로 컨텐츠를 표시합니다.
        showContent.value = true;
    }
};
// 선택된 행을 관리하는 함수
const toggleDetails = (index) => {
    if (selectedBooks.value.includes(index)) {
        selectedBooks.value = selectedBooks.value.filter((i) => i !== index);
    } else {
        selectedBooks.value.push(index);
    }
};

const isRowSelected = (index) => {
    return selectedBooks.value.includes(index);
};

// 컴포넌트가 마운트될 때 대여 목록 데이터 가져오기
onMounted(async () => {
    await fetchRentalBooks();
    if (profileStore.selectedProfile) {
        await loadAllData();
    } else {
        console.error('선택된 프로필이 없습니다.');
        this.isLoading = false;
    }
});
</script>

<style scoped>
.rental-history {
    width: 100%;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
}

table {
    width: 80%;
    border-collapse: collapse;
    margin-top: 20px;
    background-color: #fff;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    font-family: 'Nunito', 'Comic Sans MS', 'Arial', sans-serif;
}

th {
    background-color: #a5d6a7;
    color: white;
    font-weight: bold;
    padding: 15px;
    text-align: center;
    text-transform: capitalize;
    letter-spacing: 0.05em;
    font-size: 18px;
    border-bottom: 2px solid #81c784;
}

td {
    border-bottom: 2px solid #e8f5e9;
    padding: 15px;
    text-align: center;
    color: #333;
    font-size: 16px;
    background-color: #f1f8e9;
}

tr:hover {
    background-color: #c8e6c9;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.details-row td {
    padding: 20px;
    background-color: #dcedc8;
    border-bottom: none;
    animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.book-details {
    display: flex;
    align-items: center;
    justify-content: start;
    background-color: #f9fbe7;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.book-details img {
    width: 130px;
    height: 170px;
    object-fit: cover;
    border-radius: 10px;
    margin-right: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.book-details img:hover {
    transform: scale(1.05);
}

.book-info h3 {
    margin: 0 0 10px 0;
    font-size: 23px;
    font-style: bold;
    color: #388e3c;
}

.book-info p {
    margin: 4px 0;
    font-size: 16px;
    text-align: left;
    color: #4e342e;
}

tr.details-row:last-child td {
    border-bottom: none;
}

button {
    background-color: #388e3c;
    border: none;
    color: white;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #66bb6a;
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
</style>
