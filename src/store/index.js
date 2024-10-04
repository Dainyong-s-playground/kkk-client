import { createStore } from 'vuex';
import profile from './modules/profile';

const store = createStore({
    modules: {
        profile,
    },
});

export default store;
