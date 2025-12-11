import AboutView from "@/views/AboutView.vue";
import CallView from "@/views/CallView.vue";
import ContactView from "@/views/ContactView.vue";
import HomeView from "@/views/HomeView.vue";
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
      component: CallView
    },{
      path: "/:catchAll(.*)",
      name: "not-found",
      component: NotFound
    },
  ],
});

export default router;
