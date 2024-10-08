<template>
    <div v-if="!loading" class="dash-container">
        <left-board></left-board>
        <right-board></right-board>
    </div>
</template>

<script>
import LeftBoard from './LeftBoard.vue';
import RightBoard from './RightBoard.vue';

export default {
    components: {
        LeftBoard,
        RightBoard,
    },
};
</script>

<style scoped>
.dash-container {
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: flex-start;
    flex-wrap: wrap;
    margin-top: 100px;
}
</style>
