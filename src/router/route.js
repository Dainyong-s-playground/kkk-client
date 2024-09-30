import MiddleFront from '@/components/layout/MiddleFront.vue';
import PageMain from '@/components/pages/PageMain.vue';
import FairyTaleList from '@/components/pages/FairyTaleList.vue';
import ProfileView from '@/components/pages/ProfileView.vue';

const routes = [
    {
        path: '/',
        component: MiddleFront,
        children: [
            {
                path: '',
                component: PageMain,
            },
            {
                path: '/fairyTaleList',
                name: 'FairyTaleList',
                component: FairyTaleList,
            },
        ],
    },

    {
        path: '/profiles',
        component: ProfileView,
    },

    // {
    //     path: '/login',
    //     redirect: '/',
    // },
];

export default routes;
