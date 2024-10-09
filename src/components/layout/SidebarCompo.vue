<template>
    <div class="sidebar">
        <ul>
            <li @click="$emit('changeTab', 'info')">내 정보</li>
            <li @click="$emit('changeTab', 'rental')">대여 이력</li>
            <li @click="$emit('changeTab', 'purchase')">소장 이력</li>
        </ul>
    </div>
</template>

<script setup>
</script>

<style scope>
.sidebar {
    width: 150px;
    background-color: #f5f5f5;
    padding: 20px;
    height: 100vh;
    position: fixed;
    top: 100px;
    left: 0;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar ul {
    list-style: none;
    padding: 0;
}

.sidebar li {
    padding: 20px 0 20px 0;
    cursor: pointer;
    font-weight: bold;
    text-align: center;
}

.sidebar li:hover {
    background-color: #eaeaea;
}
</style>