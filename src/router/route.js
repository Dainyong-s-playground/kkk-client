import MiddleFront from '@/components/layout/MiddleFront.vue';
import DashBoard from '@/components/pages/dashboard/DashBoard.vue';
import ReservationSearch from '@/components/pages/dashboard/ReservationSearch.vue';
import FairyPlayer from '@/components/pages/FairyPlayer.vue';
import FairyTaleList from '@/components/pages/FairyTaleList.vue';
import HandLandmark from '@/components/pages/Game/HandLandmark.vue';
import PageMain from '@/components/pages/PageMain.vue';
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
            {
                path: '/fairyPlayer/:id',
                name: 'FairyPlayer',
                component: FairyPlayer,
            },
        ],
    },
    {
        path: '/profiles',
        component: ProfileView,
    },
    {
        path: '/game/hand',
        component: HandLandmark,
    },
    {
        path: '/dashboard',
        component: DashBoard,
    },
    {
        path: '/search',
        component: ReservationSearch,
    },
];

export default routes;
