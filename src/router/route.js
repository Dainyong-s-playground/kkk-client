import MiddleFront from '@/components/layout/MiddleFront.vue';
import DashBoard from '@/components/pages/dashboard/DashBoard.vue';
import ReservationSearch from '@/components/pages/dashboard/ReservationSearch.vue';
import FairyPlayer from '@/components/pages/FairyPlayer.vue';
import FairyTaleList from '@/components/pages/FairyTaleList.vue';
import HandLandmark from '@/components/pages/Game/HandLandmark.vue';
import RopeCut from '@/components/pages/Game/RopeCut.vue';
import MyPage from '@/components/pages/MyPage.vue';
import PageMain from '@/components/pages/PageMain.vue';
import ProfileView from '@/components/pages/ProfileView.vue';
import FairyTaleDetail from '@/components/pages/FairyTaleDetail.vue';

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
                path: '/fairyTaleDetail/:id',
                name: 'FairyTaleDetail',
                component: FairyTaleDetail,
                props: true,
            },
            {
                path: '/fairyPlayer/:id',
                name: 'FairyPlayer',
                component: FairyPlayer,
                props: true,
            },
        ],
    },
    {
        path: '/profiles',
        name: 'ProfileView',
        component: ProfileView,
    },
    {
        path: '/game/hand',
        component: HandLandmark,
    },
    {
        path: '/game/ropeCut',
        component: RopeCut,
    },
    {
        path: '/mypage',
        component: MyPage,
    },
    {
        path: '/dashboard',
        component: DashBoard,
    },
    {
        path: '/search',
        component: ReservationSearch,
    },
    {
        path: '/rope',
        component: RopeCut,
    },
];

export default routes;
