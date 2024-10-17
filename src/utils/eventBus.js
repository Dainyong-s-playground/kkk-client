import { reactive } from 'vue';

export const eventBus = reactive({
    emit(event, ...args) {
        this[event]?.forEach((callback) => callback(...args));
    },
    on(event, callback) {
        if (!this[event]) {
            this[event] = [];
        }
        this[event].push(callback);
    },
    off(event, callback) {
        if (!this[event]) {
            return;
        }
        const index = this[event].indexOf(callback);
        if (index > -1) {
            this[event].splice(index, 1);
        }
    },
});
