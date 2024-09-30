<template>
    <div class="fairy-tale-detail">
        <button @click="$emit('close')" class="close-button">X</button>
        <h2>{{ fairyTale.title }}</h2>
        <img :src="fairyTale.thumbnail" :alt="fairyTale.title" class="detail-image" />
        <p>{{ fairyTale.description }}</p>
        <p v-if="fairyTale.episode">{{ fairyTale.episode }}</p>
    </div>
</template>

<script>
export default {
    props: ['fairyTale'],
};
</script>

<style scoped>
.fairy-tale-detail {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    max-width: 80%;
    max-height: 80%;
    overflow-y: auto;
}
.close-button {
    float: right;
}
.detail-image {
    max-width: 100%;
    height: auto;
}
</style>
