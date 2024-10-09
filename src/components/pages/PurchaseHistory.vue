<template>
    <div class="rental-history">
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
                <template v-for="(book, index) in rentalBooks" :key="index">
                    <tr @click="toggleDetails(index)">
                        <td>{{ index + 1 }}</td>
                        <td>{{ book.Id }}</td>
                        <td>{{ book.title }}</td>
                        <td>{{ book.purchaseDate }}</td>
                    </tr>
                    <tr v-if="isRowSelected(index)" class="details-row">
                        <td colspan="5">
                            <div class="book-details">
                                <img :src="book.image" alt="Book Image" />
                                <div class="book-info">
                                    <h3>{{ book.title }}</h3>
                                    <p>{{ book.creator }}</p>
                                    <p>{{ book.price }}</p>
                                </div>
                            </div>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const rentalBooks = ref([
    { Id: 'Old1', title: '햇님달님', purchaseDate: '2024.10.08', creator: '다이농', price: '₩ 7,000', image: 'https://image.aladin.co.kr/product/22807/96/cover500/k252636533_1.jpg' },
    { Id: 'Old1', title: '햇님달님', purchaseDate: '2024.10.08', creator: '다이농', price: '₩ 7,000', image: 'https://image.aladin.co.kr/product/22807/96/cover500/k252636533_1.jpg' },
    { Id: 'Old1', title: '햇님달님', purchaseDate: '2024.10.08', creator: '다이농', price: '₩ 7,000', image: 'https://image.aladin.co.kr/product/22807/96/cover500/k252636533_1.jpg' },
    { Id: 'Old1', title: '햇님달님', purchaseDate: '2024.10.08', creator: '다이농', price: '₩ 7,000', image: 'https://image.aladin.co.kr/product/22807/96/cover500/k252636533_1.jpg' },
    { Id: 'Old1', title: '햇님달님', purchaseDate: '2024.10.08', creator: '다이농', price: '₩ 7,000', image: 'https://image.aladin.co.kr/product/22807/96/cover500/k252636533_1.jpg' },
    { Id: 'Old1', title: '햇님달님', purchaseDate: '2024.10.08', creator: '다이농', price: '₩ 7,000', image: 'https://image.aladin.co.kr/product/22807/96/cover500/k252636533_1.jpg' },
    { Id: 'Old1', title: '햇님달님', purchaseDate: '2024.10.08', creator: '다이농', price: '₩ 7,000', image: 'https://image.aladin.co.kr/product/22807/96/cover500/k252636533_1.jpg' },
    { Id: 'Old1', title: '햇님달님', purchaseDate: '2024.10.08', creator: '다이농', price: '₩ 7,000', image: 'https://image.aladin.co.kr/product/22807/96/cover500/k252636533_1.jpg' },
    { Id: 'Old1', title: '햇님달님', purchaseDate: '2024.10.08', creator: '다이농', price: '₩ 7,000', image: 'https://image.aladin.co.kr/product/22807/96/cover500/k252636533_1.jpg' },
    { Id: 'Old1', title: '햇님달님', purchaseDate: '2024.10.08', creator: '다이농', price: '₩ 7,000', image: 'https://image.aladin.co.kr/product/22807/96/cover500/k252636533_1.jpg' },
]);

const selectedBooks = ref([]);

const toggleDetails = (index) => {
    if (selectedBooks.value.includes(index)) {
        selectedBooks.value = selectedBooks.value.filter(i => i !== index);
    } else {
        selectedBooks.value.push(index);
    }
};

const isRowSelected = (index) => {
    return selectedBooks.value.includes(index);
};
</script>

<style scoped>
.rental-history {
    width: 100%;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    background-color: #fff;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    font-family: 'Nunito', 'Comic Sans MS', 'Arial', sans-serif;
}

th {
    background-color: #A5D6A7;
    color: white;
    font-weight: bold;
    padding: 15px;
    text-align: center;
    text-transform: capitalize;
    letter-spacing: 0.05em;
    font-size: 18px;
    border-bottom: 2px solid #81C784;
}

td {
    border-bottom: 2px solid #E8F5E9;
    padding: 15px;
    text-align: center;
    color: #333;
    font-size: 16px;
    background-color: #F1F8E9;
}

tr:hover {
    background-color: #C8E6C9;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.details-row td {
    padding: 20px;
    background-color: #DCEDC8;
    border-bottom: none;
    animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.book-details {
    display: flex;
    align-items: center;
    justify-content: start;
    background-color: #F9FBE7;
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
    color: #388E3C;
}

.book-info p {
    margin: 4px 0;
    font-size: 16px;
    text-align: left;
    color: #4E342E;
}

tr.details-row:last-child td {
    border-bottom: none;
}

button {
    background-color: #388E3C;
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
    background-color: #66BB6A;
}
</style>