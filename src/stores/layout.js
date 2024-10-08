import { defineStore } from 'pinia';

export const useLayoutStore = defineStore('layout', {
    state: () => ({
        showNav: false,
    }),
    actions: {
        setShowNav(value) {
            this.showNav = value;
        },
    },
});
