<template>
    <div class="profile-info">
        <img :src="user.profileImage" alt="프로필 이미지" class="profile-img" />
        <h2>{{ user.name }}</h2>
        <p>{{ user.gender }}</p>
    </div>

    <div class="stats">
        <div>
            <p>총 구매 권수</p>
            <p>{{ user.totalPurchases }}</p>
        </div>
        <div>
            <p>총 대여 횟수</p>
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
    width: 200px;
    height: 200px;
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

.stats p:first-child { /* 총 구매권수, 총 대여 횟수 */
    font-size: 26px;
}

.stats p:last-child { /* user.totalPurchases와 user.totalRentals */
    font-weight: bold;
    font-size: 26px;
    color:darkblue;
}
</style>