<template>
    <div class="profile-info">
        <img :src="user.profileImage" alt="프로필 이미지" class="profile-img" />
        <h2>{{ user.name }}</h2>
        <p>{{ user.gender }}</p>
        <p>{{ user.birthdate }}</p>
    </div>

    <div class="stats">
        <div>
            <p>총 구매 권수</p>
            <p>{{ user.totalPurchases }}</p>
        </div>
        <div>
            <p>대여 횟수</p>
            <p>{{ user.totalRentals }}</p>
        </div>
    </div>
</template>

<script setup>
const user = {
    name: '짠니뇽',
    gender: '여자',
    birthdate: '1999.09.26',
    profileImage: 'https://img.danawa.com/prod_img/500000/253/439/img/18439253_1.jpg?shrink=500:*&_v=20221207094826',
    totalPurchases: 13,
    totalRentals: 5,
};
</script>

<style scope>
.profile-info {
    text-align: center;
}

.profile-img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
}

.stats {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.stats div {
    padding: 10px 20px;
    border: 1px solid #ddd;
    margin: 0 10px;
}
</style>