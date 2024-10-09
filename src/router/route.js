import MiddleFront from '@/components/layout/MiddleFront.vue';
import FairyPlayer from '@/components/pages/FairyPlayer.vue';
import FairyTaleList from '@/components/pages/FairyTaleList.vue';
import HandLandmark from '@/components/pages/Game/HandLandmark.vue';
import MyPage from '@/components/pages/MyPage.vue';
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
        path: '/mypage',
        component: MyPage,
    },
];

export default routes;
