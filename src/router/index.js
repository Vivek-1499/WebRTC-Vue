import AboutView from "@/views/AboutView.vue";
import AgoraView from "@/views/AgoraView.vue";
import CallView from "@/views/CallView.vue";
import ContactView from "@/views/ContactView.vue";
import HomeView from "@/views/HomeView.vue";
import MultipeerView from "@/views/MultipeerView.vue";
import NotFound from "@/views/NotFound.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },{
      path: '/about',
      name: "about",
      component: AboutView
    },{
      path: '/contact',
      name: "contact",
      component: ContactView
    },{
      path: '/call',
      name: 'call',
      component: AgoraView,
      //meta: {hideNavBar: true}
    },{
      path: '/call/:roomId',
      name: "room",
      component: () => import("@/views/AgoraView.vue"),
    },{
      path: "/:catchAll(.*)",
      name: "not-found",
      component: NotFound
    },
  ],
});

export default router;
