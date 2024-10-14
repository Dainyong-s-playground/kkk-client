<template>
    <div class="gauge-bar">
        <div class="gauge" :style="{ width: gaugeWidth + '%' }"></div>
    </div>
</template>

<script>
export default {
    props: {
        value: {
            type: Number,
            required: true,
        },
        max: {
            type: Number,
            required: true,
        },
    },
    computed: {
        gaugeWidth() {
            return Math.max(0, (this.value / this.max) * 100);
        },
    },
};
</script>

<style scoped>
.gauge-bar {
    width: 45%;
    height: 30px;
    background: #ddd;
    border-radius: 20px;
    overflow: hidden;
    margin-top: 20px;
}

.gauge {
    height: 100%;
    background: linear-gradient(90deg, #4caf50, #81c784);
    transition: width 0.3s;
}
</style>
