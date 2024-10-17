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
        <div v-if="!isLoading" class="purchase-history">
            <table>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>도서번호</th>
                        <th>도서이름</th>
                        <th>구매 날짜</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(book, index) in purchaseBooks" :key="index">
                        <tr @click="toggleDetails(index)">
                            <td>{{ index + 1 }}</td>
                            <td>{{ book.id }}</td>
                            <td>{{ book.title }}</td>
                            <td>{{ formatDate(book.purchaseDate) }}</td>
                        </tr>
                        <tr v-if="isRowSelected(index)" class="details-row">
                            <td colspan="4">
                                <div class="book-details">
                                    <img :src="book.imageUrl" alt="Book Image" />
                                    <div class="book-info">
                                        <h3>{{ book.title }}</h3>
                                        <p>저자: {{ book.author }}</p>
                                        <p>구매 가격: {{ formatPrice(book.purchasePrice) }}</p>
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
const purchaseBooks = ref([]);
const selectedBooks = ref([]);

const fetchPurchaseBooks = async () => {
    if (!profileStore.loginId) {
        console.error('로그인 ID가 없습니다.');
        return;
    }
    try {
        const response = await axios.get(`${TALE_API_URL}/api/mypage/purchase/${profileStore.loginId}`);
        console.log('Received purchase books:', response.data);
        purchaseBooks.value = response.data;
    } catch (error) {
        console.error('Failed to fetch purchase books:', error);
    } finally {
        isLoading.value = false;
    }
};

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

const formatDate = (dateString) => {
    if (!dateString) return '날짜 없음';

    // 날짜 문자열에서 KST 제거
    const cleanDateString = dateString.replace(' KST', '');

    const date = new Date(cleanDateString);
    if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return '유효하지 않은 날짜';
    }

    // UTC 시간을 KST로 변환 (UTC+9)
    const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    const year = kstDate.getUTCFullYear();
    const month = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(kstDate.getUTCDate()).padStart(2, '0');
    const hours = String(kstDate.getUTCHours()).padStart(2, '0');
    const minutes = String(kstDate.getUTCMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const formatPrice = (price) => {
    if (price == null) return '가격 정보 없음';
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);
};

const loadAllData = async () => {
    try {
        isLoading.value = true;
        showContent.value = false;
        await fetchPurchaseBooks();
    } catch (error) {
        console.error('데이터 로딩 중 오류 발생:', error);
    } finally {
        isLoading.value = false;
        showContent.value = true;
    }
};

onMounted(async () => {
    if (profileStore.selectedProfile) {
        await loadAllData();
    } else {
        console.error('선택된 프로필이 없습니다.');
        isLoading.value = false;
    }
});
</script>

<style scoped>
.purchase-history {
    width: 100%;
    padding: 20px;
    margin-top: 7vh;
    box-sizing: border-box;
}

table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background-color: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    font-family: 'Noto Sans KR', sans-serif;
}

th {
    background-color: #4caf50;
    color: white;
    font-weight: bold;
    padding: 15px;
    text-align: left;
    font-size: 16px;
}

td {
    padding: 15px;
    border-bottom: 1px solid #e0e0e0;
    color: #333;
    font-size: 14px;
}

tr:hover {
    background-color: #f5f5f5;
    cursor: pointer;
}

.details-row td {
    padding: 20px;
    background-color: #f9f9f9;
}

.book-details {
    display: flex;
    align-items: center;
}

.book-details img {
    width: 100px;
    height: auto;
    border-radius: 5px;
    margin-right: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.book-info h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #333;
}

.book-info p {
    margin: 5px 0;
    font-size: 14px;
    color: #666;
}

/* 반응형 디자인을 위한 미디어 쿼리 */
@media (max-width: 768px) {
    table {
        font-size: 12px;
    }

    th,
    td {
        padding: 10px;
    }

    .book-details {
        flex-direction: column;
        align-items: flex-start;
    }

    .book-details img {
        margin-bottom: 10px;
    }
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
