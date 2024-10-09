<template>
    <div class="rental-history">
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
                <tr v-for="(book, index) in rentalBooks" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ book.bookId }}</td>
                    <td>{{ book.title }}</td>
                    <td>{{ book.startDate }}</td>
                    <td>{{ book.endDate }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
</script>

<style scope>
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

th,
td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: center;
}
</style>