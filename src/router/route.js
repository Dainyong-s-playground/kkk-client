import MiddleFront from "@/components/layout/MiddleFront.vue";
import PageMain from "@/components/pages/PageMain.vue";

const routes = [
    {
        path: "/",
        component: MiddleFront,
        children: [
            {
                path: "",
                component: PageMain,
            },
            {
                path: "main",
                component: PageMain,
            },
        ],
    },
];

export default routes;
