import MiddleFront from '@/components/layout/MiddleFront.vue';
import PageMain from '@/components/pages/PageMain.vue';
import FairyTaleList from '@/components/pages/FairyTaleList.vue';

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
];

export default routes;
